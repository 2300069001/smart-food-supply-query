import { Router } from 'express';
import { db } from '../db.js';
import { getAllSupplierRows, serializeSupplier, STATUS_URGENCY } from '../lib/serialize.js';
import type { SupplierRow } from '../types.js';

export const suppliersRouter = Router();

suppliersRouter.get('/', (_req, res) => {
  const rows = getAllSupplierRows();
  const serialized = rows.map(serializeSupplier).sort((a, b) => {
    const urgencyA = a.worstStatus ? STATUS_URGENCY[a.worstStatus] : 4;
    const urgencyB = b.worstStatus ? STATUS_URGENCY[b.worstStatus] : 4;
    if (urgencyA !== urgencyB) return urgencyA - urgencyB;
    return a.name.localeCompare(b.name);
  });
  res.json(serialized);
});

suppliersRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id) as
    | SupplierRow
    | undefined;

  if (!row) {
    return res.status(404).json({ error: 'Supplier not found', code: 'SUPPLIER_NOT_FOUND' });
  }
  res.json(serializeSupplier(row));
});
