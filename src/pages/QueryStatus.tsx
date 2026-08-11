import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Paperclip,
  FileSearch,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { QueryTimeline } from '../components/query/QueryTimeline';
import { SupplierResponseCard } from '../components/query/SupplierResponseCard';
import { QueryActions } from '../components/query/QueryActions';
import { fetchQuery } from '../api/queries';
import { fetchSupplier } from '../api/suppliers';
import { ApiError } from '../api/client';
import { getContextFieldLabel } from '../components/query/contextualFields';
import { formatDate, daysFromToday } from '../utils/format';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { QueryQuery, Supplier } from '../types';

export function QueryStatus() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [query, setQuery] = useState<QueryQuery | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);

    fetchQuery(id)
      .then(async (q) => {
        const s = await fetchSupplier(q.supplierId);
        if (cancelled) return;
        setQuery(q);
        setSupplier(s);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Something went wrong while loading this query.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => load(), [load]);

  useDocumentTitle(query ? `${query.id} · ${query.subject}` : 'Query Status');

  const [showSuccess, setShowSuccess] = useState(
    Boolean((location.state as { justSubmitted?: boolean } | null)?.justSubmitted),
  );

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => setShowSuccess(false), 6000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  if (loading) {
    return (
      <AppShell>
        <Card>
          <LoadingState label="Loading query…" />
        </Card>
      </AppShell>
    );
  }

  if (notFound) {
    return (
      <AppShell>
        <Card>
          <EmptyState
            icon={FileSearch}
            title="Query not found"
            description="This query may have been removed, or the link is incorrect."
            action={
              <Link to="/">
                <Button variant="secondary" size="sm">
                  Back to Supplier List
                </Button>
              </Link>
            }
          />
        </Card>
      </AppShell>
    );
  }

  if (error || !query || !supplier) {
    return (
      <AppShell>
        <Card>
          <ErrorState message={error ?? 'Unable to load this query. Try again.'} onRetry={load} />
        </Card>
      </AppShell>
    );
  }

  const daysToDue = daysFromToday(query.dueDate);
  const isOverdue = query.status === 'overdue';

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Supplier List
        </Link>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              role="status"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 overflow-hidden rounded-lg bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800 ring-1 ring-inset ring-brand-100"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Query submitted successfully. {supplier.name} has been notified.
            </motion.div>
          )}
        </AnimatePresence>

        {isOverdue && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-5 flex items-center gap-2.5 rounded-lg bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 ring-1 ring-inset ring-danger-100"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            This query is <span className="tabular-nums">{Math.abs(daysToDue)}</span> day
            {Math.abs(daysToDue) === 1 ? '' : 's'} overdue — the supplier has not responded within
            the expected timeframe. Consider following up directly.
          </motion.div>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide tabular-nums text-slate-400">
              {query.id}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-slate-900">
              {query.subject}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Raised for <span className="font-medium text-slate-700">{supplier.name}</span>
            </p>
          </div>
          <StatusBadge status={query.status} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader title="Query Details" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 sm:grid-cols-3">
                <DetailItem label="Supplier" value={supplier.name} />
                <DetailItem label="Category" value={query.category} />
                <DetailItem label="Priority" value={<PriorityBadge priority={query.priority} size="sm" />} />
                <DetailItem label="Created" value={formatDate(query.createdDate)} />
                <DetailItem
                  label={isOverdue ? 'Was Due' : 'Expected By'}
                  value={formatDate(query.dueDate)}
                />
                <DetailItem label="Status" value={<StatusBadge status={query.status} size="sm" />} />
              </div>

              <div className="border-t border-slate-200 px-6 py-5">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Question / Message</h3>
                <p className="rounded-lg bg-slate-50 px-4 py-3.5 text-sm leading-relaxed text-slate-700">
                  {query.message}
                </p>
                {query.attachmentName && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <Paperclip className="h-4 w-4" aria-hidden="true" />
                    {query.attachmentName}
                  </div>
                )}
              </div>

              {query.context && Object.keys(query.context).length > 0 && (
                <div className="border-t border-slate-200 px-6 py-5">
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">Additional Details</h3>
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Object.entries(query.context).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          {getContextFieldLabel(query.category, key)}
                        </dt>
                        <dd className="mt-0.5 text-sm text-slate-700">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <div className="border-t border-slate-200 px-6 py-5">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Supplier Response</h3>
                <SupplierResponseCard response={query.supplierResponse} supplierName={supplier.name} />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Query Progress" description="Updates as your query moves forward." />
              <div className="px-6 py-6">
                <QueryTimeline stages={query.timeline} />
              </div>
            </Card>

            <QueryActions
              query={query}
              supplierContactName={supplier.contactName}
              onUpdated={setQuery}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium tabular-nums text-slate-800">{value}</dd>
    </div>
  );
}
