import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, PackageSearch } from 'lucide-react';
import type { Supplier } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { CertificateStatusBadge } from '../ui/CertificateStatusBadge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { formatDate } from '../../utils/format';

export function SupplierTable({
  suppliers,
  hasActiveFilters,
  onClearFilters,
}: {
  suppliers: Supplier[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  const navigate = useNavigate();

  if (suppliers.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No suppliers match your search"
        description="Try a different supplier name, or clear your filters to see the full supplier list."
        action={
          hasActiveFilters ? (
            <Button variant="secondary" size="sm" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1020px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th scope="col" className="px-6 py-3 font-semibold">
              Supplier
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Certificate
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Last Query
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Query Status
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Open Queries
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {suppliers.map((supplier, index) => {
            const isOverdue = supplier.worstStatus === 'overdue';

            return (
              <motion.tr
                key={supplier.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.2) }}
                className={`text-sm transition-colors hover:bg-slate-50 ${
                  isOverdue ? 'border-l-2 border-l-danger-500' : 'border-l-2 border-l-transparent'
                }`}
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900">{supplier.name}</p>
                  <p className="text-xs text-slate-500">{supplier.category}</p>
                </td>
                <td className="px-4 py-4">
                  <CertificateStatusBadge certificate={supplier.certificate} />
                </td>
                <td className="px-4 py-4 tabular-nums text-slate-600">
                  {formatDate(supplier.lastQueryDate)}
                </td>
                <td className="px-4 py-4">
                  {supplier.worstStatus ? (
                    <div>
                      <StatusBadge status={supplier.worstStatus} />
                      {isOverdue && supplier.overdueDays !== null && (
                        <p className="mt-1 text-xs font-medium tabular-nums text-danger-600">
                          Overdue by {supplier.overdueDays} day{supplier.overdueDays === 1 ? '' : 's'}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">No queries yet</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums ${
                      supplier.openQueryCount > 0
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {supplier.openQueryCount}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {supplier.mostUrgentQueryId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/queries/${supplier.mostUrgentQueryId}`)}
                      >
                        View
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/queries/new?supplierId=${supplier.id}`)}
                    >
                      Raise Query
                    </Button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
