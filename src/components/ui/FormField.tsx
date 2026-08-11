import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface FieldMeta {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  children,
}: FieldMeta & { children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="text-danger-600" aria-hidden="true">
            {' '}
            *
          </span>
        )}
        {!required && <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>}
      </label>
      {children}
      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-1.5 flex items-center gap-1 overflow-hidden text-sm text-danger-600"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            id={`${id}-hint`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-1.5 overflow-hidden text-sm text-slate-500"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const baseControlClasses =
  'block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-slate-900 ring-1 ring-inset placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400';

function controlRing(hasError?: string) {
  return hasError
    ? 'ring-danger-300 focus:ring-danger-500'
    : 'ring-slate-300 focus:ring-brand-600';
}

interface TextFieldProps extends FieldMeta, Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {}

export function TextField({
  id,
  label,
  hint,
  error,
  required,
  className = '',
  ...rest
}: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${baseControlClasses} ${controlRing(error)} ${className}`}
        {...rest}
      />
    </FieldShell>
  );
}

interface TextAreaFieldProps
  extends FieldMeta,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  required,
  className = '',
  ...rest
}: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${baseControlClasses} ${controlRing(error)} resize-none ${className}`}
        {...rest}
      />
    </FieldShell>
  );
}

interface SelectFieldProps
  extends FieldMeta,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  placeholder?: string;
}

export function SelectField({
  id,
  label,
  hint,
  error,
  required,
  placeholder,
  className = '',
  children,
  ...rest
}: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${baseControlClasses} ${controlRing(error)} ${className}`}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    </FieldShell>
  );
}
