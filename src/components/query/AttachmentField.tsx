import { useRef } from 'react';
import { Paperclip, X, UploadCloud } from 'lucide-react';

export function AttachmentField({
  fileName,
  onChange,
  onRemove,
}: {
  fileName: string | null;
  onChange: (fileName: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="attachment">
        Attachment
        <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
      </label>

      {fileName ? (
        <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
            <Paperclip className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">{fileName}</span>
          </span>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove attachment ${fileName}`}
            className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-500 hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <UploadCloud className="h-4 w-4" aria-hidden="true" />
          Upload certificate, spec sheet, or photo (PDF, JPG, PNG — max 10MB)
        </button>
      )}

      <input
        ref={inputRef}
        id="attachment"
        type="file"
        className="sr-only"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file.name);
        }}
      />
    </div>
  );
}
