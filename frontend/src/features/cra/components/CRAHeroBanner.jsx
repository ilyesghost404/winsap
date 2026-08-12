import { Timer, Zap } from 'lucide-react';
import LiveTimer from './LiveTimer';
import Button from '../../../components/Button';

/**
 * Premium gradient hero banner displayed when a task is actively running.
 * Shows live timer prominently with task details and quick actions.
 */
const CRAHeroBanner = ({ activeTask, onFinish, className = '' }) => {
  if (!activeTask) return null;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-[#1c2b33] via-[#0552b1] to-[#0064e0]
        text-white p-6 sm:p-8
        shadow-electric-glow border border-blue-400/30
        animate-fade-in
        ${className}
      `}
    >
      {/* Decorative elements */}
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50" />
          <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-blue-100 font-heading">
            Active Task
          </span>
          {activeTask.ticket_reference && (
            <span className="px-2 py-0.5 bg-white/15 text-white/90 rounded-md text-[11px] font-bold border border-white/20 ml-1">
              #{activeTask.ticket_reference}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-base sm:text-lg font-semibold text-white/90 leading-snug mb-4 line-clamp-2">
              {activeTask.description || 'Untitled Task'}
            </p>

            {/* Timer */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Timer size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-0.5">Elapsed Time</p>
                <LiveTimer startTime={activeTask.start_time} variant="banner" />
              </div>
            </div>
          </div>

          {/* Finish button */}
          {onFinish && (
            <div className="flex-shrink-0">
              <Button
                variant="success"
                size="lg"
                icon={Zap}
                onClick={() => onFinish(activeTask.id)}
                className="shadow-lg shadow-emerald-500/30"
              >
                Finish Task
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRAHeroBanner;
