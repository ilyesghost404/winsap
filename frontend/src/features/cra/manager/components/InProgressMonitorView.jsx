import { Play, Timer, Flame } from 'lucide-react';
import LiveTimer, { DurationDisplay } from '../../components/LiveTimer';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../../../components/StatusBadge';
import EmptyState from '../../../../components/EmptyState';

/**
 * InProgressMonitorView component — read-only monitoring table of running tasks.
 */
const InProgressMonitorView = ({ inProgressTasks = [], loading = false, onSelectEmployee }) => {
  const formatTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play size={18} className="text-[#0064e0]" />
          <h3 className="text-base font-heading font-bold text-[#1c2b33]">
            In Progress Monitor <span className="text-xs text-[#5f7380] font-semibold">({inProgressTasks.length} running)</span>
          </h3>
        </div>
        <span className="text-xs text-[#5f7380] font-semibold bg-[#f1f5f8] px-3 py-1 rounded-full border border-[#dde5ec]">
          Read-Only Mode
        </span>
      </div>

      {inProgressTasks.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="No running tasks"
          description="There are currently no tasks in progress across all employee accounts."
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
                  <th className="px-5 py-3.5">Started At</th>
                  <th className="px-5 py-3.5">Live Timer</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dde5ec]">
                {inProgressTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => onSelectEmployee && onSelectEmployee(task.employee_id)}
                    className="hover:bg-[#e7f0fa]/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 font-bold text-[#1c2b33]">
                      {task.employee_name || `Employee #${task.employee_id}`}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-[#0064e0]">
                      #{task.ticket_reference || '—'}
                    </td>
                    <td className="px-5 py-4 font-medium max-w-xs truncate">
                      {task.description}
                    </td>
                    <td className="px-5 py-4 font-mono text-[#5f7380]">
                      {formatTime(task.start_time)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-[#e7f0fa] rounded-lg border border-[#dde5ec] w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        <LiveTimer startTime={task.start_time} variant="table" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <StatusBadge status="IN_PROGRESS" type="dot" />
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

export default InProgressMonitorView;
