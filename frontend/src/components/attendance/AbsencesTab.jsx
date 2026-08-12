import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Edit2, Search, Filter, X, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import Button from '../Button';
import Modal from '../Modal';
import { SkeletonTable } from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import Pagination from '../Pagination';
import StatusBadge from '../StatusBadge';
import { getAnomalies, validateAnomaly } from '../../services/attendanceService';

const AbsencesTab = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [formData, setFormData] = useState({
    validation_status: 'Validated',
    justification_reason: '',
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Pagination states
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAnomalies({ page: 1, limit: 1000, search: '' });
      setAnomalies(data.data || []);
    } catch (err) {
      console.error('Error fetching anomalies:', err);
      toast.error('Failed to load absences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAnomalies = Array.isArray(anomalies)
    ? anomalies.filter((a) => {
        const matchesSearch =
          !searchTerm ||
          (a.first_name && a.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (a.last_name && a.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (a.matricule && a.matricule.toLowerCase().includes(searchTerm.toLowerCase()));

        const valStatus = a.validation_status || 'Pending';
        const matchesStatus = statusFilter === 'All' || valStatus === statusFilter;
        const matchesType = typeFilter === 'All' || a.anomaly_type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
    : [];

  const paginatedAnomalies = filteredAnomalies.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filteredAnomalies.length / limit);

  const handleValidate = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setFormData({
      validation_status: anomaly.validation_status || 'Validated',
      justification_reason: anomaly.justification_reason || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await validateAnomaly(selectedAnomaly.id, formData);
      toast.success('Anomaly status updated successfully');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating anomaly:', error);
      toast.error(error.response?.data?.message || 'Failed to update anomaly');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#d9e7f5] p-3.5 shadow-xs">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search anomalies by employee name or matricule…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2 bg-[#f0f7ff] border border-[#d9e7f5] rounded-xl text-xs font-semibold text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#172033] cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-[#f0f7ff] border border-[#d9e7f5] rounded-xl text-xs font-bold text-[#172033] cursor-pointer focus:bg-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Validated">Validated</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-[#f0f7ff] border border-[#d9e7f5] rounded-xl text-xs font-bold text-[#172033] cursor-pointer focus:bg-white focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Absence">Unexcused Absence</option>
              <option value="Late">Late Check-in</option>
              <option value="Early Leave">Early Leave</option>
              <option value="Missing Checkout">Missing Checkout</option>
            </select>

            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchData}
              title="Refresh anomaly logs"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Anomalies Table */}
      {loading ? (
        <SkeletonTable rows={6} columns={6} />
      ) : filteredAnomalies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#d9e7f5] shadow-xs">
          <EmptyState
            title="No anomalies or attendance incidents found"
            description="All employees are currently checked in correctly without recorded discrepancies."
            icon={AlertTriangle}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#d9e7f5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#f0f7ff] text-sm">
              <thead className="bg-[#f0f7ff] text-[#1e3a8a] border-b border-[#d9e7f5]">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#1e3a8a]">
                    Employee
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#1e3a8a]">
                    Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#1e3a8a]">
                    Incident Type
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#1e3a8a]">
                    Duration
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#1e3a8a]">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#1e3a8a]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f7ff] bg-white">
                {paginatedAnomalies.map((anomaly) => (
                  <tr key={anomaly.id} className="hover:bg-[#f0f7ff]/60 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs border border-white/20">
                          {(anomaly.first_name || 'U').charAt(0)}
                          {(anomaly.last_name || '').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#172033] text-xs sm:text-sm">
                            {anomaly.first_name} {anomaly.last_name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{anomaly.matricule}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-mono font-semibold text-[#172033]">
                      {new Date(anomaly.anomaly_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {anomaly.anomaly_type}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-mono font-bold text-slate-700">
                      {anomaly.duration_minutes ? `${anomaly.duration_minutes} mins` : 'Full Day'}
                    </td>

                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <StatusBadge status={anomaly.validation_status || 'Pending'} type="dot" />
                    </td>

                    <td className="px-6 py-3.5 whitespace-nowrap text-right">
                      <Button
                        variant="softBlue"
                        size="xs"
                        icon={Edit2}
                        onClick={() => handleValidate(anomaly)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-[#d9e7f5]">
              <Pagination
                page={page}
                limit={limit}
                total={filteredAnomalies.length}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Validation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Review Attendance Incident"
        subtitle="Validate or reject this absence record and enter managerial remarks."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
              Decision Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.validation_status}
              onChange={(e) => setFormData({ ...formData, validation_status: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d9e7f5] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="Validated">Approved / Justified</option>
              <option value="Rejected">Rejected / Unexcused</option>
              <option value="Pending">Keep Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
              Justification Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Medical certificate provided on arrival, delay excused due to transport anomaly…"
              value={formData.justification_reason}
              onChange={(e) => setFormData({ ...formData, justification_reason: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d9e7f5] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d9e7f5]">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Decision
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AbsencesTab;
