import { Clock, MessageSquareText } from 'lucide-react';
import type { QueryQuery } from '../../types';
import { formatDate } from '../../utils/format';

export function SupplierResponseCard({
  response,
  supplierName,
}: {
  response: QueryQuery['supplierResponse'];
  supplierName: string;
}) {
  if (!response) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-slate-700">Awaiting supplier response</p>
          <p className="mt-0.5 text-sm text-slate-500">
            {supplierName} has been notified and typically responds within 3–5 business days.
            You'll see their reply here as soon as it arrives.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-brand-100 bg-brand-50/50 px-4 py-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-800">
        <MessageSquareText className="h-4 w-4" aria-hidden="true" />
        Response from {response.respondedBy}
      </div>
      <p className="text-sm leading-relaxed text-slate-700">{response.message}</p>
      <p className="mt-2 text-xs tabular-nums text-slate-500">
        Received {formatDate(response.respondedDate)}
      </p>
    </div>
  );
}
