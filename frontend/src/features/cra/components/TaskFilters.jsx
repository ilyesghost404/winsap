import { useState } from 'react';
import { Search, SlidersHorizontal, X, Calendar } from 'lucide-react';

/**
 * Advanced filter bar for CRA tasks.
 * Search, priority filter, date range, and employee filter (manager only).
 */
const TaskFilters = ({ filters, onFiltersChange, isManager = false, className = '' }) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      priority: '',
      status: '',
      startDate: '',
      endDate: '',
      employeeId: ''
    });
  };

  const hasActiveFilters = filters.priority || filters.status || filters.startDate || filters.endDate || filters.employeeId;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Primary row: Search + Toggle */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f7380]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search tasks by ticket, description..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#dde5ec] rounded-xl
              focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0]
              placeholder:text-[#5f7380]/60 font-medium transition-all"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`
            inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer
            ${expanded || hasActiveFilters
              ? 'bg-[#0064e0] text-white border-blue-400/30 shadow-electric-glow'
              : 'bg-white text-[#5f7380] border-[#dde5ec] hover:bg-[#f1f5f8] hover:text-[#1c2b33]'
            }
          `}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasActiveFilters && (
            <span className="w-4 h-4 rounded-full bg-white text-[#0064e0] text-[10px] font-black flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-[#f1f5f8] rounded-xl border border-[#dde5ec] animate-fade-in">
          {/* Status filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#5f7380] uppercase tracking-wider">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-white border border-[#dde5ec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0] cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_START">In Queue</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#5f7380] uppercase tracking-wider">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-white border border-[#dde5ec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0] cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="3">High</option>
              <option value="2">Medium</option>
              <option value="1">Low</option>
            </select>
          </div>

          {/* Date range */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#5f7380] uppercase tracking-wider">From</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-white border border-[#dde5ec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0] cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#5f7380] uppercase tracking-wider">To</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-white border border-[#dde5ec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0] cursor-pointer"
            />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="self-end inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-all cursor-pointer"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
