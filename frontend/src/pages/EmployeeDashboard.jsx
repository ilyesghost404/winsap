import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Users, Clock, CheckCircle2, CalendarDays, Calendar as CalendarIcon,
  Activity, CalendarOff, Briefcase, ChevronRight, ClipboardList, Plus, Zap
} from 'lucide-react';
import Card from '../components/Card';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { getDashboardStats } from '../services/dashboardService';
import { getCraStats } from '../services/craService';
import { Link, useNavigate } from 'react-router-dom';

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const [year, month, day] = cleanStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const CircularProgress = ({ value, max, label, colorClass = 'text-[#2563eb]' }) => {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const validValue = Math.min(Math.max(0, value), max);
  const strokeDashoffset = circumference - (validValue / max) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg className="w-22 h-22 transform -rotate-90">
        <circle
          cx="44"
          cy="44"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-[#dbeafe]"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-out ${colorClass}`}
        />
      </svg>
      <div className="absolute top-7.5 flex flex-col items-center justify-center">
        <span className="text-lg font-black font-heading text-[#172033] leading-none">{value}</span>
        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">/{max}d</span>
      </div>
      <span className="text-xs font-bold text-slate-700 mt-2 text-center">{label}</span>
    </div>
  );
};

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [craStats, setCraStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, in_progress: 0 });
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" text="Loading personal dashboard…" />
      </div>
    );
  }

  if (!stats) return null;

  const info = stats.employeeInfo || {};
  const remainingVacation = stats.remainingVacationDays ?? 0;
  const usedVacation = Math.max(0, 22 - remainingVacation);

  const remainingSick = stats.remainingSickDays ?? 5;
  const usedSick = Math.max(0, 5 - remainingSick);

  return (
    <div className="space-y-6">
      {/* ── Premium Blue Hero Banner ─────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] to-[#0064e0] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-100 font-heading mb-1">
              <Zap size={14} className="text-blue-100" />
              <span>Employee Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              Welcome back, {info.first_name || 'Employee'}! 👋
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Here is your personal absence summary, leave balances, and daily activity overview.
            </p>
          </div>

          <Button variant="secondary" icon={Plus} onClick={() => navigate('/leave-requests')}>
            Request Leave
          </Button>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Paid Leave"
          value={`${remainingVacation}d`}
          subtitle="Remaining balance"
          icon={CalendarDays}
          variant="softBlue"
        />
        <StatsCard
          title="Sick Leave"
          value={`${remainingSick}d`}
          subtitle="Remaining balance"
          icon={CalendarDays}
          colorClass="text-rose-600"
          bgClass="bg-rose-50 border border-rose-200"
        />
        <StatsCard
          title="Pending Requests"
          value={stats.pendingRequests || 0}
          subtitle="Awaiting review"
          icon={Clock}
          colorClass="text-amber-600"
          bgClass="bg-amber-50 border border-amber-200"
        />
        <StatsCard
          title="Approved Absences"
          value={stats.approvedRequests || 0}
          subtitle="This year"
          icon={CheckCircle2}
          variant="blue"
        />
        <StatsCard
          title="Total Absences"
          value={stats.totalAbsences || 0}
          subtitle="All requests"
          icon={CalendarOff}
          colorClass="text-violet-600"
          bgClass="bg-violet-50 border border-violet-200"
        />
        <StatsCard
          title="Next Holiday"
          value={stats.nextHoliday?.name || 'None'}
          subtitle={
            stats.nextHoliday
              ? parseLocalDate(stats.nextHoliday.holiday_date)?.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : '—'
          }
          icon={CalendarIcon}
          colorClass="text-pink-600"
          bgClass="bg-pink-50 border border-pink-200"
        />
      </div>

      {/* CRA Quick Tracker Card */}
      <Link
        to="/cra"
        className={`block bg-white rounded-2xl border p-5 transition-all duration-200 hover:shadow-md ${
          craStats.in_progress > 0
            ? 'border-blue-400 bg-blue-50/40 shadow-xs'
            : 'border-[#d6e2f0] hover:border-blue-300 shadow-premium-sm'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                craStats.in_progress > 0
                  ? 'bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] text-white shadow-electric-glow'
                  : 'bg-[#e7f0fa] text-[#2563eb] border border-[#dde5ec]'
              }`}
            >
              <ClipboardList size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#172033]">
                  {craStats.in_progress > 0 ? '⚡ Active Activity Tracker Running' : 'Activity Reports (CRA)'}
                </h3>
                {craStats.in_progress > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e7f0fa] text-[#2563eb]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse" />
                    Tracking Time
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {craStats.in_progress > 0
                  ? 'An activity is currently in progress. Click to view or stop tracking.'
                  : `${craStats.completed || 0} completed · ${craStats.approved || 0} approved · ${craStats.total || 0} total tasks`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-[#2563eb] group-hover:text-[#1d4ed8]">
            <span>Open CRA</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </Link>

      {/* Two Column Grid: Balances & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Balances Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <Card headerVariant="light" title="Leave Balances" subtitle="Allocated and remaining quotas for this calendar year">
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-extrabold text-[#2563eb] uppercase tracking-wider mb-3 font-heading">
                  Paid Vacation (Congés payés)
                </h4>
                <div className="flex justify-around items-center bg-[#f1f5f8] p-4 rounded-xl border border-[#dde5ec]">
                  <CircularProgress value={usedVacation} max={22} label="Used Days" colorClass="text-amber-500" />
                  <CircularProgress value={remainingVacation} max={22} label="Remaining" colorClass="text-[#2563eb]" />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-[#2563eb] uppercase tracking-wider mb-3 font-heading">
                  Sick Leave (Congés maladie)
                </h4>
                <div className="flex justify-around items-center bg-[#f1f5f8] p-4 rounded-xl border border-[#dde5ec]">
                  <CircularProgress value={usedSick} max={5} label="Used Days" colorClass="text-rose-500" />
                  <CircularProgress value={remainingSick} max={5} label="Remaining" colorClass="text-emerald-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Recent Requests Activity */}
        <div className="lg:col-span-7">
          <Card
            headerVariant="softBlue"
            title="Recent Activity"
            subtitle="Latest requests and status updates"
            actions={
              <Link
                to="/leave-requests"
                className="text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight size={14} />
              </Link>
            }
          >
            {stats.recentRequests && stats.recentRequests.length > 0 ? (
              <div className="divide-y divide-[#f1f5ff] -mx-6 -my-6">
                {stats.recentRequests.map((req) => (
                  <div key={req.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#f1f7ff] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center flex-shrink-0 border border-[#d6e2f0]">
                        <CalendarDays size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#172033] text-xs sm:text-sm capitalize truncate">
                          {req.type} Leave
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate font-mono">
                          {parseLocalDate(req.start_date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →{' '}
                          {parseLocalDate(req.end_date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={req.status} type="soft" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No leave requests filed yet.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
