import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';
import Button from '../components/Button';

const FaceLogin = () => {
  const { faceLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [statusMessage, setStatusMessage] = useState('Align your face within the frame');
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const cameraRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const isRequestPending = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
    setStatusMessage('Analyzing facial geometry and liveness…');
    setError(null);

    try {
      const user = await faceLogin(base64Image);
      if (user) {
        setIsSuccess(true);
        setStatusMessage('Identity verified! Access granted.');
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
        }
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err) {
      console.error('[FaceLogin] Error:', err);
      const reason = err.response?.data?.reason;
      const msg = err.response?.data?.message;

      if (reason === 'FACE_NOT_DETECTED') {
        setStatusMessage('Looking for face… Please center yourself.');
      } else if (reason === 'MULTIPLE_FACES') {
        setStatusMessage('Only one person allowed in frame.');
      } else if (reason === 'LIVENESS_FAILED') {
        setError('Spoofing detected. Please face the live camera.');
      } else if (reason === 'FACE_NOT_MATCHED') {
        setError('Face signature not recognized or not registered.');
      } else {
        setError(msg || 'Biometric verification failed. Try again.');
      }
    } finally {
      isRequestPending.current = false;
      setIsVerifying(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsVerifying(false);
    setStatusMessage('Align your face within the frame');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft Blue Ambient Gradient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-electric-glow mb-3.5 border border-blue-400/40">
            <Camera size={26} />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold uppercase tracking-widest text-blue-600 mb-1">
            <Zap size={14} />
            <span>AI BIOMETRIC ACCESS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[#172033]">
            Biometric Face Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fast, passwordless AI facial recognition for registered staff members
          </p>
        </div>

        {/* Camera Card */}
        <div className="bg-white rounded-3xl border border-[#d9e7f5] p-6 sm:p-8 shadow-blue-sm flex flex-col items-center text-center space-y-4">
          <div className="w-full bg-[#f0f7ff] rounded-xl p-3 border border-[#d9e7f5]">
            <p className="text-xs font-bold text-blue-700 animate-pulse">{statusMessage}</p>
          </div>

          {error && (
            <div className="w-full p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="py-12 flex flex-col items-center space-y-3 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-md">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-base font-black font-heading text-[#172033]">Welcome back!</h3>
              <p className="text-xs text-slate-500 font-semibold">Redirecting to your dashboard…</p>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <CameraCapture
                ref={cameraRef}
                onCapture={handleCapture}
                autoCapture={true}
                disabled={!!error || isVerifying}
              />

              {error && (
                <Button
                  variant="secondary"
                  icon={RefreshCw}
                  onClick={handleRetry}
                  className="w-full"
                >
                  Try Again
                </Button>
              )}
            </div>
          )}

          <div className="w-full pt-4 border-t border-[#d9e7f5] flex items-center justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={14} />
              Return to standard password login
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-blue-600" />
          <span className="font-semibold">Local Biometric Signature Protection · AbsenceFlow</span>
        </div>
      </div>
    </div>
  );
};

export default FaceLogin;
