import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Clock, RefreshCw, Zap } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Button from '../components/Button';

const VerifyResetCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(60);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error('Session expired. Please request a new code.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (value !== '' && !/^[0-9]$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setCode(digits);
    inputRefs.current[5].focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the code.');
      return;
    }

    if (timeLeft <= 0) {
      setError('The verification code has expired. Please request a new code.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/auth/verify-reset-code', { email, code: fullCode });
      toast.success('Verification successful!');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('New code sent to your email.');
      setTimeLeft(600);
      setResendCooldown(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
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
            <KeyRound size={26} />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold uppercase tracking-widest text-blue-600 mb-1">
            <Zap size={14} />
            <span>2-FACTOR SECURITY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[#172033]">
            Verify Security Code
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            We sent a 6-digit confirmation PIN to <strong className="text-[#172033] font-mono">{email}</strong>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#d9e7f5] p-6 sm:p-8 shadow-blue-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-heading font-black text-[#172033] bg-[#f0f7ff] border-2 border-[#d9e7f5] rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                />
              ))}
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500">
              <Clock size={14} className="text-blue-600" />
              <span>Code expires in: </span>
              <span className={`font-mono font-black ${timeLeft < 60 ? 'text-rose-600' : 'text-blue-600'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full" size="md">
              Verify Security Code
            </Button>

            {/* Resend Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw size={13} className={isResending ? 'animate-spin' : ''} />
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : 'Didn’t receive code? Resend PIN'}
              </button>
            </div>

            <div className="text-center pt-3 border-t border-[#d9e7f5]">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={14} /> Back to email entry
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetCode;
