import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Mail, Briefcase, Calendar, Hash, Building2, ShieldCheck,
  Phone, Edit2, CalendarDays, Clock, CheckCircle2, User, Camera,
  Trash2, Upload, Check, X, ShieldAlert, Sparkles, Lock
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, uploadAvatar, deleteAvatar } from '../services/profileService';
import { getDashboardStats } from '../services/dashboardService';

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const [year, month, day] = cleanStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const ProfileInfoRow = ({ icon: Icon, label, value, isReadOnly = false, isEditing = false, children }) => (
  <div className={`p-4 rounded-2xl border transition-all ${
    isEditing && !isReadOnly 
      ? 'bg-blue-50/40 border-blue-200 shadow-blue-xs' 
      : 'bg-white border-[#dde5ec] shadow-premium-sm hover:border-[#0082fb] hover:shadow-blue-sm'
  }`}>
    <div className="flex items-center gap-3.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-2xs ${
        isEditing && !isReadOnly ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#e7f0fa] text-[#0064e0] border-[#dde5ec]'
      }`}>
        <Icon size={18} strokeWidth={2.4} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-heading font-extrabold text-slate-500 uppercase tracking-wider">{label}</p>
          {isReadOnly && isEditing && (
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Lock size={10} /> Read Only
            </span>
          )}
        </div>
        {isEditing && !isReadOnly && children ? (
          <div className="mt-1.5">{children}</div>
        ) : (
          <p className="text-xs sm:text-sm font-bold text-[#1c2b33] truncate mt-0.5">
            {value || <span className="text-slate-400 font-normal">Not specified</span>}
          </p>
        )}
      </div>
    </div>
  </div>
);

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
  });

  const fileInputRef = useRef(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        getProfile(),
        getDashboardStats().catch(() => null)
      ]);

      if (profileRes.success) {
        const data = profileRes.data;
        setProfileData(data);
        setFormData({
          username: data.username || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          department: data.department || '',
          position: data.position || '',
        });

        // Sync global auth state
        updateUser(data);
      }
      setStats(statsRes);
    } catch (error) {
      console.error('[Profile] Load error:', error);
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Avatar Upload Handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please select a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5 MB. Please choose a smaller image.');
      return;
    }

    try {
      setIsAvatarUploading(true);
      const res = await uploadAvatar(file);
      if (res.success) {
        toast.success('Profile picture updated successfully!');
        const updatedAvatarUrl = res.avatar_url;
        setProfileData(prev => ({ ...prev, avatar_url: updatedAvatarUrl }));
        updateUser({ avatar_url: updatedAvatarUrl });
      }
    } catch (error) {
      console.error('[Profile] Avatar upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setIsAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Avatar Removal Handler
  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    try {
      setIsAvatarUploading(true);
      const res = await deleteAvatar();
      if (res.success) {
        toast.success('Profile picture removed.');
        setProfileData(prev => ({ ...prev, avatar_url: null }));
        updateUser({ avatar_url: null });
      }
    } catch (error) {
      console.error('[Profile] Avatar delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove profile picture.');
    } finally {
      setIsAvatarUploading(false);
    }
  };

  // Profile Save Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await updateProfile({
        username: formData.username.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        position: formData.position.trim(),
      });

      if (res.success) {
        toast.success('Profile changes saved successfully!');
        setProfileData(res.data);
        updateUser(res.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('[Profile] Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Editing
  const handleCancelEditing = () => {
    if (profileData) {
      setFormData({
        username: profileData.username || '',
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        department: profileData.department || '',
        position: profileData.position || '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading profile details…" />
      </div>
    );
  }

  const currentAvatar = profileData?.avatar_url || user?.avatar_url;
  const displayName = profileData?.first_name && profileData?.last_name
    ? `${profileData.first_name} ${profileData.last_name}`
    : profileData?.username || user?.username || 'Authorized User';

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="space-y-6 select-none">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* ── Meta Dark Slate & Deep Blue Hero Banner ────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] via-[#0f1d24] to-[#0064e0] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            
            {/* Avatar Container with Camera Overlay */}
            <div className="relative group self-start sm:self-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1c2b33] text-white text-2xl font-heading font-black flex items-center justify-center shadow-electric-glow border-2 border-white/30 overflow-hidden relative">
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black font-heading text-white">{initials}</span>
                )}

                {/* Loading overlay for upload */}
                {isAvatarUploading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                    <LoadingSpinner size="sm" color="white" />
                  </div>
                )}
              </div>

              {/* Camera Icon Overlay Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAvatarUploading}
                className="absolute -bottom-1.5 -right-1.5 p-2 bg-[#0064e0] hover:bg-[#0082fb] text-white rounded-xl shadow-lg border border-white/40 transition-transform active:scale-95 cursor-pointer"
                title="Change profile picture"
              >
                <Camera size={14} strokeWidth={2.5} />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
                  {displayName}
                </h2>
                <StatusBadge status={profileData?.account_status === 'Active' ? 'active' : 'pending'} type="dot" />
              </div>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 flex items-center gap-2 flex-wrap font-medium">
                <span>@{profileData?.username || user?.username}</span>
                <span>·</span>
                <span>{profileData?.position || 'Team Member'}</span>
                <span>·</span>
                <span>{profileData?.department || 'AbsenceFlow'}</span>
                <span>·</span>
                <span className="font-mono text-white font-extrabold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs border border-white/30 text-xs">
                  #{profileData?.matricule || user?.role}
                </span>
              </p>
            </div>
          </div>

          {/* Action Header Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {currentAvatar && (
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={handleRemoveAvatar}
                loading={isAvatarUploading}
              >
                Remove Photo
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              icon={Upload}
              onClick={() => fileInputRef.current?.click()}
              loading={isAvatarUploading}
            >
              Upload Photo
            </Button>

            {!isEditing && (
              <Button
                variant="secondary"
                size="sm"
                icon={Edit2}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Ambient Glow Background Effect */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Metrics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Present Days"
            value={stats.presentDays ?? 0}
            subtitle="Current cycle"
            icon={CheckCircle2}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-50 border border-emerald-200"
          />
          <StatsCard
            title="Approved Leave"
            value={stats.approvedAbsences ?? 0}
            subtitle="Validated requests"
            icon={CalendarDays}
            variant="blue"
          />
          <StatsCard
            title="Pending Requests"
            value={stats.pendingAbsences ?? 0}
            subtitle="Under review"
            icon={Clock}
            colorClass="text-amber-600"
            bgClass="bg-amber-50 border border-amber-200"
          />
        </div>
      )}

      {/* Profile Form / Detailed Details Grid */}
      <form onSubmit={handleSaveProfile}>
        <Card
          headerVariant="softBlue"
          title={isEditing ? 'Edit Personal Credentials' : 'Personal & Organizational Credentials'}
          subtitle={isEditing ? 'Modify your display username, full name, phone number, and position.' : 'Primary company credentials, contact channels, and system allocation.'}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Username */}
            <ProfileInfoRow
              icon={User}
              label="Username"
              value={`@${formData.username}`}
              isEditing={isEditing}
            >
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
                className="w-full px-3 py-2 bg-white border border-[#dde5ec] rounded-xl text-xs font-semibold text-[#1c2b33] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0]"
              />
            </ProfileInfoRow>

            {/* Email Address (Read-only for security) */}
            <ProfileInfoRow
              icon={Mail}
              label="Email Address"
              value={profileData?.email || user?.email || 'N/A'}
              isReadOnly={true}
              isEditing={isEditing}
            />

            {/* First Name */}
            <ProfileInfoRow
              icon={User}
              label="First Name"
              value={profileData?.first_name || 'Not set'}
              isEditing={isEditing}
            >
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="First name"
                className="w-full px-3 py-2 bg-white border border-[#dde5ec] rounded-xl text-xs font-semibold text-[#1c2b33] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0]"
              />
            </ProfileInfoRow>

            {/* Last Name */}
            <ProfileInfoRow
              icon={User}
              label="Last Name"
              value={profileData?.last_name || 'Not set'}
              isEditing={isEditing}
            >
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Last name"
                className="w-full px-3 py-2 bg-white border border-[#dde5ec] rounded-xl text-xs font-semibold text-[#1c2b33] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0]"
              />
            </ProfileInfoRow>

            {/* Phone Number */}
            <ProfileInfoRow
              icon={Phone}
              label="Phone Number"
              value={formData.phone || 'Not provided'}
              isEditing={isEditing}
            >
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
                className="w-full px-3 py-2 bg-white border border-[#dde5ec] rounded-xl text-xs font-semibold text-[#1c2b33] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0]"
              />
            </ProfileInfoRow>

            {/* Position / Job Title */}
            <ProfileInfoRow
              icon={Briefcase}
              label="Position / Job Title"
              value={formData.position || 'Staff Member'}
              isEditing={isEditing}
            >
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Position title"
                className="w-full px-3 py-2 bg-white border border-[#dde5ec] rounded-xl text-xs font-semibold text-[#1c2b33] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0]"
              />
            </ProfileInfoRow>

            {/* Department (System / Organization) */}
            <ProfileInfoRow
              icon={Building2}
              label="Department"
              value={profileData?.department || 'Unassigned'}
              isReadOnly={true}
              isEditing={isEditing}
            />

            {/* Matricule / Employee ID */}
            <ProfileInfoRow
              icon={Hash}
              label="Matricule / Employee ID"
              value={profileData?.matricule || 'N/A'}
              isReadOnly={true}
              isEditing={isEditing}
            />

            {/* Role & Permissions */}
            <ProfileInfoRow
              icon={ShieldCheck}
              label="System Authorization Role"
              value={(profileData?.role || user?.role || 'employee').toUpperCase()}
              isReadOnly={true}
              isEditing={isEditing}
            />

            {/* Hire Date */}
            <ProfileInfoRow
              icon={Calendar}
              label="Hire Date"
              value={
                parseLocalDate(profileData?.hire_date)?.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }) || 'Not recorded'
              }
              isReadOnly={true}
              isEditing={isEditing}
            />
          </div>

          {/* Edit Mode Control Buttons Footer */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-[#dde5ec]">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelEditing}
                disabled={isSubmitting}
                icon={X}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                icon={Check}
              >
                Save Changes
              </Button>
            </div>
          )}
        </Card>
      </form>
    </div>
  );
};

export default Profile;
