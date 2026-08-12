import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <Loader2 className={`${sizes[size]} animate-spin text-blue-600`} />
      {text && <p className="text-xs font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse ${className}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded-md w-24" />
        <div className="h-7 bg-slate-200 rounded-md w-16" />
      </div>
      <div className="w-10 h-10 bg-slate-100 rounded-xl" />
    </div>
    <div className="h-3 bg-slate-100 rounded-md w-32" />
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-pulse">
    <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-3.5 bg-slate-200 rounded-md flex-1" />
      ))}
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="px-6 py-4 flex gap-4 items-center">
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className="h-3 bg-slate-100 rounded-md flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default LoadingSpinner;