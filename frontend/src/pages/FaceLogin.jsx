import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, ShieldAlert, Sparkles, User, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';
import Button from '../components/Button';

const FaceLogin = () => {
  const { faceLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [statusMessage, setStatusMessage] = useState("Align your face within the frame");
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const cameraRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const isRequestPending = useRef(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Set up auto capture polling
  useEffect(() => {
    if (!isSuccess && !error && !isVerifying) {
      captureIntervalRef.current = setInterval(() => {
        if (cameraRef.current && !isRequestPending.current) {
          cameraRef.current.capture();
        }
      }, 1500);
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [isSuccess, error, isVerifying]);

  const handleCapture = async (base64Image) => {
    if (isRequestPending.current || isSuccess) return;

    isRequestPending.current = true;
    setIsVerifying(true);
    setStatusMessage("Analyzing liveness & facial signature...");
    setError(null);

    try {
      const user = await faceLogin(base64Image);
      if (user) {
        setIsSuccess(true);
        setStatusMessage("Identity verified. Access granted!");
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
        }
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1200);
      }
    } catch (err) {
      console.error("[FaceLogin] Error:", err);
      const errMsg = err.message || "Authentication failed.";
      
      if (errMsg.includes("FACE_NOT_DETECTED")) {
        setStatusMessage("Align your face within the frame");
        setIsVerifying(false);
      } else if (errMsg.includes("MULTIPLE_FACES")) {
        setStatusMessage("Please ensure only one person is in frame");
        setIsVerifying(false);
      } else if (errMsg.includes("LIVENESS_FAILED")) {
        setError("Spoofing detected. Please use a live face.");
        if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
      } else if (errMsg.includes("FACE_NOT_MATCHED")) {
        setError("Face not recognized. Please register or try again.");
        if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
      } else {
        setError(errMsg);
        if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
      }
    } finally {
      isRequestPending.current = false;
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsVerifying(false);
    setStatusMessage("Align your face within the frame");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <style>{`
        @keyframes scanline {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scanline {
          animation: scanline 2.5s linear infinite;
        }
      `}</style>

      {/* Dynamic background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <button 
            onClick={() => navigate('/login')}
            className="group mb-4 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-800 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Password Login
          </button>
          
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <User className="text-blue-500" size={24} />
            Face ID Authentication
          </h2>
          <p className="mt-1 text-slate-400 text-xs font-medium">
            AbsenceFlow secure passwordless login
          </p>
        </div>

        {/* Camera Container */}
        <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-black/60 flex flex-col items-center">
          
          {/* Status HUD Banner */}
          <div className={`w-full text-center py-3 px-4 rounded-2xl mb-6 border transition-all ${
            isSuccess 
              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400' 
              : error 
              ? 'bg-rose-500/15 border-rose-500/35 text-rose-400'
              : 'bg-slate-950/60 border-slate-800 text-blue-400'
          }`}>
            {isSuccess ? (
              <span className="font-bold flex items-center justify-center gap-1.5 text-xs">
                <Sparkles className="animate-spin" size={14} /> {statusMessage}
              </span>
            ) : isVerifying ? (
              <span className="font-bold flex items-center justify-center gap-1.5 text-xs animate-pulse">
                <Loader2 className="animate-spin" size={14} /> {statusMessage}
              </span>
            ) : (
              <span className="text-xs font-semibold">{statusMessage}</span>
            )}
          </div>

          {/* Camera Frame */}
          {!error ? (
            <div className="w-full relative rounded-2xl overflow-hidden">
              <CameraCapture 
                ref={cameraRef}
                onCapture={handleCapture}
                autoCapture={true}
                showGuide={!isSuccess}
                disabled={isVerifying || isSuccess}
                livenessHUD={
                  isSuccess && (
                    <div className="bg-emerald-500 text-white font-bold text-xs py-1.5 px-4 rounded-full shadow-lg shadow-emerald-500/20">
                      MATCH CONFIRMED
                    </div>
                  )
                }
              />
              {/* Scanline Animation overlay while verifying */}
              {isVerifying && !isSuccess && (
                <div className="absolute inset-0 bg-blue-500/5 pointer-events-none">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_10px_#3b82f6] animate-scanline absolute top-0" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-[4/3] bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center p-6 text-center">
              <ShieldAlert className="text-rose-500 mb-3" size={44} />
              <h4 className="font-bold text-slate-200 text-sm mb-1">Access Denied</h4>
              <p className="text-slate-400 text-xs max-w-xs mb-6 font-medium leading-relaxed">{error}</p>
              
              <Button 
                variant="primary" 
                onClick={handleRetry} 
                className="w-full max-w-xs justify-center py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/10 cursor-pointer"
                icon={RefreshCw}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceLogin;
