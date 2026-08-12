import { X, Hash, Calendar, Clock, User, Play, Square, Trash2, CheckCircle2, XCircle, FileText, Flag, Timer, History } from 'lucide-react';
import LiveTimer, { DurationDisplay } from './LiveTimer';
import PriorityBadge from './PriorityBadge';
import StatusBadge from '../../../components/StatusBadge';
import Button from '../../../components/Button';

/**
 * Slide-over panel showing full task details.
 * Includes timeline, time tracking, description, and action buttons.
 */
const TaskDetailPanel = ({
  task,
  isOpen,
  onClose,
  onStart,
  onFinish,
  onDelete,
  onApprove,
  onReject,
  isManager = false
}) => {
  if (!isOpen || !task) return null;

  const status = (task.status || '').toUpperCase();
  const isInProgress = status === 'IN_PROGRESS';
  const isPending = status === 'PENDING_START';
  const isCompleted = ['COMPLETED', 'PENDING_APPROVAL', 'APPROVED'].includes(status);
  const isRejected = status === 'REJECTED';

  const formatDateTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[998] transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-[999] shadow-2xl border-l border-[#dde5ec] flex flex-col animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dde5ec] bg-[#f1f5f8] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#e7f0fa] flex items-center justify-center border border-[#dde5ec]">
              <FileText size={16} className="text-[#0064e0]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-heading font-bold text-[#1c2b33] truncate">Task Details</h3>
              {task.ticket_reference && (
                <span className="text-[10px] font-bold text-[#0064e0]">#{task.ticket_reference}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-[#0064e0] hover:bg-[#e7f0fa] rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">

            {/* Status & Priority */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>

            {/* Live Timer (if in progress) */}
            {isInProgress && task.start_time && (
              <div className="bg-gradient-to-r from-[#1c2b33] to-[#0064e0] rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Timer Running</span>
                </div>
                <LiveTimer startTime={task.start_time} variant="banner" className="text-3xl" />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold text-[#5f7380] uppercase tracking-wider block mb-2">Description</label>
              <p className="text-sm text-[#1c2b33] leading-relaxed whitespace-pre-wrap bg-[#f1f5f8] rounded-xl p-4 border border-[#dde5ec]">
                {task.description || 'No description provided'}
              </p>
            </div>

            {/* Employee (if manager view) */}
            {task.employee_name && (
              <div>
                <label className="text-[10px] font-bold text-[#5f7380] uppercase tracking-wider block mb-2">Assigned To</label>
                <div className="flex items-center gap-2 bg-[#f1f5f8] rounded-xl p-3 border border-[#dde5ec]">
                  <div className="w-8 h-8 rounded-lg bg-[#0064e0] flex items-center justify-center text-white text-xs font-bold">
                    {task.employee_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1c2b33]">{task.employee_name}</p>
                    {task.matricule && <p className="text-[10px] text-[#5f7380]">{task.matricule}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <label className="text-[10px] font-bold text-[#5f7380] uppercase tracking-wider block mb-3">Timeline</label>
              <div className="space-y-3">
                {/* Created */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar size={13} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#5f7380] uppercase">Created</p>
                    <p className="text-xs font-semibold text-[#1c2b33]">{formatDateTime(task.created_at)}</p>
                  </div>
                </div>

                {/* Started */}
                {task.start_time && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Play size={13} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#5f7380] uppercase">Started</p>
                      <p className="text-xs font-semibold text-[#1c2b33]">{formatDateTime(task.start_time)}</p>
                    </div>
                  </div>
                )}

                {/* Finished */}
                {task.end_time && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Square size={13} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#5f7380] uppercase">Finished</p>
                      <p className="text-xs font-semibold text-[#1c2b33]">{formatDateTime(task.end_time)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Time Tracking */}
            {(task.duration_minutes || isInProgress) && (
              <div>
                <label className="text-[10px] font-bold text-[#5f7380] uppercase tracking-wider block mb-2">Time Tracking</label>
                <div className="bg-[#f1f5f8] rounded-xl p-4 border border-[#dde5ec]">
                  <div className="flex items-center gap-3">
                    <Timer size={16} className="text-[#0064e0]" />
                    <div>
                      <p className="text-[10px] text-[#5f7380] font-bold uppercase">Total Duration</p>
                      {isInProgress ? (
                        <LiveTimer startTime={task.start_time} variant="compact" />
                      ) : (
                        <DurationDisplay minutes={task.duration_minutes} className="text-sm text-[#0064e0]" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* History & Comments Placeholder */}
            <div>
              <label className="text-[10px] font-bold text-[#5f7380] uppercase tracking-wider block mb-2">History</label>
              <div className="bg-[#f1f5f8] rounded-xl p-6 border border-[#dde5ec] text-center">
                <History size={20} className="text-[#dde5ec] mx-auto mb-2" />
                <p className="text-[11px] text-[#5f7380] font-medium">Activity history coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-[#dde5ec] bg-white flex-shrink-0">
          {isPending && onStart && (
            <Button variant="primary" size="sm" icon={Play} onClick={() => { onStart(task.id); onClose(); }} className="flex-1">
              Start Task
            </Button>
          )}
          {isInProgress && onFinish && (
            <Button variant="success" size="sm" icon={Square} onClick={() => { onFinish(task.id); onClose(); }} className="flex-1">
              Finish Task
            </Button>
          )}
          {isManager && (isCompleted || status === 'PENDING_APPROVAL') && (
            <>
              {onApprove && (
                <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => { onApprove(task.id); onClose(); }} className="flex-1">
                  Approve
                </Button>
              )}
              {onReject && (
                <Button variant="danger" size="sm" icon={XCircle} onClick={() => { onReject(task.id); onClose(); }} className="flex-1">
                  Reject
                </Button>
              )}
            </>
          )}
          {(isPending || isRejected) && onDelete && (
            <Button variant="danger" size="sm" icon={Trash2} onClick={() => { onDelete(task.id); onClose(); }}>
              Delete
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default TaskDetailPanel;
