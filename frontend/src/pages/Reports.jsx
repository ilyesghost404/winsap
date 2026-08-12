import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FileSpreadsheet, FileText, Printer, RefreshCw, Users,
  CalendarOff, Clock, CheckCircle2, Calendar, TrendingUp,
  BarChart3, PieChart, Search, Filter, ArrowDownToLine, ChevronRight,
  AlertCircle, Sparkles, Building2, Zap
} from 'lucide-react';
import Card from '../components/Card';
import StatsCard from '../components/StatsCard';
import Table from '../components/Table';
import Button from '../components/Button';
import LoadingSpinner, { SkeletonCard, SkeletonTable } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import {
  getReportStats,
  getMonthlyEvolution,
  getDepartmentStats,
  getAbsenceTypes,
  getEmployeeRanking,
  getDetailedAbsences,
  exportToExcel,
  printReport,
  getAttendanceMatrix
} from '../services/reportService';
import api from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
  PieChart as RechartsPieChart, Pie, Legend
} from 'recharts';

const CustomTooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #d6e2f0',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)',
  fontSize: '12px',
  color: '#172033',
  fontWeight: 'bold',
};

const CHART_COLORS = ['#0064e0', '#0082fb', '#1c2b33', '#004fb3', '#2563eb', '#38bdf8'];

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [rankingData, setRankingData] = useState([]);
  const [detailedData, setDetailedData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [formFilters, setFormFilters] = useState({
    department_id: '',
    timePeriod: 'this_month',
    month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    start_date: '',
    end_date: '',
  });

  const [activeFilters, setActiveFilters] = useState({
    department_id: '',
    start_date: '',
    end_date: '',
    month: '',
    page: 1,
    limit: 10,
  });

  const [departments, setDepartments] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [matrixYear, setMatrixYear] = useState(new Date().getFullYear());
  const [matrixMonth, setMatrixMonth] = useState(new Date().getMonth() + 1);
  const [matrixData, setMatrixData] = useState({
    matrix: [],
    daysInMonth: Array.from(
      { length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() },
      (_, i) => i + 1
    ),
    totalDays: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [matrixLoading, setMatrixLoading] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await api.get('/departments');
        setDepartments(Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to load departments', error);
      }
    };
    loadDepartments();
  }, []);

  const fetchMatrixData = useCallback(async () => {
    try {
      setMatrixLoading(true);
      const data = await getAttendanceMatrix(matrixYear, matrixMonth);
      if (data) {
        const total = data.totalDays || new Date(matrixYear, matrixMonth, 0).getDate();
        setMatrixData({
          matrix: Array.isArray(data.matrix) ? data.matrix : [],
          daysInMonth: Array.isArray(data.daysInMonth) && data.daysInMonth.length > 0
            ? data.daysInMonth
            : Array.from({ length: total }, (_, i) => i + 1),
          totalDays: total,
          year: data.year || matrixYear,
          month: data.month || matrixMonth,
        });
      }
    } catch (error) {
      console.error('Error fetching attendance matrix:', error);
      toast.error('Failed to load attendance matrix data');
    } finally {
      setMatrixLoading(false);
    }
  }, [matrixYear, matrixMonth]);

  useEffect(() => {
    fetchMatrixData();
  }, [fetchMatrixData]);

  const applyFilters = useCallback(() => {
    let start_date = formFilters.start_date;
    let end_date = formFilters.end_date;
    let month = '';

    const today = new Date();
    if (formFilters.timePeriod === 'this_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      start_date = firstDay.toISOString().split('T')[0];
      end_date = lastDay.toISOString().split('T')[0];
    } else if (formFilters.timePeriod === 'last_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      start_date = firstDay.toISOString().split('T')[0];
      end_date = lastDay.toISOString().split('T')[0];
    } else if (formFilters.timePeriod === 'specific_month' && formFilters.month) {
      const [year, monthStr] = formFilters.month.split('-');
      const firstDay = new Date(parseInt(year, 10), parseInt(monthStr, 10) - 1, 1);
      const lastDay = new Date(parseInt(year, 10), parseInt(monthStr, 10), 0);
      start_date = firstDay.toISOString().split('T')[0];
      end_date = lastDay.toISOString().split('T')[0];
      month = formFilters.month;
    }

    setActiveFilters({
      department_id: formFilters.department_id,
      start_date,
      end_date,
      month,
      page: 1,
      limit: 10,
    });
  }, [formFilters]);

  useEffect(() => {
    applyFilters();
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const [statsRes, monthlyRes, deptRes, typesRes, rankingRes, detailedRes] =
        await Promise.allSettled([
          getReportStats(activeFilters),
          getMonthlyEvolution(activeFilters),
          getDepartmentStats(activeFilters),
          getAbsenceTypes(activeFilters),
          getEmployeeRanking(activeFilters),
          getDetailedAbsences(activeFilters),
        ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value || null);
      }
      setMonthlyData(monthlyRes.status === 'fulfilled' && Array.isArray(monthlyRes.value) ? monthlyRes.value : []);
      setDepartmentData(deptRes.status === 'fulfilled' && Array.isArray(deptRes.value) ? deptRes.value : []);
      setTypeData(typesRes.status === 'fulfilled' && Array.isArray(typesRes.value) ? typesRes.value : []);
      setRankingData(rankingRes.status === 'fulfilled' && Array.isArray(rankingRes.value) ? rankingRes.value : []);

      if (detailedRes.status === 'fulfilled' && detailedRes.value) {
        setDetailedData(Array.isArray(detailedRes.value.data) ? detailedRes.value.data : []);
        setPagination({
          page: detailedRes.value.page || 1,
          limit: detailedRes.value.limit || 10,
          total: detailedRes.value.total || 0,
          totalPages: detailedRes.value.totalPages || 0,
        });
      }
    } catch (error) {
      console.error('Error loading reports data:', error);
      setFetchError('Unable to load reports data. Please check your network and try again.');
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleExportExcel = () => {
    setIsExportModalOpen(true);
  };

  const handleConfirmExport = async () => {
    try {
      setExporting(true);
      await exportToExcel(selectedYear, selectedMonth);
      toast.success('Report exported to Excel successfully!');
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export Excel report');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    printReport();
  };

  // Safe Matrix day list computation
  const daysInMatrix = (matrixData && Array.isArray(matrixData.daysInMonth) && matrixData.daysInMonth.length > 0)
    ? matrixData.daysInMonth
    : Array.from(
        { length: (matrixData && matrixData.totalDays) || new Date(matrixYear, matrixMonth, 0).getDate() },
        (_, i) => i + 1
      );

  const matrixRows = (matrixData && Array.isArray(matrixData.matrix)) ? matrixData.matrix : [];

  return (
    <div className="space-y-6">
      {/* ── Premium Blue Hero Banner ─────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] to-[#0064e0] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-100 font-heading mb-1.5">
              <Zap size={14} className="text-blue-100" />
              <span>Workforce Intelligence & Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              REPORTS & AUDIT MATRIX
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Cross-department absenteeism rates, monthly trends, and high-fidelity attendance log matrix.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button variant="secondary" icon={Printer} onClick={handlePrint} size="sm">
              Print Report
            </Button>
            <Button variant="navy" icon={FileSpreadsheet} onClick={handleExportExcel} size="sm">
              Export Excel (.xlsx)
            </Button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Error Banner with Retry */}
      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold text-rose-700 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{fetchError}</span>
          </div>
          <Button size="xs" variant="secondary" onClick={fetchAllData} icon={RefreshCw}>
            Retry
          </Button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#d6e2f0] p-4.5 shadow-premium-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-[11px] font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
              Department
            </label>
            <select
              value={formFilters.department_id}
              onChange={(e) => setFormFilters({ ...formFilters, department_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#f1f5ff] border border-[#d6e2f0] rounded-xl text-xs font-bold text-[#172033] cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
              Time Period
            </label>
            <select
              value={formFilters.timePeriod}
              onChange={(e) => setFormFilters({ ...formFilters, timePeriod: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#f1f5ff] border border-[#d6e2f0] rounded-xl text-xs font-bold text-[#172033] cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
            >
              <option value="this_month">Current Month</option>
              <option value="last_month">Last Month</option>
              <option value="specific_month">Specific Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {formFilters.timePeriod === 'specific_month' ? (
            <div>
              <label className="block text-[11px] font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                Month Picker
              </label>
              <input
                type="month"
                value={formFilters.month}
                onChange={(e) => setFormFilters({ ...formFilters, month: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f1f5ff] border border-[#d6e2f0] rounded-xl text-xs font-semibold text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
              />
            </div>
          ) : formFilters.timePeriod === 'custom' ? (
            <>
              <div>
                <label className="block text-[11px] font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formFilters.start_date}
                  onChange={(e) => setFormFilters({ ...formFilters, start_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f1f5ff] border border-[#d6e2f0] rounded-xl text-xs font-semibold text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={formFilters.end_date}
                  onChange={(e) => setFormFilters({ ...formFilters, end_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f1f5ff] border border-[#d6e2f0] rounded-xl text-xs font-semibold text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
                />
              </div>
            </>
          ) : null}

          <div className="flex items-end">
            <Button icon={Filter} onClick={applyFilters} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards (Rich Hierarchy) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Lost Days"
            value={stats?.totalAbsences ?? 0}
            subtitle="Company wide days off"
            icon={CalendarOff}
            variant="blue"
          />
          <StatsCard
            title="Absence Rate"
            value={`${stats?.absenceRate ?? 0}%`}
            subtitle="Workforce impact"
            icon={TrendingUp}
            variant="softBlue"
          />
          <StatsCard
            title="Most Impacted"
            value={stats?.mostImpactedDepartment || 'None'}
            subtitle="Highest absent count"
            icon={Building2}
            colorClass="text-violet-600"
            bgClass="bg-violet-50 border border-violet-200"
          />
          <StatsCard
            title="Avg Absence Span"
            value={`${stats?.avgDuration ?? 0}d`}
            subtitle="Average leave length"
            icon={Clock}
            colorClass="text-amber-600"
            bgClass="bg-amber-50 border border-amber-200"
          />
        </div>
      )}

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Evolution */}
        <Card
          headerVariant="softBlue"
          title="Monthly Absence Evolution"
          subtitle="Total company-wide absent days per month across the last 12 months"
        >
          {loading ? (
            <div className="h-68 flex items-center justify-center">
              <LoadingSpinner size="md" text="Loading trend data…" />
            </div>
          ) : monthlyData.length === 0 ? (
            <div className="h-68 flex items-center justify-center text-slate-400 text-xs font-semibold">
              No trend data available for selected period
            </div>
          ) : (
            <div className="h-68">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5ff" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11, fontWeight: 600 }} allowDecimals={false} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0064e0"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0064e0', strokeWidth: 2, stroke: '#e7f0fa' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Department Stats */}
        <Card
          headerVariant="softBlue"
          title="Department Absence Comparison"
          subtitle="Total accumulated absent days per operational division"
        >
          {loading ? (
            <div className="h-68 flex items-center justify-center">
              <LoadingSpinner size="md" text="Loading department comparison…" />
            </div>
          ) : departmentData.length === 0 ? (
            <div className="h-68 flex items-center justify-center text-slate-400 text-xs font-semibold">
              No department data available
            </div>
          ) : (
            <div className="h-68">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5ff" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11, fontWeight: 600 }} allowDecimals={false} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Bar dataKey="absences" radius={[6, 6, 0, 0]}>
                    {departmentData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Charts Row 2: Absence Types Breakdown & Employee Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          headerVariant="softBlue"
          title="Absence Type Breakdown"
          subtitle="Distribution of leave categories"
        >
          {loading ? (
            <div className="h-60 flex items-center justify-center">
              <LoadingSpinner size="sm" text="Loading types…" />
            </div>
          ) : typeData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-400 text-xs font-semibold">
              No absence type data available
            </div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {typeData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card
          headerVariant="softBlue"
          title="Highest Absence Accumulation"
          subtitle="Top employee absence frequency and working days lost"
          className="lg:col-span-2"
        >
          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="sm" text="Loading rankings…" />
            </div>
          ) : rankingData.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-semibold">
              No employee rankings recorded
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 -my-6">
              <table className="w-full text-sm">
                <thead className="bg-[#f1f5f8] text-[#2563eb] border-b border-[#dde5ec]">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                      Employee
                    </th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                      Department
                    </th>
                    <th className="px-4 py-3.5 text-right text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                      Absence Days
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7f0fa] bg-white">
                  {rankingData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="hover:bg-[#e7f0fa]/60 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-[#172033] text-xs">{row.name}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">{row.department || '—'}</td>
                      <td className="px-4 py-3.5 text-right text-xs font-black text-[#2563eb] font-mono">
                        {row.count}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── Monthly Attendance Matrix Table ──────────────────────── */}
      <Card
        headerVariant="blue"
        title={
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full text-white">
            <span className="font-heading font-black text-white">
              MONTHLY ATTENDANCE MATRIX ·{' '}
              {new Date(matrixYear, matrixMonth - 1, 1).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              }).toUpperCase()}
            </span>
            <div className="flex items-center gap-2">
              <select
                value={matrixMonth}
                onChange={(e) => setMatrixMonth(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 bg-white/15 text-white border border-white/30 rounded-xl text-xs font-bold cursor-pointer focus:bg-[#1d4ed8] focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1} className="text-[#172033] bg-white">
                    {new Date(0, i).toLocaleString('default', { month: 'short' })}
                  </option>
                ))}
              </select>
              <select
                value={matrixYear}
                onChange={(e) => setMatrixYear(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 bg-white/15 text-white border border-white/30 rounded-xl text-xs font-bold cursor-pointer focus:bg-[#1d4ed8] focus:outline-none"
              >
                {[matrixYear - 1, matrixYear, matrixYear + 1].map((y) => (
                  <option key={y} value={y} className="text-[#172033] bg-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto -mx-6 -my-6 max-h-100 custom-scrollbar">
          {matrixLoading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="md" text="Loading attendance matrix…" />
            </div>
          ) : matrixRows.length > 0 ? (
            <table className="w-full text-xs">
              <thead className="bg-[#f1f5f8] text-[#2563eb] sticky top-0 z-20 border-b border-[#dde5ec]">
                <tr>
                  <th className="sticky left-0 bg-[#f1f5f8] z-30 px-5 py-3 text-left font-extrabold text-[#2563eb] border-r border-[#dde5ec] min-w-[160px] font-heading">
                    Employee
                  </th>
                  <th className="px-3 py-3 text-left font-bold text-slate-500 min-w-[90px]">Matricule</th>
                  <th className="px-3 py-3 text-left font-bold text-slate-500 min-w-[110px]">Department</th>
                  {daysInMatrix.map((day) => {
                    const d = new Date(matrixYear, matrixMonth - 1, day);
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <th
                        key={day}
                        className={`px-2 py-3 text-center font-bold border-r border-[#dde5ec] min-w-[32px] ${
                          isWeekend ? 'bg-[#f4f7fc] text-slate-400' : 'text-[#2563eb]'
                        }`}
                      >
                        {day}
                      </th>
                    );
                  })}
                  <th className="sticky right-0 bg-[#e7f0fa] z-30 px-3 py-3 font-extrabold text-[#2563eb] border-l border-[#dde5ec] text-center min-w-[70px]">
                    Worked
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7f0fa] bg-white">
                {matrixRows.map((row) => (
                  <tr key={row.employee_id} className="hover:bg-[#e7f0fa]/60 transition-colors">
                    <td className="sticky left-0 bg-white z-10 px-5 py-2.5 font-bold text-[#172033] border-r border-[#dde5ec] shadow-xs truncate max-w-[160px]">
                      {row.name}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-500 font-semibold">{row.matricule}</td>
                    <td className="px-3 py-2.5 text-slate-600 font-medium truncate max-w-[110px]">{row.department}</td>
                    {(Array.isArray(row.dailyStatus) ? row.dailyStatus : []).map((dayStatus, idx) => {
                      let cellBg = '';
                      let cellText = 'text-slate-700';

                      if (dayStatus.status === 'weekend') {
                        cellBg = 'bg-[#f4f7fc]';
                        cellText = 'text-slate-300';
                      } else if (dayStatus.status === 'holiday') {
                        cellBg = 'bg-blue-50';
                        cellText = 'text-[#2563eb] font-bold';
                      } else if (dayStatus.status === 'absent') {
                        cellBg = 'bg-rose-50';
                        cellText = 'text-rose-700 font-black';
                      } else if (dayStatus.status === 'present') {
                        cellText = 'text-emerald-600 font-black';
                      }

                      return (
                        <td
                          key={idx}
                          className={`px-1 py-2.5 text-center border-r border-[#e7f0fa] ${cellBg} ${cellText}`}
                          title={dayStatus.hoverText}
                        >
                          {dayStatus.label}
                        </td>
                      );
                    })}
                    <td className="sticky right-0 bg-[#e7f0fa] z-10 px-3 py-2.5 font-black text-[#2563eb] text-center border-l border-[#dde5ec] font-mono">
                      {row.totalWorkedDays}d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs font-semibold">
              No attendance matrix records found for this period
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-[#d6e2f0] bg-[#f4f7fc] flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold text-slate-600">
          <span className="flex items-center gap-1.5"><span className="text-emerald-600 font-black">✓</span> Present</span>
          <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.2 bg-rose-50 text-rose-600 rounded border border-rose-200 font-black">A</span> Absence</span>
          <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.2 bg-blue-50 text-[#2563eb] rounded border border-[#bfdbfe] font-black">V</span> Vacation</span>
          <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.2 bg-rose-50 text-rose-600 rounded border border-rose-200 font-black">S</span> Sick</span>
          <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-600 rounded border border-indigo-200 font-black">T</span> Telework</span>
          <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200 font-black">H</span> Holiday</span>
        </div>
      </Card>

      {/* Export Month Selection Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Intelligence Report to Excel"
        subtitle="Choose the target month and year to generate a formatted spreadsheet report."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] cursor-pointer"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d6e2f0]">
            <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button icon={FileSpreadsheet} onClick={handleConfirmExport} loading={exporting}>
              Download Excel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reports;
