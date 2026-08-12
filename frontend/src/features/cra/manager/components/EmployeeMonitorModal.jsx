import { X, User, Clock, CheckCircle2, Calendar, FileText, Timer, Building, Hash } from 'lucide-react';
import LiveTimer, { DurationDisplay } from '../../components/LiveTimer';
import StatusBadge from '../../../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';

/**
 * Read-Only Employee Monitor Profile slide-over modal for managers.
 * Clicking any employee row in the Control Room opens this detailed monitoring profile.
 */
const EmployeeMonitorModal = ({ isOpen, onClose, profileData, loading = false }) => {
  if (!isOpen) return null;

  const emp = profileData?.employee || {};
  const metrics = profileData?.metrics || {};
  const tasks = profileData?.recent_tasks || [];

  const initials = (emp.first_name || 'E')
    .split(' ')
    .map(n => n[0])
    .join('') + (emp.last_name ? emp.last_name[0] : '');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[998] transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-[999] shadow-2xl border-l border-[#dde5ec] flex flex-col animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#dde5ec] bg-[#f1f5f8] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1c2b33] to-[#0064e0] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {initials || 'EM'}
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-[#1c2b33]">
                {emp.first_name} {emp.last_name}
              </h3>
              <p className="text-xs text-[#5f7380] font-medium flex items-center gap-2">
                <span>Matricule: {emp.matricule || '—'}</span>
                {emp.department_name && (
                  <span className="inline-flex items-center gap-1 text-[#0064e0]">
                    <Building size={11} />
                    {emp.department_name}
                  </span>
                )}
              </p>
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Clock className="w-8 h-8 animate-spin text-[#0064e0] mb-2" />
              <p className="text-xs text-[#5f7380] font-medium">Loading employee monitoring profile...</p>
            </div>
          ) : (
            <>
              {/* Working Status Badge */}
              <div className="flex items-center justify-between p-4 bg-[#f1f5f8] rounded-xl border border-[#dde5ec]">
                <span className="text-xs font-bold text-[#5f7380] uppercase tracking-wider">Current Status</span>
                {metrics.is_working ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Working Now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    Idle / Between Tasks
                  </span>
                )}
              </div>

              {/* Metric Cards Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#e7f0fa] rounded-xl p-3.5 border border-[#dde5ec] text-center">
                  <p className="text-[10px] font-bold text-[#5f7380] uppercase tracking-wider">Hours Today</p>
                  <p className="text-lg font-heading font-black text-[#0064e0] mt-1">{metrics.hours_today || 0}h</p>
                </div>
                <div className="bg-[#e7f0fa] rounded-xl p-3.5 border border-[#dde5ec] text-center">
                  <p className="text-[10px] font-bold text-[#5f7380] uppercase tracking-wider">Weekly Hours</p>
                  <p className="text-lg font-heading font-black text-[#1c2b33] mt-1">{metrics.hours_week || 0}h</p>
                </div>
                <div className="bg-[#e7f0fa] rounded-xl p-3.5 border border-[#dde5ec] text-center">
                  <p className="text-[10px] font-bold text-[#5f7380] uppercase tracking-wider">Monthly Hours</p>
                  <p className="text-lg font-heading font-black text-emerald-600 mt-1">{metrics.hours_month || 0}h</p>
                </div>
              </div>

              {/* Tasks History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#5f7380] uppercase tracking-wider">Recent Activity Timeline</h4>
                {tasks.length === 0 ? (
                  <p className="text-xs text-[#5f7380] font-medium py-4 text-center">No tasks recorded for this employee.</p>
                ) : (
                  <div className="space-y-2.5">
                    {tasks.map((t) => (
                      <div key={t.id} className="p-3.5 bg-white rounded-xl border border-[#dde5ec] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          {t.ticket_reference ? (
                            <span className="text-xs font-mono font-bold text-[#0064e0]">#{t.ticket_reference}</span>
                          ) : (
                            <span className="text-xs text-[#5f7380]">Task #{t.id}</span>
                          )}
                          <StatusBadge status={t.status} type="dot" />
                        </div>
                        <p className="text-xs font-semibold text-[#1c2b33] leading-snug">{t.description}</p>
                        {t.duration_minutes && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#5f7380] pt-1 border-t border-[#f1f5f8]">
                            <Clock size={11} />
                            <span>Duration:</span>
                            <DurationDisplay minutes={t.duration_minutes} className="text-xs font-bold text-[#0064e0]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#dde5ec] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#5f7380] hover:text-[#1c2b33] bg-[#f1f5f8] rounded-xl border border-[#dde5ec]"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default EmployeeMonitorModal;
