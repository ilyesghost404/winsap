import { CheckCircle2, Download, Search } from 'lucide-react';
import StatusBadge from '../../../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { DurationDisplay } from '../../components/LiveTimer';
import Pagination from '../../../../components/Pagination';
import EmptyState from '../../../../components/EmptyState';
import Button from '../../../../components/Button';

/**
 * CompletedMonitorView component — read-only view of completed tasks.
 * Supports Search, Date/Employee Filters, and Report Exports. No task editing.
 */
const CompletedMonitorView = ({
  completedTasks = [],
  loading = false,
  pagination,
  onPageChange,
  filters,
  onFiltersChange,
  onOpenReports,
  onSelectEmployee
}) => {
  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header controls & export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <h3 className="text-base font-heading font-bold text-[#1c2b33]">
            Completed Tasks Monitor <span className="text-xs text-[#5f7380] font-semibold">({pagination?.total || completedTasks.length})</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="xs" icon={Download} onClick={onOpenReports}>
            Generate Reports
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f7380]" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          placeholder="Search completed tasks by employee, ticket reference..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#dde5ec] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0]"
        />
      </div>

      {/* Table */}
      {completedTasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No completed tasks"
          description="Finished tasks across employee accounts will be logged here in read-only format."
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
                  <th className="px-5 py-3.5">Started</th>
                  <th className="px-5 py-3.5">Ended</th>
                  <th className="px-5 py-3.5">Duration</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dde5ec]">
                {completedTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => onSelectEmployee && onSelectEmployee(task.employee_id)}
                    className="hover:bg-[#f1f5f8]/50 transition-colors cursor-pointer"
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
                    <td className="px-5 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-5 py-4 text-[#5f7380] font-medium">
                      {formatDate(task.start_time)} {formatTime(task.start_time)}
                    </td>
                    <td className="px-5 py-4 text-[#5f7380] font-medium">
                      {formatDate(task.end_time)} {formatTime(task.end_time)}
                    </td>
                    <td className="px-5 py-4">
                      <DurationDisplay minutes={task.duration_minutes} className="text-xs text-[#0064e0]" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <StatusBadge status={task.status} type="dot" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={20}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default CompletedMonitorView;
