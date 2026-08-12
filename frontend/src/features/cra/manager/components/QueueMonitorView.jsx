import { ListTodo, Hash, Calendar, Clock, Inbox } from 'lucide-react';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../../../components/StatusBadge';
import EmptyState from '../../../../components/EmptyState';

/**
 * QueueMonitorView component — pure read-only monitoring table of queued tasks across all employees.
 */
const QueueMonitorView = ({ queueTasks = [], loading = false, onSelectEmployee }) => {
  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo size={18} className="text-amber-600" />
          <h3 className="text-base font-heading font-bold text-[#1c2b33]">
            Queue Monitor <span className="text-xs text-[#5f7380] font-semibold">({queueTasks.length} queued)</span>
          </h3>
        </div>
        <span className="text-xs text-[#5f7380] font-semibold bg-[#f1f5f8] px-3 py-1 rounded-full border border-[#dde5ec]">
          Read-Only Mode
        </span>
      </div>

      {queueTasks.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Queue is empty"
          description="There are currently no tasks waiting in queue across all employee accounts."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#dde5ec] overflow-hidden shadow-premium-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-[#1c2b33]">
              <thead className="bg-[#f1f5f8] border-b border-[#dde5ec] text-[#5f7380] font-heading font-extrabold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Ticket Ref</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Waiting Since</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dde5ec]">
                {queueTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => onSelectEmployee && onSelectEmployee(task.employee_id)}
                    className="hover:bg-[#f1f5f8]/60 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 font-bold text-[#1c2b33]">
                      {task.employee_name || `Employee #${task.employee_id}`}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-[#0064e0]">
                      #{task.ticket_reference || '—'}
                    </td>
                    <td className="px-5 py-4 font-medium max-w-sm truncate">
                      {task.description}
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-5 py-4 font-medium text-[#5f7380]">
                      {formatDate(task.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <StatusBadge status="PENDING_START" type="dot" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueMonitorView;
