import { useState, useEffect, useRef } from 'react';

/**
 * Live timer that counts up from a start time.
 * Renders HH:MM:SS with configurable variants.
 */
const LiveTimer = ({ startTime, variant = 'default', className = '' }) => {
  const [elapsed, setElapsed] = useState('00:00:00');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!startTime) {
      setElapsed('00:00:00');
      return;
    }

    const start = new Date(startTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - start) / 1000));
      const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const seconds = String(diff % 60).padStart(2, '0');
      setElapsed(`${hours}:${minutes}:${seconds}`);
    };

    updateTimer();
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTime]);

  const variants = {
    default: 'text-lg font-mono font-bold text-[#0064e0] tracking-wider',
    banner: 'text-4xl sm:text-5xl font-mono font-black text-white tracking-widest drop-shadow-lg',
    card: 'text-base font-mono font-bold text-[#0064e0] tracking-wider',
    compact: 'text-sm font-mono font-semibold text-[#0064e0] tracking-wider',
    table: 'text-xs font-mono font-bold text-blue-600 tracking-wider'
  };

  return (
    <span className={`${variants[variant] || variants.default} ${className}`}>
      {elapsed}
    </span>
  );
};

/**
 * Static duration display. Formats minutes into HH:MM format.
 */
export const DurationDisplay = ({ minutes, className = '' }) => {
  if (!minutes && minutes !== 0) return <span className={className}>—</span>;

  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hrs === 0) {
    return <span className={`font-mono font-semibold ${className}`}>{mins}m</span>;
  }

  return (
    <span className={`font-mono font-semibold ${className}`}>
      {hrs}h {mins > 0 ? `${mins}m` : ''}
    </span>
  );
};

export default LiveTimer;
