import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Shield,
  UserCheck,
  Play,
  Laptop,
  HeartPulse,
  Palmtree,
  GraduationCap,
  Calendar,
  Sparkles
} from 'lucide-react';

const StatusBadge = ({ status, type = 'soft', className = '' }) => {
  const getBadgeConfig = (statusString) => {
    const s = String(statusString || '').toLowerCase().trim();

    // Success & Active
    if (['approved', 'validated', 'active', 'added', 'healthy', 'enabled', 'completed', 'success', 'present', 'enrolled', 'configured'].includes(s)) {
      return {
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: CheckCircle2,
        dot: 'bg-emerald-500 shadow-xs shadow-emerald-400',
        label: s === 'enrolled' ? 'Enrolled' : s === 'configured' ? 'Configured' : (statusString || 'Active')
      };
    }

    // In progress
    if (['in progress', 'in_progress', 'ongoing', 'running'].includes(s)) {
      return {
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: Play,
        dot: 'bg-blue-600 animate-pulse shadow-xs shadow-blue-400',
        label: 'In Progress'
      };
    }

    // Danger & Rejected
    if (['rejected', 'disabled', 'error', 'absent', 'missing', 'locked', 'failed'].includes(s)) {
      return {
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        icon: XCircle,
        dot: 'bg-rose-500 shadow-xs shadow-rose-400',
        label: statusString || 'Rejected'
      };
    }

    // Warning & Pending
    if (['pending', 'waiting', 'pending_approval', 'late', 'unknown', 'checking', 'pending start', 'pending_start', 'pending activation', 'pending_activation'].includes(s)) {
      return {
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: Clock,
        dot: 'bg-amber-500 shadow-xs shadow-amber-400',
        label: s.includes('activation') ? 'Pending Activation' : statusString === 'pending_approval' ? 'Pending Approval' : statusString === 'pending_start' ? 'Pending Start' : (statusString || 'Pending')
      };
    }

    // Not Enrolled / Not Configured / No Account
    if (['not enrolled', 'not_enrolled', 'not configured', 'not_configured', 'no account', 'no_account', 'none', 'unlinked'].includes(s)) {
      let label = 'No Account';
      if (s.includes('enrolled')) label = 'Not Enrolled';
      if (s.includes('configured')) label = 'Not Configured';
      return {
        color: 'text-slate-600',
        bg: 'bg-slate-100',
        border: 'border-slate-200/80',
        icon: AlertCircle,
        dot: 'bg-slate-400',
        label
      };
    }

    // Leave Types
    if (['telework', 'remote'].includes(s)) {
      return {
        color: 'text-indigo-700',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        icon: Laptop,
        dot: 'bg-indigo-500',
        label: 'Telework'
      };
    }

    if (['vacation', 'conges payes', 'paid leave'].includes(s)) {
      return {
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: Palmtree,
        dot: 'bg-blue-600',
        label: 'Vacation'
      };
    }

    if (['sick leave', 'sick', 'maladie', 'malade'].includes(s)) {
      return {
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        icon: HeartPulse,
        dot: 'bg-rose-500',
        label: 'Sick Leave'
      };
    }

    if (['training', 'formation'].includes(s)) {
      return {
        color: 'text-violet-700',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        icon: GraduationCap,
        dot: 'bg-violet-500',
        label: 'Training'
      };
    }

    // Roles
    if (['admin', 'administrator'].includes(s)) {
      return {
        color: 'text-violet-800',
        bg: 'bg-violet-100',
        border: 'border-violet-200',
        icon: Shield,
        dot: 'bg-violet-600',
        label: 'Admin'
      };
    }

    if (['manager'].includes(s)) {
      return {
        color: 'text-blue-800',
        bg: 'bg-blue-100',
        border: 'border-blue-200',
        icon: UserCheck,
        dot: 'bg-blue-600',
        label: 'Manager'
      };
    }

    if (['employee'].includes(s)) {
      return {
        color: 'text-slate-700',
        bg: 'bg-slate-100',
        border: 'border-slate-200',
        icon: UserCheck,
        dot: 'bg-slate-500',
        label: 'Employee'
      };
    }

    // Default fallback
    return {
      color: 'text-slate-700',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      icon: AlertCircle,
      dot: 'bg-slate-400',
      label: statusString || '—'
    };
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  if (type === 'dot') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${config.bg} ${config.color} ${config.border} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  }

  if (type === 'outline') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border bg-white ${config.border} ${config.color} ${className}`}>
        <Icon size={12} className="flex-shrink-0" />
        {config.label}
      </span>
    );
  }

  // Default 'soft' pill
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${config.bg} ${config.color} ${config.border} shadow-2xs ${className}`}>
      <Icon size={12} className="flex-shrink-0" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
