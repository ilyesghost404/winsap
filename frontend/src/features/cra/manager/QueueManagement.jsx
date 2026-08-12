import { ListTodo, UserPlus, Trash2 } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';

/**
 * QueueManagement component — allows managers to view, assign, and manage all employee queues.
 */
const QueueManagement = ({
  queueTasks = [],
  loading = false,
  onAssignTaskClick,
  onViewDetails,
  onDeleteTask
}) => {
  if (loading) {
    return <LoadingSpinner text="Loading task queues..." />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-heading font-bold text-[#1c2b33]">Employee Task Queues</h3>
          <p className="text-xs text-[#5f7380]">Overview of tasks assigned across all team members ({queueTasks.length} queued)</p>
        </div>
      </div>

      {queueTasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No queued tasks"
          description="There are currently no tasks waiting in any employee queue."
          action={onAssignTaskClick}
          actionLabel="Assign Task"
          actionIcon={UserPlus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {queueTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onViewDetails={onViewDetails}
              onDelete={onDeleteTask}
              isManager={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QueueManagement;
