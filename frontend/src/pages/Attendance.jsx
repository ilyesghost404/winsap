import { useState } from 'react';
import { CalendarCheck, Clock, CalendarOff, Zap } from 'lucide-react';
import PresenceTab from '../components/attendance/PresenceTab';
import AbsencesTab from '../components/attendance/AbsencesTab';
import EmployeeAttendanceView from '../components/attendance/EmployeeAttendanceView';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const [activeTab, setActiveTab] = useState('presence');

  if (isEmployee) {
    return <EmployeeAttendanceView />;
  }

  const tabs = [
    { id: 'presence', label: 'Daily Presence Tracker', icon: Clock },
    { id: 'absences', label: 'Absence History & Logs', icon: CalendarOff },
  ];

  return (
    <div className="space-y-6">
      {/* ── Premium Blue Hero Banner ─────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] to-[#0064e0] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-100 font-heading mb-1">
              <Zap size={14} className="text-blue-100" />
              <span>Real-Time Workforce Verification</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              LIVE ATTENDANCE MONITOR
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Monitor daily check-in timestamps, missing departures, delay calculations, and biometric log verification.
            </p>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────── */}
      <div className="bg-white p-1.5 rounded-2xl border border-[#dde5ec] shadow-premium-sm inline-flex gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-heading font-bold text-xs transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-electric-glow'
                    : 'text-[#172033] hover:text-[#2563eb] hover:bg-[#eff6ff]'
                }
              `}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────── */}
      <div className="animate-fade-in">
        {activeTab === 'presence' && <PresenceTab />}
        {activeTab === 'absences' && <AbsencesTab />}
      </div>
    </div>
  );
};

export default Attendance;
