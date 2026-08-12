import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  LogIn, LogOut, Clock, CalendarDays, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import Card from '../Card';
import StatsCard from '../StatsCard';
import Button from '../Button';
import LoadingSpinner from '../LoadingSpinner';
import StatusBadge from '../StatusBadge';
import { checkIn, checkOut } from '../../services/presenceService';
import { getAttendance } from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import AttendanceVerifyModal from './AttendanceVerifyModal';

const EmployeeAttendanceView = () => {
  const { user } = useAuth();
  const employeeId = user?.employee_id;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyType, setVerifyType] = useState('check-in');

  const fetchHistory = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const data = await getAttendance(
        employeeId,
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      );
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  }, [employeeId, currentDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCheckIn = () => {
    setVerifyType('check-in');
    setVerifyModalOpen(true);
  };

  const handleCheckOut = () => {
    setVerifyType('check-out');
    setVerifyModalOpen(true);
  };

  const handleVerifySuccess = () => {
    fetchHistory();
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Find today's attendance record
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = history.find((h) => {
    const d = h.date ? h.date.split('T')[0] : '';
    return d === todayStr;
  });

  const hasCheckedIn = !!todayRecord?.check_in;
  const hasCheckedOut = !!todayRecord?.check_out;

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    try {
      if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }
      return new Date(timeStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const totalDays = history.length;
  const presentDays = history.filter((h) => !!h.check_in).length;
  const completedDays = history.filter((h) => !!h.check_in && !!h.check_out).length;

  return (
    <div className="space-y-6">
      {/* ── Hero Banner ────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] to-[#0064e0] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-100 font-heading mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shadow-xs" />
            <span>Daily Presence Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
            My Attendance
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
            Record your daily presence check-ins, checkouts, and review monthly work logs.
          </p>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Today's Punch Card Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
            <Clock size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Today's Presence Status</h3>
              {hasCheckedIn && !hasCheckedOut && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Clocked In
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Check in:{' '}
              <strong className="text-slate-800">{formatTime(todayRecord?.check_in)}</strong> · Check out:{' '}
              <strong className="text-slate-800">{formatTime(todayRecord?.check_out)}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!hasCheckedIn ? (
            <Button icon={LogIn} onClick={handleCheckIn}>
              Check In Today
            </Button>
          ) : !hasCheckedOut ? (
            <Button variant="softBlue" icon={LogOut} onClick={handleCheckOut}>
              Check Out Now
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 size={16} />
              <span>Full Day Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Monthly Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Days Logged"
          value={totalDays}
          subtitle="In selected month"
          icon={CalendarDays}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatsCard
          title="Present Days"
          value={presentDays}
          subtitle="Checked in"
          icon={CheckCircle2}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <StatsCard
          title="Completed Full Days"
          value={completedDays}
          subtitle="Both in & out"
          icon={Clock}
          colorClass="text-indigo-600"
          bgClass="bg-indigo-50"
        />
      </div>

      {/* Monthly Attendance Log Table */}
      <Card
        title={
          <div className="flex items-center gap-3">
            <span>
              Attendance Log ·{' '}
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="md" text="Loading month logs..." />
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No attendance records found for this month.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 -my-6">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record, i) => {
                  const checkInTime = record.check_in;
                  const checkOutTime = record.check_out;
                  const isComplete = checkInTime && checkOutTime;

                  return (
                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 text-xs font-semibold text-slate-900">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-3.5 text-xs font-mono text-slate-700">
                        {formatTime(checkInTime)}
                      </td>
                      <td className="px-6 py-3.5 text-xs font-mono text-slate-700">
                        {formatTime(checkOutTime)}
                      </td>
                      <td className="px-6 py-3.5">
                        {isComplete ? (
                          <StatusBadge status="completed" type="dot" />
                        ) : checkInTime ? (
                          <StatusBadge status="active" type="dot" />
                        ) : (
                          <StatusBadge status="absent" type="dot" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Biometric / Manual Verification Modal */}
      <AttendanceVerifyModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        type={verifyType}
        onSuccess={handleVerifySuccess}
      />
    </div>
  );
};

export default EmployeeAttendanceView;
