import { cn } from '@/lib/utils';
import { TaskStatus } from '@/lib/mockData';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig: Record<TaskStatus, { 
  label: string; 
  className: string; 
  icon: React.ElementType 
}> = {
  'Completed': { 
    label: 'Completed', 
    className: 'status-completed border', 
    icon: CheckCircle2 
  },
  'Pending': { 
    label: 'Pending', 
    className: 'status-pending border', 
    icon: Clock 
  },
  'Delayed': { 
    label: 'Delayed', 
    className: 'status-delayed border', 
    icon: AlertTriangle 
  },
  'No-Show': { 
    label: 'No-Show', 
    className: 'status-noshow border', 
    icon: XCircle 
  }
};

export const StatusBadge = ({ status, showIcon = true, size = 'md' }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      config.className,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      {config.label}
    </span>
  );
};
