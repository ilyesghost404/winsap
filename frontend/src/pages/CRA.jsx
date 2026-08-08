import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Edit2, Trash2, CheckCircle2, XCircle, Clock, Search, X,
  ClipboardList, FileText, Timer, Calendar, Play, Square, RefreshCw,
  FileSpreadsheet, Award, TrendingUp, Activity, ExternalLink
} from 'lucide-react';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import StatsCard from '../components/StatsCard';
import { useAuth } from '../context/AuthContext';
import {
  getMyActivities,
  getAllActivities,
  createCraEntry,
  startActivity,
  startExistingActivity,
  endActivity,
  updateCraEntry,
  deleteCraEntry,
  approveCraEntry,
  rejectCraEntry,
  getCraStats
} from '../services/craService';
import { getEmployees } from '../services/employeeService';
import {
  getEmployeeYearlyReport,
  exportEmployeeYearlyExcel,
  exportEmployeeYearlyPdf
} from '../services/reportService';
import { connectSocket, disconnectSocket } from '../services/socket';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const STATUS_CONFIG = {
  PENDING_START: { label: 'Pending Start', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: Clock, dot: 'bg-slate-400' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-50/70', text: 'text-blue-700', border: 'border-blue-200/60', icon: Play, dot: 'bg-blue-500 animate-pulse' },
  PENDING_APPROVAL: { label: 'Pending Approval', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, dot: 'bg-amber-500' },
  COMPLETED: { label: 'Pending Approval', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, dot: 'bg-amber-500' },
  APPROVED: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2, dot: 'bg-emerald-500' },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle, dot: 'bg-rose-500' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING_START;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.bg} ${config.text} border ${config.border}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <Icon size={12} className="flex-shrink-0" />
      {config.label}
    </span>
  );
};

