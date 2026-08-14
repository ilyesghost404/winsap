import { useState, useEffect, useRef } from 'react';
import { Loader2, AlertTriangle, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import CameraCapture from './CameraCapture';
import Button from './Button';
import toast from 'react-hot-toast';
import api from '../services/api';

const FaceVerification = ({ onSuccess, onCancel }) => {
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Position your face in front of the camera...");

  const cameraRef = useRef(null);
  const verifyInterval = useRef(null);
  const isRequestPending = useRef(false);

  useEffect(() => {
    verifyInterval.current = setInterval(() => {
      if (cameraRef.current && !isRequestPending.current && !isSuccess && !isVerifying && !error) {
        cameraRef.current.capture();
      }
    }, 1500);

    return () => {
      if (verifyInterval.current) {
        clearInterval(verifyInterval.current);
      }
    };
  }, [isSuccess, isVerifying, error]);

  const handleCapture = async (base64Image) => {
    if (isRequestPending.current || isSuccess || isVerifying || error) return;

    isRequestPending.current = true;
    setStatusMessage("Checking liveness and verifying face match...");

    try {
      const res = await api.post('/users/me/face-id/verify-current', {
        image: base64Image
      });

      if (res.data.success && res.data.verified && res.data.verifyToken) {
        setIsVerifying(true);
        setStatusMessage("Face matched! Authorization granted...");

        const token = res.data.verifyToken;
        setTimeout(() => {
          setIsSuccess(true);
          setIsVerifying(false);
          toast.success('Current Face ID verified successfully!');
          if (onSuccess) {
            setTimeout(() => onSuccess(token), 1000);
          }
        }, 800);
      }
    } catch (err) {
      console.error('Verify face error:', err);
      const errReason = err.response?.data?.reason;
      const errMsg = err.response?.data?.message;

      if (errReason === "FACE_NOT_DETECTED") {
        setStatusMessage("Looking for face...");
      } else if (errReason === "MULTIPLE_FACES") {
        setStatusMessage("Only one person allowed in frame.");
      } else if (errReason === "LIVENESS_FAILED") {
        setError("Spoofing detected. Please present a live face.");
        if (verifyInterval.current) clearInterval(verifyInterval.current);
      } else if (errReason === "FACE_NOT_MATCHED") {
        setError("Face does not match your currently registered profile.");
        if (verifyInterval.current) clearInterval(verifyInterval.current);
      } else {
        if (!errReason || errReason === "LOW_FACE_QUALITY") {
          setStatusMessage(errMsg || "Adjust lighting and align face with camera.");
        } else {
          setError(errMsg || 'Face verification failed. Please try again.');
          if (verifyInterval.current) clearInterval(verifyInterval.current);
        }
      }
    } finally {
      isRequestPending.current = false;
    }
  };

  if (isSuccess) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center border border-emerald-400 text-white shadow-lg shadow-emerald-500/20 mb-4">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <h4 className="font-bold text-slate-800 text-base">Current Face ID Verified!</h4>
        <p className="text-xs text-slate-500 mt-1">Proceeding to requested operation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center max-w-md py-4">
        <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-6 text-center text-rose-600 mb-6 shadow-sm w-full">
          <AlertTriangle size={36} className="mx-auto mb-3 text-rose-500" />
          <h4 className="font-bold text-rose-800 mb-2">Biometric Verification Failed</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
        </div>

        <div className="flex items-center gap-3 w-full">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} className="flex-1 text-xs">
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => { setError(null); isRequestPending.current = false; }}
            className="flex-1 text-xs"
          >
            <RefreshCw size={14} className="mr-1.5" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col items-center max-w-md">
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 w-full text-center mb-5 shadow-2xs">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-700 mb-0.5">
            <ShieldCheck size={16} />
            <span>Step 1: Verify Current Face ID</span>
          </div>
          <p className="text-slate-600 font-semibold text-xs animate-pulse">{statusMessage}</p>
        </div>

        <CameraCapture
          ref={cameraRef}
          onCapture={handleCapture}
          autoCapture={true}
          disabled={isVerifying || isSuccess}
        />
      </div>
    </div>
  );
};

export default FaceVerification;
