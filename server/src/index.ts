import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import './db.js';
import { seedIfEmpty } from './seed.js';
import { suppliersRouter } from './routes/suppliers.js';
import { queriesRouter } from './routes/queries.js';

seedIfEmpty();

const app = express();

// Local dev origins are always allowed; the deployed frontend origin is added
// via FRONTEND_URL so production CORS never falls back to a wildcard.
// Trimmed and stripped of a trailing slash so a stray space or slash pasted
// into the hosting platform's env var UI doesn't silently break the match
// against the browser's exact Origin header.
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.trim().replace(/\/+$/, ''));
}
console.log('CORS allowed origins:', allowedOrigins);
app.use(cors({ origin: allowedOrigins }));

app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/suppliers', suppliersRouter);
app.use('/api/queries', queriesRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
});

// API_PORT is an explicit override for local development, so this server
// never fights the frontend dev server for a port when both are started
// together. PORT is the standard variable hosting platforms (e.g. Render)
// assign automatically.
const PORT = Number(process.env.API_PORT || process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
