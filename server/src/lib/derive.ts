import type {
  QueryEventRow,
  QueryStatusValue,
  WorkflowStatus,
  TimelineStageKey,
  CertificateStatus,
} from '../types.js';

const STAGE_ORDER: TimelineStageKey[] = ['raised', 'sent', 'responded', 'review', 'resolved'];

const STAGE_LABELS: Record<TimelineStageKey, string> = {
  raised: 'Query Raised',
  sent: 'Sent to Supplier',
  responded: 'Supplier Responded',
  review: 'QA Review',
  resolved: 'Resolved',
};

export interface TimelineStageOut {
  key: TimelineStageKey;
  label: string;
  timestamp: string | null;
  state: 'complete' | 'current' | 'upcoming';
}

export function buildTimeline(events: QueryEventRow[]): TimelineStageOut[] {
  const byStage = new Map(events.map((e) => [e.stage, e]));
  let reachedIndex = -1;
  STAGE_ORDER.forEach((stage, i) => {
    if (byStage.has(stage)) reachedIndex = i;
  });

  return STAGE_ORDER.map((key, index) => {
    let state: TimelineStageOut['state'] = 'upcoming';
    if (index <= reachedIndex) state = 'complete';
    if (index === reachedIndex + 1) state = 'current';
    return {
      key,
      label: STAGE_LABELS[key],
      timestamp: byStage.get(key)?.created_at ?? null,
      state,
    };
  });
}

export function computeWorkflowStatus(events: QueryEventRow[]): WorkflowStatus {
  const stages = new Set(events.map((e) => e.stage));
  if (stages.has('resolved')) return 'resolved';
  if (stages.has('responded') || stages.has('review')) return 'in-progress';
  return 'pending';
}

export function computeEffectiveStatus(
  events: QueryEventRow[],
  dueAt: string,
): QueryStatusValue {
  const workflow = computeWorkflowStatus(events);
  if (workflow === 'resolved') return 'resolved';
  const isOverdue = new Date(dueAt).getTime() < Date.now();
  return isOverdue ? 'overdue' : workflow;
}

export function computeCertificateStatus(expiry: string | null): {
  status: CertificateStatus;
  daysUntilExpiry: number | null;
} {
  if (!expiry) return { status: 'none', daysUntilExpiry: null };
  const daysUntilExpiry = Math.round(
    (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (daysUntilExpiry < 0) return { status: 'expired', daysUntilExpiry };
  if (daysUntilExpiry <= 30) return { status: 'expiring-soon', daysUntilExpiry };
  return { status: 'valid', daysUntilExpiry };
}

export const ALLOWED_TRANSITIONS: Record<TimelineStageKey, TimelineStageKey | null> = {
  raised: 'sent',
  sent: 'responded',
  responded: 'review',
  review: 'resolved',
  resolved: null,
};
