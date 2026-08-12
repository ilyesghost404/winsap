import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Users, UserCheck, UserX, Shield, Briefcase, UserCircle,
  UserPlus, TrendingUp, AlertTriangle, Activity, Clock,
  Database, Server, Wifi, CheckCircle2, XCircle, Search,
  Plus, Settings, RefreshCw, Key, ToggleLeft, ToggleRight,
  Trash2, ChevronRight, Loader2, WifiOff, CircleDot, LogIn, LogOut, Zap
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
  PieChart as RechartsPieChart, Pie, Legend
} from 'recharts';
import Card from '../components/Card';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import LoadingSpinner, { SkeletonCard } from '../components/LoadingSpinner';
import {
  getAdminDashboardStats,
  searchUsers,
  getSystemHealth
} from '../services/dashboardService';

const ROLE_COLORS = { admin: '#8b5cf6', manager: '#2563eb', employee: '#06b6d4' };
const CHART_COLORS = ['#2563eb', '#3b82f6', '#38bdf8', '#22d3ee', '#8b5cf6', '#06b6d4'];

const ACTION_META = {
  user_created: { icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50 border border-emerald-200', label: 'User Created' },
  user_updated: { icon: UserCircle, color: 'text-[#2563eb]', bg: 'bg-[#e7f0fa] border border-[#dde5ec]', label: 'User Updated' },
  user_deleted: { icon: Trash2, color: 'text-rose-600', bg: 'bg-rose-50 border border-rose-200', label: 'User Deleted' },
  role_changed: { icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50 border border-violet-200', label: 'Role Changed' },
  account_enabled: { icon: ToggleRight, color: 'text-emerald-600', bg: 'bg-emerald-50 border border-emerald-200', label: 'Account Enabled' },
  account_disabled: { icon: ToggleLeft, color: 'text-amber-600', bg: 'bg-amber-50 border border-amber-200', label: 'Account Disabled' },
  password_changed: { icon: Key, color: 'text-orange-600', bg: 'bg-orange-50 border border-orange-200', label: 'Password Changed' },
  login: { icon: LogIn, color: 'text-[#2563eb]', bg: 'bg-[#eff6ff] border border-[#bfdbfe]', label: 'Login' },
  logout: { icon: LogOut, color: 'text-slate-600', bg: 'bg-slate-50 border border-slate-200', label: 'Logout' },
};

const formatRelativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const getInitials = (fullName, username) => {
  if (fullName && fullName.trim() && fullName.trim() !== ' ') {
    const parts = fullName.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return (username || '?').slice(0, 2).toUpperCase();
};

const HealthBadge = ({ status, latency }) => {
  const isHealthy = status === 'healthy';
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
        isHealthy
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-rose-50 text-rose-700 border-rose-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
        } animate-pulse`}
      />
      <span>{isHealthy ? 'Operational' : 'Error'}</span>
      {latency != null && <span className="text-[10px] opacity-70">({latency}ms)</span>}
    </div>
  );
};

const CustomTooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #d6e2f0',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)',
  fontSize: '12px',
  color: '#172033',
  fontWeight: 'bold',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchDebounce = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Admin dashboard fetch error:', err);
      setError('Failed to load dashboard data.');
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      setHealthLoading(true);
      const data = await getSystemHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchHealth();
    const healthInterval = setInterval(fetchHealth, 30000);
    return () => clearInterval(healthInterval);
  }, [fetchStats, fetchHealth]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchDebounce.current);
    if (!val.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearchOpen(true);
    setSearchLoading(true);
    searchDebounce.current = setTimeout(async () => {
      try {
        const results = await searchUsers(val);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const userGrowthData =
    stats?.userGrowth?.map((row) => ({
      name: row.month_label,
      users: parseInt(row.count),
    })) ?? [];

  const roleData =
    stats?.roleDistribution?.map((row) => ({
      name: row.role.charAt(0).toUpperCase() + row.role.slice(1),
      value: parseInt(row.count),
    })) ?? [];

  const deptData =
    stats?.deptDistribution?.map((row) => ({
      name: row.department,
      users: parseInt(row.count),
    })) ?? [];

  const systemOk =
    health &&
    health.database?.status === 'healthy' &&
    health.api?.status === 'healthy';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-2">
          <div className="h-7 bg-blue-100 rounded-md w-56" />
          <div className="h-4 bg-slate-100 rounded-md w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 border border-rose-200 shadow-xs">
          <WifiOff size={28} />
        </div>
        <h2 className="text-lg font-bold text-[#172033] mb-1">Failed to load admin dashboard</h2>
        <p className="text-xs text-slate-500 mb-4 max-w-sm">{error}</p>
        <Button icon={RefreshCw} onClick={fetchStats} size="sm">
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Premium Blue Hero Banner ─────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] to-[#0064e0] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-100 font-heading mb-1.5">
              <Zap size={14} className="text-blue-100" />
              <span>System & Security Administration</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              ADMINISTRATOR DASHBOARD
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 font-mono">
              {now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              · {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs ${
              systemOk
                ? 'bg-white text-emerald-700 border-white/40'
                : 'bg-amber-100 border-amber-200 text-amber-800'
            }`}
          >
            <CircleDot size={13} className={systemOk ? 'text-emerald-600' : 'text-amber-600'} />
            <span>{systemOk ? 'All Systems Operational' : 'System Notice'}</span>
          </div>
        </div>

        {/* Ambient Gradient Glow Accents */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Global Search Bar */}
      <div className="relative" ref={searchRef}>
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search accounts by name, username, email, department…"
            className="w-full pl-10 pr-4 py-2.5 bg-[#f1f5ff] border border-[#d6e2f0] rounded-xl text-xs text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] focus:bg-white transition-all shadow-xs"
          />
          {searchLoading && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" size={14} />
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 max-w-xl mt-1.5 bg-white rounded-2xl shadow-xl border border-[#d6e2f0] p-2 z-50 overflow-hidden max-h-80 overflow-y-auto custom-scrollbar animate-scale-in">
            {searchResults.length === 0 && !searchLoading ? (
              <div className="px-4 py-6 text-center text-slate-400 text-xs">
                No users found matching "{searchQuery}"
              </div>
            ) : (
              <div className="divide-y divide-[#f1f5ff]">
                {searchResults.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      navigate('/users');
                      setSearchOpen(false);
                    }}
                    className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-[#f1f7ff] rounded-xl cursor-pointer transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-2xs"
                      style={{ background: ROLE_COLORS[u.role] || '#64748b' }}
                    >
                      {getInitials(u.full_name, u.username)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#172033] text-xs truncate">
                        {u.full_name && u.full_name.trim() !== '' ? u.full_name : u.username}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <StatusBadge status={u.role} type="outline" />
                      <StatusBadge status={u.is_active ? 'Active' : 'Disabled'} type="dot" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Access Action Bar */}
      <div className="bg-white rounded-2xl border border-[#d6e2f0] p-3 shadow-premium-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            {
              label: 'Manage Users',
              icon: Users,
              iconBg: 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]',
              action: () => navigate('/users'),
            },
            {
              label: 'Add User',
              icon: UserPlus,
              iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
              action: () => navigate('/users', { state: { action: 'add' } }),
            },
            {
              label: 'Security Center',
              icon: Activity,
              iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200',
              action: () => navigate('/admin/security'),
            },
            {
              label: 'Roles & Access',
              icon: Key,
              iconBg: 'bg-violet-50 text-violet-600 border border-violet-200',
              action: () => navigate('/users'),
            },
            {
              label: 'System Settings',
              icon: Settings,
              iconBg: 'bg-[#e7f0fa] text-[#2563eb] border border-[#dde5ec]',
              action: () => navigate('/settings'),
            },
            {
              label: 'System Health',
              icon: Server,
              iconBg: 'bg-teal-50 text-teal-600 border border-teal-200',
              action: () =>
                document.getElementById('system-health-section')?.scrollIntoView({ behavior: 'smooth' }),
            },
          ].map(({ label, icon: Icon, iconBg, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-[#f1f7ff] border border-transparent hover:border-[#d6e2f0] transition-all text-left group cursor-pointer"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon size={17} />
              </div>
              <span className="text-xs font-bold text-[#172033] group-hover:text-[#2563eb]">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Cards Grid (8 stats across 2 rows) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={Users}
          variant="softBlue"
        />
        <StatsCard
          title="Active Accounts"
          value={stats?.activeAccounts}
          icon={UserCheck}
          variant="blue"
        />
        <StatsCard
          title="Disabled Accounts"
          value={stats?.disabledAccounts}
          icon={UserX}
          colorClass="text-rose-600"
          bgClass="bg-rose-50 border border-rose-200"
        />
        <StatsCard
          title="Administrators"
          value={stats?.admins}
          icon={Shield}
          colorClass="text-violet-600"
          bgClass="bg-violet-50 border border-violet-200"
        />
        <StatsCard
          title="Managers"
          value={stats?.managers}
          icon={Briefcase}
          colorClass="text-blue-600"
          bgClass="bg-blue-50 border border-blue-200"
        />
        <StatsCard
          title="Employees"
          value={stats?.employees}
          icon={UserCircle}
          colorClass="text-sky-600"
          bgClass="bg-sky-50 border border-sky-200"
        />
        <StatsCard
          title="New Users (Month)"
          value={stats?.newThisMonth}
          icon={UserPlus}
          colorClass="text-teal-600"
          bgClass="bg-teal-50 border border-teal-200"
          trend={{ value: `+${stats?.newThisWeek ?? 0}`, label: 'this week', positive: true }}
        />
        <StatsCard
          title="Logged In Today"
          value={stats?.loggedInToday}
          icon={LogIn}
          colorClass="text-indigo-600"
          bgClass="bg-indigo-50 border border-indigo-200"
        />
      </div>

      {/* Charts Row: User Growth + Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          headerVariant="softBlue"
          title="User Growth"
          subtitle="New user registrations over the last 12 months"
          className="lg:col-span-2"
        >
          {userGrowthData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-xs">
              No registration data available
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5ff" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#dbeafe' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card headerVariant="softBlue" title="Role Distribution" subtitle="Active users divided by system permissions">
          {roleData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-xs">No data</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {roleData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Two Column Layout: Recent Users & Recent Admin Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          headerVariant="softBlue"
          title="Recent User Registrations"
          subtitle="Latest accounts added to the system directory"
          actions={
            <button
              onClick={() => navigate('/users')}
              className="text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 transition-colors cursor-pointer"
            >
              Directory <ChevronRight size={14} />
            </button>
          }
        >
          {stats?.recentUsers?.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No users registered yet</div>
          ) : (
            <div className="divide-y divide-[#f1f5ff] -mx-6 -my-6">
              {stats?.recentUsers?.map((u) => (
                <div
                  key={u.id}
                  onClick={() => navigate('/users')}
                  className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#f1f7ff] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-2xs"
                      style={{ background: ROLE_COLORS[u.role] || '#64748b' }}
                    >
                      {getInitials(u.full_name, u.username)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#172033] text-xs sm:text-sm truncate">
                        {u.full_name && u.full_name.trim() !== '' ? u.full_name : u.username}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={u.role} type="outline" />
                    <StatusBadge status={u.is_active ? 'Active' : 'Disabled'} type="dot" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          headerVariant="softBlue"
          title="Security & Audit Trail"
          subtitle="Recent administrative changes and system modifications"
          actions={
            <button
              onClick={() => navigate('/admin/security')}
              className="text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 transition-colors cursor-pointer"
            >
              Security Center <ChevronRight size={14} />
            </button>
          }
        >
          {stats?.recentActivity?.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No activity recorded yet</div>
          ) : (
            <div className="divide-y divide-[#f1f5ff] -mx-6 -my-6">
              {stats?.recentActivity?.map((act) => {
                const meta = ACTION_META[act.action] || {
                  icon: Activity,
                  color: 'text-slate-600',
                  bg: 'bg-slate-50 border border-slate-200',
                  label: act.action,
                };
                const Icon = meta.icon;
                return (
                  <div key={act.id} className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#f1f7ff] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs ${meta.bg}`}>
                        <Icon size={15} className={meta.color} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#172033] text-xs truncate">
                          {act.description || meta.label}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          by <span className="font-semibold text-slate-600">{act.performed_by_name || 'System'}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                      {formatRelativeTime(act.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* System Health Section */}
      <div id="system-health-section">
        <Card
          headerVariant="softBlue"
          title="System Health & Infrastructure"
          subtitle="Real-time monitoring of database connections, API latency, and core services"
          actions={
            <Button
              variant="outline"
              size="xs"
              icon={RefreshCw}
              loading={healthLoading}
              onClick={fetchHealth}
            >
              Refresh Health
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#f1f5ff] rounded-2xl p-4 border border-[#d6e2f0]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-[#2563eb]" />
                  <span className="text-xs font-bold text-[#172033]">Database (PostgreSQL)</span>
                </div>
                <HealthBadge status={health?.database?.status} latency={health?.database?.latency} />
              </div>
              <p className="text-[11px] text-slate-500">Connection pool and query response time</p>
            </div>

            <div className="bg-[#f1f5ff] rounded-2xl p-4 border border-[#d6e2f0]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server size={16} className="text-indigo-600" />
                  <span className="text-xs font-bold text-[#172033]">Express Backend API</span>
                </div>
                <HealthBadge status={health?.api?.status} latency={health?.api?.latency} />
              </div>
              <p className="text-[11px] text-slate-500">Node.js HTTP request-response engine</p>
            </div>

            <div className="bg-[#f1f5ff] rounded-2xl p-4 border border-[#d6e2f0]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wifi size={16} className="text-emerald-600" />
                  <span className="text-xs font-bold text-[#172033]">WebSocket Gateway</span>
                </div>
                <HealthBadge status="healthy" />
              </div>
              <p className="text-[11px] text-slate-500">Real-time CRA and attendance sync stream</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
