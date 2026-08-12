# Project Overview — Smart Food Co. Supplier Query Management

Written as a handoff/context doc so a new session (or a human) can pick this project up cold.
For product rationale see `README.md` → "Product Decisions". For a chronological build log see
`PROJECT_PROGRESS.md`. This file is the **current-state snapshot**.

## What this is

A full-stack QA tool (React/TS/Vite frontend + Express/TypeScript backend + SQLite) for a food
company's QA manager to raise, track, and resolve supplier queries about allergens, certificates,
ingredient safety, and compliance docs. Built as a UX/UI intern hiring assignment; the backend was
added afterward to make the demo credible (real persistence, not mock data).

**GitHub:** https://github.com/2300069001/smart-food-supply-query (public)

## Demo login

```
ganesh@smartfoodco.com
demo123
```

Session-only auth (sessionStorage flag, no real backend session) — see `src/lib/auth.ts` +
`src/components/auth/RequireAuth.tsx`. `/` and all app routes redirect to `/login` when
unauthenticated; refreshing while logged in does NOT bounce you back to login (flag persists for
the tab's session).

## Repo state right now

- Git initialized, 1 commit on `main` (`eb6d3a4` — "feat: complete Smart Foods supplier query
  management system"), pushed to the public GitHub repo above.
- **Uncommitted changes exist** — deployment-prep work (see "What's uncommitted" below) has not
  been committed or pushed yet. Run `git status` / `git diff` before doing anything destructive.
- No secrets in the repo. `.env` is gitignored; `.env.example` (root) and `server/.env.example`
  document the variables without real values.

## Architecture

```
Frontend (Vite static build)  →  VITE_API_URL  →  Express API (separate service)  →  SQLite (local file)
```

Two independently deployable pieces. Frontend never talks to SQLite directly — everything goes
through `src/api/client.ts` (`fetch` wrapper reading `import.meta.env.VITE_API_URL`, falls back to
`http://localhost:4000`).

### Frontend (`src/`)
- React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Framer Motion, Lucide icons
- `pages/`: Login, SupplierList, RaiseQuery, QueryStatus
- `components/auth/RequireAuth.tsx`: route guard
- `components/ui/`: shared primitives (Button, Card, badges, form fields, loading/error/empty states)
- `api/`: typed fetch layer (`client.ts`, `suppliers.ts`, `queries.ts`)
- `lib/auth.ts`: sessionStorage-based demo auth

### Backend (`server/`) — separate npm package
- Express + TypeScript, dev via `tsx watch`, `better-sqlite3` for persistence, Zod for validation
- `src/db.ts`: opens/creates `server/data/app.db`, creates the `data/` dir if missing
  (`fs.mkdirSync(..., {recursive:true})` — required for a fresh clone to work), creates schema
  (`suppliers`, `queries`, `query_events` tables)
- `src/seed.ts`: exports `runSeed()` (destructive wipe+reseed, used by `npm run seed` CLI) and
  `seedIfEmpty()` (checks if `suppliers` table is empty, only seeds if so — called automatically
  on every server boot from `index.ts`, so a fresh deploy self-bootstraps and a restart never wipes
  data created through the UI)
- `src/index.ts`: Express app — CORS allow-list (`localhost:5173`/`5174` always + `FRONTEND_URL`
  env var if set, no wildcard), `GET /api/health` → `{"status":"ok"}`, mounts
  `routes/suppliers.ts` + `routes/queries.ts`, listens on
  `process.env.API_PORT || process.env.PORT || 4000`
- `src/lib/derive.ts`: pure functions — timeline construction, status derivation (overdue is
  **computed on every request** from due date + events, never stored), certificate expiry status
- `src/lib/serialize.ts`: DB row → API JSON shaping

**Why `API_PORT` before `PORT`:** `PORT` is the standard var hosting platforms (Render etc.) set —
checked and used correctly in production. `API_PORT` is a manual override that only matters when
running frontend+backend together locally under a tool/environment that happens to inject an
ambient `PORT` var for the whole process tree (this bit us during development inside the Claude
Code sandbox specifically — real local dev on a normal machine never sets `PORT`, so it's a no-op
there). Don't remove the `API_PORT` check without understanding this.

## What's uncommitted (deployment-prep work, done this session)

- `server/src/index.ts` — CORS allow-list, `PORT`/`API_PORT` resolution, health endpoint shape,
  calls `seedIfEmpty()` at boot
- `server/src/seed.ts` — refactored into `runSeed()` + `seedIfEmpty()` (see above); also fixed a
  cross-platform bug in the "am I the CLI entry point" check (was doing manual `file://` string
  concatenation which breaks on Windows paths — now uses `pathToFileURL()`)
- `server/package.json` / `server/package-lock.json` — removed an accidental self-referential
  `"supplier-query-management": "file:.."` dependency that had appeared (likely from an `npm
  install` run from the wrong directory) — would have broken a fresh `npm install`
- `README.md` — added a full Deployment section (architecture, env vars, per-service deploy steps,
  a note that SQLite here is demo-scale persistence, not a production DB choice); fixed a stale
  reference to the deleted `HoloBackground`/`components/login/` (removed two sessions ago when the
  login page's visual language was aligned with the rest of the app)
- **New files, not yet `git add`ed:** `.env.example` (root, documents `VITE_API_URL`),
  `server/.env.example` (documents `PORT`, `FRONTEND_URL`, `API_PORT`),
  `public/_redirects` (`/*  /index.html  200` — SPA fallback so `/login` and `/queries/:id` don't
  404 on a static host; Vite copies `public/` into `dist/` automatically)

**Not yet done:** these changes haven't been committed. Full verification (login flow, contextual
fields, submit, status progression, resolve, refresh/persistence) was manually re-run against real
production-accurate ports (4000/backend, 5173/frontend, no ambient `PORT` collision) and passed
completely. Not yet re-tested after this session's package.json fix, but that fix only touched
dependency declarations, not runtime code — low risk.

## How to run locally

```bash
npm run setup   # installs both frontend+backend deps, seeds the DB
npm run dev     # runs both dev servers together (frontend :5173, backend :4000)
```

## How to deploy (not yet done — this is the next step)

**Backend (e.g. Render Web Service):**
- Root directory: `server`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Env var: `FRONTEND_URL=<the frontend URL from the step below>` (set after frontend is deployed,
  or come back and add it once you know the URL)
- Render sets `PORT` automatically — nothing to configure there
- Note the resulting backend URL, e.g. `https://smart-food-api.onrender.com`

**Frontend (e.g. Render Static Site or Netlify):**
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Env var: `VITE_API_URL=<backend URL from above>`
- SPA routing is already handled by `public/_redirects` — no extra host config needed on Render or
  Netlify specifically; other static hosts may need an equivalent rewrite-all-to-index.html rule

**Order matters a bit:** deploy the backend first, grab its URL, set that as `VITE_API_URL` when
deploying the frontend, grab the frontend's URL, then go back and set `FRONTEND_URL` on the
backend service and redeploy/restart it (or set both as placeholder guesses if your host gives you
a predictable URL pattern before first deploy, e.g. Render's `<service-name>.onrender.com`).

## Known constraints / things not to "fix" without re-reading why

- SQLite is intentional for this assignment (see README's "A note on SQLite here") — don't swap to
  Postgres/etc. unless explicitly asked; the task history shows this was repeatedly and explicitly
  scoped out.
- Don't wrap `<Routes>` in Framer Motion's `<AnimatePresence>` again — this silently broke
  client-side navigation earlier (`navigate()` updated the URL but never re-rendered the matched
  route) and was reverted to plain `<Routes>` + enter-only page transitions. Documented in
  `PROJECT_PROGRESS.md`.
- The login page's background was deliberately toned down from an earlier dark/holographic design
  to match the rest of the app's light, restrained visual language — this was a direct, explicit
  instruction, not an oversight.
- Demo credentials are intentionally hardcoded/visible on the login screen itself — this is a demo
  auth flow by design, not a security gap to "fix."
