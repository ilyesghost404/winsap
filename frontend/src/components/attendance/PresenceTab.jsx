import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  RefreshCw, Search, Filter, LogIn, LogOut, CheckCircle2,
  Users, UserCheck, UserX, Clock, AlertCircle, X, Zap
} from 'lucide-react';
import Button from '../Button';
import { SkeletonTable } from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import Pagination from '../Pagination';
import StatusBadge from '../StatusBadge';
import { getTodayAttendance, checkIn, checkOut } from '../../services/presenceService';

const PresenceTab = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTodayAttendance({ page: 1, limit: 1000, search: '' });
      setAttendanceData(data.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async (employeeId) => {
    try {
      await checkIn(employeeId);
      toast.success('Check-in recorded successfully!');
      fetchData();
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (employeeId) => {
    try {
      await checkOut(employeeId);
      toast.success('Check-out recorded successfully!');
      fetchData();
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  const formatTime = (time) => {
    if (!time) return '—';
    try {
      if (time.includes(':')) {
        const [hours, minutes] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }
      const d = new Date(time);
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return time;
    }
  };

  // Filter attendance records
  const filteredData = useMemo(() => {
    return attendanceData.filter((item) => {
      const name = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();
      const matricule = (item.matricule || '').toLowerCase();
      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm.toLowerCase()) ||
        matricule.includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'Present') matchesStatus = !!item.check_in && !item.check_out;
      if (statusFilter === 'Completed') matchesStatus = !!item.check_in && !!item.check_out;
      if (statusFilter === 'Absent') matchesStatus = !item.check_in;

      return matchesSearch && matchesStatus;
    });
  }, [attendanceData, searchTerm, statusFilter]);

  // Paginated records
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredData.slice(startIndex, startIndex + limit);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / limit);

  // Statistics
  const presentCount = attendanceData.filter((item) => !!item.check_in && !item.check_out).length;
  const completedCount = attendanceData.filter((item) => !!item.check_in && !!item.check_out).length;
  const absentCount = attendanceData.filter((item) => !item.check_in).length;

  return (
    <div className="space-y-4">
      {/* Overview Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-[#d5e2f1] p-4 flex items-center gap-3 shadow-premium-sm">
          <div className="w-10 h-10 rounded-xl bg-[#eef5ff] text-[#1e54a9] flex items-center justify-center flex-shrink-0 border border-[#d5e2f1]">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xl font-heading font-black text-[#172033]">{attendanceData.length}</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">Total Tracked</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#d6e2f0] p-4 flex items-center gap-3 shadow-premium-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-200">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-xl font-heading font-black text-emerald-950">{presentCount}</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">Currently In</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#d6e2f0] p-4 flex items-center gap-3 shadow-premium-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-200">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xl font-heading font-black text-[#172033]">{completedCount}</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">Completed Day</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#d6e2f0] p-4 flex items-center gap-3 shadow-premium-sm">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 border border-rose-200">
            <UserX size={20} />
          </div>
          <div>
            <p className="text-xl font-heading font-black text-rose-950">{absentCount}</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">Not Checked In</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#d6e2f0] p-3.5 shadow-premium-sm">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by employee name or matricule…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2 bg-[#f1f5ff] border border-[#d6e2f0] rounded-xl text-xs font-semibold text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] focus:bg-white transition-all"
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
            <div className="flex items-center gap-1 bg-[#f1f5ff] rounded-xl p-1 border border-[#d6e2f0]">
              {[
                { id: '', label: 'All' },
                { id: 'Present', label: 'Present' },
                { id: 'Completed', label: 'Completed' },
                { id: 'Absent', label: 'Absent' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-electric-glow'
                      : 'text-[#172033] hover:text-[#2563eb]'
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
              title="Refresh logs"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      {loading ? (
        <SkeletonTable rows={6} columns={5} />
      ) : filteredData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#d6e2f0] shadow-premium-sm">
          <EmptyState
            title="No attendance records found"
            description="No employees matched your current filters or today's logs are empty."
            icon={Clock}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#dde5ec] shadow-premium-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e7f0fa] text-sm">
              <thead className="bg-[#f1f5f8] text-[#2563eb] border-b border-[#dde5ec]">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Employee
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Check In
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Check Out
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7f0fa] bg-white">
                {paginatedData.map((record) => {
                  const hasCheckedIn = !!record.check_in;
                  const hasCheckedOut = !!record.check_out;

                  return (
                    <tr key={record.id} className="hover:bg-[#e7f0fa]/60 transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs border border-white/20">
                            {(record.first_name || 'U').charAt(0)}
                            {(record.last_name || '').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#172033] text-xs sm:text-sm">
                              {record.first_name} {record.last_name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{record.matricule}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-xs font-mono font-bold text-slate-700">
                        {hasCheckedIn ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {formatTime(record.check_in)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-xs font-mono font-bold text-slate-700">
                        {hasCheckedOut ? (
                          <span className="text-[#2563eb] bg-[#e7f0fa] px-2 py-0.5 rounded border border-[#dde5ec]">
                            {formatTime(record.check_out)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap">
                        {hasCheckedIn && hasCheckedOut ? (
                          <StatusBadge status="completed" type="dot" />
                        ) : hasCheckedIn ? (
                          <StatusBadge status="present" type="dot" />
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

          {totalPages > 1 && (
            <div className="p-4 border-t border-[#d6e2f0]">
              <Pagination
                page={page}
                limit={limit}
                total={filteredData.length}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PresenceTab;
