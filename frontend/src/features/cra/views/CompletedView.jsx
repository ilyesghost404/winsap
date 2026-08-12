import { CheckCircle2, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useState } from 'react';
import TaskCard from '../components/TaskCard';
import StatusBadge from '../../../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { DurationDisplay } from '../components/LiveTimer';
import Pagination from '../../../components/Pagination';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/Button';

/**
 * "Completed" view — displays finished/approved/rejected tasks with grid/table view toggle and pagination.
 */
const CompletedView = ({
  tasks = [],
  loading = false,
  pagination,
  onPageChange,
  onViewDetails,
  onApprove,
  onReject,
  onDelete,
  isManager = false
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

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

  if (loading) {
    return <LoadingSpinner text="Loading completed tasks..." />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <h3 className="text-base font-heading font-bold text-[#1c2b33]">
            Completed Tasks <span className="text-xs text-[#5f7380] font-semibold">({pagination?.total || tasks.length})</span>
          </h3>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#f1f5f8] p-1 rounded-xl border border-[#dde5ec]">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-[#0064e0] shadow-2xs' : 'text-[#5f7380] hover:text-[#1c2b33]'
            }`}
            title="Grid View"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-[#0064e0] shadow-2xs' : 'text-[#5f7380] hover:text-[#1c2b33]'
            }`}
            title="Table View"
          >
            <TableIcon size={15} />
          </button>
        </div>
      </div>

      {!tasks || tasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No completed tasks"
          description="Finished tasks will appear here along with total duration and approval statuses."
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onViewDetails={onViewDetails}
              onApprove={onApprove}
              onReject={onReject}
              onDelete={onDelete}
              isManager={isManager}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-[#dde5ec] overflow-hidden shadow-premium-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-[#1c2b33]">
              <thead className="bg-[#f1f5f8] border-b border-[#dde5ec] text-[#5f7380] font-heading font-extrabold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Ticket / Ref</th>
                  {isManager && <th className="px-5 py-3.5">Employee</th>}
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Started</th>
                  <th className="px-5 py-3.5">Ended</th>
                  <th className="px-5 py-3.5">Duration</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dde5ec]">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[#f1f5f8]/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#0064e0]">
                      #{task.ticket_reference || '—'}
                    </td>
                    {isManager && (
                      <td className="px-5 py-4 font-semibold text-[#1c2b33]">
                        {task.employee_name || '—'}
                      </td>
                    )}
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
                    <td className="px-5 py-4">
                      <StatusBadge status={task.status} type="dot" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button variant="ghost" size="xs" onClick={() => onViewDetails(task)}>
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
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

export default CompletedView;
