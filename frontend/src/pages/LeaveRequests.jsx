import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Edit2, Trash2, CheckCircle2, XCircle, Clock, Search, X,
  Calendar, AlertCircle, FileText, Zap, ArrowRight, Check, Ban
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { getAbsences, createAbsence, updateAbsence, deleteAbsence, validateAbsence, rejectAbsence } from '../services/absenceService';
import { getEmployees } from '../services/employeeService';
import { useAuth } from '../context/AuthContext';
import EmployeeLeaveRequestsView from '../components/leave/EmployeeLeaveRequestsView';
import { getEmployeeLeaveBalanceForManager } from '../services/leaveBalanceService';

const LeaveRequests = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const [absences, setAbsences] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: '',
    type: 'Vacation',
    start_date: '',
    end_date: '',
    reason: '',
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Employee balances state (for managers)
  const [employeeBalances, setEmployeeBalances] = useState({});

  const filteredAbsences = absences.filter((a) => {
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesType = typeFilter === 'All' || a.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const absencesData = await getAbsences({ page, limit, search: searchTerm });
      setAbsences(absencesData.data || []);
      setTotal(absencesData.total || 0);
      setTotalPages(absencesData.totalPages || 0);

      if (!isEmployee) {
        const employeesData = await getEmployees({ limit: 1000 });
        setEmployees(employeesData.data || []);

        const uniqueEmployeeIds = [...new Set((absencesData.data || []).map((a) => a.employee_id))];
        const balances = {};
        await Promise.all(
          uniqueEmployeeIds.map(async (empId) => {
            try {
              const balanceRes = await getEmployeeLeaveBalanceForManager(empId);
              if (balanceRes.success && balanceRes.data) {
                balances[empId] = balanceRes.data;
              }
            } catch (err) {
              console.error(`Error fetching balance for employee ${empId}:`, err);
            }
          })
        );
        setEmployeeBalances(balances);
      }
    } catch (error) {
      console.error('Error fetching absences:', error);
      toast.error('Failed to load leave requests');
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
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (isEmployee) {
    return <EmployeeLeaveRequestsView />;
  }

  const handleAdd = () => {
    setEditingAbsence(null);
    setFormData({
      employee_id: employees.length > 0 ? employees[0].id : '',
      type: 'Vacation',
      start_date: '',
      end_date: '',
      reason: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (absence) => {
    setEditingAbsence(absence);
    setFormData({
      employee_id: absence.employee_id,
      type: absence.type,
      start_date: absence.start_date ? absence.start_date.split('T')[0] : '',
      end_date: absence.end_date ? absence.end_date.split('T')[0] : '',
      reason: absence.reason || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this absence record?')) {
      try {
        await deleteAbsence(id);
        toast.success('Absence record deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting absence:', error);
        toast.error('Failed to delete absence record');
      }
    }
  };

  const handleValidate = async (id) => {
    try {
      await validateAbsence(id);
      toast.success('Leave request approved');
      fetchData();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectAbsence(id);
      toast.success('Leave request rejected');
      fetchData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingAbsence) {
        await updateAbsence(editingAbsence.id, formData);
        toast.success('Absence record updated');
      } else {
        await createAbsence(formData);
        toast.success('Absence request logged');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving absence:', error);
      toast.error(error.response?.data?.message || 'Failed to save absence');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Premium Blue Hero Banner ─────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] to-[#0064e0] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-100 font-heading mb-1">
              <Zap size={14} className="text-blue-100" />
              <span>Leave Authorization Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              TIME-OFF & ABSENCE REQUESTS
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Validate vacation periods, medical leaves, telework requests, and track remaining employee quotas.
            </p>
          </div>

          <Button variant="secondary" icon={Plus} onClick={handleAdd}>
            Log Leave Request
          </Button>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── Filter Toolbar ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#dde5ec] p-4 shadow-premium-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by employee name, matricule, or reason…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f1f5f8] border border-[#dde5ec] rounded-xl text-xs font-semibold text-[#1c2b33] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-[#f1f5ff] border border-[#d6e2f0] rounded-xl text-xs font-bold text-[#172033] cursor-pointer focus:bg-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Validated">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3.5 py-2 bg-[#f1f5ff] border border-[#d6e2f0] rounded-xl text-xs font-bold text-[#172033] cursor-pointer focus:bg-white focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Vacation">Vacation</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Telework">Telework</option>
              <option value="Training">Training</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Leave Requests Table ─────────────────────────────────── */}
      <Card
        headerVariant="softBlue"
        title={`Leave Applications (${filteredAbsences.length})`}
        subtitle="Manage employee requests, approve or reject leave balances with instant notification."
      >
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="md" text="Loading leave applications…" />
          </div>
        ) : filteredAbsences.length === 0 ? (
          <EmptyState
            title="No leave requests found"
            description="There are no absence or vacation requests matching the selected filters."
            icon={Calendar}
            action={handleAdd}
            actionLabel="Log Request"
          />
        ) : (
          <div className="overflow-x-auto -mx-6 -my-6">
            <table className="w-full text-sm">
              <thead className="bg-[#f1f5f8] text-[#2563eb] border-b border-[#dde5ec]">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Employee
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Leave Category
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Date Range
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Duration
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Balance Available
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Validation Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5ff] bg-white">
                {filteredAbsences.map((absence) => {
                  const empBalance = employeeBalances[absence.employee_id];
                  const vacRemaining = empBalance?.remaining_vacation_days ?? '—';
                  const sickRemaining = empBalance?.remaining_sick_days ?? '—';

                  const start = new Date(absence.start_date);
                  const end = new Date(absence.end_date);
                  const days = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={absence.id} className="hover:bg-[#f1f7ff] transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                            {(absence.first_name || 'U').charAt(0)}
                            {(absence.last_name || '').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#172033] text-xs sm:text-sm">
                              {absence.first_name} {absence.last_name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{absence.matricule}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={absence.type} type="soft" />
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-slate-700">
                        {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →{' '}
                        {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono font-bold text-[#172033]">
                        {days} {days === 1 ? 'day' : 'days'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe] font-bold" title="Vacation balance">
                            V: {vacRemaining}d
                          </span>
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold" title="Sick balance">
                            S: {sickRemaining}d
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={absence.status} type="dot" />
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {absence.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleValidate(absence.id)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
                                title="Approve Request"
                              >
                                <Check size={15} strokeWidth={2.4} />
                              </button>
                              <button
                                onClick={() => handleReject(absence.id)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                                title="Reject Request"
                              >
                                <Ban size={15} strokeWidth={2.4} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEdit(absence)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563eb] hover:bg-[#eff6ff] transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(absence.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
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
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-[#d6e2f0]">
            <Pagination
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>

      {/* Add / Edit Absence Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAbsence ? 'Modify Absence Record' : 'Submit Leave Application'}
        subtitle="Specify employee name, dates, category, and approval rationale."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
              Employee <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] cursor-pointer"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.matricule})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
              Leave Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] cursor-pointer"
            >
              <option value="Vacation">Paid Vacation (Congés)</option>
              <option value="Sick Leave">Sick Leave (Maladie)</option>
              <option value="Telework">Telework / Remote</option>
              <option value="Training">Professional Training</option>
              <option value="Maternity/Paternity">Parental Leave</option>
              <option value="Other">Other Authorized Reason</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
              Reason / Justification
            </label>
            <textarea
              rows={2}
              placeholder="Optional notes or context for managers…"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d6e2f0]">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingAbsence ? 'Save Updates' : 'Submit Leave'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveRequests;
