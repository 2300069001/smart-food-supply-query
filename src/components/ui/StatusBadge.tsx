import { Clock, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { QueryStatusValue } from '../../types';

interface StatusConfig {
  label: string;
  icon: typeof Clock;
  className: string;
}

const STATUS_CONFIG: Record<QueryStatusValue, StatusConfig> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-warn-50 text-warn-700 ring-1 ring-inset ring-warn-100',
  },
  'in-progress': {
    label: 'In Progress',
    icon: RefreshCw,
    className: 'bg-info-50 text-info-700 ring-1 ring-inset ring-info-100',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle2,
    className: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100',
  },
  overdue: {
    label: 'Overdue',
    icon: AlertTriangle,
    className: 'bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-100',
  },
};

export function StatusBadge({
  status,
  size = 'md',
}: {
  status: QueryStatusValue;
  size?: 'sm' | 'md';
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const sizeClasses =
    size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${config.className}`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" />
      {config.label}
    </span>
  );
}
