import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send, X, Loader2, Mail, MessagesSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextField, TextAreaField, SelectField } from '../components/ui/FormField';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { PrioritySelector } from '../components/query/PrioritySelector';
import { AttachmentField } from '../components/query/AttachmentField';
import { CONTEXTUAL_FIELDS } from '../components/query/contextualFields';
import { CertificateStatusBadge } from '../components/ui/CertificateStatusBadge';
import { QUERY_CATEGORIES } from '../constants';
import { fetchSuppliers } from '../api/suppliers';
import { createQuery } from '../api/queries';
import { ApiError } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { QueryCategory, QueryPriority } from '../types';

interface FormState {
  supplierId: string;
  category: QueryCategory | '';
  subject: string;
  message: string;
  priority: QueryPriority | null;
  attachmentName: string | null;
  context: Record<string, string>;
}

type FormErrorKey = 'supplierId' | 'category' | 'subject' | 'message' | 'priority';
type FormErrors = Partial<Record<FormErrorKey, string>>;

const SUBJECT_MIN = 5;
const SUBJECT_MAX = 120;
const MESSAGE_MIN = 20;

export function RaiseQuery() {
  useDocumentTitle('Raise New Query');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: suppliers, loading: suppliersLoading, error: suppliersError, refetch } = useFetch(
    fetchSuppliers,
    [],
  );
  const preselectedSupplierId = searchParams.get('supplierId') ?? '';

  const [form, setForm] = useState<FormState>({
    supplierId: preselectedSupplierId,
    category: '',
    subject: '',
    message: '',
    priority: null,
    attachmentName: null,
    context: {},
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const errorKey = key as FormErrorKey;
      if (!(errorKey in prev)) return prev;
      const next = { ...prev };
      delete next[errorKey];
      return next;
    });
  }

  function updateCategory(category: QueryCategory) {
    setForm((prev) => ({ ...prev, category, context: {} }));
    setErrors((prev) => {
      if (!('category' in prev)) return prev;
      const next = { ...prev };
      delete next.category;
      return next;
    });
  }

  function updateContextField(key: string, value: string) {
    setForm((prev) => ({ ...prev, context: { ...prev.context, [key]: value } }));
  }

  const contextualFields = form.category ? CONTEXTUAL_FIELDS[form.category] : undefined;
  const selectedSupplier = (suppliers ?? []).find((s) => s.id === form.supplierId);

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!form.supplierId) next.supplierId = 'Select a supplier to continue.';
    if (!form.category) next.category = 'Choose a query category.';
    if (!form.subject.trim()) next.subject = 'Add a subject line for this query.';
    else if (form.subject.trim().length < SUBJECT_MIN)
      next.subject = `Subject should be at least ${SUBJECT_MIN} characters.`;
    if (!form.message.trim()) next.message = 'Describe what you need from the supplier.';
    else if (form.message.trim().length < MESSAGE_MIN)
      next.message = `Add more detail so the supplier can respond accurately (min. ${MESSAGE_MIN} characters).`;
    if (!form.priority) next.priority = 'Choose a priority level for this query.';
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSubmitError(true);
      return;
    }

    const cleanedContext = Object.fromEntries(
      Object.entries(form.context).filter(([, value]) => value.trim() !== ''),
    );

    setSubmitting(true);
    try {
      const newQuery = await createQuery({
        supplierId: form.supplierId,
        category: form.category as QueryCategory,
        subject: form.subject.trim(),
        message: form.message.trim(),
        priority: form.priority as QueryPriority,
        attachmentName: form.attachmentName ?? undefined,
        context: Object.keys(cleanedContext).length > 0 ? cleanedContext : null,
      });
      navigate(`/queries/${newQuery.id}`, { state: { justSubmitted: true } });
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.message
          : 'Could not submit this query. Check your connection and try again.',
      );
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">
            Raise New Query
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Send a food safety, compliance, or documentation question to a supplier. They will
            receive a notification and your query will appear in the tracker.
          </p>
        </div>

        <Card>
          <CardHeader
            title="Query Details"
            description="Fields marked with * are required."
          />

          {suppliersLoading ? (
            <LoadingState label="Loading suppliers…" />
          ) : suppliersError ? (
            <ErrorState message="Unable to load suppliers. Try again." onRetry={refetch} />
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5 px-6 py-6">
              <AnimatePresence>
                {submitError && Object.keys(errors).length > 0 && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700 ring-1 ring-inset ring-danger-100"
                  >
                    Please fix the highlighted fields before submitting.
                  </motion.div>
                )}

                {serverError && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700 ring-1 ring-inset ring-danger-100"
                  >
                    {serverError}
                  </motion.div>
                )}
              </AnimatePresence>

              <SelectField
                id="supplier"
                label="Supplier"
                required
                placeholder="Select a supplier"
                value={form.supplierId}
                error={errors.supplierId}
                onChange={(e) => updateField('supplierId', e.target.value)}
              >
                {(suppliers ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.category}
                  </option>
                ))}
              </SelectField>

              {selectedSupplier && (
                <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Contact
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-700">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                      {selectedSupplier.contactName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Query History
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-700">
                      <MessagesSquare className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                      {selectedSupplier.openQueryCount} open quer
                      {selectedSupplier.openQueryCount === 1 ? 'y' : 'ies'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Certificate
                    </p>
                    <div className="mt-1">
                      <CertificateStatusBadge certificate={selectedSupplier.certificate} />
                    </div>
                  </div>
                </div>
              )}

              <SelectField
                id="category"
                label="Query Category"
                required
                placeholder="Select a category"
                value={form.category}
                error={errors.category}
                onChange={(e) => updateCategory(e.target.value as QueryCategory)}
              >
                {QUERY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </SelectField>

              {contextualFields && (
                <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2">
                  <p className="col-span-full -mt-1 text-xs font-medium text-slate-500">
                    Add details specific to this category (optional, but helps the supplier respond
                    faster).
                  </p>
                  {contextualFields.map((field) => (
                    <TextField
                      key={field.key}
                      id={`context-${field.key}`}
                      label={field.label}
                      type={field.type ?? 'text'}
                      placeholder={field.placeholder}
                      value={form.context[field.key] ?? ''}
                      onChange={(e) => updateContextField(field.key, e.target.value)}
                    />
                  ))}
                </div>
              )}

              <TextField
                id="subject"
                label="Subject"
                required
                placeholder="e.g. Confirm allergen statement for Batch #A2291"
                value={form.subject}
                error={errors.subject}
                hint={
                  !errors.subject
                    ? `${form.subject.trim().length}/${SUBJECT_MAX} characters — minimum ${SUBJECT_MIN}`
                    : undefined
                }
                onChange={(e) => updateField('subject', e.target.value)}
                maxLength={SUBJECT_MAX}
              />

              <TextAreaField
                id="message"
                label="Question / Message"
                required
                rows={5}
                placeholder="Describe exactly what information or documentation you need, including product names, batch numbers, or certificate types where relevant."
                hint={
                  !errors.message
                    ? `${form.message.trim().length} characters — minimum ${MESSAGE_MIN}. Be specific for a faster, more accurate response.`
                    : undefined
                }
                value={form.message}
                error={errors.message}
                onChange={(e) => updateField('message', e.target.value)}
              />

              <PrioritySelector
                value={form.priority}
                error={errors.priority}
                onChange={(value) => updateField('priority', value)}
              />

              <AttachmentField
                fileName={form.attachmentName}
                onChange={(name) => updateField('attachmentName', name)}
                onRemove={() => updateField('attachmentName', null)}
              />

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={submitting}
                  icon={<X className="h-4 w-4" aria-hidden="true" />}
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  icon={
                    submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="h-4 w-4" aria-hidden="true" />
                    )
                  }
                >
                  {submitting ? 'Submitting…' : 'Submit Query'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
