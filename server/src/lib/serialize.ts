import { db } from '../db.js';
import {
  buildTimeline,
  computeEffectiveStatus,
  computeCertificateStatus,
} from './derive.js';
import type { SupplierRow, QueryRow, QueryEventRow } from '../types.js';

export function getAllSupplierRows(): SupplierRow[] {
  return db.prepare('SELECT * FROM suppliers ORDER BY name ASC').all() as SupplierRow[];
}

export function getAllQueryRows(): QueryRow[] {
  return db.prepare('SELECT * FROM queries').all() as QueryRow[];
}

export function getEventsForQuery(queryId: string): QueryEventRow[] {
  return db
    .prepare('SELECT * FROM query_events WHERE query_id = ? ORDER BY created_at ASC, id ASC')
    .all(queryId) as QueryEventRow[];
}

export function serializeQuery(row: QueryRow) {
  const events = getEventsForQuery(row.id);
  const status = computeEffectiveStatus(events, row.due_at);
  const timeline = buildTimeline(events);
  const respondedEvent = events.find((e) => e.stage === 'responded');

  return {
    id: row.id,
    supplierId: row.supplier_id,
    category: row.category,
    priority: row.priority,
    subject: row.subject,
    message: row.question,
    attachmentName: row.attachment_name ?? undefined,
    context: row.context_json ? JSON.parse(row.context_json) : null,
    status,
    createdDate: row.created_at,
    dueDate: row.due_at,
    supplierResponse: respondedEvent
      ? {
          message: respondedEvent.message ?? '',
          respondedDate: respondedEvent.created_at,
          respondedBy: respondedEvent.actor ?? 'Supplier',
        }
      : null,
    timeline,
  };
}

export const STATUS_URGENCY: Record<string, number> = {
  overdue: 0,
  pending: 1,
  'in-progress': 2,
  resolved: 3,
};

export function serializeSupplier(row: SupplierRow) {
  const queryRows = getAllQueryRows().filter((q) => q.supplier_id === row.id);
  const serializedQueries = queryRows.map(serializeQuery);
  const openQueries = serializedQueries.filter((q) => q.status !== 'resolved');

  const worstStatus =
    openQueries.length > 0
      ? openQueries.slice().sort((a, b) => STATUS_URGENCY[a.status] - STATUS_URGENCY[b.status])[0]
          .status
      : serializedQueries.length > 0
        ? 'resolved'
        : null;

  const lastQuery = serializedQueries
    .slice()
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())[0];

  const mostUrgent = serializedQueries
    .slice()
    .sort((a, b) => {
      const diff = STATUS_URGENCY[a.status] - STATUS_URGENCY[b.status];
      if (diff !== 0) return diff;
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    })[0];

  const overdueDays =
    worstStatus === 'overdue' && mostUrgent
      ? Math.abs(Math.round((Date.now() - new Date(mostUrgent.dueDate).getTime()) / 86_400_000))
      : null;

  const cert = computeCertificateStatus(row.certificate_expiry);

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    lastQueryDate: lastQuery ? lastQuery.createdDate : null,
    openQueryCount: openQueries.length,
    worstStatus,
    mostUrgentQueryId: mostUrgent ? mostUrgent.id : null,
    overdueDays,
    certificate: {
      name: row.certificate_name,
      expiryDate: row.certificate_expiry,
      status: cert.status,
      daysUntilExpiry: cert.daysUntilExpiry,
    },
  };
}
