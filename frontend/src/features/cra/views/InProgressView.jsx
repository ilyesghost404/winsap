import { Play, Flame } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';

/**
 * "In Progress" view — displays tasks currently active with running timers (IN_PROGRESS).
 * Actions: View Details, Finish Task.
 */
const InProgressView = ({
  tasks = [],
  loading = false,
  onFinish,
  onViewDetails,
  isManager = false
}) => {
  if (loading) {
    return <LoadingSpinner text="Loading in-progress tasks..." />;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        icon={Flame}
        title="No active tasks"
        description="You have no tasks currently in progress. Start a task from your Queue to begin tracking time."
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play size={18} className="text-[#0064e0]" />
          <h3 className="text-base font-heading font-bold text-[#1c2b33]">
            Tasks In Progress <span className="text-xs text-[#5f7380] font-semibold">({tasks.length})</span>
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onFinish={onFinish}
            onViewDetails={onViewDetails}
            isManager={isManager}
          />
        ))}
      </div>
    </div>
  );
};

export default InProgressView;
