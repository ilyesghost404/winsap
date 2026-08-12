import { FolderOpen, Plus } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There are no items to display right now.',
  action,
  actionLabel = 'Create New',
  actionIcon: ActionIcon = Plus,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center mb-3.5 text-blue-600 shadow-xs">
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <h4 className="text-base font-semibold text-slate-800 tracking-tight">{title}</h4>
      {description && (
        <p className="text-xs text-slate-500 mt-1 max-w-sm font-normal leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-5">
          <Button icon={ActionIcon} size="sm" onClick={action}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;