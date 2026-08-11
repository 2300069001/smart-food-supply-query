import { Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center" role="status">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-hidden="true" />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
    </div>
  );
}
