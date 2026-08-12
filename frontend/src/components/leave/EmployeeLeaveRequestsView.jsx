import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Edit2, Trash2, CalendarDays, Clock, FileText,
  CheckCircle2, XCircle, Search, Umbrella, Activity, BookOpen, AlertTriangle, Laptop, Zap
} from 'lucide-react';
import Card from '../Card';
import Button from '../Button';
import Modal from '../Modal';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import Pagination from '../Pagination';
import StatusBadge from '../StatusBadge';
import { getAbsences, createAbsence, updateAbsence, deleteAbsence } from '../../services/absenceService';
import { getMyLeaveBalance } from '../../services/leaveBalanceService';
import { useAuth } from '../../context/AuthContext';

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const [year, month, day] = cleanStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const EmployeeLeaveRequestsView = () => {
  const { user } = useAuth();
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState(null);

  const [formData, setFormData] = useState({
    type: 'Vacation',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const [balance, setBalance] = useState({
    paidLeave: 22,
    sickLeave: 5,
    telework: 0,
    rtt: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [absencesData, balanceRes] = await Promise.all([
        getAbsences({ page, limit, search: searchTerm }),
        getMyLeaveBalance().catch(() => null),
      ]);

      setAbsences(absencesData.data || []);
      setTotal(absencesData.total || 0);
      setTotalPages(absencesData.totalPages || 0);

      if (balanceRes && balanceRes.success && balanceRes.data) {
        setBalance(balanceRes.data);
      }
    } catch (error) {
      console.error('Error fetching employee leave data:', error);
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
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAdd = () => {
    setEditingAbsence(null);
    setFormData({
      employee_id: user?.employee_id || '',
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
    if (window.confirm('Are you sure you want to cancel this leave application?')) {
      try {
        await deleteAbsence(id);
        toast.success('Leave application removed');
        fetchData();
      } catch (error) {
        console.error('Error deleting absence:', error);
        toast.error('Failed to remove request');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAbsence) {
        await updateAbsence(editingAbsence.id, formData);
        toast.success('Request updated');
      } else {
        await createAbsence(formData);
        toast.success('Leave request submitted for approval');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving absence:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const filteredAbsences = absences.filter((a) => {
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesType = typeFilter === 'All' || a.type === typeFilter;
    return matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* ── Bright Blue Hero Banner ────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] to-[#0064e0] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-100 font-heading mb-1">
              <Zap size={14} className="text-blue-100" />
              <span>Personal Time-Off Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              MY LEAVE REQUESTS
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Submit vacation dates, medical leaves, or telework days and monitor managerial approval.
            </p>
          </div>

          <Button variant="secondary" icon={Plus} onClick={handleAdd}>
            Apply for Leave
          </Button>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Balance Badges Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#d9e7f5] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-200">
            <Umbrella size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">
              Paid Leave
            </p>
            <p className="text-xl font-heading font-black text-[#172033] mt-0.5">
              {balance.paidLeave ?? 22}d <span className="text-xs font-normal text-slate-400">left</span>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d9e7f5] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 border border-rose-200">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">
              Sick Leave
            </p>
            <p className="text-xl font-heading font-black text-[#172033] mt-0.5">
              {balance.sickLeave ?? 5}d <span className="text-xs font-normal text-slate-400">left</span>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d9e7f5] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-200">
            <Laptop size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">
              Telework
            </p>
            <p className="text-xl font-heading font-black text-[#172033] mt-0.5">
              {balance.telework ?? 0}d <span className="text-xs font-normal text-slate-400">logged</span>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d9e7f5] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0 border border-violet-200">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">
              Training
            </p>
            <p className="text-xl font-heading font-black text-[#172033] mt-0.5">
              {balance.rtt ?? 0}d <span className="text-xs font-normal text-slate-400">taken</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#d9e7f5] p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search your requests by reason or type…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f0f7ff] border border-[#d9e7f5] rounded-xl text-xs font-semibold text-[#172033] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-[#f0f7ff] border border-[#d9e7f5] rounded-xl text-xs font-bold text-[#172033] cursor-pointer focus:bg-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Validated">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3.5 py-2 bg-[#f0f7ff] border border-[#d9e7f5] rounded-xl text-xs font-bold text-[#172033] cursor-pointer focus:bg-white focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Vacation">Vacation Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Telework">Telework</option>
              <option value="Training">Training</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <Card
        headerVariant="softBlue"
        title={`My Request History (${filteredAbsences.length})`}
        subtitle="Full log of your submitted absences, dates, and validation status."
      >
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="md" text="Loading your requests…" />
          </div>
        ) : filteredAbsences.length === 0 ? (
          <EmptyState
            title="No requests found"
            description="You have not submitted any leave requests matching the filters."
            icon={CalendarDays}
            action={handleAdd}
            actionLabel="Apply for Leave"
          />
        ) : (
          <div className="overflow-x-auto -mx-6 -my-6">
            <table className="w-full text-sm">
              <thead className="bg-[#f0f7ff] text-[#1e3a8a] border-b border-[#d9e7f5]">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#1e3a8a]">
                    Type
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#1e3a8a]">
                    Date Range
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#1e3a8a]">
                    Duration
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#1e3a8a]">
                    Reason / Notes
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#1e3a8a]">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#1e3a8a]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f7ff] bg-white">
                {filteredAbsences.map((absence) => {
                  const startDate = new Date(absence.start_date);
                  const endDate = new Date(absence.end_date);
                  const durationDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={absence.id} className="hover:bg-[#f0f7ff]/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <StatusBadge status={absence.type} type="soft" />
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-700 font-semibold font-mono">
                        {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        <span className="text-slate-400 mx-1">→</span>
                        {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="px-4 py-3.5 text-xs font-black text-blue-600 font-mono">
                        {durationDays}d
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate">
                        {absence.reason || 'No details provided'}
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={absence.status} type="dot" />
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        {(!absence.status || absence.status === 'Pending' || absence.status === 'PENDING') ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(absence)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-[#f0f7ff] transition-colors cursor-pointer"
                              title="Edit Request"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(absence.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Cancel Request"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Locked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pt-4 border-t border-[#d9e7f5]">
            <Pagination
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </Card>

      {/* Modal for Employee Leave Request */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAbsence ? 'Edit Leave Application' : 'Apply for Leave'}
        subtitle="Submit a vacation, sick leave, or telework request to your manager."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
              Leave Classification <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d9e7f5] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="Vacation">Vacation Leave (Congés payés)</option>
              <option value="Sick Leave">Sick Leave (Maladie)</option>
              <option value="Telework">Telework / Remote</option>
              <option value="Training">Training / Workshop</option>
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
                className="w-full px-3.5 py-2.5 bg-white border border-[#d9e7f5] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
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
                className="w-full px-3.5 py-2.5 bg-white border border-[#d9e7f5] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
              Reason / Justification
            </label>
            <input
              type="text"
              placeholder="e.g. Family vacation or medical certificate submitted"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d9e7f5] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d9e7f5]">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingAbsence ? 'Save Changes' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeLeaveRequestsView;
