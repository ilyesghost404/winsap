import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  ShieldAlert, Lock, Unlock, Monitor, Activity, Users,
  AlertTriangle, Clock, RefreshCw, XCircle, Search, PowerOff
} from 'lucide-react';
import Card from '../components/Card';
import StatsCard from '../components/StatsCard';
import Button from '../components/Button';
import LoadingSpinner, { SkeletonTable } from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import api from '../services/api';

const AdminSecurityCenter = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  const [stats, setStats] = useState({
    total_users: 0,
    active_accounts: 0,
    locked_accounts: 0,
    disabled_accounts: 0,
    online_users: 0,
    offline_users: 0,
  });

  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const limit = 10;

  // Lock user modal state
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lockDuration, setLockDuration] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const [usersRes, logsRes] = await Promise.allSettled([
        api.get('/users', { params: { limit: 1000 } }),
        api.get('/users/audit-logs', { params: { limit: 1000 } }),
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value.data.success) {
        setUsers(usersRes.value.data.data || []);
        if (usersRes.value.data.stats) {
          setStats(usersRes.value.data.stats);
        }
      }

      if (logsRes.status === 'fulfilled' && logsRes.value.data.success) {
        setAuditLogs(logsRes.value.data.data || logsRes.value.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load security center metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleToggleLock = async (user) => {
    if (user.is_locked) {
      try {
        await api.post(`/users/${user.id}/unlock`);
        toast.success(`Account unlocked: ${user.username}`);
        fetchSecurityData();
      } catch (err) {
        toast.error('Failed to unlock user account');
      }
    } else {
      setSelectedUser(user);
      setIsLockModalOpen(true);
    }
  };

  const handleConfirmLock = async () => {
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      await api.post(`/users/${selectedUser.id}/lock`, {
        duration_minutes: lockDuration,
      });
      toast.success(`Account locked for ${lockDuration} minutes`);
      setIsLockModalOpen(false);
      fetchSecurityData();
    } catch (err) {
      toast.error('Failed to lock account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice((usersPage - 1) * limit, usersPage * limit);
  const totalUsersPages = Math.ceil(filteredUsers.length / limit);

  const paginatedLogs = auditLogs.slice((logsPage - 1) * limit, logsPage * limit);
  const totalLogsPages = Math.ceil(auditLogs.length / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Security Command Center
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Monitor system access, enforce lockouts, and audit organizational security events.
          </p>
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={fetchSecurityData}>
          Refresh Security
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatsCard
          title="Total Accounts"
          value={stats.total_users || users.length}
          subtitle="All credentials"
          icon={Users}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatsCard
          title="Active Accounts"
          value={stats.active_accounts || users.filter((u) => u.is_active).length}
          subtitle="Authorized logins"
          icon={Monitor}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <StatsCard
          title="Locked Accounts"
          value={stats.locked_accounts || users.filter((u) => u.is_locked).length}
          subtitle="Temporary lockouts"
          icon={Lock}
          colorClass="text-rose-600"
          bgClass="bg-rose-50"
        />
        <StatsCard
          title="Audit Trail Records"
          value={auditLogs.length}
          subtitle="Security actions logged"
          icon={Activity}
          colorClass="text-indigo-600"
          bgClass="bg-indigo-50"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          {[
            { id: 'users', label: 'User Security Status' },
            { id: 'logs', label: 'Security Audit Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-3 font-semibold text-xs sm:text-sm transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* User Security Status Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search user accounts by username or email…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setUsersPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50/75 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Account Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Lock Status
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5">
                        <div>
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {u.username}
                          </p>
                          <span className="text-xs text-slate-400">{u.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                          {u.role}
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
                        <StatusBadge status={u.is_active ? 'active' : 'rejected'} type="dot" />
                      </td>

                      <td className="px-6 py-3.5">
                        {u.is_locked ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                            <Lock size={12} /> Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <Unlock size={12} /> Unlocked
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <Button
                          size="xs"
                          variant={u.is_locked ? 'secondary' : 'softBlue'}
                          icon={u.is_locked ? Unlock : Lock}
                          onClick={() => handleToggleLock(u)}
                        >
                          {u.is_locked ? 'Unlock' : 'Lock Account'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={usersPage}
              limit={limit}
              total={filteredUsers.length}
              totalPages={totalUsersPages}
              onPageChange={(p) => setUsersPage(p)}
            />
          </div>
        </div>
      )}

      {/* Security Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Initiator
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Event / Action
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Target User
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-slate-600 font-mono">
                      {new Date(log.created_at || log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-xs font-semibold text-slate-900">
                      {log.initiator_name || 'System Auto'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {log.action_type || log.event}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-700">
                      {log.target_username || log.target_id || '—'}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500 truncate max-w-xs">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={logsPage}
            limit={limit}
            total={auditLogs.length}
            totalPages={totalLogsPages}
            onPageChange={(p) => setLogsPage(p)}
          />
        </div>
      )}

      {/* Lock User Modal */}
      <Modal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        title={`Lock Account: ${selectedUser?.username}`}
        subtitle="Temporarily restrict login access for this account."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Lockout Duration (Minutes)
            </label>
            <select
              value={lockDuration}
              onChange={(e) => setLockDuration(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={60}>1 Hour</option>
              <option value={1440}>24 Hours</option>
              <option value={43200}>30 Days (Indefinite)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsLockModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmLock} loading={isSubmitting}>
              Confirm Lockout
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSecurityCenter;
