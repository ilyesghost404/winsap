import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  colorClass = 'text-[#0064e0]',
  bgClass = 'bg-[#e7f0fa] border border-[#dde5ec]',
  progress = null, // e.g. 75 (%)
  variant = 'default', // 'default' | 'softBlue' | 'blue' | 'gradient'
  className = '',
  onClick
}) => {
  if (variant === 'blue' || variant === 'gradient') {
    return (
      <div
        onClick={onClick}
        className={`
          relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c2b33] to-[#0064e0] text-white p-6 shadow-electric-glow border border-blue-400/30 transition-all duration-200
          ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl' : ''}
          ${className}
        `}
      >
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-100 font-heading truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white">
                {value ?? 0}
              </span>
              {trend && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/20 text-white backdrop-blur-xs border border-white/30">
                  {trend.positive ? <TrendingUp size={12} /> : trend.negative ? <TrendingDown size={12} /> : <Minus size={12} />}
                  {trend.value}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs font-semibold text-blue-100 mt-1.5 truncate">
                {subtitle}
              </p>
            )}
          </div>

          {Icon && (
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/30 shadow-inner">
              <Icon size={24} className="text-white" strokeWidth={2.4} />
            </div>
          )}
        </div>

        {progress !== null && (
          <div className="mt-4 pt-3 border-t border-white/20 relative z-10">
            <div className="flex items-center justify-between text-[10px] font-bold text-blue-100 mb-1">
              <span>Target Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </div>
          </div>
        )}

        {/* Decorative background ambient glow */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/15 rounded-full blur-xl pointer-events-none" />
      </div>
    );
  }

  if (variant === 'softBlue') {
    return (
      <div
        onClick={onClick}
        className={`
          relative overflow-hidden rounded-2xl bg-[#e7f0fa] text-[#1c2b33] p-6 shadow-premium-sm border border-[#dde5ec] transition-all duration-200
          hover:shadow-blue-glow hover:border-[#0082fb] hover:-translate-y-0.5
          ${onClick ? 'cursor-pointer' : ''}
          ${className}
        `}
      >
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#0064e0] font-heading truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-[#0064e0]">
                {value ?? 0}
              </span>
              {trend && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                  trend.positive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  trend.negative ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  'bg-white text-slate-700 border-[#dde5ec]'
                }`}>
                  {trend.positive ? <TrendingUp size={12} /> : trend.negative ? <TrendingDown size={12} /> : <Minus size={12} />}
                  {trend.value}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs font-semibold text-slate-500 mt-1.5 truncate">
                {subtitle}
              </p>
            )}
          </div>

          {Icon && (
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-[#dde5ec] shadow-xs">
              <Icon size={24} className="text-[#0064e0]" strokeWidth={2.4} />
            </div>
          )}
        </div>

        {progress !== null && (
          <div className="mt-4 pt-3 border-t border-[#dde5ec] relative z-10">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
              <span>Metric Target</span>
              <span className="text-[#0064e0]">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#dde5ec] rounded-full overflow-hidden">
              <div className="h-full bg-[#0064e0] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default crisp white Meta card
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl bg-white p-6 shadow-premium-card border border-[#dde5ec] transition-all duration-200
        hover:shadow-blue-glow hover:border-[#0082fb] hover:-translate-y-0.5
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#5f7380] font-heading truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className="text-3xl font-heading font-black tracking-tight text-[#1c2b33]">
              {value ?? 0}
            </span>
            {trend && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                  trend.positive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : trend.negative
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-[#f1f5f8] text-slate-700 border-[#dde5ec]'
                }`}
              >
                {trend.positive ? <TrendingUp size={12} /> : trend.negative ? <TrendingDown size={12} /> : <Minus size={12} />}
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs font-semibold text-slate-500 mt-1.5 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center flex-shrink-0 shadow-2xs`}>
            <Icon className={colorClass} size={22} strokeWidth={2.4} />
          </div>
        )}
      </div>

      {progress !== null && (
        <div className="mt-4 pt-3 border-t border-[#f1f5f8]">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
            <span>Progress</span>
            <span className="text-[#0064e0]">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#f1f5f8] rounded-full overflow-hidden border border-[#dde5ec]">
            <div
              className="h-full bg-gradient-to-r from-[#0064e0] to-[#0082fb] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
