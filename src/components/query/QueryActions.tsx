import { useState, type FormEvent } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextAreaField } from '../ui/FormField';
import { updateQueryStatus } from '../../api/queries';
import { ApiError } from '../../api/client';
import type { QueryQuery, WorkflowStage } from '../../types';

interface StageActionConfig {
  title: string;
  description: string;
  label: string;
  placeholder: string;
  required: boolean;
  buttonLabel: string;
}

const STAGE_ACTIONS: Record<'responded' | 'review' | 'resolved', StageActionConfig> = {
  responded: {
    title: 'Log Supplier Response',
    description: "Record the supplier's reply once they respond by email or portal.",
    label: "Supplier's Response",
    placeholder: "Paste or summarize the supplier's reply...",
    required: true,
    buttonLabel: 'Log Response',
  },
  review: {
    title: 'Move to QA Review',
    description: 'Mark this query as under QA review before resolving.',
    label: 'Review Note',
    placeholder: 'Add any internal notes for this review...',
    required: false,
    buttonLabel: 'Start QA Review',
  },
  resolved: {
    title: 'Resolve Query',
    description: 'Close this query once the response has been verified.',
    label: 'Resolution Note',
    placeholder: 'e.g. Certificate verified and filed.',
    required: false,
    buttonLabel: 'Mark Resolved',
  },
};

export function QueryActions({
  query,
  supplierContactName,
  onUpdated,
}: {
  query: QueryQuery;
  supplierContactName: string;
  onUpdated: (updated: QueryQuery) => void;
}) {
  const currentStage = query.timeline.find((s) => s.state === 'current');
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!currentStage || currentStage.key === 'raised' || currentStage.key === 'sent') {
    return null;
  }

  const stageKey = currentStage.key as 'responded' | 'review' | 'resolved';
  const config = STAGE_ACTIONS[stageKey];
  const actor = stageKey === 'responded' ? supplierContactName : 'Ganesh';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (config.required && !note.trim()) {
      setValidationError('This field is required.');
      return;
    }
    setValidationError(null);
    setSubmitting(true);
    try {
      const updated = await updateQueryStatus(query.id, {
        stage: stageKey as WorkflowStage,
        message: note.trim() || undefined,
        actor,
      });
      onUpdated(updated);
      setNote('');
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : 'Could not update this query. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader title={config.title} description={config.description} />
      <form onSubmit={handleSubmit} className="space-y-3 px-6 py-5">
        {serverError && (
          <div
            role="alert"
            className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700 ring-1 ring-inset ring-danger-100"
          >
            {serverError}
          </div>
        )}
        <TextAreaField
          id="action-note"
          label={config.label}
          required={config.required}
          rows={3}
          placeholder={config.placeholder}
          value={note}
          error={validationError ?? undefined}
          onChange={(e) => {
            setNote(e.target.value);
            if (validationError) setValidationError(null);
          }}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? 'Saving…' : config.buttonLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
