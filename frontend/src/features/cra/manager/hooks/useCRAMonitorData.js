import { useState, useEffect, useCallback } from 'react';
import { getSocket } from '../../../../services/socket';
import {
  getAllActivities,
  getLiveCraData,
  getControlCenterData,
  getEmployeeMonitorSummary
} from '../../../../services/craService';
import toast from 'react-hot-toast';

/**
 * Custom hook for the Manager Control Center (Monitoring Only).
 * Automates real-time Socket.IO feed updates and data polling.
 */
const useCRAMonitorData = () => {
  const [stats, setStats] = useState({
    employees_working_now: 0,
    tasks_in_queue: 0,
    tasks_in_progress: 0,
    tasks_completed_today: 0,
    tasks_completed_this_week: 0,
    total_hours_today: 0,
    avg_duration_minutes: 0,
    team_productivity: 0
  });

  const [liveActivities, setLiveActivities] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [queueTasks, setQueueTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  // Selected Employee Profile for slide-over modal
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // General loading & refresh key
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters for completed tasks
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    employeeId: ''
  });

  const [completedPagination, setCompletedPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Fetch all control center data
  const fetchData = useCallback(async () => {
    try {
      const [ccData, liveData, queueRes, inProgressRes, completedRes] = await Promise.all([
        getControlCenterData(),
        getLiveCraData(),
        getAllActivities({ status: 'PENDING_START', limit: 100 }),
        getAllActivities({ status: 'IN_PROGRESS', limit: 100 }),
        getAllActivities({
          status: 'COMPLETED',
          limit: 20,
          page: completedPagination.page,
          search: filters.search,
          startDate: filters.startDate,
          endDate: filters.endDate,
          ...(filters.employeeId ? { employeeId: filters.employeeId } : {})
        })
      ]);

      if (ccData) {
        setStats(ccData.stats || {});
        setActivityFeed(ccData.feed || []);
      }

      setLiveActivities(liveData.data || []);
      setQueueTasks(queueRes.data || []);
      setInProgressTasks(inProgressRes.data || []);
      setCompletedTasks(completedRes.data || []);

      setCompletedPagination(prev => ({
        ...prev,
        page: completedRes.page || 1,
        totalPages: completedRes.totalPages || 1,
        total: completedRes.total || 0
      }));
    } catch (error) {
      console.error('Error fetching manager control center data:', error);
    }
  }, [completedPagination.page, filters]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    load();
  }, [refreshKey]);

  // Re-fetch completed when filters change
  useEffect(() => {
    if (!loading) {
      fetchData();
    }
  }, [filters.search, filters.startDate, filters.endDate, filters.employeeId, completedPagination.page]);

  // Socket.IO real-time event listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleRealtimeUpdate = (data) => {
      refreshData();
    };

    socket.on('cra_started', handleRealtimeUpdate);
    socket.on('cra_finished', handleRealtimeUpdate);
    socket.on('cra_created', handleRealtimeUpdate);
    socket.on('cra_approved', handleRealtimeUpdate);
    socket.on('cra_rejected', handleRealtimeUpdate);

    return () => {
      socket.off('cra_started', handleRealtimeUpdate);
      socket.off('cra_finished', handleRealtimeUpdate);
      socket.off('cra_created', handleRealtimeUpdate);
      socket.off('cra_approved', handleRealtimeUpdate);
      socket.off('cra_rejected', handleRealtimeUpdate);
    };
  }, [refreshData]);

  // Auto-refresh interval (polling fallback every 15s)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchData();
    }, 15000);
    return () => clearInterval(timer);
  }, [fetchData]);

  // Open Employee Monitor Detail profile modal
  const openEmployeeProfile = useCallback(async (employeeId) => {
    if (!employeeId) return;
    setLoadingProfile(true);
    setProfileModalOpen(true);
    try {
      const summary = await getEmployeeMonitorSummary(employeeId);
      setSelectedEmployeeProfile(summary);
    } catch (error) {
      toast.error('Failed to load employee monitoring profile');
      setProfileModalOpen(false);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const closeEmployeeProfile = useCallback(() => {
    setProfileModalOpen(false);
    setSelectedEmployeeProfile(null);
  }, []);

  const setCompletedPage = useCallback((page) => {
    setCompletedPagination(prev => ({ ...prev, page }));
  }, []);

  return {
    stats,
    liveActivities,
    activityFeed,
    queueTasks,
    inProgressTasks,
    completedTasks,
    loading,
    completedPagination,
    setCompletedPage,
    filters,
    setFilters,
    refreshData,
    // Employee profile modal
    selectedEmployeeProfile,
    loadingProfile,
    profileModalOpen,
    openEmployeeProfile,
    closeEmployeeProfile
  };
};

export default useCRAMonitorData;
