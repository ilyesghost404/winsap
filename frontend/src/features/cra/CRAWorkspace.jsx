import { useState } from 'react';
import {
  ListTodo,
  Play,
  CheckCircle2,
  LayoutGrid,
  Plus,
  RefreshCw
} from 'lucide-react';
import useCRAData from './hooks/useCRAData';
import CRAStatsBar from './components/CRAStatsBar';
import CRAHeroBanner from './components/CRAHeroBanner';
import TaskFilters from './components/TaskFilters';
import CreateTaskModal from './components/CreateTaskModal';
import TaskDetailPanel from './components/TaskDetailPanel';
import QueueView from './views/QueueView';
import InProgressView from './views/InProgressView';
import CompletedView from './views/CompletedView';
import KanbanView from './views/KanbanView';
import ManagerControlCenter from './manager/ManagerControlCenter';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const CRAWorkspace = () => {
  const {
    queueTasks,
    inProgressTasks,
    completedTasks,
    activeTimer,
    stats,
    monthlyStats,
    loading,
    pagination,
    filters,
    setFilters,
    setCompletedPage,
    handleStartTask,
    handleFinishTask,
    handleCreateTask,
    handleDeleteTask,
    handleApproveTask,
    handleRejectTask,
    refreshData,
    isManager,
    user
  } = useCRAData();

  // If user is a Manager, render the pure read-only Control Room Dashboard
  if (isManager) {
    return <ManagerControlCenter />;
  }

  // Active tab: 'queue' | 'in_progress' | 'completed' | 'kanban' | 'live_monitor' | 'queue_mgmt' | 'reports'
  const [activeTab, setActiveTab] = useState('queue');

  // Modals & Panels
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  const handleOpenDetail = (task) => {
    setSelectedTask(task);
    setDetailPanelOpen(true);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
    setDetailPanelOpen(false);
  };

  // Tabs for employees
  const tabs = [
    { id: 'queue', label: 'In Queue', count: stats?.pending_start || queueTasks.length, icon: ListTodo },
    { id: 'in_progress', label: 'In Progress', count: stats?.in_progress || inProgressTasks.length, icon: Play },
    { id: 'completed', label: 'Completed', count: stats?.completed || pagination?.completed?.total || 0, icon: CheckCircle2 },
    { id: 'kanban', label: 'Board View', icon: LayoutGrid }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-[#1c2b33] tracking-tight">
            Compte Rendu d'Activité (CRA)
          </h1>
          <p className="text-xs text-[#5f7380] font-semibold mt-1">
            {isManager
              ? 'Manage team activities, assign tasks, monitor live work, and approve reports'
              : 'Track your daily tasks, manage queued work, and monitor your working hours'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            title="Refresh workspace"
          >
            Refresh
          </Button>

          {isManager && (
            <Button
              variant="secondary"
              size="sm"
              icon={UserPlus}
              onClick={() => setAssignModalOpen(true)}
            >
              Assign Task
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Hero Banner for Active Task Timer */}
      {activeTimer && (
        <CRAHeroBanner
          activeTask={activeTimer}
          onFinish={handleFinishTask}
        />
      )}

      {/* Summary Stats Row */}
      <CRAStatsBar
        stats={stats}
        monthlyStats={monthlyStats}
        isManager={isManager}
      />

      {/* Filters Bar */}
      <TaskFilters
        filters={filters}
        onFiltersChange={setFilters}
        isManager={isManager}
      />

      {/* Main Workspace Navigation Tabs */}
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

      {/* Main Tab Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <LoadingSpinner text="Loading CRA workspace..." />
        ) : (
          <>
            {activeTab === 'queue' && (
              <QueueView
                tasks={queueTasks}
                loading={loading}
                onStart={handleStartTask}
                onViewDetails={handleOpenDetail}
                onDelete={handleDeleteTask}
                isManager={isManager}
              />
            )}

            {activeTab === 'in_progress' && (
              <InProgressView
                tasks={inProgressTasks}
                loading={loading}
                onFinish={handleFinishTask}
                onViewDetails={handleOpenDetail}
                isManager={isManager}
              />
            )}

            {activeTab === 'completed' && (
              <CompletedView
                tasks={completedTasks}
                loading={loading}
                pagination={pagination.completed}
                onPageChange={setCompletedPage}
                onViewDetails={handleOpenDetail}
                onApprove={handleApproveTask}
                onReject={handleRejectTask}
                onDelete={handleDeleteTask}
                isManager={isManager}
              />
            )}

            {activeTab === 'kanban' && (
              <KanbanView
                queueTasks={queueTasks}
                inProgressTasks={inProgressTasks}
                completedTasks={completedTasks}
                onStart={handleStartTask}
                onFinish={handleFinishTask}
                onViewDetails={handleOpenDetail}
                onDelete={handleDeleteTask}
                onApprove={handleApproveTask}
                onReject={handleRejectTask}
                isManager={isManager}
              />
            )}

            {activeTab === 'live_monitor' && isManager && (
              <LiveMonitorPanel
                liveData={liveData}
                loading={loading}
                onRefresh={refreshData}
              />
            )}

            {activeTab === 'queue_mgmt' && isManager && (
              <QueueManagement
                queueTasks={queueTasks}
                loading={loading}
                onAssignTaskClick={() => setAssignModalOpen(true)}
                onViewDetails={handleOpenDetail}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {activeTab === 'reports' && isManager && (
              <ReportsPanel
                stats={stats}
                monthlyStats={monthlyStats}
              />
            )}
          </>
        )}
      </div>

      {/* Modals & Panels */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateTask}
        isManager={isManager}
      />

      {isManager && (
        <TaskAssignModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onAssign={handleCreateTask}
        />
      )}

      <TaskDetailPanel
        task={selectedTask}
        isOpen={detailPanelOpen}
        onClose={handleCloseDetail}
        onStart={handleStartTask}
        onFinish={handleFinishTask}
        onDelete={handleDeleteTask}
        onApprove={handleApproveTask}
        onReject={handleRejectTask}
        isManager={isManager}
      />
    </div>
  );
};

export default CRAWorkspace;
