import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, CalendarDays, Calendar as CalendarIcon, Zap, Sparkles, CheckCircle2
} from 'lucide-react';
import Card from '../Card';
import LoadingSpinner from '../LoadingSpinner';
import { getHolidays } from '../../services/holidayService';

const TYPE_COLORS = {
  National: {
    bg: 'bg-[#e7f0fa] text-[#0064e0] border-[#dde5ec]',
    dot: 'bg-[#0064e0]',
    badge: 'bg-[#0064e0] text-white',
  },
  Religious: {
    bg: 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]',
    dot: 'bg-[#7c3aed]',
    badge: 'bg-[#7c3aed] text-white',
  },
  Company: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-600',
    badge: 'bg-emerald-600 text-white',
  },
  Other: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    badge: 'bg-slate-600 text-white',
  },
};

const getDaysInMonth = (year, month) => {
  const days = [];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Mon as 0
  let startDayOfWeek = firstDay - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  return days;
};

const formatLocalDate = (date) => {
  if (!date) return '';
  if (typeof date === 'string') {
    const clean = date.includes('T') ? date.split('T')[0] : date;
    const parts = clean.split('-');
    if (parts.length === 3) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  const cleanStr = String(dateStr).includes('T') ? String(dateStr).split('T')[0] : String(dateStr);
  const [year, month, day] = cleanStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const EmployeeHolidaysView = ({ holidays: initialHolidays, loading: parentLoading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidaysList, setHolidaysList] = useState(Array.isArray(initialHolidays) ? initialHolidays : []);
  const [loading, setLoading] = useState(parentLoading ?? false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchHolidaysForYear = useCallback(async (targetYear) => {
    try {
      setLoading(true);
      const res = await getHolidays(targetYear);
      setHolidaysList(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error fetching employee holidays:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(initialHolidays) && initialHolidays.length > 0) {
      setHolidaysList(initialHolidays);
    } else {
      fetchHolidaysForYear(year);
    }
  }, [initialHolidays, year, fetchHolidaysForYear]);

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const holidaysMap = useMemo(() => {
    const map = {};
    holidaysList.forEach((h) => {
      const startStr = formatLocalDate(h.start_date || h.holiday_date);
      const endStr = formatLocalDate(h.end_date || h.start_date || h.holiday_date);
      if (startStr && endStr) {
        let cur = parseLocalDate(startStr);
        const end = parseLocalDate(endStr);
        while (cur <= end) {
          const dStr = formatLocalDate(cur);
          if (!map[dStr]) map[dStr] = [];
          if (!map[dStr].some((item) => item.id === h.id)) {
            map[dStr].push(h);
          }
          cur.setDate(cur.getDate() + 1);
        }
      }
    });
    return map;
  }, [holidaysList]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthHolidays = useMemo(() => {
    return holidaysList.filter((h) => {
      const startStr = formatLocalDate(h.start_date || h.holiday_date);
      const endStr = formatLocalDate(h.end_date || h.start_date || h.holiday_date);
      if (!startStr || !endStr) return false;
      const cur = parseLocalDate(startStr);
      const end = parseLocalDate(endStr);
      while (cur <= end) {
        if (cur.getFullYear() === year && cur.getMonth() === month) {
          return true;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return false;
    });
  }, [holidaysList, year, month]);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] via-[#0064e0] to-[#0082fb] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-100 font-heading mb-1">
          <Zap size={14} className="text-blue-100" />
          <span>Personal Workspace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white uppercase">
          Company Holiday Calendar
        </h1>
        <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl font-medium">
          View official national, religious, and company non-working dates for the year.
        </p>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Calendar Card with Gradient Header */}
      <Card
        headerVariant="blue"
        title={
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center border border-white/30 shadow-inner">
                <CalendarDays size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wide font-heading">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <p className="text-[11px] text-blue-100 font-normal">
                  {monthHolidays.length} official holiday event{monthHolidays.length !== 1 ? 's' : ''} this month
                </p>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-xs border border-white/30 rounded-xl p-1 shadow-2xs">
              <button
                onClick={prevMonth}
                className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-bold text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="md" text="Loading holiday calendar…" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Weekday Column Headers */}
            <div className="grid grid-cols-7 gap-1.5 text-center font-extrabold text-xs text-[#0064e0] uppercase tracking-wider py-2 border-b border-[#dde5ec] bg-[#f1f5f8] rounded-xl font-heading">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => (
                <div
                  key={dayName}
                  className={`py-0.5 ${idx >= 5 ? 'text-[#0082fb] font-semibold' : 'text-[#0064e0]'}`}
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* 7-Column Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {days.map((item, index) => {
                const formatted = formatLocalDate(item.date);
                const dayHolidays = holidaysMap[formatted] || [];
                const isToday = formatLocalDate(new Date()) === formatted;
                const hasHoliday = dayHolidays.length > 0;

                const dayOfWeek = item.date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[85px] sm:min-h-[95px] p-2 rounded-xl border transition-all duration-150 flex flex-col justify-between select-none
                      ${
                        isToday
                          ? 'bg-[#e7f0fa] border-[#0064e0] ring-2 ring-[#0082fb]/50 shadow-xs'
                          : hasHoliday
                          ? 'bg-[#e7f0fa] border-[#dde5ec] shadow-2xs'
                          : item.isCurrentMonth
                          ? isWeekend
                            ? 'bg-[#f8fafc] border-[#e2e8f0]'
                            : 'bg-white border-[#dde5ec]'
                          : 'bg-[#f8fafc]/50 border-slate-100 opacity-40'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`
                          text-xs font-black font-mono inline-flex items-center justify-center w-6 h-6 rounded-lg transition-colors
                          ${
                            isToday
                              ? 'bg-[#0064e0] text-white shadow-xs'
                              : hasHoliday
                              ? 'text-[#0064e0] bg-[#e7f0fa]'
                              : item.isCurrentMonth
                              ? 'text-[#1c2b33]'
                              : 'text-slate-400'
                          }
                        `}
                      >
                        {item.date.getDate()}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#0064e0] text-white font-heading">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="mt-1 space-y-1">
                      {dayHolidays.map((h) => {
                        const style = TYPE_COLORS[h.type] || TYPE_COLORS.National;
                        return (
                          <div
                            key={h.id}
                            className={`px-1.5 py-1 rounded-lg text-[10px] font-bold border truncate flex items-center gap-1 ${style.bg}`}
                            title={`${h.name} (${h.type}): ${h.description || 'Public holiday'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                            <span className="truncate">{h.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Holidays of this Month */}
      <Card
        headerVariant="softBlue"
        title={`Holidays in ${currentDate.toLocaleDateString('en-US', { month: 'long' })}`}
        subtitle="Official non-working days scheduled for this month"
      >
        {monthHolidays.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <CalendarDays size={24} className="mx-auto text-slate-300 mb-2 opacity-60" />
            <p className="font-semibold text-slate-600">No official holidays scheduled for this month.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e7f0fa]">
            {monthHolidays.map((h) => {
              const startStr = formatLocalDate(h.start_date || h.holiday_date);
              const endStr = formatLocalDate(h.end_date || h.start_date || h.holiday_date);
              const typeClass = TYPE_COLORS[h.type] || TYPE_COLORS.National;

              return (
                <div key={h.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-xl bg-[#e7f0fa] text-[#0064e0] flex items-center justify-center flex-shrink-0 border border-[#dde5ec] shadow-2xs">
                      <CalendarDays size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-[#1c2b33] text-xs sm:text-sm">{h.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {startStr === endStr ? startStr : `${startStr} → ${endStr}`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${typeClass.bg}`}>
                    {h.type}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmployeeHolidaysView;
