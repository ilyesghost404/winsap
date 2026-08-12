import { ListTodo, Inbox } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';

/**
 * "In Queue" view — displays tasks assigned by managers or created by employee waiting to start (PENDING_START).
 * Employees cannot edit queued tasks directly.
 * Available actions: View Details, Start Task.
 */
const QueueView = ({
  tasks = [],
  loading = false,
  onStart,
  onViewDetails,
  onDelete,
  isManager = false
}) => {
  if (loading) {
    return <LoadingSpinner text="Loading task queue..." />;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Queue is empty"
        description="There are no tasks waiting in queue. Tasks assigned by managers or created for later will appear here."
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo size={18} className="text-[#0064e0]" />
          <h3 className="text-base font-heading font-bold text-[#1c2b33]">
            Tasks In Queue <span className="text-xs text-[#5f7380] font-semibold">({tasks.length})</span>
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStart={onStart}
            onViewDetails={onViewDetails}
            onDelete={onDelete}
            isManager={isManager}
          />
        ))}
      </div>
    </div>
  );
};

export default QueueView;
