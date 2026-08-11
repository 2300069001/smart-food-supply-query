import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { SupplierStatsBar } from '../components/supplier/SupplierStatsBar';
import { SupplierFilters, type SupplierFilterState } from '../components/supplier/SupplierFilters';
import { SupplierTable } from '../components/supplier/SupplierTable';
import { fetchSuppliers } from '../api/suppliers';
import { useFetch } from '../hooks/useFetch';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const DEFAULT_FILTERS: SupplierFilterState = {
  search: '',
  status: 'all',
  category: 'all',
};

export function SupplierList() {
  useDocumentTitle('Supplier Queries');
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SupplierFilterState>(DEFAULT_FILTERS);
  const { data: suppliers, loading, error, refetch } = useFetch(fetchSuppliers, []);

  const categories = useMemo(
    () => Array.from(new Set((suppliers ?? []).map((s) => s.category))).sort(),
    [suppliers],
  );

  const filteredSuppliers = useMemo(() => {
    return (suppliers ?? []).filter((supplier) => {
      const matchesSearch = supplier.name
        .toLowerCase()
        .includes(filters.search.trim().toLowerCase());
      const matchesStatus =
        filters.status === 'all' || supplier.worstStatus === filters.status;
      const matchesCategory =
        filters.category === 'all' || supplier.category === filters.category;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [filters, suppliers]);

  const hasActiveFilters =
    filters.search.trim() !== '' || filters.status !== 'all' || filters.category !== 'all';

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">
            Supplier Queries
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track food safety, compliance, and documentation queries sent to your suppliers.
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={() => navigate('/queries/new')}>
          Raise New Query
        </Button>
      </div>

      {loading ? (
        <Card>
          <LoadingState label="Loading suppliers…" />
        </Card>
      ) : error ? (
        <Card>
          <ErrorState message="Unable to load supplier queries. Try again." onRetry={refetch} />
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <SupplierStatsBar
              suppliers={suppliers ?? []}
              isOverdueFilterActive={filters.status === 'overdue'}
              onToggleOverdueFilter={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: prev.status === 'overdue' ? 'all' : 'overdue',
                }))
              }
            />
          </div>

          <Card>
            <div className="border-b border-slate-200 px-6 py-4">
              <SupplierFilters filters={filters} onChange={setFilters} categories={categories} />
            </div>
            <SupplierTable
              suppliers={filteredSuppliers}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={() => setFilters(DEFAULT_FILTERS)}
            />
          </Card>
        </>
      )}
    </AppShell>
  );
}
