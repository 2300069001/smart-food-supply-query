import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import './db.js';
import { suppliersRouter } from './routes/suppliers.js';
import { queriesRouter } from './routes/queries.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/suppliers', suppliersRouter);
app.use('/api/queries', queriesRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
});

const PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
