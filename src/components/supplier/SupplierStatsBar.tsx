import { Building2, MessagesSquare, AlertTriangle } from 'lucide-react';
import type { Supplier } from '../../types';

export function SupplierStatsBar({
  suppliers,
  isOverdueFilterActive,
  onToggleOverdueFilter,
}: {
  suppliers: Supplier[];
  isOverdueFilterActive: boolean;
  onToggleOverdueFilter: () => void;
}) {
  const totalSuppliers = suppliers.length;
  const openQueries = suppliers.reduce((sum, s) => sum + s.openQueryCount, 0);
  const overdueCount = suppliers.filter((s) => s.worstStatus === 'overdue').length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Building2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-2xl font-bold leading-none tabular-nums text-slate-900">
            {totalSuppliers}
          </p>
          <p className="mt-1 text-sm text-slate-500">Total Suppliers</p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-info-50 text-info-600">
          <MessagesSquare className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-2xl font-bold leading-none tabular-nums text-slate-900">
            {openQueries}
          </p>
          <p className="mt-1 text-sm text-slate-500">Open Queries</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleOverdueFilter}
        disabled={overdueCount === 0}
        aria-pressed={isOverdueFilterActive}
        title={
          overdueCount > 0
            ? isOverdueFilterActive
              ? 'Showing overdue suppliers only — click to clear'
              : 'Show only suppliers with overdue queries'
            : undefined
        }
        className={`flex items-center gap-4 rounded-xl border p-4 text-left shadow-sm transition-colors disabled:cursor-default ${
          isOverdueFilterActive
            ? 'border-danger-300 bg-danger-50 ring-2 ring-danger-200'
            : overdueCount > 0
              ? 'border-danger-200 bg-white hover:bg-danger-50/60'
              : 'border-slate-200 bg-white'
        }`}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-2xl font-bold leading-none tabular-nums text-slate-900">
            {overdueCount}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Need Attention (Overdue){overdueCount > 0 ? ' — view' : ''}
          </p>
        </div>
      </button>
    </div>
  );
}
