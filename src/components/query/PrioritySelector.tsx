import { ChevronUp, Minus, ChevronDown } from 'lucide-react';
import type { QueryPriority } from '../../types';

const OPTIONS: { value: QueryPriority; label: string; icon: typeof ChevronUp; activeClass: string }[] = [
  {
    value: 'low',
    label: 'Low',
    icon: ChevronDown,
    activeClass: 'has-[:checked]:bg-slate-100 has-[:checked]:text-slate-700 has-[:checked]:ring-slate-300',
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: Minus,
    activeClass: 'has-[:checked]:bg-violet-50 has-[:checked]:text-violet-700 has-[:checked]:ring-violet-300',
  },
  {
    value: 'high',
    label: 'High',
    icon: ChevronUp,
    activeClass: 'has-[:checked]:bg-danger-50 has-[:checked]:text-danger-700 has-[:checked]:ring-danger-300',
  },
];

export function PrioritySelector({
  value,
  onChange,
  error,
}: {
  value: QueryPriority | null;
  onChange: (value: QueryPriority) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-slate-700">
        Priority
        <span className="text-danger-600" aria-hidden="true">
          {' '}
          *
        </span>
      </legend>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 ring-1 ring-inset ring-slate-300 transition-colors hover:bg-slate-50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-600 ${opt.activeClass}`}
          >
            <input
              type="radio"
              name="priority"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              aria-invalid={!!error}
              aria-describedby={error ? 'priority-error' : undefined}
              className="sr-only"
            />
            <opt.icon className="h-4 w-4" aria-hidden="true" />
            {opt.label}
          </label>
        ))}
      </div>
      {error && (
        <p id="priority-error" className="mt-1.5 text-sm text-danger-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
