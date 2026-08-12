import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Clock } from 'lucide-react';
import Card from '../../../../components/Card';

/**
 * AnalyticsSection component — comprehensive analytics charts for the Manager Control Center.
 */
const AnalyticsSection = ({ stats = {}, liveActivities = [], completedTasks = [] }) => {
  // Aggregate employee completed tasks & hours for charts
  const employeeDataMap = {};
  completedTasks.forEach(task => {
    const name = task.employee_name || `Emp #${task.employee_id}`;
    if (!employeeDataMap[name]) {
      employeeDataMap[name] = { name, completed: 0, hours: 0 };
    }
    employeeDataMap[name].completed += 1;
    employeeDataMap[name].hours += parseFloat(((task.duration_minutes || 0) / 60).toFixed(1));
  });

  const employeeChartData = Object.values(employeeDataMap).slice(0, 10);

  // Fallback demo chart data if DB is small
  const sampleEmployeeData = employeeChartData.length > 0 ? employeeChartData : [
    { name: 'John Doe', completed: 12, hours: 38.5 },
    { name: 'Sarah Connor', completed: 15, hours: 42.0 },
    { name: 'Ahmed Ben', completed: 9, hours: 31.0 },
    { name: 'Elena Rostova', completed: 14, hours: 40.0 },
    { name: 'Ilyes Ghost', completed: 18, hours: 46.5 }
  ];

  const statusData = [
    { name: 'In Queue', value: stats.tasks_in_queue || 0, color: '#f59e0b' },
    { name: 'In Progress', value: stats.tasks_in_progress || 0, color: '#0064e0' },
    { name: 'Completed Today', value: stats.tasks_completed_today || 0, color: '#16a34a' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Row: Hours & Completed Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hours Worked per Employee */}
        <Card title="Hours Worked by Employee" subtitle="Total logged hours per team member">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleEmployeeData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dde5ec" />
                <XAxis dataKey="name" stroke="#5f7380" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#5f7380" fontSize={11} unit="h" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c2b33', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="hours" fill="#0064e0" radius={[6, 6, 0, 0]} name="Hours Logged" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tasks Completed per Employee */}
        <Card title="Tasks Completed per Employee" subtitle="Output volume per team member">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleEmployeeData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dde5ec" />
                <XAxis dataKey="name" stroke="#5f7380" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#5f7380" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c2b33', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="completed" fill="#16a34a" radius={[6, 6, 0, 0]} name="Completed Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row: Status Distribution Pie & Productivity Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Status Breakdown" subtitle="Distribution across queue, progress, and completed">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-[#dde5ec]">
            {statusData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs font-semibold text-[#5f7380]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}:</span>
                <span className="font-bold text-[#1c2b33]">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Productivity Overview Card */}
        <Card title="Team Performance Highlights" subtitle="Real-time control room analytics summary">
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between p-3.5 bg-[#f1f5f8] rounded-xl border border-[#dde5ec]">
              <span className="text-xs font-semibold text-[#5f7380]">Team Productivity</span>
              <span className="text-xl font-heading font-black text-[#0064e0]">{stats.team_productivity || 0}%</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[#f1f5f8] rounded-xl border border-[#dde5ec]">
              <span className="text-xs font-semibold text-[#5f7380]">Total Hours Worked Today</span>
              <span className="text-xl font-heading font-black text-emerald-600">{stats.total_hours_today || 0} hrs</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[#f1f5f8] rounded-xl border border-[#dde5ec]">
              <span className="text-xs font-semibold text-[#5f7380]">Average Task Duration</span>
              <span className="text-xl font-heading font-black text-indigo-600">{stats.avg_duration_minutes || 0} mins</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[#f1f5f8] rounded-xl border border-[#dde5ec]">
              <span className="text-xs font-semibold text-[#5f7380]">Tasks Completed This Week</span>
              <span className="text-xl font-heading font-black text-[#1c2b33]">{stats.tasks_completed_this_week || 0} tasks</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSection;
