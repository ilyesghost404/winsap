import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email address…');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.post('/users/verify-email', { token });
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully. You can now log in.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The token may be expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft Blue Ambient Gradient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-electric-glow mb-3.5 border border-blue-400/40">
            <MailCheck size={26} />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold uppercase tracking-widest text-blue-600 mb-1">
            <Zap size={14} />
            <span>EMAIL VERIFICATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[#172033]">
            Account Confirmation
          </h1>
        </div>

        <div className="bg-white rounded-3xl border border-[#d9e7f5] p-6 sm:p-8 shadow-blue-sm text-center">
          {status === 'loading' && (
            <div className="py-6 flex flex-col items-center justify-center">
              <LoadingSpinner size="md" text={message} />
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4 py-2">
              <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-200 shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-base font-black font-heading text-[#172033]">Email Verified Successfully</h3>
                <p className="text-xs text-slate-500 mt-1">{message}</p>
              </div>
              <Button onClick={() => navigate('/login')} className="w-full mt-3">
                Go to Sign In
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4 py-2">
              <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-200">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-base font-black font-heading text-[#172033]">Verification Failed</h3>
                <p className="text-xs text-slate-500 mt-1">{message}</p>
              </div>
              <Button variant="secondary" onClick={() => navigate('/login')} className="w-full mt-3">
                Back to Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
