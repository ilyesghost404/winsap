import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  CalendarDays, Plus, Edit2, Trash2, Search, Filter,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Sparkles, CheckCircle2, Clock, Globe, Shield, RefreshCw,
  Sun, Moon, Users, Zap
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { getHolidays, createHoliday, updateHoliday, deleteHoliday } from '../services/holidayService';
import { useAuth } from '../context/AuthContext';
import EmployeeHolidaysView from '../components/holidays/EmployeeHolidaysView';

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = String(dateStr).includes('T') ? String(dateStr).split('T')[0] : String(dateStr);
  const [year, month, day] = cleanStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatLocalDate = (d) => {
  if (!d) return '';
  if (typeof d === 'string') {
    return d.includes('T') ? d.split('T')[0] : d;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TYPE_COLORS = {
  National: {
    bg: 'bg-[#e7f0fa] text-[#0064e0] border-[#dde5ec]',
    dot: 'bg-[#0064e0]',
    badge: 'bg-[#0064e0] text-white',
    ring: 'ring-[#0082fb]',
  },
  Religious: {
    bg: 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]',
    dot: 'bg-[#7c3aed]',
    badge: 'bg-[#7c3aed] text-white',
    ring: 'ring-violet-400',
  },
  Company: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-600',
    badge: 'bg-emerald-600 text-white',
    ring: 'ring-emerald-400',
  },
  Other: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    badge: 'bg-slate-600 text-white',
    ring: 'ring-slate-400',
  },
};

