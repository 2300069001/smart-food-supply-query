import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { SupplierCertificate } from '../../types';
import { formatDate } from '../../utils/format';

export function CertificateStatusBadge({ certificate }: { certificate: SupplierCertificate }) {
  if (certificate.status === 'none' || !certificate.name) {
    return <span className="text-xs text-slate-400">No certificate on file</span>;
  }

  if (certificate.status === 'valid') {
    return (
      <div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-brand-700">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {certificate.name}
        </p>
        <p className="mt-0.5 text-xs tabular-nums text-slate-500">
          Expires {formatDate(certificate.expiryDate)}
        </p>
      </div>
    );
  }

  if (certificate.status === 'expiring-soon') {
    const days = certificate.daysUntilExpiry ?? 0;
    return (
      <div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-warn-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {certificate.name}
        </p>
        <p className="mt-0.5 text-xs tabular-nums text-warn-600">
          Expires in {days} day{days === 1 ? '' : 's'}
        </p>
      </div>
    );
  }

  const days = Math.abs(certificate.daysUntilExpiry ?? 0);
  return (
    <div>
      <p className="flex items-center gap-1.5 text-sm font-medium text-danger-700">
        <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {certificate.name}
      </p>
      <p className="mt-0.5 text-xs tabular-nums text-danger-600">
        Expired {days} day{days === 1 ? '' : 's'} ago
      </p>
    </div>
  );
}
