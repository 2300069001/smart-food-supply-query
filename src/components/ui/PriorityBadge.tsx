import { ChevronUp, Minus, ChevronDown } from 'lucide-react';
import type { QueryPriority } from '../../types';

const PRIORITY_CONFIG: Record<
  QueryPriority,
  { label: string; icon: typeof ChevronUp; className: string }
> = {
  high: {
    label: 'High Priority',
    icon: ChevronUp,
    className: 'bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-100',
  },
  medium: {
    label: 'Medium Priority',
    icon: Minus,
    className: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100',
  },
  low: {
    label: 'Low Priority',
    icon: ChevronDown,
    className: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
  },
};

export function PriorityBadge({
  priority,
  size = 'md',
}: {
  priority: QueryPriority;
  size?: 'sm' | 'md';
}) {
  const config = PRIORITY_CONFIG[priority];
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
