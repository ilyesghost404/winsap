import { Play, Square, Eye, Trash2, Clock, Hash, Calendar, User } from 'lucide-react';
import LiveTimer, { DurationDisplay } from './LiveTimer';
import PriorityBadge from './PriorityBadge';
import StatusBadge from '../../../components/StatusBadge';
import Button from '../../../components/Button';

/**
 * Universal task card used across Queue, In Progress, and Completed views.
 * Adapts its layout and actions based on task status.
 */
const TaskCard = ({
  task,
  onStart,
  onFinish,
  onViewDetails,
  onDelete,
  onApprove,
  onReject,
  isManager = false,
  className = ''
}) => {
  const status = (task.status || '').toUpperCase();
  const isInProgress = status === 'IN_PROGRESS';
  const isPending = status === 'PENDING_START';
  const isCompleted = ['COMPLETED', 'PENDING_APPROVAL', 'APPROVED'].includes(status);
  const isRejected = status === 'REJECTED';

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
    <div
      className={`
        group relative bg-white rounded-2xl border border-[#dde5ec] overflow-hidden
        transition-all duration-300 ease-out
        hover:shadow-blue-glow hover:border-[#0082fb]/40 hover:-translate-y-0.5
        ${isInProgress ? 'ring-2 ring-blue-500/20 border-blue-300 shadow-blue-glow' : 'shadow-premium-sm'}
        ${className}
      `}
    >
      {/* Top accent bar */}
      {isInProgress && (
        <div className="h-1 bg-gradient-to-r from-[#0064e0] to-[#0082fb] w-full" />
      )}
      {isPending && (
        <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500 w-full" />
      )}

      <div className="p-5">
        {/* Header row: Ticket + Status + Priority */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {task.ticket_reference && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e7f0fa] text-[#0064e0] rounded-lg text-[11px] font-bold border border-[#dde5ec] flex-shrink-0">
                <Hash size={10} />
                {task.ticket_reference}
              </span>
            )}
            <PriorityBadge priority={task.priority} />
          </div>
          <StatusBadge status={task.status} type="dot" />
        </div>

        {/* Description */}
        <p className="text-sm font-semibold text-[#1c2b33] leading-snug mb-3 line-clamp-2">
          {task.description || 'No description provided'}
        </p>

        {/* Meta info row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[#5f7380] font-medium mb-4">
          {task.employee_name && (
            <span className="inline-flex items-center gap-1">
              <User size={11} />
              {task.employee_name}
            </span>
          )}
          {task.start_time && (
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(task.start_time)} {formatTime(task.start_time)}
            </span>
          )}
          {isCompleted && task.duration_minutes && (
            <span className="inline-flex items-center gap-1">
              <Clock size={11} />
              <DurationDisplay minutes={task.duration_minutes} className="text-[11px] text-[#5f7380]" />
            </span>
          )}
        </div>

        {/* Live Timer (In Progress only) */}
        {isInProgress && task.start_time && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#e7f0fa] rounded-xl border border-[#dde5ec] mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-bold text-[#5f7380] uppercase tracking-wider">Elapsed</span>
            <LiveTimer startTime={task.start_time} variant="card" />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="xs"
              icon={Eye}
              onClick={() => onViewDetails(task)}
            >
              Details
            </Button>
          )}

          {isPending && onStart && (
            <Button
              variant="primary"
              size="xs"
              icon={Play}
              onClick={() => onStart(task.id)}
            >
              Start Task
            </Button>
          )}

          {isInProgress && onFinish && (
            <Button
              variant="success"
              size="xs"
              icon={Square}
              onClick={() => onFinish(task.id)}
            >
              Finish Task
            </Button>
          )}

          {isManager && (isCompleted || status === 'PENDING_APPROVAL') && onApprove && (
            <>
              <Button
                variant="success"
                size="xs"
                onClick={() => onApprove(task.id)}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="xs"
                onClick={() => onReject(task.id)}
              >
                Reject
              </Button>
            </>
          )}

          {(isPending || isRejected) && onDelete && (
            <Button
              variant="danger"
              size="xs"
              icon={Trash2}
              onClick={() => onDelete(task.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
