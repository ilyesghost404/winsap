import { useState } from 'react';
import { User, Timer, LayoutGrid, Table as TableIcon, Activity, Clock, Hash, Building } from 'lucide-react';
import LiveTimer, { DurationDisplay } from '../../components/LiveTimer';
import StatusBadge from '../../../../components/StatusBadge';
import EmptyState from '../../../../components/EmptyState';
import LoadingSpinner from '../../../../components/LoadingSpinner';

/**
 * LiveActivityMonitor component — real-time table/cards showing every active employee currently working.
 * Read-only control room view. Clicking an employee opens their monitoring profile.
 */
const LiveActivityMonitor = ({ liveActivities = [], loading = false, onSelectEmployee }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  const formatDateTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const calculateProgress = (startTime, durationMinutes) => {
    if (!startTime) return 0;
    const elapsedMinutes = (Date.now() - new Date(startTime).getTime()) / (1000 * 60);
    const target = durationMinutes || 480; // default 8h target
    return Math.min(100, Math.round((elapsedMinutes / target) * 100));
  };

  if (loading) {
    return <LoadingSpinner text="Fetching live employee activity..." />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-400" />
          <h3 className="text-base font-heading font-bold text-[#1c2b33]">
            Live Employee Activity Monitor <span className="text-xs text-[#5f7380] font-semibold">({liveActivities.length} active)</span>
          </h3>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#f1f5f8] p-1 rounded-xl border border-[#dde5ec]">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-[#0064e0] shadow-2xs' : 'text-[#5f7380] hover:text-[#1c2b33]'
            }`}
            title="Table View"
          >
            <TableIcon size={15} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-[#0064e0] shadow-2xs' : 'text-[#5f7380] hover:text-[#1c2b33]'
            }`}
            title="Grid View"
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {liveActivities.length === 0 ? (
        <EmptyState
          icon={Timer}
          title="No active tasks in progress"
          description="All employees are currently offline or between task timers."
        />
      ) : viewMode === 'table' ? (
        /* Control Room Live Table */
        <div className="bg-white rounded-2xl border border-[#dde5ec] overflow-hidden shadow-premium-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-[#1c2b33]">
              <thead className="bg-[#f1f5f8] border-b border-[#dde5ec] text-[#5f7380] font-heading font-extrabold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Current Task</th>
                  <th className="px-5 py-3.5">Ticket Ref</th>
                  <th className="px-5 py-3.5">Started At</th>
                  <th className="px-5 py-3.5">Live Timer</th>
                  <th className="px-5 py-3.5">Estimated Duration</th>
                  <th className="px-5 py-3.5">Progress</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dde5ec]">
                {liveActivities.map((item) => {
                  const progress = calculateProgress(item.start_time, item.duration_minutes);
                  const initials = (item.employee_name || 'E')
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectEmployee && onSelectEmployee(item.employee_id)}
                      className="hover:bg-[#e7f0fa]/50 transition-colors cursor-pointer group"
                    >
                      {/* Employee info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1c2b33] to-[#0064e0] text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-[#1c2b33] group-hover:text-[#0064e0] transition-colors">
                              {item.employee_name}
                            </p>
                            <p className="text-[10px] text-[#5f7380] font-mono">
                              {item.matricule || `ID: ${item.employee_id}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Current Task */}
                      <td className="px-5 py-4 font-semibold text-[#1c2b33] max-w-xs truncate">
                        {item.description || 'Task in progress'}
                      </td>

                      {/* Ticket Ref */}
                      <td className="px-5 py-4">
                        {item.ticket_reference ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e7f0fa] text-[#0064e0] rounded-md text-[11px] font-bold border border-[#dde5ec]">
                            <Hash size={10} />
                            {item.ticket_reference}
                          </span>
                        ) : (
                          <span className="text-[#5f7380]">—</span>
                        )}
                      </td>

                      {/* Started At */}
                      <td className="px-5 py-4 font-mono font-medium text-[#5f7380]">
                        {formatDateTime(item.start_time)}
                      </td>

                      {/* Live Timer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#e7f0fa] rounded-lg border border-[#dde5ec] w-fit">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          <LiveTimer startTime={item.start_time} variant="table" />
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-5 py-4">
                        <DurationDisplay minutes={item.duration_minutes || 480} className="text-xs text-[#0064e0]" />
                      </td>

                      {/* Progress */}
                      <td className="px-5 py-4 w-32">
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#5f7380] mb-1">
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#f1f5f8] rounded-full overflow-hidden border border-[#dde5ec]">
                          <div
                            className="h-full bg-gradient-to-r from-[#0064e0] to-[#0082fb] rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-right">
                        <StatusBadge status="IN_PROGRESS" type="dot" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveActivities.map((item) => {
            const initials = (item.employee_name || 'E')
              .split(' ')
              .map(n => n[0])
              .join('')
              .slice(0, 2);

            return (
              <div
                key={item.id}
                onClick={() => onSelectEmployee && onSelectEmployee(item.employee_id)}
                className="bg-white rounded-2xl p-5 border border-[#dde5ec] shadow-premium-sm hover:shadow-blue-glow hover:border-[#0082fb]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1c2b33] to-[#0064e0] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1c2b33] group-hover:text-[#0064e0] transition-colors">
                        {item.employee_name}
                      </h4>
                      <p className="text-[10px] text-[#5f7380] font-mono">{item.matricule || `ID: ${item.employee_id}`}</p>
                    </div>
                  </div>
                  <StatusBadge status="IN_PROGRESS" type="dot" />
                </div>

                <p className="text-xs font-semibold text-[#1c2b33] leading-snug mb-3 line-clamp-2">
                  {item.description || 'Task in progress'}
                </p>

                <div className="bg-[#e7f0fa] rounded-xl p-3 border border-[#dde5ec] flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0064e0]">Live Timer</span>
                  <LiveTimer startTime={item.start_time} variant="card" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LiveActivityMonitor;
