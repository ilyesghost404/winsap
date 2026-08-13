import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Users, UserPlus, Edit2, Trash2, Search, X, Lock, Unlock, RefreshCw, Mail, Eye, Calendar, Clock, ShieldCheck
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner, { SkeletonTable } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { getUsers, createUser, updateUser, deleteUser, resendActivationEmail, toggleUserStatus } from '../services/userService';
import { getEmployees, getUnlinkedEmployees, getEmployeeById } from '../services/employeeService';

const ROLE_COLORS = {
  admin: 'bg-violet-50 text-violet-700 border-violet-200/80',
  manager: 'bg-blue-50 text-blue-700 border-blue-200/80',
  employee: 'bg-slate-100 text-slate-700 border-slate-200',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [unlinkedEmployees, setUnlinkedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsUser, setDetailsUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [resendingId, setResendingId] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'employee',
    employee_id: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, employeesResponse, unlinkedResponse] = await Promise.all([
        getUsers({ page, limit, search: searchTerm }),
        getEmployees({ limit: 1000 }),
        getUnlinkedEmployees()
      ]);
      setUsers(usersResponse.data || []);
      setTotal(usersResponse.total || 0);
      setTotalPages(usersResponse.totalPages || 0);
      setEmployees(employeesResponse.data || []);
      setUnlinkedEmployees(unlinkedResponse || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAdd = async () => {
    setEditingUser(null);
    try {
      const unlinked = await getUnlinkedEmployees();
      setUnlinkedEmployees(unlinked || []);
    } catch (err) {
      console.error('Failed to load unlinked employees', err);
    }
    setFormData({
      username: '',
      email: '',
      role: 'employee',
      employee_id: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = async (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      employee_id: user.employee_id || '',
    });

    // Refresh unlinked employees and include the currently linked employee
    try {
      const unlinked = await getUnlinkedEmployees();
      let list = unlinked || [];

      // If user has a linked employee, make sure it's in the dropdown
      if (user.employee_id) {
        const alreadyIncluded = list.some((e) => e.id === user.employee_id);
        if (!alreadyIncluded) {
          // Try the local employees list first, then fetch from API
          let linked = employees.find((e) => e.id === user.employee_id);
          if (!linked) {
            try {
              linked = await getEmployeeById(user.employee_id);
            } catch (_) { /* ignore fetch error */ }
          }
          if (linked) {
            list = [linked, ...list];
          }
        }
      }
      setUnlinkedEmployees(list);
    } catch (err) {
      console.error('Failed to load unlinked employees', err);
    }

    setIsModalOpen(true);
  };

  const handleSelectEmployee = (employeeId) => {
    setFormData((prev) => {
      const selected = [...unlinkedEmployees, ...employees].find((e) => e.id === parseInt(employeeId, 10));
      return {
        ...prev,
        employee_id: employeeId,
        email: selected?.email || prev.email,
        username: selected ? `${selected.first_name.toLowerCase()}.${selected.last_name.toLowerCase()}`.replace(/\s+/g, '') : prev.username
      };
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user account?')) {
      try {
        await deleteUser(id);
        fetchData();
        toast.success('User account deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleResendActivation = async (user) => {
    try {
      setResendingId(user.id);
      await resendActivationEmail(user.id);
      toast.success(`Activation email resent to ${user.email}`);
    } catch (error) {
      console.error('Resend activation error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend activation email');
    } finally {
      setResendingId(null);
    }
  };

  const handleToggleStatus = async (user) => {
    const actionLabel = user.is_active ? 'disable' : 'enable';
    if (window.confirm(`Are you sure you want to ${actionLabel} account for '${user.username}'?`)) {
      try {
        await toggleUserStatus(user.id, !user.is_active);
        toast.success(`Account '${user.username}' ${user.is_active ? 'disabled' : 'enabled'} successfully`);
        fetchData();
      } catch (error) {
        console.error('Toggle status error:', error);
        toast.error(error.response?.data?.message || `Failed to ${actionLabel} account`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.role === 'employee' && !formData.employee_id) {
      toast.error('Please select an employee to link for Employee accounts.');
      return;
    }

    try {
      const submitData = {
        ...formData,
        employee_id: formData.role === 'employee' ? formData.employee_id : null
      };

      if (editingUser) {
        await updateUser(editingUser.id, submitData);
        toast.success('User account updated successfully');
      } else {
        await createUser(submitData);
        toast.success('User account created! Activation email sent to employee.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Failed to save user account');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            User Account Management
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Link login accounts to employee profiles, manage role authorizations, and send activation links.
          </p>
        </div>
        <Button icon={UserPlus} onClick={handleAdd}>
          Create User Account
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search username, email, or linked employee…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl p-1 border border-slate-200/90">
            {[
              { id: '', label: 'All Roles' },
              { id: 'admin', label: 'Admin' },
              { id: 'manager', label: 'Manager' },
              { id: 'employee', label: 'Employee' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  roleFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchData}
            title="Refresh Users"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <SkeletonTable rows={6} columns={7} />
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <EmptyState
            title="No user accounts found"
            description="Create user accounts linked to employees to allow system access."
            icon={Users}
            action={handleAdd}
            actionLabel="Create First Account"
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Username / Email
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Linked Employee
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Account Status
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                    Activation Date
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                    Last Login
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const roleClass = ROLE_COLORS[u.role] || ROLE_COLORS.employee;
                  const computedStatus = !u.is_active ? 'Disabled' : (u.account_status || (u.is_verified ? 'Active' : 'Pending Activation'));

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-2xs">
                            {(u.username?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                              {u.username}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        {u.employee_name ? (
                          <span className="text-xs font-medium text-slate-800">
                            {u.employee_name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">— Unlinked —</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${roleClass}`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusBadge status={computedStatus} type="dot" />
                      </td>

                      <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-slate-500">
                        {u.activated_at ? formatDate(u.activated_at) : '—'}
                      </td>

                      <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-slate-500">
                        {u.last_login ? formatDate(u.last_login) : 'Never'}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Resend Activation Email (if pending) */}
                          {(computedStatus === 'Pending Activation' || computedStatus === 'Pending') && (
                            <button
                              onClick={() => handleResendActivation(u)}
                              disabled={resendingId === u.id}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
                              title="Resend Activation Email"
                            >
                              <Mail size={15} />
                            </button>
                          )}

                          {/* View Details */}
                          <button
                            onClick={() => setDetailsUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View Account Details"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Toggle Active / Disabled */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              u.is_active
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.is_active ? 'Disable Account' : 'Enable Account'}
                          >
                            {u.is_active ? <Lock size={15} /> : <Unlock size={15} />}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Account"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete User Account"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Create / Edit User Modal (No Password Field!) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Account' : 'Create User Account'}
        subtitle={editingUser ? 'Update role and employee assignment.' : 'Create an account and trigger an activation email.'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Username <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. john.doe"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* 2. Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="john.doe@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">An activation link will be sent to this email address.</p>
          </div>

          {/* 3. Account Type (Role) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Account Type (Role) <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => {
                const newRole = e.target.value;
                setFormData({
                  ...formData,
                  role: newRole,
                  employee_id: newRole === 'employee' ? formData.employee_id : ''
                });
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="admin">Administrator</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          {/* 4. Employee Selection (Dynamic - Only shown when Role === 'employee') */}
          {formData.role === 'employee' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Select Employee <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal normal-case">Only employees without an account</span>
              </label>
              <select
                required
                value={formData.employee_id}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
              >
                <option value="">-- Choose an Employee --</option>
                {unlinkedEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.matricule}) — {emp.department || 'No Dept'}
                  </option>
                ))}
              </select>
              {unlinkedEmployees.length === 0 && !editingUser && (
                <p className="text-[11px] text-amber-600 font-medium mt-1.5">
                  ⚠️ No unlinked employees found. All employees currently have existing user accounts.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingUser ? 'Save Changes' : 'Create & Send Activation Email'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Account Details Modal */}
      {detailsUser && (
        <Modal
          isOpen={Boolean(detailsUser)}
          onClose={() => setDetailsUser(null)}
          title="Account Details"
          subtitle={`Detailed status and history for '${detailsUser.username}'`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block mb-0.5">Username</span>
                <span className="font-bold text-slate-900 text-sm">{detailsUser.username}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Email</span>
                <span className="font-semibold text-slate-800">{detailsUser.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Role</span>
                <span className="font-semibold text-slate-800 uppercase">{detailsUser.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Linked Employee</span>
                <span className="font-semibold text-slate-800">{detailsUser.employee_name || '—'}</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Account Status</span>
                <StatusBadge status={!detailsUser.is_active ? 'Disabled' : (detailsUser.account_status || 'Pending Activation')} type="dot" />
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Created At</span>
                <span className="font-mono text-slate-700">{formatDate(detailsUser.created_at)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Activation Date</span>
                <span className="font-mono text-slate-700">{formatDate(detailsUser.activated_at)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Last Login</span>
                <span className="font-mono text-slate-700">{formatDate(detailsUser.last_login)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="secondary" onClick={() => setDetailsUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
