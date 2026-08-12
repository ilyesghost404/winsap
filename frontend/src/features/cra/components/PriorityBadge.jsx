import { Flag, ArrowUp, ArrowDown, Minus } from 'lucide-react';

/**
 * Color-coded priority badge with icon.
 * Maps numeric priority (0-3) or string ("high"/"medium"/"low") to visual.
 */
const PriorityBadge = ({ priority, className = '' }) => {
  const getPriorityConfig = (p) => {
    const val = typeof p === 'string' ? p.toLowerCase() : Number(p);

    if (val === 'high' || val === 'urgent' || val >= 3) {
      return {
        label: 'High',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        icon: ArrowUp,
        dot: 'bg-rose-500'
      };
    }
    if (val === 'medium' || val === 2) {
      return {
        label: 'Medium',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: Minus,
        dot: 'bg-amber-500'
      };
    }
    // low or 0/1
    return {
      label: 'Low',
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: ArrowDown,
      dot: 'bg-slate-400'
    };
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <Icon size={11} strokeWidth={2.5} />
      {config.label}
    </span>
  );
};

export default PriorityBadge;
