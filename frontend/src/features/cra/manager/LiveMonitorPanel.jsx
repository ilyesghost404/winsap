import { useState, useEffect } from 'react';
import { User, Timer, AlertCircle, RefreshCw } from 'lucide-react';
import LiveTimer, { DurationDisplay } from '../components/LiveTimer';
import Button from '../../../components/Button';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';

/**
 * Real-time monitoring panel for managers showing all employees currently running timers.
 */
const LiveMonitorPanel = ({ liveData = [], loading = false, onRefresh }) => {
  if (loading) {
    return <LoadingSpinner text="Fetching live employee activity..." />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-heading font-bold text-[#1c2b33]">Live Employee Monitoring</h3>
          <p className="text-xs text-[#5f7380] font-medium">
            Real-time active timers across your organization ({liveData.length} active)
          </p>
        </div>
        <Button variant="outline" size="xs" icon={RefreshCw} onClick={onRefresh}>
          Refresh Live Data
        </Button>
      </div>

      {liveData.length === 0 ? (
        <EmptyState
          icon={Timer}
          title="No active timers"
          description="No employees are currently running active task timers."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-blue-200 shadow-electric-glow relative overflow-hidden"
            >
              {/* Top indicator */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-[#1c2b33]">{item.employee_name}</span>
                </div>
                {item.matricule && (
                  <span className="text-[10px] font-bold text-[#5f7380] font-mono">{item.matricule}</span>
                )}
              </div>

              {/* Task info */}
              <p className="text-xs font-semibold text-[#1c2b33] mb-3 line-clamp-2">
                {item.description || 'No description'}
              </p>

              {/* Timer box */}
              <div className="bg-[#e7f0fa] rounded-xl p-3 border border-[#dde5ec] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0064e0]">Elapsed</span>
                <LiveTimer startTime={item.start_time} variant="card" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveMonitorPanel;
