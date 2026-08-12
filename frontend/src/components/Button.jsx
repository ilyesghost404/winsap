import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  size = 'md',
  icon: Icon,
  loading = false,
  type = 'button',
  title
}) => {
  const variants = {
    primary:
      'bg-[#1c2b33] hover:bg-[#152229] active:bg-[#0f191f] text-white shadow-electric-glow hover:shadow-cyan-glow border border-blue-400/30 font-bold',
    secondary:
      'bg-[#e7f0fa] hover:bg-[#dde5ec] active:bg-[#c9d9e8] text-[#0064e0] hover:text-[#004fb3] border border-[#dde5ec] shadow-2xs font-bold',
    softBlue:
      'bg-[#f1f5f8] hover:bg-[#e7f0fa] active:bg-[#dde5ec] text-[#0064e0] border border-[#dde5ec] shadow-2xs font-bold',
    outline:
      'bg-white hover:bg-[#e7f0fa] active:bg-[#dde5ec] text-[#1c2b33] border border-[#dde5ec] shadow-2xs hover:border-[#0082fb] font-semibold',
    ghost:
      'bg-transparent hover:bg-[#e7f0fa] active:bg-[#dde5ec] text-[#5f7380] hover:text-[#1c2b33] border border-transparent font-semibold',
    danger:
      'bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 hover:border-rose-300 font-bold',
    dangerSolid:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-500/30 border border-rose-500 font-bold',
    success:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-500/30 border border-emerald-500 font-bold',
    slate:
      'bg-gradient-to-r from-[#1c2b33] to-[#2a3c47] hover:from-[#152229] hover:to-[#1c2b33] text-white border border-slate-600 shadow-premium-card font-bold',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    sm: 'px-3.5 py-2 text-xs rounded-xl gap-2 font-semibold',
    md: 'px-4.5 py-2.5 text-xs sm:text-sm rounded-xl gap-2.5',
    lg: 'px-6 py-3 text-base rounded-xl gap-3',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`
        inline-flex items-center justify-center font-heading transition-all duration-200
        active:scale-[0.98] select-none cursor-pointer tracking-tight
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed active:scale-100 hover:shadow-none pointer-events-none' : ''}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 size={size === 'sm' || size === 'xs' ? 14 : 16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' || size === 'xs' ? 15 : 17} className="flex-shrink-0" strokeWidth={2.2} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
