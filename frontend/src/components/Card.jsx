const Card = ({
  children,
  className = '',
  title,
  subtitle,
  actions,
  hover = false,
  noPadding = false,
  headerVariant = 'softBlue', // 'softBlue' | 'light' | 'blue' | 'gradient'
  cardVariant = 'white', // 'white' | 'highlight' | 'secondary'
  id
}) => {
  const getCardVariantClasses = () => {
    if (cardVariant === 'highlight') {
      return 'bg-gradient-to-br from-[#1c2b33] to-[#0064e0] text-white border-blue-400/30 shadow-electric-glow';
    }
    if (cardVariant === 'secondary') {
      return 'bg-[#f1f5f8] text-[#1c2b33] border-[#dde5ec] shadow-premium-sm';
    }
    return 'bg-white text-[#1c2b33] border-[#dde5ec] shadow-premium-card';
  };

  const getHeaderVariantClasses = () => {
    if (cardVariant === 'highlight') {
      return 'bg-white/10 text-white border-white/20';
    }
    if (headerVariant === 'blue' || headerVariant === 'gradient') {
      return 'bg-gradient-to-r from-[#1c2b33] via-[#0064e0] to-[#0082fb] text-white border-blue-400/30 shadow-electric-glow';
    }
    if (headerVariant === 'light') {
      return 'bg-[#f1f5f8] text-[#1c2b33] border-[#dde5ec]';
    }
    return 'bg-[#f1f5f8] text-[#1c2b33] border-[#dde5ec]';
  };

  return (
    <div
      id={id}
      className={`
        rounded-2xl border overflow-hidden transition-all duration-200
        ${getCardVariantClasses()}
        ${hover ? 'hover:shadow-blue-glow hover:border-[#0082fb] hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {(title || subtitle || actions) && (
        <div
          className={`
            px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3
            ${getHeaderVariantClasses()}
          `}
        >
          <div className="min-w-0">
            {typeof title === 'string' ? (
              <h3 className="text-base font-heading font-black tracking-tight truncate">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p
                className={`text-xs font-semibold mt-0.5 truncate ${
                  cardVariant === 'highlight' || headerVariant === 'blue'
                    ? 'text-blue-100'
                    : 'text-slate-500'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">{actions}</div>}
        </div>
      )}
      {noPadding ? children : <div className="p-6">{children}</div>}
    </div>
  );
};

export default Card;