const Holidays = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Month navigation state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth(); // 0-indexed

  // Filter and search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Pagination for holiday list
  const [page, setPage] = useState(1);
  const limit = 6;

  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    type: 'National',
    description: '',
  });

  const fetchHolidaysData = async () => {
    try {
      setLoading(true);
      const res = await getHolidays(currentYear);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setHolidays(list);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast.error('Failed to load holiday calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidaysData();
  }, [currentYear]);

  // If role is employee, render specialized employee calendar view
  if (isEmployee) {
    return (
      <EmployeeHolidaysView
        holidays={holidays}
        loading={loading}
        calendarDate={calendarDate}
        setCalendarDate={setCalendarDate}
      />
    );
  }

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCalendarDate(new Date());
  };

  // Build map of holidays keyed by YYYY-MM-DD spanning multi-day ranges
  const holidaysMap = useMemo(() => {
    const map = {};
    (holidays || []).forEach((h) => {
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
  }, [holidays]);

  // Calendar Grid computation (7 columns: Mon -> Sun)
  const calendarDays = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday as first day: 0 = Mon, ..., 6 = Sun
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Leading days from previous month
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const date = new Date(year, month - 1, dayNum);
      days.push({
        date,
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateString: formatLocalDate(date),
      });
    }

    // Days in current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        dayNumber: i,
        isCurrentMonth: true,
        dateString: formatLocalDate(date),
      });
    }

    // Trailing days from next month to complete 6-week matrix (42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        dayNumber: i,
        isCurrentMonth: false,
        dateString: formatLocalDate(date),
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Modal Handlers
  const handleAdd = (datePrefill = null) => {
    setEditingHoliday(null);
    const prefill = datePrefill || formatLocalDate(new Date());
    setFormData({
      name: '',
      start_date: prefill,
      end_date: prefill,
      type: 'National',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    const startStr = formatLocalDate(holiday.start_date || holiday.holiday_date);
    const endStr = formatLocalDate(holiday.end_date || holiday.start_date || holiday.holiday_date);
    setFormData({
      name: holiday.name || '',
      start_date: startStr,
      end_date: endStr,
      type: holiday.type || 'National',
      description: holiday.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this official holiday?')) {
      try {
        await deleteHoliday(id);
        toast.success('Holiday removed successfully');
        fetchHolidaysData();
      } catch (error) {
        console.error('Error deleting holiday:', error);
        toast.error('Failed to delete holiday');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.end_date < formData.start_date) {
      toast.error('End Date cannot be earlier than Start Date.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingHoliday) {
        await updateHoliday(editingHoliday.id, formData);
        toast.success('Holiday updated successfully');
      } else {
        await createHoliday(formData);
        toast.success('Holiday created successfully');
      }
      setIsModalOpen(false);
      fetchHolidaysData();
    } catch (error) {
      console.error('Error saving holiday:', error);
      toast.error(error.response?.data?.message || 'Failed to save holiday');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered list for table
  const filteredHolidays = useMemo(() => {
    return (holidays || []).filter((h) => {
      const matchSearch =
        (h.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = !typeFilter || h.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [holidays, searchTerm, typeFilter]);

  const paginatedHolidays = useMemo(() => {
    return filteredHolidays.slice((page - 1) * limit, page * limit);
  }, [filteredHolidays, page, limit]);

  const totalPages = Math.ceil(filteredHolidays.length / limit) || 1;

  // Upcoming holidays
  const today = new Date();
  const todayFormatted = formatLocalDate(today);

  const upcomingHolidays = useMemo(() => {
    return (holidays || [])
      .filter((h) => {
        const endStr = formatLocalDate(h.end_date || h.start_date || h.holiday_date);
        return endStr && endStr >= todayFormatted;
      })
      .sort((a, b) => new Date(a.start_date || a.holiday_date) - new Date(b.start_date || b.holiday_date))
      .slice(0, 3);
  }, [holidays, todayFormatted]);

  const monthName = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* ── Premium Blue Hero Banner (matching Dashboard) ────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] via-[#0064e0] to-[#0082fb] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-100 font-heading mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shadow-xs" />
              <span>Calendar Management Hub</span>
              <span className="text-blue-200">·</span>
              <span className="text-blue-100 font-mono">{currentYear}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white uppercase">
              Holiday Calendar
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl font-medium">
              Configure public holidays, religious dates, and official company non-working periods.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => handleAdd()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#0064e0] hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Plus size={18} />
              <span>Add New Holiday</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow Reflection */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Upcoming Holidays Showcase */}
      {upcomingHolidays.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {upcomingHolidays.map((h) => {
            const startStr = formatLocalDate(h.start_date || h.holiday_date);
            const endStr = formatLocalDate(h.end_date || h.start_date || h.holiday_date);
            const startObj = parseLocalDate(startStr);
            const isToday = todayFormatted >= startStr && todayFormatted <= endStr;
            const diffTime = startObj ? startObj.getTime() - today.setHours(0, 0, 0, 0) : 0;
            const daysAway = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const typeClass = TYPE_COLORS[h.type] || TYPE_COLORS.National;

            return (
              <div
                key={h.id}
                className="bg-white rounded-2xl border border-[#dde5ec] p-4 shadow-premium-sm flex items-center justify-between gap-3 hover:border-[#0082fb] hover:shadow-electric-glow transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#e7f0fa] text-[#0064e0] flex items-center justify-center flex-shrink-0 border border-[#dde5ec]">
                    <CalendarDays size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#1c2b33] text-xs truncate">{h.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {startStr === endStr ? startStr : `${startStr} → ${endStr}`}
                    </p>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex-shrink-0 ${isToday ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : typeClass.bg}`}>
                  {isToday ? 'Active' : daysAway > 0 ? `in ${daysAway}d` : 'Today'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modern Hero-Style Monthly Calendar Card with Gradient Header ──── */}
      <Card
        headerVariant="blue"
        title={
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center border border-white/30 shadow-inner flex-shrink-0">
                <CalendarDays size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide font-heading">
                  {monthName}
                </h2>
                <p className="text-[11px] text-blue-100 font-medium">
                  {(holidays || []).filter(h => {
                    const startStr = formatLocalDate(h.start_date || h.holiday_date);
                    const endStr = formatLocalDate(h.end_date || h.start_date || h.holiday_date);
                    if (!startStr || !endStr) return false;
                    const cur = parseLocalDate(startStr);
                    const end = parseLocalDate(endStr);
                    while (cur <= end) {
                      if (cur.getFullYear() === currentYear && cur.getMonth() === currentMonth) {
                        return true;
                      }
                      cur.setDate(cur.getDate() + 1);
                    }
                    return false;
                  }).length} official holiday events scheduled this month
                </p>
              </div>
            </div>

            {/* Navigation & Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-white/15 backdrop-blur-xs border border-white/30 rounded-xl p-1 shadow-2xs">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleToday}
                  className="px-2.5 py-1 text-xs font-bold text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Quick Selectors */}
              <select
                value={currentMonth}
                onChange={(e) => setCalendarDate(new Date(currentYear, parseInt(e.target.value, 10), 1))}
                className="px-2.5 py-1.5 bg-white/15 text-white border border-white/30 rounded-xl text-xs font-bold cursor-pointer focus:bg-[#0064e0] focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i} className="text-[#1c2b33] bg-white">
                    {new Date(0, i).toLocaleString('default', { month: 'short' })}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => setCalendarDate(new Date(parseInt(e.target.value, 10), currentMonth, 1))}
                className="px-2.5 py-1.5 bg-white/15 text-white border border-white/30 rounded-xl text-xs font-bold cursor-pointer focus:bg-[#0064e0] focus:outline-none"
              >
                {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                  <option key={year} value={year} className="text-[#1c2b33] bg-white">
                    {year}
                  </option>
                ))}
              </select>
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
              {calendarDays.map((cell, index) => {
                const dayHolidays = holidaysMap[cell.dateString] || [];
                const isToday = cell.dateString === todayFormatted;
                const hasHoliday = dayHolidays.length > 0;
                const primaryHoliday = dayHolidays[0];

                const dayOfWeek = cell.date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (hasHoliday) {
                        handleEdit(primaryHoliday);
                      } else {
                        handleAdd(cell.dateString);
                      }
                    }}
                    className={`
                      min-h-[90px] sm:min-h-[105px] p-2 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative select-none
                      ${
                        isToday
                          ? 'bg-[#e7f0fa] border-[#0064e0] ring-2 ring-[#0082fb]/50 shadow-xs'
                          : hasHoliday
                          ? 'bg-[#e7f0fa] border-[#dde5ec] hover:border-[#0064e0] hover:shadow-md hover:-translate-y-0.5'
                          : cell.isCurrentMonth
                          ? isWeekend
                            ? 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-[#e7f0fa]/60 hover:border-[#0082fb]'
                            : 'bg-white border-[#dde5ec] hover:bg-[#e7f0fa]/60 hover:border-[#0082fb] hover:-translate-y-0.5'
                          : 'bg-[#f8fafc]/50 border-slate-100 opacity-40 hover:opacity-80'
                      }
                    `}
                  >
                    {/* Top Row: Date Number & Badges */}
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`
                          text-xs font-black font-mono inline-flex items-center justify-center w-6 h-6 rounded-lg transition-colors
                          ${
                            isToday
                              ? 'bg-[#0064e0] text-white shadow-xs'
                              : hasHoliday
                              ? 'text-[#0064e0] bg-[#e7f0fa]'
                              : cell.isCurrentMonth
                              ? 'text-[#1c2b33] group-hover:text-[#0064e0]'
                              : 'text-slate-400'
                          }
                        `}
                      >
                        {cell.dayNumber}
                      </span>

                      {isToday && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#0064e0] text-white font-heading">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Bottom Content: Holiday Pill & Description */}
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

                      {!hasHoliday && cell.isCurrentMonth && (
                        <div className="opacity-0 group-hover:opacity-100 text-[10px] text-[#0064e0] font-semibold flex items-center gap-1 transition-opacity">
                          <Plus size={10} />
                          <span>Add</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend & Categories */}
            <div className="pt-3 border-t border-[#d6e2f0] flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-[11px] font-bold text-[#0064e0] uppercase tracking-wider font-heading">Legend:</span>
                {Object.entries(TYPE_COLORS).map(([typeKey, config]) => (
                  <div key={typeKey} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                    <span className="text-xs font-bold text-[#1c2b33]">{typeKey}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Click any calendar day cell to add or edit holiday schedules.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Synchronized Holiday Management & List Section */}
      <Card
        headerVariant="softBlue"
        title={`Holiday Directory (${filteredHolidays.length})`}
        subtitle="Manage official calendar non-working days, edit dates, and filter by classification."
        actions={
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#dde5ec] rounded-xl text-xs font-bold text-[#1c2b33] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0]"
            >
              <option value="">All Categories</option>
              <option value="National">National Holidays</option>
              <option value="Religious">Religious Holidays</option>
              <option value="Company">Company Events</option>
              <option value="Other">Other Non-Working</option>
            </select>
          </div>
        }
      >
        {filteredHolidays.length === 0 ? (
          <EmptyState
            title="No holidays found"
            description={
              searchTerm || typeFilter
                ? 'No holidays match your search query.'
                : 'No official holidays registered for this year yet.'
            }
            icon={CalendarDays}
            action={() => handleAdd()}
            actionLabel="Add New Holiday"
          />
        ) : (
          <div className="overflow-x-auto -mx-6 -my-6">
            <table className="w-full text-sm">
              <thead className="bg-[#f1f5f8] text-[#0064e0] border-b border-[#dde5ec]">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#0064e0]">
                    Holiday Name
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#0064e0]">
                    Official Date Range
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#0064e0]">
                    Category
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#0064e0]">
                    Description
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#0064e0]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7f0fa] bg-white">
                {paginatedHolidays.map((holiday) => {
                  const startStr = formatLocalDate(holiday.start_date || holiday.holiday_date);
                  const endStr = formatLocalDate(holiday.end_date || holiday.start_date || holiday.holiday_date);
                  const style = TYPE_COLORS[holiday.type] || TYPE_COLORS.National;

                  return (
                    <tr key={holiday.id} className="hover:bg-[#e7f0fa]/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-2xs ${style.bg}`}>
                            <CalendarDays size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-[#1c2b33] text-xs sm:text-sm">
                              {holiday.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#1c2b33]">
                        {startStr === endStr ? startStr : `${startStr} → ${endStr}`}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${style.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {holiday.type}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate font-medium">
                        {holiday.description || 'Official non-working day'}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(holiday)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0064e0] hover:bg-[#e7f0fa] transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(holiday.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pt-4 border-t border-[#dde5ec]">
            <Pagination
              page={page}
              limit={limit}
              total={filteredHolidays.length}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>

      {/* ── Centered Add / Edit Holiday Modal Dialog ─────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHoliday ? 'Edit Holiday Details' : 'Add New Holiday'}
        subtitle="Configure the holiday designation, start date, end date, and classification."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-extrabold text-[#1c2b33] uppercase tracking-wider mb-1.5">
              Holiday Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Independence Day, Summer Break"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dde5ec] rounded-xl text-sm font-semibold text-[#1c2b33] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-extrabold text-[#1c2b33] uppercase tracking-wider mb-1.5">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#dde5ec] rounded-xl text-sm font-semibold text-[#1c2b33] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold text-[#1c2b33] uppercase tracking-wider mb-1.5">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#dde5ec] rounded-xl text-sm font-semibold text-[#1c2b33] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold text-[#1c2b33] uppercase tracking-wider mb-1.5">
              Classification Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dde5ec] rounded-xl text-sm font-semibold text-[#1c2b33] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0] cursor-pointer transition-all"
            >
              <option value="National">National Public Holiday</option>
              <option value="Religious">Religious Holiday</option>
              <option value="Company">Company Holiday / Bridge</option>
              <option value="Other">Other Non-Working</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold text-[#1c2b33] uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Additional details regarding paid status or company guidance…"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dde5ec] rounded-xl text-sm font-medium text-[#1c2b33] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0] resize-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#dde5ec]">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingHoliday ? 'Save Changes' : 'Save Holiday'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Holidays;
