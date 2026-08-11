import { useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { PageTransition } from './PageTransition';

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <div className="h-[3px] bg-gradient-to-r from-brand-600 via-brand-500 to-info-500" />
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
              <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-sm font-semibold leading-tight text-slate-900">
                Smart Food Co.
              </span>
              <span className="block text-xs leading-tight text-slate-500">
                QA Supplier Portal
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold leading-tight text-slate-900">
                Ganesh
              </p>
              <p className="text-xs leading-tight text-slate-500">QA Manager</p>
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
              aria-hidden="true"
            >
              G
            </div>
          </div>
        </div>
      </header>
      <PageTransition className="mx-auto max-w-7xl px-6 py-8">{children}</PageTransition>
    </div>
  );
}
