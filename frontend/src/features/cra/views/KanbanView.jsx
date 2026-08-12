import { ListTodo, Play, CheckCircle2 } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import EmptyState from '../../../components/EmptyState';

/**
 * 3-Column Kanban Board view (Queue → In Progress → Completed).
 */
const KanbanView = ({
  queueTasks = [],
  inProgressTasks = [],
  completedTasks = [],
  onStart,
  onFinish,
  onViewDetails,
  onDelete,
  onApprove,
  onReject,
  isManager = false
}) => {
  const columns = [
    {
      id: 'queue',
      title: 'In Queue',
      icon: ListTodo,
      color: 'border-amber-400 bg-amber-500/10 text-amber-700',
      tasks: queueTasks,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      icon: Play,
      color: 'border-blue-400 bg-blue-500/10 text-blue-700',
      tasks: inProgressTasks,
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'completed',
      title: 'Completed',
      icon: CheckCircle2,
      color: 'border-emerald-400 bg-emerald-500/10 text-emerald-700',
      tasks: completedTasks,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      {columns.map((col) => {
        const Icon = col.icon;
        return (
          <div
            key={col.id}
            className="bg-[#f1f5f8] rounded-2xl p-4 border border-[#dde5ec] flex flex-col min-h-[500px]"
          >
            {/* Column header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#dde5ec]">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${col.color}`}>
                  <Icon size={16} />
                </div>
                <h4 className="text-sm font-heading font-bold text-[#1c2b33]">{col.title}</h4>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badgeColor}`}>
                {col.tasks.length}
              </span>
            </div>

            {/* Cards container */}
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
              {col.tasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-[#dde5ec] rounded-xl text-xs text-[#5f7380] font-medium">
                  No tasks
                </div>
              ) : (
                col.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStart={col.id === 'queue' ? onStart : undefined}
                    onFinish={col.id === 'in_progress' ? onFinish : undefined}
                    onViewDetails={onViewDetails}
                    onDelete={col.id === 'queue' ? onDelete : undefined}
                    onApprove={col.id === 'completed' ? onApprove : undefined}
                    onReject={col.id === 'completed' ? onReject : undefined}
                    isManager={isManager}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanView;
