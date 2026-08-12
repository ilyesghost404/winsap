import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertTriangle, Camera, ArrowRight, SkipForward, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Button from '../components/Button';
import FaceRegistration from '../components/FaceRegistration';
import PasswordInput from '../components/PasswordInput';
import LoadingSpinner from '../components/LoadingSpinner';
import WinsapLogo from '../components/WinsapLogo';

const ActivateAccount = () => {
  const [step, setStep] = useState(1); // 1: Password, 2: Optional Face, 3: Success
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('checking'); // 'checking' | 'valid' | 'invalid' | 'expired' | 'already_activated'
  const [errorMessage, setErrorMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [showFaceCamera, setShowFaceCamera] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const routeParams = useParams();

  // Robustly extract token from route parameters, query string, pathname, or hash
  const extractToken = () => {
    // 1. Check React Router route params (e.g. /activate-account/:token)
    if (routeParams?.token) return routeParams.token;

    // 2. Check query string in location.search
    let params = new URLSearchParams(location.search);
    let t = params.get('token');
    if (t) return t;

    // 3. Check query string in window.location.search
    params = new URLSearchParams(window.location.search);
    t = params.get('token');
    if (t) return t;

    // 4. Check pathname directly (e.g. /activate-account/TOKEN)
    const pathname = location.pathname || window.location.pathname || '';
    if (pathname.includes('/activate-account/')) {
      const pathSegment = pathname.split('/activate-account/')[1];
      if (pathSegment && pathSegment.trim() !== '') {
        return pathSegment.split('?')[0].split('#')[0];
      }
    }

    // 5. Check hash fragments
    if (location.hash && location.hash.includes('?')) {
      const query = location.hash.split('?')[1];
      params = new URLSearchParams(query);
      t = params.get('token');
      if (t) return t;
    }

    if (window.location.hash && window.location.hash.includes('?')) {
      const query = window.location.hash.split('?')[1];
      params = new URLSearchParams(query);
      t = params.get('token');
      if (t) return t;
    }

    return null;
  };

  const getTimestamp = () => new Date().toISOString().split('T')[1].slice(0, 12);

  useEffect(() => {
    console.log(`[ACTIVATION] Component mounted: ${getTimestamp()}`);
    let isMounted = true;

    const checkToken = async () => {
      try {
        const extractedToken = extractToken();
        console.log(`[ACTIVATION] Token extracted: ${getTimestamp()} (Present: ${!!extractedToken})`);

        if (!extractedToken) {
          if (isMounted) {
            setErrorMessage('Invalid activation link.');
            setVerificationStatus('invalid');
          }
          return;
        }

        setToken(extractedToken);

        console.log(`[ACTIVATION] Verification request started: ${getTimestamp()}`);
        const res = await api.get(`/users/activate-account/verify?token=${encodeURIComponent(extractedToken)}`, {
          timeout: 10000
        });
        console.log(`[ACTIVATION] Verification response: ${getTimestamp()} (Success: ${res.data?.success})`);

        if (isMounted) {
          if (res.data.success) {
            setUserInfo(res.data.data);
            setVerificationStatus('valid');
            console.log(`[ACTIVATION] Form rendered: ${getTimestamp()}`);
          } else {
            setErrorMessage(res.data.message || 'Invalid activation link.');
            setVerificationStatus(res.data.reason || 'invalid');
          }
        }
      } catch (error) {
        console.error(`[ACTIVATION] Verification error at ${getTimestamp()}:`, error);
        if (isMounted) {
          const reason = error.response?.data?.reason || (error.code === 'ECONNABORTED' ? 'timeout' : 'invalid');
          const msg = error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'Unable to verify activation link. Please try again.' : 'Invalid activation link.');
          setErrorMessage(msg);
          setVerificationStatus(reason);
        }
      }
    };

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [location.search, location.pathname, routeParams?.token]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post('/users/activate-account', { token, password });
      if (res.data.success) {
        toast.success('Password set successfully!');
        setUserInfo((prev) => ({ ...prev, employee_id: res.data.data?.employeeId || prev?.employee_id }));
        setStep(2); // Step 2: Optional Face Registration
      }
    } catch (error) {
      console.error('Activation error:', error);
      const msg = error.response?.data?.message || 'Failed to activate account.';
      const reason = error.response?.data?.reason;
      toast.error(msg);
      if (reason && reason !== 'valid') {
        setErrorMessage(msg);
        setVerificationStatus(reason);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipFace = () => {
    toast.success('Face ID skipped. You can enable it anytime from your profile settings.');
    setStep(3); // Complete activation
  };

  const handleFaceSuccess = () => {
    toast.success('Face ID registered successfully!');
    setStep(3); // Complete activation
  };

  // 1. Loading State
  if (verificationStatus === 'checking') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <LoadingSpinner size="lg" text="Verifying activation link…" />
      </div>
    );
  }

  // 1b. Timeout State
  if (verificationStatus === 'timeout') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-amber-200/80 p-8 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">Verification Timeout</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {errorMessage || 'Unable to verify activation link. Please try again.'}
          </p>
          <div className="flex gap-3 mt-2">
            <Button variant="secondary" className="w-1/2" onClick={() => navigate('/login')}>
              Return to Login
            </Button>
            <Button className="w-1/2" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Expired Link
  if (verificationStatus === 'expired') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-amber-200/80 p-8 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">Activation Link Expired</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {errorMessage || 'Activation link has expired.'} Please contact your system administrator to resend a new activation link.
          </p>
          <Button className="w-full mt-2" onClick={() => navigate('/login')}>
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  // 3. Already Activated
  if (verificationStatus === 'already_activated') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-blue-200/80 p-8 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100">
            <Info size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">Account Already Activated</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {errorMessage || 'This account has already been activated.'} You can log into your workspace now.
          </p>
          <Button className="w-full mt-2" onClick={() => navigate('/login')}>
            Proceed to Login
          </Button>
        </div>
      </div>
    );
  }

  // 4. Invalid Link
  if (verificationStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200/80 p-8 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">Invalid Activation Link</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {errorMessage || 'Invalid activation link.'} Please check the link URL or request a new activation link from your administrator.
          </p>
          <Button className="w-full mt-2" onClick={() => navigate('/login')}>
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  // 5. Activation Completed State
  if (step === 3) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-emerald-200/80 p-8 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-heading">Account Activated!</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Your password has been set and your account status is now <span className="font-bold text-emerald-600">Active</span>. You can now log into Winsap workspace.
          </p>
          <Button className="w-full mt-4" size="lg" onClick={() => navigate('/login')}>
            Proceed to Login
          </Button>
        </div>
      </div>
    );
  }

  // 6. Valid Wizard Steps (Step 1: Password, Step 2: Optional Face)
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="mb-1 flex justify-center">
            <WinsapLogo variant="full" colorMode="original" size="2xl" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Account Activation Wizard
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-2 pt-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
              <span>1. Set Password</span>
            </div>
            <ArrowRight size={14} className="text-slate-300" />
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              <span>2. Optional Face ID</span>
            </div>
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          {step === 1 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {userInfo && (
                <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-2xl text-xs text-blue-900 font-medium">
                  Welcome <span className="font-bold">{userInfo.username}</span>! Please create a strong password for your account (<span className="font-mono">{userInfo.email}</span>).
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <PasswordInput
                  required
                  placeholder="Min. 8 characters (1 uppercase, 1 number, 1 special)"
                  value={password}
                  onChange={(e) => setPassword(typeof e === 'string' ? e : e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <PasswordInput
                  required
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(typeof e === 'string' ? e : e.target.value)}
                />
              </div>

              <Button type="submit" loading={isLoading} className="w-full mt-2" size="md">
                Set Password & Continue
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
                <Camera size={28} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  Optional Facial Biometrics
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                  Register your Face ID now for secure facial authentication.
                </p>
              </div>

              {!showFaceCamera ? (
                <div className="space-y-3 pt-2">
                  <Button
                    className="w-full"
                    icon={Camera}
                    onClick={() => setShowFaceCamera(true)}
                  >
                    Register Face ID
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    icon={SkipForward}
                    onClick={handleSkipFace}
                  >
                    Skip for now
                  </Button>
                  <p className="text-[11px] text-slate-400 font-medium">
                    You can register or update your Face ID anytime later from your profile.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <FaceRegistration
                    employeeId={userInfo?.employee_id}
                    token={token}
                    onSuccess={handleFaceSuccess}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowFaceCamera(false)}
                  >
                    Cancel Camera Registration
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;
