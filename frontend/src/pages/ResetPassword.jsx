import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowLeft, Zap } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import PasswordInput from '../components/PasswordInput';
import Button from '../components/Button';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email && !success) {
      toast.error('Session expired. Please request a new code.');
      navigate('/forgot-password');
    }
  }, [email, navigate, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/auth/reset-password', { email, newPassword });
      toast.success('Password reset successfully!');
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
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
            <ShieldCheck size={26} />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold uppercase tracking-widest text-blue-600 mb-1">
            <Zap size={14} />
            <span>CREDENTIAL SECURITY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[#172033]">
            Create New Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose a new secure password for <strong className="text-[#172033] font-mono">{email}</strong>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#d9e7f5] p-6 sm:p-8 shadow-blue-sm">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-200 shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-base font-black font-heading text-[#172033]">Password Reset Successfully</h3>
                <p className="text-xs text-slate-500 mt-1">
                  You can now log in using your newly created password.
                </p>
              </div>
              <Button onClick={() => navigate('/login')} className="w-full mt-3">
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <PasswordInput
                  required
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#d9e7f5] rounded-xl text-sm font-semibold text-[#172033] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <PasswordInput
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#d9e7f5] rounded-xl text-sm font-semibold text-[#172033] focus:bg-white"
                />
              </div>

              <Button type="submit" loading={isSubmitting} className="w-full mt-2" size="md">
                Reset Password
              </Button>

              <div className="text-center pt-3 border-t border-[#d9e7f5]">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-blue-600" />
          <span className="font-semibold">Encrypted with TLS 1.3 · AbsenceFlow</span>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
