import { UserCheck, ListTodo, Play, CheckCircle2, CalendarDays, Clock, Timer, Zap } from 'lucide-react';
import StatsCard from '../../../../components/StatsCard';

/**
 * 8 Live Control Room metric cards for the Manager Dashboard.
 */
const ManagerStatsGrid = ({ stats = {} }) => {
  const cards = [
    {
      title: 'Working Now',
      value: stats.employees_working_now || 0,
      subtitle: 'Active live timers',
      icon: UserCheck,
      variant: (stats.employees_working_now || 0) > 0 ? 'gradient' : 'default',
      colorClass: 'text-[#0064e0]',
      bgClass: 'bg-[#e7f0fa] border border-[#dde5ec]'
    },
    {
      title: 'Tasks In Queue',
      value: stats.tasks_in_queue || 0,
      subtitle: 'Awaiting employee start',
      icon: ListTodo,
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50 border border-amber-200'
    },
    {
      title: 'Tasks In Progress',
      value: stats.tasks_in_progress || 0,
      subtitle: 'Currently running',
      icon: Play,
      variant: (stats.tasks_in_progress || 0) > 0 ? 'softBlue' : 'default'
    },
    {
      title: 'Completed Today',
      value: stats.tasks_completed_today || 0,
      subtitle: 'Finished today',
      icon: CheckCircle2,
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50 border border-emerald-200'
    },
    {
      title: 'Completed This Week',
      value: stats.tasks_completed_this_week || 0,
      subtitle: 'Current week total',
      icon: CalendarDays,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50 border border-blue-200'
    },
    {
      title: 'Hours Worked Today',
      value: `${stats.total_hours_today || 0}h`,
      subtitle: 'Across all employees',
      icon: Clock,
      variant: 'softBlue'
    },
    {
      title: 'Avg Task Duration',
      value: `${stats.avg_duration_minutes || 0}m`,
      subtitle: 'Average per completed task',
      icon: Timer
    },
    {
      title: 'Team Productivity',
      value: `${stats.team_productivity || 0}%`,
      subtitle: 'Overall completion rate',
      icon: Zap,
      progress: stats.team_productivity || 0,
      variant: 'default'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <StatsCard
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            variant={card.variant || 'default'}
            colorClass={card.colorClass}
            bgClass={card.bgClass}
            progress={card.progress}
          />
        </div>
      ))}
    </div>
  );
};

export default ManagerStatsGrid;
