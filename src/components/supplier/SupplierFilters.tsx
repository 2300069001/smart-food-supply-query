import { Search } from 'lucide-react';
import type { QueryStatusValue } from '../../types';

export interface SupplierFilterState {
  search: string;
  status: QueryStatusValue | 'all';
  category: string;
}

const STATUS_OPTIONS: { value: QueryStatusValue | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export function SupplierFilters({
  filters,
  onChange,
  categories,
}: {
  filters: SupplierFilterState;
  onChange: (next: SupplierFilterState) => void;
  categories: string[];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search suppliers by name..."
          aria-label="Search suppliers"
          className="block w-full rounded-lg border-0 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
      </div>

      <label className="sr-only" htmlFor="status-filter">
        Filter by query status
      </label>
      <select
        id="status-filter"
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as QueryStatusValue | 'all' })
        }
        className="rounded-lg border-0 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="category-filter">
        Filter by supplier category
      </label>
      <select
        id="category-filter"
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className="rounded-lg border-0 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
      >
        <option value="all">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}
