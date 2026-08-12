import { useState } from 'react';
import {
  Radio,
  ListTodo,
  Play,
  CheckCircle2,
  BarChart3,
  Activity,
  Download,
  RefreshCw,
  Eye,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import useCRAMonitorData from './hooks/useCRAMonitorData';
import LiveActivityMonitor from './components/LiveActivityMonitor';
import QueueMonitorView from './components/QueueMonitorView';
import InProgressMonitorView from './components/InProgressMonitorView';
import CompletedMonitorView from './components/CompletedMonitorView';
import AnalyticsSection from './components/AnalyticsSection';
import RealTimeActivityFeed from './components/RealTimeActivityFeed';
import EmployeeMonitorModal from './components/EmployeeMonitorModal';
import ReportsGeneratorModal from './components/ReportsGeneratorModal';
import Button from '../../../components/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';

/**
 * ManagerControlCenter — Monitoring Console for Managers.
 * Pure Read-Only workspace focused entirely on monitoring tables, live activity feeds, and detailed task data without summary cards.
 */
const ManagerControlCenter = () => {
  const {
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
    selectedEmployeeProfile,
    loadingProfile,
    profileModalOpen,
    openEmployeeProfile,
    closeEmployeeProfile
  } = useCRAMonitorData();

  // Active view tab: 'live' | 'queue' | 'in_progress' | 'completed' | 'analytics' | 'feed'
  const [activeTab, setActiveTab] = useState('live');
  const [reportsModalOpen, setReportsModalOpen] = useState(false);

  const tabs = [
    { id: 'live', label: 'Live Task Monitor', count: liveActivities.length, icon: Radio, badgeColor: 'bg-emerald-500 text-white animate-pulse' },
    { id: 'in_progress', label: 'In Progress Tasks', count: inProgressTasks.length, icon: Play },
    { id: 'queue', label: 'Queue Monitor', count: queueTasks.length, icon: ListTodo },
    { id: 'completed', label: 'Completed Tasks', count: completedPagination.total, icon: CheckCircle2 },
    { id: 'feed', label: 'Real-Time Activity Feed', count: activityFeed.length, icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const handleOpenLiveMonitorTab = () => {
    window.open('/manager/cra-live-monitor', '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Control Room Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-6 border border-[#dde5ec] shadow-premium-card">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1c2b33] text-white shadow-electric-glow">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Operations Control Room
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5f7380] bg-[#f1f5f8] px-2.5 py-0.5 rounded-lg border border-[#dde5ec]">
              <ShieldCheck size={12} className="text-[#0064e0]" />
              Read-Only Monitoring Console
            </span>
          </div>

          <h1 className="text-2xl font-heading font-black text-[#1c2b33] tracking-tight mt-2">
            CRA Activity & Telemetry Monitor
          </h1>
          <p className="text-xs text-[#5f7380] font-semibold mt-1">
            Real-time control room observation of active employee timers, queued work, and activity event feeds.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            variant="primary"
            size="sm"
            icon={ExternalLink}
            onClick={handleOpenLiveMonitorTab}
            title="Open dedicated Live Monitor in a new browser tab"
          >
            Open Live Monitor
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            title="Refresh monitoring data"
          >
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => setReportsModalOpen(true)}
          >
            Reports & Exports
          </Button>
        </div>
      </div>

      {/* Control Center Navigation Tabs */}
      <div className="border-b border-[#dde5ec]">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto custom-scrollbar pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap
                  ${isActive
                    ? 'border-[#0064e0] text-[#0064e0] bg-[#e7f0fa]/50 rounded-t-xl'
                    : 'border-transparent text-[#5f7380] hover:text-[#1c2b33] hover:border-[#dde5ec]'
                  }
                `}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      tab.badgeColor || (isActive ? 'bg-[#0064e0] text-white' : 'bg-[#dde5ec] text-[#5f7380]')
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab View Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <LoadingSpinner text="Fetching control room telemetry..." />
        ) : (
          <>
            {activeTab === 'live' && (
              <LiveActivityMonitor
                liveActivities={liveActivities}
                loading={loading}
                onSelectEmployee={openEmployeeProfile}
              />
            )}

            {activeTab === 'queue' && (
              <QueueMonitorView
                queueTasks={queueTasks}
                loading={loading}
                onSelectEmployee={openEmployeeProfile}
              />
            )}

            {activeTab === 'in_progress' && (
              <InProgressMonitorView
                inProgressTasks={inProgressTasks}
                loading={loading}
                onSelectEmployee={openEmployeeProfile}
              />
            )}

            {activeTab === 'completed' && (
              <CompletedMonitorView
                completedTasks={completedTasks}
                loading={loading}
                pagination={completedPagination}
                onPageChange={setCompletedPage}
                filters={filters}
                onFiltersChange={setFilters}
                onOpenReports={() => setReportsModalOpen(true)}
                onSelectEmployee={openEmployeeProfile}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsSection
                stats={stats}
                liveActivities={liveActivities}
                completedTasks={completedTasks}
              />
            )}

            {activeTab === 'feed' && (
              <RealTimeActivityFeed
                feed={activityFeed}
              />
            )}
          </>
        )}
      </div>

      {/* Read-Only Employee Profile Slide-Over Modal */}
      <EmployeeMonitorModal
        isOpen={profileModalOpen}
        onClose={closeEmployeeProfile}
        profileData={selectedEmployeeProfile}
        loading={loadingProfile}
      />

      {/* Reports Export Generator Modal */}
      <ReportsGeneratorModal
        isOpen={reportsModalOpen}
        onClose={() => setReportsModalOpen(false)}
      />
    </div>
  );
};

export default ManagerControlCenter;
