import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  User, Bell, Palette, Shield, Save, Eye, EyeOff,
  Mail, CalendarCheck, CalendarRange, Lock, CheckCircle2, Zap
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import PasswordInput from '../components/PasswordInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  getProfile,
  updateProfile,
  getNotifications,
  updateNotifications,
  getAppearance,
  updateAppearance,
  changePassword,
} from '../services/settingsService';

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
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, notifRes] = await Promise.allSettled([
        getProfile(),
        getNotifications(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setProfileForm({
          username: profileRes.value.username || '',
          email: profileRes.value.email || '',
          first_name: profileRes.value.first_name || '',
          last_name: profileRes.value.last_name || '',
          phone: profileRes.value.phone || '',
        });
      }

      if (notifRes.status === 'fulfilled' && notifRes.value) {
        setNotifSettings((prev) => ({ ...prev, ...notifRes.value }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile(profileForm);
      toast.success('Account profile updated successfully');
    } catch (err) {
      console.error('Save profile error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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

  const pwStrength = getPasswordStrength(pwForm.newPassword);

  const tabs = [
    { id: 'profile', label: 'My Account', icon: User },
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
              Configure profile information, automated notifications, authentication security, and account preferences.
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

      {/* Tab 1: Profile Account */}
      {activeTab === 'profile' && (
        <Card headerVariant="light" title="Account Information" subtitle="Update login username, full name, and contact details">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-heading font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dde5ec] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dde5ec] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-heading font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dde5ec] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dde5ec] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#dde5ec]">
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Notifications */}
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

      {/* Tab 3: Security */}
      {activeTab === 'security' && (
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
      )}
    </div>
  );
};

export default Settings;
