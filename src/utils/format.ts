function toDate(dateStr: string): Date {
  // Accept both bare dates ("2026-08-11") and full ISO timestamps
  // ("2026-08-11T09:00:00.000Z") without double-appending a time component.
  return /T\d{2}:\d{2}/.test(dateStr) ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return toDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return '—';
  return toDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function daysFromToday(dateStr: string): number {
  const target = toDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
