import { ListTodo, Play, CheckCircle2, Clock, CalendarDays } from 'lucide-react';
import StatsCard from '../../../components/StatsCard';

/**
 * Horizontal row of summary stat cards for the CRA dashboard.
 */
const CRAStatsBar = ({ stats = {}, monthlyStats = {}, isManager = false }) => {
  const employeeCards = [
    {
      title: 'In Queue',
      value: stats?.pending_start || 0,
      subtitle: 'Tasks awaiting start',
      icon: ListTodo,
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50 border border-amber-200'
    },
    {
      title: 'In Progress',
      value: stats?.in_progress || 0,
      subtitle: 'Currently active',
      icon: Play,
      variant: (stats?.in_progress || 0) > 0 ? 'softBlue' : 'default'
    },
    {
      title: 'Completed',
      value: stats?.completed || 0,
      subtitle: 'Tasks finished',
      icon: CheckCircle2,
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50 border border-emerald-200'
    },
    {
      title: 'Hours This Month',
      value: monthlyStats?.total_hours_month || 0,
      subtitle: `${monthlyStats?.completed_this_week || 0} completed this week`,
      icon: Clock,
      variant: 'softBlue'
    },
    {
      title: 'Days This Month',
      value: monthlyStats?.total_days_month || 0,
      subtitle: `Avg: ${monthlyStats?.avg_duration_minutes || 0}min per task`,
      icon: CalendarDays
    }
  ];

  const managerCards = [
    {
      title: 'Total Tasks',
      value: stats?.total || 0,
      subtitle: `${stats?.approved || 0} approved`,
      icon: ListTodo,
      variant: 'gradient'
    },
    {
      title: 'In Queue',
      value: stats?.pending_start || 0,
      subtitle: 'Awaiting start',
      icon: ListTodo,
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50 border border-amber-200'
    },
    {
      title: 'In Progress',
      value: stats?.in_progress || 0,
      subtitle: `${monthlyStats?.active_employees || 0} active employees`,
      icon: Play,
      variant: (stats?.in_progress || 0) > 0 ? 'softBlue' : 'default'
    },
    {
      title: 'Completed Today',
      value: monthlyStats?.completed_today || 0,
      subtitle: `${monthlyStats?.completed_this_week || 0} this week`,
      icon: CheckCircle2,
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50 border border-emerald-200'
    },
    {
      title: 'Hours This Month',
      value: monthlyStats?.total_hours_month || 0,
      subtitle: `Avg: ${monthlyStats?.avg_duration_minutes || 0}min per task`,
      icon: Clock,
      variant: 'softBlue'
    }
  ];

  const cards = isManager ? managerCards : employeeCards;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <StatsCard
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            variant={card.variant || 'default'}
            colorClass={card.colorClass}
            bgClass={card.bgClass}
          />
        </div>
      ))}
    </div>
  );
};

export default CRAStatsBar;
