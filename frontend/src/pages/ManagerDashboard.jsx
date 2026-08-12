import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sunrise,
  Activity,
  UserPlus,
  TrendingUp,
  ClipboardList,
  Play,
  QrCode,
  Building2,
  CalendarRange,
  Zap,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import Card from '../components/Card';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { getDashboardStats } from '../services/dashboardService';
import { getCraStats, getAllActivities } from '../services/craService';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useNavigate, Link } from 'react-router-dom';

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const [year, month, day] = cleanStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const ActiveTaskRow = ({ task }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateElapsed = () => {
      const diffMs = Date.now() - new Date(task.startTime || task.start_time).getTime();
      if (diffMs < 0) {
        setElapsed('0m');
        return;
      }
      const diffMins = Math.floor(diffMs / 60000);
      const hrs = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      if (hrs === 0) {
        setElapsed(`${mins}m`);
      } else {
        setElapsed(`${hrs}h ${mins}m`);
      }
    };

    updateElapsed();
    const timer = setInterval(updateElapsed, 30000);
    return () => clearInterval(timer);
  }, [task.startTime, task.start_time]);

  return (
    <span className="font-bold text-[#2563eb] flex items-center gap-1.5 text-xs font-mono bg-[#e7f0fa] px-2 py-0.5 rounded border border-[#dde5ec]">
      <Clock size={12} className="text-[#2563eb]" />
      {elapsed}
    </span>
  );
};

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [craStats, setCraStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, completed: 0 });
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        try {
          const cra = await getCraStats();
          setCraStats(cra);
        } catch (e) {
          console.error('Error fetching CRA stats:', e);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Fetch initial active tasks
    getAllActivities({ status: 'in_progress' })
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setActiveTasks(rows);
      })
      .catch((err) => console.error('Error fetching active tasks:', err));

    // Connect WebSocket
    const socket = connectSocket();
    if (socket) {
      socket.on('cra_started', (task) => {
        setActiveTasks((prev) => {
          if (prev.some((t) => t.id === task.craId || t.id === task.id)) return prev;
          return [
            {
              id: task.craId || task.id,
              employee_name: task.employeeName,
              employeeName: task.employeeName,
              ticket_reference: task.ticketReference,
              ticketReference: task.ticketReference,
              startTime: task.startTime,
              start_time: task.startTime,
              description: task.description || 'Running Task',
            },
            ...prev,
          ];
        });
        toast.success(`⚡ ${task.employeeName} started: ${task.ticketReference}`, {
          id: `start-${task.craId || task.id}`,
        });
        getCraStats().then(setCraStats).catch(() => {});
      });

      socket.on('cra_auto_started', (task) => {
        setActiveTasks((prev) => {
          if (prev.some((t) => t.id === task.craId || t.id === task.id)) return prev;
          return [
            {
              id: task.craId || task.id,
              employee_name: task.employeeName,
              employeeName: task.employeeName,
              ticket_reference: task.ticketReference,
              ticketReference: task.ticketReference,
              startTime: task.startTime,
              start_time: task.startTime,
              description: task.description || 'Auto-started queued task',
            },
            ...prev,
          ];
        });
        toast.success(`⚡ ${task.employeeName} started ${task.ticketReference}`, {
          id: `auto-${task.craId || task.id}`,
        });
        getCraStats().then(setCraStats).catch(() => {});
      });

      socket.on('cra_approved', () => {
        getCraStats().then(setCraStats).catch(() => {});
      });

      socket.on('cra_finished', (payload) => {
        setActiveTasks((prev) =>
          prev.filter((t) => t.id !== payload.craId && t.id !== parseInt(payload.craId, 10))
        );
        getCraStats().then(setCraStats).catch(() => {});
      });

      socket.on('cra_created', (payload) => {
        toast.success(`CRA task assigned: ${payload.ticketReference}`, {
          id: `create-${payload.craId}`,
          duration: 5000,
        });
        getCraStats().then(setCraStats).catch(() => {});
      });
    }

    return () => {
      if (socket) {
        socket.off('cra_started');
        socket.off('cra_auto_started');
        socket.off('cra_approved');
        socket.off('cra_finished');
        socket.off('cra_created');
      }
      disconnectSocket();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" text="Loading manager intelligence dashboard…" />
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const totalEmp = stats?.totalEmployees || 1;
  const presentPct = Math.round(((stats?.presentToday || 0) / totalEmp) * 100);
  const absentPct = Math.round(((stats?.absentToday || 0) / totalEmp) * 100);
  const latePct = Math.round(((stats?.lateToday || 0) / totalEmp) * 100);
  const onLeavePct = Math.round(((stats?.employeesOnLeaveToday || 0) / totalEmp) * 100);

  return (
    <div className="space-y-6">
      {/* ── Premium Blue Hero Banner ─────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] to-[#0064e0] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-100 font-heading mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shadow-xs" />
              <span>Operations Live Control Center</span>
              <span className="text-blue-200">·</span>
              <span className="text-blue-100 font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              {greeting()}, Manager! 👋
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Real-time enterprise workforce presence, absence requests, and live activity tracking.
            </p>
          </div>

          {/* Quick Action Button Hub */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="secondary"
              icon={Clock}
              onClick={() => navigate('/leave-requests')}
              size="sm"
            >
              Review Requests ({stats?.pendingRequests || 0})
            </Button>
            <Button
              variant="softBlue"
              icon={CalendarDays}
              onClick={() => navigate('/attendance')}
              size="sm"
            >
              Live Attendance
            </Button>
            <Button
              variant="secondary"
              icon={QrCode}
              onClick={() => window.open(`${window.location.origin}/attendance-verification`, '_blank')}
              size="sm"
            >
              QR Scanner
            </Button>
          </div>
        </div>

        {/* Ambient Gradient Glow Accents */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── KPI Metric Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Workforce"
          value={stats?.totalEmployees || 0}
          subtitle="Registered staff"
          icon={Users}
          variant="softBlue"
          progress={100}
        />
        <StatsCard
          title="Present Today"
          value={stats?.presentToday || 0}
          subtitle={`${presentPct}% presence rate`}
          icon={UserCheck}
          variant="blue"
          progress={presentPct}
        />
        <StatsCard
          title="Absent Today"
          value={stats?.absentToday || 0}
          subtitle="Unexcused / Out"
          icon={UserX}
          colorClass="text-rose-600"
          bgClass="bg-rose-50 border border-rose-200"
          progress={absentPct}
        />
        <StatsCard
          title="Pending Requests"
          value={stats?.pendingRequests || 0}
          subtitle="Requires validation"
          icon={Clock}
          colorClass="text-amber-600"
          bgClass="bg-amber-50 border border-amber-200"
          onClick={() => navigate('/leave-requests')}
        />
        <StatsCard
          title="Upcoming Holidays"
          value={stats?.holidaysThisMonth || 0}
          subtitle="This calendar month"
          icon={CalendarRange}
          colorClass="text-violet-600"
          bgClass="bg-violet-50 border border-violet-200"
          onClick={() => navigate('/holidays')}
        />
      </div>

      {/* ── CRA Pending Review Alert Banner ──────────────────────── */}
      {craStats.completed > 0 && (
        <Link
          to="/cra"
          className="block bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#38bdf8] rounded-2xl p-5 text-white shadow-electric-glow border border-blue-400/40 hover:shadow-lg hover:scale-[1.005] transition-all duration-200"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/30 shadow-inner">
                <ClipboardList size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-heading font-black text-white">
                  Activity Reports Awaiting Your Approval
                </h3>
                <p className="text-xs text-blue-50 mt-0.5">
                  <span className="font-bold underline">{craStats.completed}</span> completed CRA activit{craStats.completed === 1 ? 'y' : 'ies'} submitted for managerial review.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#2563eb] font-bold rounded-xl text-xs shadow-xs">
              <span>Validate Reports</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </Link>
      )}

      {/* ── Live Active Tasks Monitoring Section ─────────────────── */}
      <Card
        headerVariant="light"
        title="Live Active Tasks Monitor"
        subtitle="Real-time live synchronization of activities currently running across employees"
        actions={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Connected (WebSocket)
          </span>
        }
      >
        {activeTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <div className="w-12 h-12 bg-[#e7f0fa] rounded-2xl flex items-center justify-center mb-3 text-[#2563eb] border border-[#dde5ec] shadow-xs">
              <ClipboardList size={24} />
            </div>
            <p className="text-sm font-heading font-bold text-[#172033]">No active tasks currently running</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              When employees start their CRA activity tracker, live progress and elapsed time appear here instantly.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 -my-6">
            <table className="w-full text-sm">
              <thead className="bg-[#f1f5f8] text-[#2563eb] border-b border-[#dde5ec] text-left">
                <tr>
                  <th className="text-[11px] font-heading font-extrabold uppercase tracking-wider px-6 py-3.5 text-[#2563eb]">
                    Employee
                  </th>
                  <th className="text-[11px] font-heading font-extrabold uppercase tracking-wider px-6 py-3.5 text-[#2563eb]">
                    Ticket Reference
                  </th>
                  <th className="text-[11px] font-heading font-extrabold uppercase tracking-wider px-6 py-3.5 text-[#2563eb]">
                    Started At
                  </th>
                  <th className="text-[11px] font-heading font-extrabold uppercase tracking-wider px-6 py-3.5 text-[#2563eb]">
                    Duration
                  </th>
                  <th className="text-[11px] font-heading font-extrabold uppercase tracking-wider px-6 py-3.5 text-[#2563eb]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7f0fa] bg-white">
                {activeTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[#e7f0fa]/60 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-[#172033] whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                          {(task.employee_name || 'U').charAt(0)}
                        </div>
                        <span>{task.employee_name || 'Employee'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs font-bold text-[#2563eb]">
                      {task.ticket_reference || task.task_name || 'N/A'}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                      {task.startTime ? new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      <TaskLiveTimer task={task} />
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        In Progress
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Two-Column Operational Layout ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Real-Time Presence Breakdown */}
        <Card
          headerVariant="light"
          title="Daily Presence Overview"
          subtitle="Workforce check-in and check-out distribution for today"
          actions={
            <Link
              to="/attendance"
              className="text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 transition-colors"
            >
              Full Log <ArrowRight size={14} />
            </Link>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#e7f0fa] rounded-xl p-3 border border-[#dde5ec] text-center">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563eb] font-heading">Present</p>
                <p className="text-xl font-heading font-black text-[#2563eb] mt-1">{stats?.presentToday || 0}</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3 border border-rose-200 text-center">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 font-heading">Absent</p>
                <p className="text-xl font-heading font-black text-rose-700 mt-1">{stats?.absentToday || 0}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-center">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 font-heading">Late</p>
                <p className="text-xl font-heading font-black text-amber-700 mt-1">{stats?.lateToday || 0}</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-3 border border-violet-200 text-center">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-600 font-heading">On Leave</p>
                <p className="text-xl font-heading font-black text-violet-700 mt-1">{stats?.employeesOnLeaveToday || 0}</p>
              </div>
            </div>

            {/* Attendance Matrix Row Preview */}
            {stats?.recentAttendance && stats.recentAttendance.length > 0 && (
              <div className="overflow-x-auto -mx-6 -mb-6 mt-4 border-t border-[#dde5ec]">
                <table className="w-full text-xs">
                  <thead className="bg-[#f1f5f8] text-[#2563eb] border-b border-[#dde5ec]">
                    <tr>
                      <th className="px-5 py-2.5 text-left font-heading font-bold text-[#2563eb]">Staff</th>
                      <th className="px-3 py-2.5 text-left font-heading font-bold text-[#2563eb]">Check-In</th>
                      <th className="px-3 py-2.5 text-left font-heading font-bold text-[#2563eb]">Check-Out</th>
                      <th className="px-5 py-2.5 text-right font-heading font-bold text-[#2563eb]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7f0fa] bg-white">
                    {stats.recentAttendance.slice(0, 5).map((att) => (
                      <tr key={att.id} className="hover:bg-[#e7f0fa]/60 transition-colors">
                        <td className="px-5 py-2.5 font-bold text-[#172033]">{att.first_name} {att.last_name}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600">{att.check_in || '—'}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600">{att.check_out || '—'}</td>
                        <td className="px-5 py-2.5 text-right">
                          <StatusBadge status={att.check_in ? (att.check_out ? 'completed' : 'present') : 'absent'} type="dot" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Pending Leave Requests */}
        <Card
          headerVariant="softBlue"
          title="Pending Leave Applications"
          subtitle="Requests awaiting managerial validation and quota deduction"
          actions={
            <Link
              to="/leave-requests"
              className="text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 transition-colors"
            >
              Manage <ArrowRight size={14} />
            </Link>
          }
        >
          {stats?.recentAbsences && stats.recentAbsences.length > 0 ? (
            <div className="divide-y divide-[#f1f5ff] -mx-6 -my-6">
              {stats.recentAbsences.map((ab) => (
                <div key={ab.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#f1f7ff] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                      {(ab.first_name || 'U').charAt(0)}{(ab.last_name || '').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#172033] text-xs sm:text-sm truncate">
                        {ab.first_name} {ab.last_name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate font-mono">
                        {parseLocalDate(ab.start_date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →{' '}
                        {parseLocalDate(ab.end_date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={ab.type} type="soft" />
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => navigate('/leave-requests')}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3 text-emerald-600 border border-emerald-200">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-sm font-heading font-bold text-[#172033]">All requests reviewed</p>
              <p className="text-xs text-slate-500 mt-1">No pending leave applications requiring approval.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
