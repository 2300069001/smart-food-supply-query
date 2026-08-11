import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, Loader2, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/FormField';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { setAuthenticated } from '../lib/auth';

const DEMO_EMAIL = 'ganesh@smartfoodco.com';
const DEMO_PASSWORD = 'demo123';

type LoginState = 'idle' | 'checking' | 'success';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function Login() {
  useDocumentTitle('Sign In');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<LoginState>('idle');

  const busy = state !== 'idle';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const isValid =
      email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;

    if (!isValid) {
      setError('Invalid email or password. Use the demo credentials below.');
      return;
    }

    setState('checking');
    await wait(260);
    setState('success');
    await wait(200);
    setAuthenticated();
    navigate('/');
  }

  return (
    <div className="relative min-h-screen">
      <div className="h-[3px] bg-gradient-to-r from-brand-600 via-brand-500 to-info-500" />

      <div className="flex min-h-[calc(100vh-3px)] flex-col items-center justify-center px-6 py-12">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600">
            <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <p className="mt-3 font-display text-lg font-semibold text-slate-900">Smart Food Co.</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">QA Supplier Portal</p>
        </div>

        <Card className="w-full max-w-md">
          <div className="px-8 pb-8 pt-7">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to manage supplier food safety queries.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700 ring-1 ring-inset ring-danger-100"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <TextField
                id="email"
                label="Work Email"
                type="email"
                required
                autoComplete="username"
                placeholder="you@smartfoodco.com"
                value={email}
                disabled={busy}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                id="password"
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                disabled={busy}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={busy}
                icon={
                  state === 'checking' ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : state === 'success' ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                  )
                }
              >
                {state === 'checking' ? 'Signing in…' : state === 'success' ? 'Welcome, Ganesh' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-5 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500 ring-1 ring-inset ring-slate-200">
              <p className="font-medium text-slate-600">Demo credentials</p>
              <p className="mt-0.5 font-mono">{DEMO_EMAIL} · {DEMO_PASSWORD}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
