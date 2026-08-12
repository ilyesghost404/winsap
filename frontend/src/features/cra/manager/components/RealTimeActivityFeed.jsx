import { Activity, Play, CheckCircle2, ListTodo, Clock, Zap } from 'lucide-react';

/**
 * RealTimeActivityFeed component — displays a live stream of employee task events.
 * Listens to real-time status transitions.
 */
const RealTimeActivityFeed = ({ feed = [], className = '' }) => {
  const getEventConfig = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'IN_PROGRESS') {
      return {
        label: 'started task',
        icon: Play,
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      };
    }
    if (['COMPLETED', 'APPROVED'].includes(s)) {
      return {
        label: 'completed task',
        icon: CheckCircle2,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
      };
    }
    return {
      label: 'queued task',
      icon: ListTodo,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    };
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`bg-white rounded-2xl p-6 border border-[#dde5ec] shadow-premium-sm space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-[#dde5ec]">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[#0064e0]" />
          <h3 className="text-base font-heading font-bold text-[#1c2b33]">Live Activity Feed</h3>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Control Room Stream
        </span>
      </div>

      {feed.length === 0 ? (
        <p className="text-xs text-[#5f7380] font-medium py-6 text-center">No recent activity events recorded.</p>
      ) : (
        <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
          {feed.map((item, index) => {
            const config = getEventConfig(item.status);
            const Icon = config.icon;

            return (
              <div
                key={item.id || index}
                className="flex items-start gap-3 p-3 bg-[#f1f5f8] rounded-xl border border-[#dde5ec] hover:border-[#0082fb]/40 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className={`p-2 rounded-lg border ${config.color} flex-shrink-0 mt-0.5`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[#1c2b33] truncate">
                      {item.employee_name || `Employee #${item.employee_id}`}
                      <span className="font-normal text-[#5f7380] ml-1">{config.label}</span>
                    </p>
                    <span className="text-[10px] font-mono font-medium text-[#5f7380] flex-shrink-0">
                      {formatTimeAgo(item.updated_at || item.start_time)}
                    </span>
                  </div>
                  <p className="text-xs text-[#5f7380] font-medium truncate mt-0.5">
                    {item.ticket_reference && <span className="font-mono font-bold text-[#0064e0] mr-1">#{item.ticket_reference}</span>}
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RealTimeActivityFeed;
