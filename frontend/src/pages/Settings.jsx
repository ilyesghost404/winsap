import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  User, Bell, Palette, Shield, Save, Eye, EyeOff,
  Mail, CalendarCheck, CalendarRange, Lock, CheckCircle2, Zap,
  Camera, Trash2, AlertTriangle, Loader2
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import PasswordInput from '../components/PasswordInput';
import LoadingSpinner from '../components/LoadingSpinner';
import FaceRegistration from '../components/FaceRegistration';
import FaceVerification from '../components/FaceVerification';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications,
  updateNotifications,
  changePassword,
} from '../services/settingsService';
import {
  getMyFaceIdStatus,
  deleteMyFaceId
} from '../services/userService';

const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`
      relative inline-flex h-5.5 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer border
      ${checked ? 'bg-blue-600 border-blue-600 shadow-electric-glow' : 'bg-slate-200 border-slate-300'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    <span
      className={`
        inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200
        ${checked ? 'translate-x-5.5' : 'translate-x-1'}
      `}
    />
  </button>
);

const getPasswordStrength = (pw) => {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-rose-500' };
  if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 3) return { level: 3, label: 'Good', color: 'bg-blue-600' };
  return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
};

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Face ID state
  const [faceStatusLoading, setFaceStatusLoading] = useState(true);
  const [faceStatus, setFaceStatus] = useState({ configured: false, status: 'not_configured', registeredAt: null });
  const [faceAction, setFaceAction] = useState(null); // null | 'setup' | 'update' | 'remove'
  const [faceStep, setFaceStep] = useState(1); // 1: Verify current face, 2: Register new / Confirm removal
  const [verifyToken, setVerifyToken] = useState(null);
  const [removingFace, setRemovingFace] = useState(false);

  // Notifications
  const [notifSettings, setNotifSettings] = useState({
    email_leave_approval: true,
    email_leave_rejected: true,
    email_holiday_reminders: true,
    email_attendance_alerts: false,
  });

  // Password
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchFaceStatus = useCallback(async () => {
    try {
      setFaceStatusLoading(true);
      const res = await getMyFaceIdStatus();
      if (res && res.success) {
        setFaceStatus(res);
      }
    } catch (err) {
      console.warn('Failed to load Face ID status:', err);
    } finally {
      setFaceStatusLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const notifRes = await getNotifications().catch(() => null);

      if (notifRes) {
        setNotifSettings((prev) => ({ ...prev, ...notifRes }));
      }
      await fetchFaceStatus();
    } catch (err) {
      console.error('Error loading settings:', err);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [fetchFaceStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleNotif = async (key) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    try {
      await updateNotifications(updated);
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Failed to update notification setting');
      setNotifSettings(notifSettings);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setSaving(true);
      await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password updated successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Password change error:', err);
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const startSetupFace = () => {
    setFaceAction('setup');
    setFaceStep(2);
    setVerifyToken(null);
  };

  const startUpdateFace = () => {
    setFaceAction('update');
    setFaceStep(1);
    setVerifyToken(null);
  };

  const startRemoveFace = () => {
    setFaceAction('remove');
    setFaceStep(1);
    setVerifyToken(null);
  };

  const pwStrength = getPasswordStrength(pwForm.newPassword);

  const tabs = [
    { id: 'notifications', label: 'Email Notifications', icon: Bell },
    { id: 'security', label: 'Security & Password', icon: Lock },
  ];

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading settings & profile preferences…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Hero Banner Section ──────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] to-[#0064e0] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-100 font-heading mb-1">
              <Zap size={14} className="text-blue-100" />
              <span>User & System Preferences</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              SETTINGS & SECURITY
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Configure profile information, automated notifications, Face ID biometrics, and security preferences.
            </p>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────── */}
      <div className="bg-white p-1.5 rounded-2xl border border-[#dde5ec] shadow-premium-sm inline-flex gap-1.5 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-heading font-bold text-xs transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? 'bg-[#1c2b33] text-white shadow-electric-glow'
                    : 'text-slate-600 hover:text-[#0064e0] hover:bg-[#e7f0fa]'
                }
              `}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Notifications */}
      {activeTab === 'notifications' && (
        <Card headerVariant="light" title="Email Notification Settings" subtitle="Choose system alerts, approval digests, and holiday reminders">
          <div className="space-y-4 divide-y divide-slate-100">
            {[
              {
                key: 'email_leave_approval',
                title: 'Leave Request Approvals',
                desc: 'Receive confirmation email when your vacation or sickness application is validated.',
              },
              {
                key: 'email_leave_rejected',
                title: 'Leave Request Rejections',
                desc: 'Get notified if a leave or absence application is rejected by management.',
              },
              {
                key: 'email_holiday_reminders',
                title: 'Company Holiday Reminders',
                desc: 'Receive automated reminder emails ahead of upcoming public or company non-working days.',
              },
              {
                key: 'email_attendance_alerts',
                title: 'Daily Attendance Digest',
                desc: 'Receive daily check-in summary and anomaly notifications.',
              },
            ].map(({ key, title, desc }) => (
              <div key={key} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-heading font-bold text-slate-900">{title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
                <Toggle
                  checked={Boolean(notifSettings[key])}
                  onChange={() => handleToggleNotif(key)}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 2: Security */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Face ID / Biometric Authentication Card */}
          <Card
            headerVariant="light"
            title="Face ID / Biometric Authentication"
            subtitle="Manage your biometric face profile for passwordless login and instant verification"
          >
            {faceStatusLoading ? (
              <div className="py-6 flex items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mr-2" size={18} />
                <span className="text-xs font-semibold">Checking Face ID status…</span>
              </div>
            ) : faceStatus.configured ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl flex-shrink-0 border border-emerald-200 shadow-2xs">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-heading font-bold text-slate-900">Face ID Status</h4>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                        Configured
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Your Face ID is configured and ready for passwordless login and verification.
                      {faceStatus.registeredAt && (
                        <span className="block text-[11px] text-slate-400 mt-0.5 font-mono">
                          Registered on: {new Date(faceStatus.registeredAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                  <Button
                    variant="secondary"
                    onClick={startUpdateFace}
                    className="text-xs py-2 px-3"
                  >
                    <Camera size={14} className="mr-1.5 text-[#0064e0]" />
                    Update Face ID
                  </Button>

                  <Button
                    variant="danger"
                    onClick={startRemoveFace}
                    className="text-xs py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    <Trash2 size={14} className="mr-1.5" />
                    Remove Face ID
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-slate-200 text-slate-600 rounded-xl flex-shrink-0 border border-slate-300 shadow-2xs">
                    <Camera size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-heading font-bold text-slate-900">Face ID Status</h4>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                        Not configured
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Set up Face ID to use biometric verification for fast, secure login and attendance checks.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={startSetupFace}
                  className="text-xs py-2 px-4 whitespace-nowrap"
                >
                  <Camera size={14} className="mr-1.5" />
                  Set Up Face ID
                </Button>
              </div>
            )}
          </Card>

          {/* Change Password Card */}
          <Card headerVariant="light" title="Change Password" subtitle="Ensure your account is using a secure, long password">
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-heading font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <PasswordInput
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <PasswordInput
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  required
                />
                {pwForm.newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Strength:</span>
                      <span className={pwStrength.color.replace('bg-', 'text-')}>{pwStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pwStrength.color} transition-all duration-300`}
                        style={{ width: `${(pwStrength.level / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <PasswordInput
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100">
                <Button type="submit" loading={saving}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── Multi-Step Face ID Management Modal ──────────────────── */}
      {faceAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 relative animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Camera size={18} className="text-[#0064e0]" />
                {faceAction === 'setup' && 'Set Up Face ID'}
                {faceAction === 'update' && (faceStep === 1 ? 'Update Face ID (Step 1 of 2)' : 'Update Face ID (Step 2 of 2)')}
                {faceAction === 'remove' && (faceStep === 1 ? 'Remove Face ID (Step 1 of 2)' : 'Remove Face ID (Step 2 of 2)')}
              </h3>
              <button
                onClick={() => setFaceAction(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Verify Current Face ID (for update and remove) */}
            {faceStep === 1 && (faceAction === 'update' || faceAction === 'remove') && (
              <FaceVerification
                onSuccess={(token) => {
                  setVerifyToken(token);
                  setFaceStep(2);
                }}
                onCancel={() => setFaceAction(null)}
              />
            )}

            {/* Step 2: Register New Face ID for Setup */}
            {faceStep === 2 && faceAction === 'setup' && (
              <FaceRegistration
                useMeEndpoint={true}
                mode="register"
                onSuccess={() => {
                  setFaceAction(null);
                  toast.success('Face ID set up successfully!');
                  fetchFaceStatus();
                }}
              />
            )}

            {/* Step 2: Register New Face ID for Update */}
            {faceStep === 2 && faceAction === 'update' && (
              <FaceRegistration
                useMeEndpoint={true}
                mode="update"
                verifyToken={verifyToken}
                onSuccess={() => {
                  setFaceAction(null);
                  toast.success('Face ID updated successfully!');
                  fetchFaceStatus();
                }}
              />
            )}

            {/* Step 2: Confirmation Dialog for Remove */}
            {faceStep === 2 && faceAction === 'remove' && (
              <div className="text-center py-3">
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xs">
                  <AlertTriangle size={28} />
                </div>
                <h3 className="font-heading font-black text-lg text-slate-900 mb-1">
                  Remove Face ID?
                </h3>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed max-w-sm mx-auto">
                  Biometric verification succeeded. Are you sure you want to remove your Face ID? Removing it will disable Face ID authentication until it is configured again.
                </p>

                <div className="flex items-center gap-3 max-w-xs mx-auto">
                  <Button
                    variant="secondary"
                    onClick={() => setFaceAction(null)}
                    disabled={removingFace}
                    className="flex-1 text-xs py-2.5"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    loading={removingFace}
                    onClick={async () => {
                      try {
                        setRemovingFace(true);
                        const res = await deleteMyFaceId(verifyToken);
                        if (res && res.success) {
                          toast.success('Face ID profile removed successfully');
                          setFaceStatus({ configured: false, status: 'not_configured', registeredAt: null });
                          setFaceAction(null);
                        }
                      } catch (err) {
                        console.error('Failed to remove Face ID:', err);
                        toast.error(err.response?.data?.message || 'Failed to remove Face ID');
                      } finally {
                        setRemovingFace(false);
                      }
                    }}
                    className="flex-1 text-xs py-2.5 bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    Yes, Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
