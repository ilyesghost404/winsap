import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getSocket } from '../../../services/socket';
import {
  getMyActivities,
  getAllActivities,
  getCraStats,
  getMonthlyStats,
  startExistingActivity,
  endActivity,
  createCraEntry,
  startActivity,
  deleteCraEntry,
  approveCraEntry,
  rejectCraEntry,
  getLiveCraData
} from '../../../services/craService';
import toast from 'react-hot-toast';

const useCRAData = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  const employeeId = user?.employee_id;

  // Tasks by status
  const [queueTasks, setQueueTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // Manager: all employees

  // Stats
  const [stats, setStats] = useState({
    total: 0, pending_start: 0, in_progress: 0, completed: 0, approved: 0, rejected: 0
  });
  const [monthlyStats, setMonthlyStats] = useState({
    total_hours_month: 0, total_days_month: 0, completed_this_week: 0, avg_duration_minutes: 0
  });

  // Active timer (employee)
  const [activeTimer, setActiveTimer] = useState(null);

  // Live data (manager)
  const [liveData, setLiveData] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Pagination
  const [pagination, setPagination] = useState({
    queue: { page: 1, totalPages: 1, total: 0 },
    inProgress: { page: 1, totalPages: 1, total: 0 },
    completed: { page: 1, totalPages: 1, total: 0 },
    all: { page: 1, totalPages: 1, total: 0 }
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    status: '',
    startDate: '',
    endDate: '',
    employeeId: ''
  });

  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Fetch employee tasks by status
  const fetchEmployeeTasks = useCallback(async () => {
    if (!employeeId && !isManager) return;

    try {
      const fetcher = isManager ? getAllActivities : getMyActivities;

      const [queueRes, progressRes, completedRes] = await Promise.all([
        fetcher({ status: 'PENDING_START', limit: 50, search: filters.search }),
        fetcher({ status: 'IN_PROGRESS', limit: 50, search: filters.search }),
        fetcher({
          status: filters.status && ['COMPLETED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].includes(filters.status)
            ? filters.status
            : 'COMPLETED',
          limit: 20,
          page: pagination.completed.page,
          search: filters.search,
          startDate: filters.startDate,
          endDate: filters.endDate,
          ...(isManager && filters.employeeId ? { employeeId: filters.employeeId } : {})
        })
      ]);

      setQueueTasks(queueRes.data || []);
      setInProgressTasks(progressRes.data || []);
      setCompletedTasks(completedRes.data || []);

      // Set active timer from in-progress tasks
      const active = (progressRes.data || []).find(t =>
        !isManager ? true : t.employee_id === employeeId
      );
      setActiveTimer(active || null);

      setPagination(prev => ({
        ...prev,
        queue: { page: 1, totalPages: queueRes.totalPages || 1, total: queueRes.total || 0 },
        inProgress: { page: 1, totalPages: progressRes.totalPages || 1, total: progressRes.total || 0 },
        completed: {
          page: completedRes.page || 1,
          totalPages: completedRes.totalPages || 1,
          total: completedRes.total || 0
        }
      }));
    } catch (error) {
      console.error('Error fetching CRA tasks:', error);
    }
  }, [employeeId, isManager, filters, pagination.completed.page]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const [statsData, monthlyData] = await Promise.all([
        getCraStats(),
        getMonthlyStats()
      ]);
      setStats(statsData || {});
      setMonthlyStats(monthlyData || {});
    } catch (error) {
      console.error('Error fetching CRA stats:', error);
    }
  }, []);

  // Fetch live data (manager only)
  const fetchLiveData = useCallback(async () => {
    if (!isManager) return;
    try {
      const result = await getLiveCraData();
      setLiveData(result.data || []);
    } catch (error) {
      console.error('Error fetching live CRA data:', error);
    }
  }, [isManager]);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchEmployeeTasks(), fetchStats(), fetchLiveData()]);
      setLoading(false);
    };
    loadAll();
  }, [refreshKey]);

  // Re-fetch when filters change (debounced by refreshKey effect)
  useEffect(() => {
    if (!loading) {
      fetchEmployeeTasks();
    }
  }, [filters.search, filters.status, filters.startDate, filters.endDate, filters.employeeId, pagination.completed.page]);

  // Socket.IO real-time updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleCraUpdate = () => {
      refreshData();
    };

    socket.on('cra_started', handleCraUpdate);
    socket.on('cra_finished', handleCraUpdate);
    socket.on('cra_created', handleCraUpdate);
    socket.on('cra_approved', handleCraUpdate);
    socket.on('cra_rejected', handleCraUpdate);

    return () => {
      socket.off('cra_started', handleCraUpdate);
      socket.off('cra_finished', handleCraUpdate);
      socket.off('cra_created', handleCraUpdate);
      socket.off('cra_approved', handleCraUpdate);
      socket.off('cra_rejected', handleCraUpdate);
    };
  }, [refreshData]);

  // Actions
  const handleStartTask = useCallback(async (taskId) => {
    try {
      await startExistingActivity(taskId);
      toast.success('Task started! Timer is running.');
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start task');
    }
  }, [refreshData]);

  const handleFinishTask = useCallback(async (taskId) => {
    try {
      await endActivity(taskId);
      toast.success('Task completed!');
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to finish task');
    }
  }, [refreshData]);

  const handleCreateTask = useCallback(async (data) => {
    try {
      if (data.start_immediately) {
        await startActivity(data);
        toast.success('Task created and started!');
      } else {
        await createCraEntry(data);
        toast.success('Task added to queue!');
      }
      refreshData();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
      return false;
    }
  }, [refreshData]);

  const handleDeleteTask = useCallback(async (taskId) => {
    try {
      await deleteCraEntry(taskId);
      toast.success('Task deleted');
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  }, [refreshData]);

  const handleApproveTask = useCallback(async (taskId) => {
    try {
      await approveCraEntry(taskId);
      toast.success('Task approved');
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve task');
    }
  }, [refreshData]);

  const handleRejectTask = useCallback(async (taskId) => {
    try {
      await rejectCraEntry(taskId);
      toast.success('Task rejected');
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject task');
    }
  }, [refreshData]);

  const setCompletedPage = useCallback((page) => {
    setPagination(prev => ({
      ...prev,
      completed: { ...prev.completed, page }
    }));
  }, []);

  return {
    // Data
    queueTasks,
    inProgressTasks,
    completedTasks,
    allTasks,
    activeTimer,
    liveData,
    stats,
    monthlyStats,

    // State
    loading,
    pagination,
    filters,
    setFilters,
    setCompletedPage,

    // Actions
    handleStartTask,
    handleFinishTask,
    handleCreateTask,
    handleDeleteTask,
    handleApproveTask,
    handleRejectTask,
    refreshData,

    // Auth
    isManager,
    user
  };
};

export default useCRAData;
