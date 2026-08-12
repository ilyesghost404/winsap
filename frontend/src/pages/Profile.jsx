import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Mail, Briefcase, Calendar, Hash, Building2, ShieldCheck,
  Phone, Edit2, CalendarDays, Clock, CheckCircle2, User, Zap, Sparkles
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getEmployeeById, updateEmployee } from '../services/employeeService';
import { getDashboardStats } from '../services/dashboardService';

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const [year, month, day] = cleanStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const ProfileInfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#dde5ec] shadow-premium-sm transition-all hover:border-[#0082fb] hover:shadow-blue-sm">
    <div className="w-10 h-10 rounded-xl bg-[#e7f0fa] text-[#0064e0] flex items-center justify-center flex-shrink-0 border border-[#dde5ec] shadow-2xs">
      <Icon size={18} strokeWidth={2.4} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-heading font-extrabold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-xs sm:text-sm font-bold text-[#1c2b33] truncate mt-0.5">
        {value || <span className="text-slate-400 font-normal">Not specified</span>}
      </p>
    </div>
  </div>
);

const Profile = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    matricule: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    hire_date: '',
  });

  const fetchProfileData = async () => {
    try {
      if (!user?.employee_id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const [empData, statsData] = await Promise.all([
        getEmployeeById(user.employee_id),
        getDashboardStats().catch(() => null),
      ]);
      setEmployee(empData);
      setStats(statsData);
      setFormData({
        matricule: empData.matricule || '',
        first_name: empData.first_name || '',
        last_name: empData.last_name || '',
        email: empData.email || '',
        phone: empData.phone || '',
        department: empData.department || '',
        position: empData.position || '',
        hire_date: empData.hire_date ? empData.hire_date.split('T')[0] : '',
      });
    } catch (error) {
      console.error('Failed to load profile data:', error);
      toast.error('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await updateEmployee(user.employee_id, formData);
      toast.success('Profile updated successfully');
      setIsEditModalOpen(false);
      fetchProfileData();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading profile details…" />
      </div>
    );
  }

  const initials = employee
    ? `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase()
    : user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      {/* ── Meta Dark Slate & Deep Blue Hero Banner ────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] to-[#0064e0] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1c2b33] text-white text-2xl font-heading font-black flex items-center justify-center flex-shrink-0 shadow-electric-glow border border-white/30">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-3xl font-heading font-black tracking-tight text-white">
                  {employee
                    ? `${employee.first_name} ${employee.last_name}`
                    : user?.username || 'Account Profile'}
                </h2>
                <StatusBadge status="active" type="dot" />
              </div>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 flex items-center gap-2 flex-wrap">
                <span>{employee?.position || 'Team Member'}</span>
                <span>·</span>
                <span>{employee?.department || 'AbsenceFlow'}</span>
                <span>·</span>
                <span className="font-mono text-white font-extrabold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs border border-white/30">
                  #{employee?.matricule || user?.role}
                </span>
              </p>
            </div>
          </div>

          {employee && (
            <Button variant="secondary" icon={Edit2} onClick={() => setIsEditModalOpen(true)} size="sm">
              Edit Profile
            </Button>
          )}
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
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

      {/* Detailed Information Grid */}
      <Card
        headerVariant="softBlue"
        title="Personal & Organizational Details"
        subtitle="Primary company credentials, contact channels, and system allocation."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <ProfileInfoRow
            icon={Hash}
            label="Matricule / Employee ID"
            value={employee?.matricule || 'N/A'}
          />
          <ProfileInfoRow
            icon={Mail}
            label="Email Address"
            value={employee?.email || user?.email || 'N/A'}
          />
          <ProfileInfoRow
            icon={Phone}
            label="Phone Number"
            value={employee?.phone || 'Not provided'}
          />
          <ProfileInfoRow
            icon={Building2}
            label="Department"
            value={employee?.department || 'Unassigned'}
          />
          <ProfileInfoRow
            icon={Briefcase}
            label="Position / Role"
            value={employee?.position || 'Staff'}
          />
          <ProfileInfoRow
            icon={Calendar}
            label="Hire Date"
            value={
              parseLocalDate(employee?.hire_date)?.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }) || 'Not recorded'
            }
          />
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Personal Information"
        subtitle="Update contact phone, email, and position."
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-extrabold text-[#1c2b33] uppercase tracking-wider mb-1.5">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f1f5f8] border border-[#dde5ec] rounded-xl text-xs sm:text-sm font-semibold text-[#1c2b33] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-heading font-extrabold text-[#1c2b33] uppercase tracking-wider mb-1.5">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f1f5f8] border border-[#dde5ec] rounded-xl text-xs sm:text-sm font-semibold text-[#1c2b33] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-extrabold text-[#1c2b33] uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f1f5f8] border border-[#dde5ec] rounded-xl text-xs sm:text-sm font-semibold text-[#1c2b33] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-heading font-extrabold text-[#1c2b33] uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f1f5f8] border border-[#dde5ec] rounded-xl text-xs sm:text-sm font-semibold text-[#1c2b33] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold text-[#1c2b33] uppercase tracking-wider mb-1.5">
              Position
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#f1f5f8] border border-[#dde5ec] rounded-xl text-xs sm:text-sm font-semibold text-[#1c2b33] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#dde5ec]">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
