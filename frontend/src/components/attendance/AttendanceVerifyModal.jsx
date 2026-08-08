import { useState, useEffect, useRef } from 'react';
import { Loader2, RefreshCw, AlertTriangle, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import Modal from '../Modal';
import Button from '../Button';
import toast from 'react-hot-toast';
import { checkInWithFaceOnly, checkOutWithFaceOnly } from '../../services/presenceService';
import CameraCapture from '../CameraCapture';

const AttendanceVerifyModal = ({ isOpen, onClose, type, employeeId, onSuccess }) => {
  const [step, setStep] = useState(0); // 0: Face Auth, 5: Complete
  const [faceConfidence, setFaceConfidence] = useState(0);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState("Looking for face...");
  
  const cameraRef = useRef(null);
  const verifyInterval = useRef(null);
  const isRequestPending = useRef(false);

  const typeRef = useRef(type);
  const employeeIdRef = useRef(employeeId);

  useEffect(() => {
    typeRef.current = type;
  }, [type]);

  useEffect(() => {
    employeeIdRef.current = employeeId;
  }, [employeeId]);

  const resetState = () => {
    setStep(0);
    setFaceConfidence(0);
    setError('');
    setStatusMessage("Looking for face...");
    isRequestPending.current = false;
    stopPolling();
  };

  useEffect(() => {
    if (isOpen && step === 0 && !error) {
      startPolling();
    } else {
      stopPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [isOpen, step, error]);

  const startPolling = () => {
    if (verifyInterval.current) clearInterval(verifyInterval.current);
    verifyInterval.current = setInterval(() => {
      if (cameraRef.current && !isRequestPending.current && step === 0 && !error) {
        cameraRef.current.capture();
      }
    }, 1500);
  };

  const stopPolling = () => {
    if (verifyInterval.current) {
      clearInterval(verifyInterval.current);
      verifyInterval.current = null;
    }
  };

  const handleCapture = async (base64Image) => {
    if (isRequestPending.current || step !== 0) return;
    
    isRequestPending.current = true;
    setStatusMessage("Checking liveness & recording attendance...");

    try {
      const deviceInfo = `Browser: ${navigator.appName} on ${navigator.platform}`;
      const currentType = typeRef.current;
      const currentEmployeeId = employeeIdRef.current;

      let res;
      if (currentType === 'check-in') {
        res = await checkInWithFaceOnly(currentEmployeeId, base64Image, deviceInfo);
      } else {
        res = await checkOutWithFaceOnly(currentEmployeeId, base64Image, deviceInfo);
      }
      
      if (res.success) {
        stopPolling();
        const attRecord = res.data;
        setFaceConfidence(attRecord.face_confidence || 100);
        setStep(5); // Complete state
        
        toast.success(currentType === 'check-in' ? 'Checked in successfully!' : 'Checked out successfully!');
        if (onSuccess) {
          onSuccess(attRecord);
        }
      }
    } catch (err) {
      console.error('🚨 Biometric check-in/out final api error:', err);
      const errReason = err.response?.data?.reason;
      const errMsg = err.response?.data?.message;

      if (errReason === "FACE_NOT_DETECTED") {
        setStatusMessage("Looking for face...");
      } else if (errReason === "MULTIPLE_FACES") {
        setStatusMessage("Only one person allowed in frame.");
      } else if (errReason === "LIVENESS_FAILED") {
        setError("Spoofing detected. Please use a live face.");
        stopPolling();
      } else if (errReason === "FACE_NOT_MATCHED") {
        setError("Face matched a different employee.");
        stopPolling();
      } else {
        if (!errReason || errReason === "LOW_FACE_QUALITY") {
           setStatusMessage(errMsg || "Adjust lighting and face camera directly.");
        } else {
           setError(errMsg || 'Biometric attendance verification failed. Please try again.');
           stopPolling();
        }
      }
    } finally {
      isRequestPending.current = false;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { resetState(); onClose(); }} title={type === 'check-in' ? 'Secure Check-In Verification' : 'Secure Check-Out Verification'} size="md">
      <div className="space-y-6 flex flex-col items-center">
        
        {/* Step Indicator Header (single step) */}
        <div className="w-full text-center border-b border-slate-100 pb-4 mb-2">
          <span className="text-sm font-bold text-blue-600 flex items-center justify-center gap-1.5">
            Biometric Face Verification
          </span>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs text-red-600 flex items-center gap-2 w-full animate-in fade-in duration-200">
            <AlertTriangle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 0: Local AI Camera Detection */}
        {step === 0 && (
          <div className="w-full flex flex-col items-center text-center space-y-4 max-w-sm">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full mb-2">
              <h4 className="font-bold text-slate-800 text-sm">Face Liveness Detection</h4>
              <p className="text-blue-600 font-semibold text-xs mt-1 animate-pulse">{statusMessage}</p>
            </div>
            
            <CameraCapture 
              ref={cameraRef}
              onCapture={handleCapture}
              autoCapture={true}
              disabled={error !== ''}
            />
            
            {error && (
              <Button variant="secondary" onClick={() => { setError(''); startPolling(); }} className="rounded-xl mt-4 w-full">
                <RefreshCw size={14} className="mr-1.5" /> Try Again
              </Button>
            )}
          </div>
        )}

        {/* Step 5: Completion Success */}
        {step === 5 && (
          <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center border border-emerald-400 text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={36} strokeWidth={2.5} />
            </div>
            <h4 className="font-bold text-slate-800 text-lg">Attendance Registered!</h4>
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1 mb-2">
              <Sparkles size={12} /> Confidence: {faceConfidence.toFixed(2)}%
            </span>
            <p className="text-slate-500 text-xs max-w-xs">Your check-in session has been verified and safely recorded. You may now close this window.</p>
            
            <Button variant="success" onClick={() => { resetState(); onClose(); }} className="rounded-xl w-full max-w-xs mt-6">
              Close Window
            </Button>
          </div>
        )}

      </div>
    </Modal>
  );
};

export default AttendanceVerifyModal;
