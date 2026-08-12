import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Button from '../components/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Verification code sent successfully!');
      navigate('/verify-reset-code', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request. Please try again.');
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
            <Mail size={26} />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold uppercase tracking-widest text-blue-600 mb-1">
            <Zap size={14} />
            <span>ACCOUNT RECOVERY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[#172033]">
            Forgot Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter your registered email and we'll send a 6-digit verification code.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#d9e7f5] p-6 sm:p-8 shadow-blue-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#f0f7ff] border border-[#d9e7f5] rounded-xl text-sm font-semibold text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full mt-2" size="md">
              Send Verification Code
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
        </div>

        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-blue-600" />
          <span className="font-semibold">Encrypted with TLS 1.3 · AbsenceFlow</span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
