import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { getAllQueryRows, getEventsForQuery, serializeQuery } from '../lib/serialize.js';
import { buildTimeline, ALLOWED_TRANSITIONS } from '../lib/derive.js';
import type { QueryRow, SupplierRow, TimelineStageKey } from '../types.js';

export const queriesRouter = Router();

const DUE_DAYS_BY_PRIORITY: Record<string, number> = { high: 5, medium: 7, low: 10 };
const STAGE_SEQUENCE: TimelineStageKey[] = ['raised', 'sent', 'responded', 'review', 'resolved'];

function nextQueryId(): string {
  const rows = db.prepare("SELECT id FROM queries WHERE id LIKE 'QRY-%'").all() as { id: string }[];
  const max = rows.reduce((m, r) => {
    const n = parseInt(r.id.replace('QRY-', ''), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 1080);
  return `QRY-${max + 1}`;
}

const createQuerySchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  category: z.enum([
    'Allergen Information',
    'Certificate / Compliance',
    'Ingredient Safety',
    'Product Documentation',
    'Other',
  ]),
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters'),
  message: z.string().trim().min(20, 'Message must be at least 20 characters'),
  priority: z.enum(['low', 'medium', 'high']),
  attachmentName: z.string().optional(),
  context: z.record(z.string()).nullable().optional(),
});

queriesRouter.get('/', (_req, res) => {
  const rows = getAllQueryRows();
  res.json(rows.map(serializeQuery));
});

queriesRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM queries WHERE id = ?').get(req.params.id) as
    | QueryRow
    | undefined;
  if (!row) return res.status(404).json({ error: 'Query not found', code: 'QUERY_NOT_FOUND' });
  res.json(serializeQuery(row));
});

queriesRouter.get('/:id/timeline', (req, res) => {
  const row = db.prepare('SELECT * FROM queries WHERE id = ?').get(req.params.id) as
    | QueryRow
    | undefined;
  if (!row) return res.status(404).json({ error: 'Query not found', code: 'QUERY_NOT_FOUND' });
  res.json(buildTimeline(getEventsForQuery(row.id)));
});

queriesRouter.post('/', (req, res) => {
  const parsed = createQuerySchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: 'Invalid query payload', code: 'VALIDATION_ERROR', details: parsed.error.flatten() });
  }
  const data = parsed.data;

  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(data.supplierId) as
    | SupplierRow
    | undefined;
  if (!supplier) {
    return res.status(400).json({ error: 'Unknown supplier', code: 'UNKNOWN_SUPPLIER' });
  }

  const id = nextQueryId();
  const now = new Date();
  const due = new Date(now.getTime() + DUE_DAYS_BY_PRIORITY[data.priority] * 86_400_000);

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO queries (id, supplier_id, category, priority, subject, question, attachment_name, context_json, created_at, due_at)
       VALUES (@id, @supplier_id, @category, @priority, @subject, @question, @attachment_name, @context_json, @created_at, @due_at)`,
    ).run({
      id,
      supplier_id: data.supplierId,
      category: data.category,
      priority: data.priority,
      subject: data.subject,
      question: data.message,
      attachment_name: data.attachmentName ?? null,
      context_json: data.context ? JSON.stringify(data.context) : null,
      created_at: now.toISOString(),
      due_at: due.toISOString(),
    });

    const insertEvent = db.prepare(
      `INSERT INTO query_events (query_id, stage, message, actor, created_at) VALUES (?, ?, NULL, ?, ?)`,
    );
    insertEvent.run(id, 'raised', 'Ganesh', now.toISOString());
    insertEvent.run(id, 'sent', 'System', new Date(now.getTime() + 60_000).toISOString());
  });
  tx();

  const row = db.prepare('SELECT * FROM queries WHERE id = ?').get(id) as QueryRow;
  res.status(201).json(serializeQuery(row));
});

const statusUpdateSchema = z.object({
  stage: z.enum(['sent', 'responded', 'review', 'resolved']),
  message: z.string().trim().optional(),
  actor: z.string().trim().optional(),
});

queriesRouter.patch('/:id/status', (req, res) => {
  const row = db.prepare('SELECT * FROM queries WHERE id = ?').get(req.params.id) as
    | QueryRow
    | undefined;
  if (!row) return res.status(404).json({ error: 'Query not found', code: 'QUERY_NOT_FOUND' });

  const parsed = statusUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: 'Invalid status update', code: 'VALIDATION_ERROR', details: parsed.error.flatten() });
  }

  const events = getEventsForQuery(row.id);
  const stages = new Set(events.map((e) => e.stage));
  const lastStage = STAGE_SEQUENCE.filter((s) => stages.has(s)).pop() as TimelineStageKey;
  const expectedNext = ALLOWED_TRANSITIONS[lastStage];

  if (expectedNext !== parsed.data.stage) {
    return res.status(409).json({
      error: `Cannot move from "${lastStage}" to "${parsed.data.stage}". Expected next stage: "${
        expectedNext ?? 'none — already resolved'
      }".`,
      code: 'INVALID_TRANSITION',
    });
  }

  db.prepare(
    `INSERT INTO query_events (query_id, stage, message, actor, created_at) VALUES (?, ?, ?, ?, ?)`,
  ).run(
    row.id,
    parsed.data.stage,
    parsed.data.message ?? null,
    parsed.data.actor ?? 'Ganesh',
    new Date().toISOString(),
  );

  const updated = db.prepare('SELECT * FROM queries WHERE id = ?').get(row.id) as QueryRow;
  res.json(serializeQuery(updated));
});
