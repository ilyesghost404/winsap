import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  ShieldCheck, Lock, Smartphone, Monitor, Globe, Clock,
  Trash2, AlertTriangle, Key, LogIn, ChevronRight, Server,
  RefreshCw, CheckCircle2, Camera
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import PasswordInput from '../components/PasswordInput';
import Modal from '../components/Modal';
import FaceRegistration from '../components/FaceRegistration';
import CameraCapture from '../components/CameraCapture';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const SecuritySettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Face ID state
  const [faceStatus, setFaceStatus] = useState({ registered: false });
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const [sessRes, histRes, faceRes] = await Promise.allSettled([
        api.get('/security/sessions'),
        api.get('/security/login-history'),
        api.get('/face/status'),
      ]);

      if (sessRes.status === 'fulfilled' && sessRes.value.data.success) {
        setSessions(sessRes.value.data.data || []);
      }
      if (histRes.status === 'fulfilled' && histRes.value.data.success) {
        setLoginHistory(histRes.value.data.data || []);
      }
      if (faceRes.status === 'fulfilled' && faceRes.value.data.success) {
        setFaceStatus(faceRes.value.data.data || { registered: false });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load security parameters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setIsChangingPassword(true);
      const res = await api.put('/auth/update-password', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      const res = await api.delete(`/security/sessions/${sessionId}`);
      if (res.data.success) {
        toast.success('Session revoked successfully');
        fetchSecurityData();
      }
    } catch (err) {
      toast.error('Failed to revoke session');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading security controls..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Security Settings
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Manage multi-factor authentication, active devices, and biometric facial access.
        </p>
      </div>

      {/* Biometric Face ID & 2FA Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Face ID Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Camera size={20} />
              </div>
              <StatusBadge status={faceStatus.registered ? 'active' : 'rejected'} type="dot" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-3">Biometric Face ID</h3>
            <p className="text-xs text-slate-500 mt-1">
              {faceStatus.registered
                ? 'Your face template is registered for high-speed kiosk and attendance check-in.'
                : 'Register your face to enable instantaneous kiosk check-ins and face login.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button
              size="sm"
              variant={faceStatus.registered ? 'secondary' : 'primary'}
              onClick={() => setIsFaceModalOpen(true)}
              className="w-full"
            >
              {faceStatus.registered ? 'Update Face Template' : 'Register Biometrics'}
            </Button>
          </div>
        </div>

        {/* Password Strength Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-3">Account Security Health</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your account is guarded with bcrypt hash authentication and JWT encrypted session tokens.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Protected by AbsenceFlow Auth</span>
            <span className="font-bold text-emerald-600">Active</span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <Card title="Update Password" subtitle="Choose a strong password with at least 8 characters">
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <PasswordInput
              required
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <PasswordInput
                required
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <PasswordInput
                required
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button type="submit" loading={isChangingPassword}>
              Save New Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Active Sessions Card */}
      <Card title="Active Sessions" subtitle="Devices and browsers currently logged into this account">
        {sessions.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No external active sessions found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 -mx-6 -my-6">
            {sessions.map((sess) => (
              <div key={sess.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Monitor size={18} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">
                      {sess.browser || 'Web Browser'} on {sess.os || 'Desktop'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {sess.ip_address || '127.0.0.1'} · Last active {new Date(sess.last_active).toLocaleString()}
                    </p>
                  </div>
                </div>

                <Button
                  size="xs"
                  variant="secondary"
                  icon={Trash2}
                  onClick={() => handleRevokeSession(sess.id)}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Biometric Registration Modal */}
      <Modal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        title="Biometric Face ID Setup"
        subtitle="Capture face template using your webcam."
      >
        <FaceRegistration
          employeeId={user?.employee_id}
          onSuccess={() => {
            setIsFaceModalOpen(false);
            fetchSecurityData();
            toast.success('Face biometric template registered successfully!');
          }}
        />
      </Modal>
    </div>
  );
};

export default SecuritySettings;
