import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'app.db');

fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    certificate_name TEXT,
    certificate_expiry TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS queries (
    id TEXT PRIMARY KEY,
    supplier_id TEXT NOT NULL REFERENCES suppliers(id),
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    subject TEXT NOT NULL,
    question TEXT NOT NULL,
    attachment_name TEXT,
    context_json TEXT,
    created_at TEXT NOT NULL,
    due_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS query_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id TEXT NOT NULL REFERENCES queries(id),
    stage TEXT NOT NULL,
    message TEXT,
    actor TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_queries_supplier ON queries(supplier_id);
  CREATE INDEX IF NOT EXISTS idx_events_query ON query_events(query_id);
`);