const formatTimeOfDay = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const formatFullDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined) return '—';
  
  // Day-based equivalence: 1 working day = 8 hours = 480 minutes
  const minsInWorkDay = 480; 
  if (minutes >= minsInWorkDay) {
    const days = Math.floor(minutes / minsInWorkDay);
    const remainingMins = minutes % minsInWorkDay;
    const remainingHours = Math.floor(remainingMins / 60);
    const finalMins = remainingMins % 60;
    
    let durationStr = `${days} day${days > 1 ? 's' : ''}`;
    if (remainingHours > 0) durationStr += ` ${remainingHours}h`;
    if (finalMins > 0) durationStr += ` ${finalMins}m`;
    return durationStr;
  }
  
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMins}m`;
};


const MONTHS = [
  { value: '', label: 'All Months' },
  { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
  { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
  { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

// Helper hook for running a live stopwatch
const LiveStopwatch = ({ startTime }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!startTime) return;
    const start = new Date(startTime).getTime();

    const updateTimer = () => {
      const diffMs = Date.now() - start;
      if (diffMs < 0) {
        setElapsed('00:00:00');
        return;
      }
      const totalSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      const pad = (n) => String(n).padStart(2, '0');
      setElapsed(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="font-mono text-2xl font-bold tracking-wider tabular-nums">{elapsed}</span>;
};

const CRA = () => {
  const { user } = useAuth();

  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending_start: 0, in_progress: 0, completed: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState(null);
  const [nextTask, setNextTask] = useState(null);
  const [employeesList, setEmployeesList] = useState([]);

  // Tab state (Managers only)
  const [activeTab, setActiveTab] = useState('activities');

  // Yearly reports states (Managers only)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Searchable autocomplete employee states
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [showEmployeeSuggestions, setShowEmployeeSuggestions] = useState(false);

  // Synchronize search input text when selectedEmployeeId changes
  useEffect(() => {
    if (selectedEmployeeId && employeesList.length > 0) {
      const selected = employeesList.find(e => e.id.toString() === selectedEmployeeId.toString());
      if (selected) {
        setEmployeeSearchQuery(`${selected.first_name} ${selected.last_name}`);
      }
    } else {
      setEmployeeSearchQuery('');
    }
  }, [selectedEmployeeId, employeesList]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startImmediate, setStartImmediate] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    employeeId: '',
    ticketReference: '',
    description: '',
    priority: 'Medium',
    durationType: 'Hours',
    durationValue: '',
    startDate: '',
    endDate: ''
  });

  // Fetch employees list for managers
  useEffect(() => {
    if (isManager) {
      getEmployees({ limit: 1000 })
        .then(res => {
          setEmployeesList(res.data || []);
        })
        .catch(err => console.error("Error loading employees:", err));
    }
  }, [isManager]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [selectedEmployeeFilterId, setSelectedEmployeeFilterId] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        status: statusFilter || undefined,
        month: monthFilter || undefined,
        year: yearFilter || undefined,
        startDate: startDateFilter || undefined,
        endDate: endDateFilter || undefined,
      };

      let result;
      if (isManager) {
        result = await getAllActivities({ 
          ...params, 
          search: searchTerm || undefined, 
          employeeId: selectedEmployeeFilterId || undefined 
        });
      } else {
        result = await getMyActivities({
          ...params,
          search: searchTerm || undefined
        });
        const currentItem = result.currentTask || (result.data || []).find(item => item.status === 'IN_PROGRESS') || null;
        const queuedItem = result.nextTask || (result.data || []).find(item => item.status === 'PENDING_START') || null;
        setActiveTimer(currentItem);
        setNextTask(queuedItem);
      }

      setEntries(result.data || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 0);

      // Fetch general stats
      const statsData = await getCraStats();
      setStats(statsData);

      // Check for any running timer for current employee
      if (isEmployee && !isManager) {
        const activeItem = result.currentTask || (result.data || []).find(item => item.status === 'IN_PROGRESS');
        setActiveTimer(activeItem || null);
      }
    } catch (error) {
      console.error('Error fetching CRA data:', error);
      toast.error('Failed to load activity reports');
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, monthFilter, yearFilter, searchTerm, selectedEmployeeFilterId, startDateFilter, endDateFilter, isManager, isEmployee]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket.IO real-time listeners for approval & auto-start events
  useEffect(() => {
    const socket = connectSocket();
    if (socket) {
      if (isManager) {
        socket.emit("join", "managers");
      }

      socket.on("cra_approved", () => {
        fetchData();
      });

      socket.on("cra_auto_started", (payload) => {
        if (isEmployee && payload.employeeId === user?.employee_id) {
          toast.success("Your next task has started automatically.", { id: `auto-${payload.craId}` });
        } else if (isManager) {
          toast.success(`${payload.employeeName || 'Employee'} started ${payload.ticketReference} automatically.`, { id: `auto-${payload.craId}` });
        }
        fetchData();
      });

      socket.on("cra_created", (payload) => {
        if (isEmployee && payload.employeeId === user?.employee_id) {
          toast.success(`New task assigned to you: ${payload.ticketReference}`, { id: `create-${payload.craId}`, duration: 5000 });
        }
        fetchData();
      });

      socket.on("cra_started", () => {
        fetchData();
      });

      socket.on("cra_finished", () => {
        fetchData();
      });
    }

    return () => {
      if (socket) {
        socket.off("cra_approved");
        socket.off("cra_auto_started");
        socket.off("cra_created");
        socket.off("cra_started");
        socket.off("cra_finished");
      }
    };
  }, [fetchData, isEmployee, isManager, user?.employee_id]);

  // Debounced search
  useEffect(() => {
    if (!isManager) return;
    const timer = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const resetForm = () => {
    setFormData({
      employeeId: '',
      ticketReference: '',
      description: '',
      priority: 'Medium',
      durationType: 'Hours',
      durationValue: '',
      startDate: '',
      endDate: ''
    });
    setEditingEntry(null);
    setStartImmediate(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);

    let durationType = 'Hours';
    let durationValue = '';
    if (entry.duration_minutes !== null && entry.duration_minutes !== undefined) {
      const minsInWorkDay = 480;
      if (entry.duration_minutes >= minsInWorkDay) {
        durationType = 'Days';
        durationValue = parseFloat((entry.duration_minutes / minsInWorkDay).toFixed(2));
      } else {
        durationType = 'Hours';
        durationValue = parseFloat((entry.duration_minutes / 60).toFixed(2));
      }
    }

    const formatDateInput = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toISOString().split('T')[0];
    };

    setFormData({
      employeeId: entry.employee_id || '',
      ticketReference: entry.ticket_reference || '',
      description: entry.description || '',
      priority: entry.priority === 2 ? 'High' : entry.priority === 0 ? 'Low' : 'Medium',
      durationType,
      durationValue: durationValue !== '' ? String(durationValue) : '',
      startDate: formatDateInput(entry.start_time),
      endDate: formatDateInput(entry.end_time)
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.ticketReference || !formData.ticketReference.trim()) {
      toast.error('Ticket Reference is required');
      return;
    }
    if (!formData.description || !formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.startDate) {
      toast.error('Start Date is required');
      return;
    }
    if (!formData.durationValue || parseFloat(formData.durationValue) <= 0) {
      toast.error('Duration is required and must be greater than 0');
      return;
    }
    if (parseFloat(formData.durationValue) < 0.5) {
      toast.error('Minimum duration is 0.5');
      return;
    }

    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End Date cannot be before Start Date');
      return;
    }

    // Convert values
    const durationNum = parseFloat(formData.durationValue);
    let durationMinutes = 0;
    if (formData.durationType === 'Hours') {
      durationMinutes = Math.round(durationNum * 60);
    } else {
      durationMinutes = Math.round(durationNum * 480);
    }

    const payload = {
      employeeId: formData.employeeId,
      ticketReference: formData.ticketReference.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      durationMinutes
    };

    setSubmitting(true);
    try {
      if (editingEntry) {
        await updateCraEntry(editingEntry.id, payload);
        toast.success('Activity updated successfully');
      } else {
        if (startImmediate && !isManager) {
          if (activeTimer) {
            toast.error('You already have an active timer running.');
            setSubmitting(false);
            return;
          }
          await startActivity(payload);
          toast.success('Activity started successfully');
        } else {
          await createCraEntry(payload);
          toast.success(isManager ? 'Task assigned successfully' : 'Activity logged successfully');
        }
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save activity';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedEmployeeId) {
      toast.error('Please select an employee');
      return;
    }
    try {
      setLoadingReport(true);
      setReportData(null);
      const data = await getEmployeeYearlyReport(selectedEmployeeId, selectedYear);
      setReportData(data);
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.message || 'No approved tasks found for this employee in the selected year.');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedEmployeeId) return;
    try {
      setExportingExcel(true);
      await exportEmployeeYearlyExcel(selectedEmployeeId, selectedYear);
      toast.success('Excel report downloaded successfully');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    if (!selectedEmployeeId) return;
    try {
      setExportingPdf(true);
      await exportEmployeeYearlyPdf(selectedEmployeeId, selectedYear);
      toast.success('PDF report downloaded successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleStartExisting = async (id) => {
    if (activeTimer) {
      toast.error('Please stop your current running activity first.');
      return;
    }
    try {
      await startExistingActivity(id);
      toast.success('Timer started!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start activity');
    }
  };

  const handleEndActivity = async (id) => {
    try {
      const loadingToast = toast.loading('Calculating duration and stopping task...');
      const res = await endActivity(id);
      toast.dismiss(loadingToast);
      toast.success(`Task ended! Status set to Pending Approval. Duration: ${formatDuration(res.data.duration_minutes)}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to end activity');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCraEntry(id);
      toast.success('Activity deleted');
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete activity');
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approveCraEntry(id);
      if (res.autoStartedTask) {
        toast.success(`Approved! Next task (${res.autoStartedTask.ticket_reference}) auto-started.`);
      } else {
        toast.success('Activity approved successfully');
      }
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve activity');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectCraEntry(id);
      toast.success('Activity rejected');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject activity');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const nextQueuedTask = isEmployee ? entries.find(item => item.status === 'PENDING_START') : null;

  return (
    <div className="space-y-6">
      {/* Active & Queued Task Widgets (Employee view) */}
      {isEmployee && (activeTimer || nextTask) && (
        <div className={`grid grid-cols-1 ${activeTimer && nextTask ? 'md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {/* Current Active Task Card */}
          {activeTimer && (
            <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl shadow-blue-900/10 border border-blue-800/40 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Current Task: 🟢 In Progress
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/20 border border-blue-400/30 text-blue-200 rounded-md text-xs font-mono font-bold">
                    {activeTimer.ticket_reference || activeTimer.ticketReference}
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {activeTimer.description}
                  </h2>
                  <p className="text-xs text-slate-300">
                    Started today at <span className="font-semibold text-white">{formatTimeOfDay(activeTimer.start_time)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Elapsed Time</span>
                  <LiveStopwatch startTime={activeTimer.start_time} />
                </div>
                <button
                  onClick={() => handleEndActivity(activeTimer.id)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 transition-all"
                >
                  <Square size={14} className="fill-white" />
                  End Activity
                </button>
              </div>
            </div>
          )}

          {/* Next Queued Task Card (Displayed ONLY IF nextTask exists) */}
          {nextTask && (
            <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 rounded-3xl p-6 shadow-sm border border-amber-200/60 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200 uppercase tracking-wider">
                    <Clock size={12} className="text-amber-600" />
                    Next Queued Task: ⏳ Waiting to Start
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-200/60 text-amber-900 rounded-md text-xs font-mono font-bold">
                    {nextTask.ticket_reference || nextTask.ticketReference}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800">
                    {nextTask.description}
                  </h3>
                  <p className="text-xs text-amber-700/80 font-medium pt-1">
                    ⚡ Will automatically start after current task is completed and approved by manager.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isManager ? 'CRA Management' : 'My CRA'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isManager
              ? 'Review and validate employee working durations'
              : 'Track and report your daily working hours automatically'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isManager && (
            <button
              onClick={() => window.open('/manager/cra-live-monitor', '_blank')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 border border-slate-600/50"
            >
              <Activity size={16} />
              Open Live Monitor
              <ExternalLink size={14} className="opacity-60" />
            </button>
          )}
          {(isEmployee || isManager) && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <Plus size={18} />
              {isManager ? 'Assign Task' : 'Track Activity'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs (Managers Only) */}
      {isManager && (
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'activities'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            All Logs & Validation
          </button>
          <button
            onClick={() => setActiveTab('yearly-reports')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'yearly-reports'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Annual Reports
          </button>
        </div>
      )}

      {(activeTab === 'activities' || !isManager) && (
        <>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Logs"
          value={stats.total}
          icon={ClipboardList}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
          borderClass="border-t-blue-500"
        />
        <StatsCard
          title="Pending Start"
          value={stats.pending_start}
          icon={Clock}
          colorClass="text-slate-600"
          bgClass="bg-slate-50"
          borderClass="border-t-slate-500"
        />
        <StatsCard
          title="In Progress"
          value={stats.in_progress}
          icon={Play}
          colorClass="text-blue-500"
          bgClass="bg-blue-50/50"
          borderClass="border-t-blue-400"
        />
        <StatsCard
          title="Pending Approval"
          value={stats.completed || stats.pending_approval}
          icon={Timer}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
          borderClass="border-t-amber-500"
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle2}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
          borderClass="border-t-emerald-500"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isManager ? "Search by employee name or ticket reference..." : "Search by ticket reference..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {isManager && (
            <select
              value={selectedEmployeeFilterId}
              onChange={(e) => { setSelectedEmployeeFilterId(e.target.value); setPage(1); }}
              className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50 cursor-pointer"
            >
              <option value="">All Employees</option>
              {employeesList.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PENDING_START">Pending Start</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Date range filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">From:</span>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => { setStartDateFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">To:</span>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => { setEndDateFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50"
            />
          </div>

          <select
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50 cursor-pointer font-medium"
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <input
            type="number"
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
            placeholder="Year"
            min="2020"
            max="2099"
            className="w-24 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50 font-medium"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {entries.length === 0 ? (
          <EmptyState
            title="No activity records found"
            description={isManager ? "No employee activity reports found matching the filters." : "You have no logged tasks for this range."}
            icon={ClipboardList}
            action={isEmployee ? handleOpenAdd : undefined}
            actionLabel="Start New Task"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {isManager && <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Employee</th>}
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Ticket Reference</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Ticket Description</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Priority</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Start Date</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">End Date</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Hours / Days Spent</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    {isManager && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {(entry.employee_name || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{entry.employee_name}</p>
                            <p className="text-xs text-slate-400">{entry.matricule}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-mono font-bold">
                        <FileText size={12} />
                        {entry.ticket_reference}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 max-w-xs truncate" title={entry.description}>{entry.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        entry.priority === 2 ? 'bg-rose-50 text-rose-700' :
                        entry.priority === 1 ? 'bg-blue-50 text-blue-700' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {entry.priority === 2 ? 'High' : entry.priority === 1 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 flex items-center gap-1">
                        <Calendar size={14} className="text-slate-400" />
                        {entry.start_time ? formatDateTime(entry.start_time) : formatDateTime(entry.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 flex items-center gap-1">
                        <Calendar size={14} className="text-slate-400" />
                        {entry.end_time ? formatDateTime(entry.end_time) : (entry.status === 'IN_PROGRESS' ? 'Running' : '—')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
                        <Timer size={14} className="text-slate-400" />
                        {entry.status === 'IN_PROGRESS' ? (
                          <span className="text-blue-600 font-semibold animate-pulse">Running...</span>
                        ) : (
                          formatDuration(entry.duration_minutes)
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Employee controls */}
                        {isEmployee && (
                          <>
                            {entry.status === 'PENDING_START' && (
                              <button
                                onClick={() => handleStartExisting(entry.id)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Start Task"
                                disabled={!!activeTimer}
                              >
                                <Play size={16} className="fill-emerald-50" />
                              </button>
                            )}
                            {entry.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleEndActivity(entry.id)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors animate-pulse"
                                title="End Activity"
                              >
                                <Square size={16} className="fill-rose-50" />
                              </button>
                            )}
                            {entry.status === 'PENDING_START' && (
                              <button
                                onClick={() => handleOpenEdit(entry)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Details"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {['PENDING_START', 'PENDING_APPROVAL', 'COMPLETED'].includes(entry.status) && (
                              <button
                                onClick={() => setDeleteConfirm(entry.id)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
                        )}

                        {/* Manager validation controls */}
                        {isManager && (
                          <>
                            {['PENDING_APPROVAL', 'COMPLETED'].includes(entry.status) && (
                              <>
                                <button
                                  onClick={() => handleApprove(entry.id)}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Approve CRA (Will auto-start next pending task)"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(entry.id)}
                                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Reject CRA"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            {!['PENDING_APPROVAL', 'COMPLETED'].includes(entry.status) && (
                              <span className="text-xs text-slate-400 italic">No Actions</span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
      </>
      )}

      {activeTab === 'yearly-reports' && isManager && (
        <div className="space-y-6">
          {/* Report Setup Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1 relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Select Employee
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={employeeSearchQuery}
                    onChange={(e) => {
                      setEmployeeSearchQuery(e.target.value);
                      setShowEmployeeSuggestions(true);
                    }}
                    onFocus={() => setShowEmployeeSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowEmployeeSuggestions(false), 200)}
                    placeholder="Search by first name, last name, or ID..."
                    className="w-full h-10 pl-9 pr-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50"
                  />
                  <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                </div>

                {showEmployeeSuggestions && employeeSearchQuery && (
                  <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200/60 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {employeesList.filter(emp => {
                      const q = employeeSearchQuery.toLowerCase();
                      const first = (emp.first_name || '').toLowerCase();
                      const last = (emp.last_name || '').toLowerCase();
                      const full = `${first} ${last}`;
                      const reversed = `${last} ${first}`;
                      const matr = (emp.matricule || '').toLowerCase();
                      return first.includes(q) || last.includes(q) || full.includes(q) || reversed.includes(q) || matr.includes(q);
                    }).length === 0 ? (
                      <div className="p-3 text-sm text-slate-400 text-center">
                        No employee found
                      </div>
                    ) : (
                      employeesList.filter(emp => {
                        const q = employeeSearchQuery.toLowerCase();
                        const first = (emp.first_name || '').toLowerCase();
                        const last = (emp.last_name || '').toLowerCase();
                        const full = `${first} ${last}`;
                        const reversed = `${last} ${first}`;
                        const matr = (emp.matricule || '').toLowerCase();
                        return first.includes(q) || last.includes(q) || full.includes(q) || reversed.includes(q) || matr.includes(q);
                      }).map(emp => (
                        <div
                          key={emp.id}
                          onClick={() => {
                            setSelectedEmployeeId(emp.id.toString());
                            setEmployeeSearchQuery(`${emp.first_name} ${emp.last_name}`);
                            setShowEmployeeSuggestions(false);
                          }}
                          className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <span className="font-semibold">
                            {emp.first_name} {emp.last_name}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {emp.matricule ? `#${emp.matricule}` : ''}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="w-full md:w-36">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Select Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50 cursor-pointer"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={handleGenerateReport}
                  disabled={loadingReport}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {loadingReport ? 'Generating...' : 'Generate Report'}
                </button>

                {reportData && (
                  <>
                    <button
                      onClick={handleExportExcel}
                      disabled={exportingExcel}
                      className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl border border-emerald-200 transition-colors disabled:opacity-50"
                      title="Export to Excel"
                    >
                      <FileSpreadsheet size={16} />
                      Excel
                    </button>

                    <button
                      onClick={handleExportPdf}
                      disabled={exportingPdf}
                      className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-semibold rounded-xl border border-rose-200 transition-colors disabled:opacity-50"
                      title="Export to PDF"
                    >
                      <FileText size={16} />
                      PDF
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {loadingReport && (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/60 rounded-2xl">
              <LoadingSpinner size="lg" text="Aggregating stats and compiling yearly report..." />
            </div>
          )}

          {reportData && !loadingReport && (
            <div className="space-y-6">
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatsCard
                  title="Completed Tasks"
                  value={`${reportData.summary.totalTasks} Tasks`}
                  icon={Award}
                  colorClass="text-blue-600"
                  bgClass="bg-blue-50"
                  borderClass="border-t-blue-500"
                />
                <StatsCard
                  title="Working Hours"
                  value={`${reportData.summary.totalHours} hrs`}
                  icon={Clock}
                  colorClass="text-indigo-600"
                  bgClass="bg-indigo-50"
                  borderClass="border-t-indigo-500"
                />
                <StatsCard
                  title="High Priority"
                  value={reportData.summary.priorityCounts.High}
                  icon={TrendingUp}
                  colorClass="text-rose-600"
                  bgClass="bg-rose-50"
                  borderClass="border-t-rose-500"
                />
                <StatsCard
                  title="Medium Priority"
                  value={reportData.summary.priorityCounts.Medium}
                  icon={CheckCircle2}
                  colorClass="text-amber-600"
                  bgClass="bg-amber-50"
                  borderClass="border-t-amber-500"
                />
                <StatsCard
                  title="Low Priority"
                  value={reportData.summary.priorityCounts.Low}
                  icon={Calendar}
                  colorClass="text-slate-600"
                  bgClass="bg-slate-50"
                  borderClass="border-t-slate-500"
                />
              </div>

              {/* Chart & Summary Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                      Employee Summary
                    </h3>
                    <div className="mt-4 space-y-3">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</span>
                        <span className="text-sm font-bold text-slate-700">{reportData.employee.fullName}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee ID</span>
                        <span className="text-sm font-semibold text-slate-700 font-mono">{reportData.employee.matricule}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                        <span className="text-sm font-semibold text-slate-700">{reportData.employee.email}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
                          <span className="text-sm font-semibold text-slate-700">{reportData.employee.department}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Position</span>
                          <span className="text-sm font-semibold text-slate-700">{reportData.employee.position}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Generated: {reportData.generationDate}</span>
                    <span>Year: {reportData.year}</span>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                  <h3 className="text-base font-bold text-slate-800 mb-4">
                    Monthly Activity Distribution
                  </h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(reportData.summary.monthlyCounts).map(([month, count]) => ({
                          month: month.substring(0, 3),
                          tasks: count
                        }))}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                        <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
                          {Object.entries(reportData.summary.monthlyCounts).map((_, index) => (
                            <Cell key={`cell-${index}`} fill="#3b82f6" fillOpacity={0.85} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-800">
                    Approved Task List
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-left border-b border-slate-100">
                        <th className="text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3.5">Ticket</th>
                        <th className="text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3.5">Description</th>
                        <th className="text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3.5">Priority</th>
                        <th className="text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3.5">Duration</th>
                        <th className="text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3.5">Completed Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.tasks.map(task => (
                        <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-mono font-bold">
                              {task.ticketReference}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 max-w-sm truncate" title={task.description}>
                            {task.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              task.priority === 'High' ? 'bg-rose-50 text-rose-700' :
                              task.priority === 'Low' ? 'bg-slate-100 text-slate-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                            {task.durationHours} hrs
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                            {task.endTime ? new Date(task.endTime).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Task" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Are you sure you want to delete this activity log? This cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirm)}
              className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Task Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEntry ? 'Edit Task Info' : isManager ? 'Assign Task to Employee' : 'Start / Schedule Task'} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {isManager && !editingEntry && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Employee *</label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50 cursor-pointer"
                required
              >
                <option value="">-- Choose Employee --</option>
                {employeesList.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.matricule})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ticket Reference *</label>
            <input
              type="text"
              value={formData.ticketReference}
              onChange={(e) => setFormData(prev => ({ ...prev, ticketReference: e.target.value }))}
              placeholder="Ex: JIRA-245 or FIL-123"
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ticket Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Explain the objectives or tickets solved..."
              rows={3}
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50 resize-none font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration Type *</label>
              <select
                value={formData.durationType}
                onChange={(e) => setFormData(prev => ({ ...prev, durationType: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50 cursor-pointer font-medium"
                required
              >
                <option value="Hours">Hours</option>
                <option value="Days">Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Number of {formData.durationType} *
              </label>
              <input
                type="number"
                value={formData.durationValue}
                onChange={(e) => setFormData(prev => ({ ...prev, durationValue: e.target.value }))}
                placeholder="Min: 0.5"
                min="0.5"
                step="any"
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50 font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50 cursor-pointer font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50 cursor-pointer font-medium"
              />
            </div>
          </div>

          {!editingEntry && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50/50 cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>

            {editingEntry ? (
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
              >
                Save Details
              </button>
            ) : isManager ? (
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
              >
                Assign Task
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  onClick={() => setStartImmediate(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all"
                >
                  Create Pending
                </button>
                <button
                  type="submit"
                  onClick={() => setStartImmediate(true)}
                  disabled={submitting || !!activeTimer}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={14} className="fill-white" />
                  Start Timer Now
                </button>
              </>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CRA;
