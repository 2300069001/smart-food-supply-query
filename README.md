# Smart Food Co. — Supplier Query Management

A full-stack QA tool that lets a Quality Assurance manager at a food company track supplier
queries about allergens, certificates, ingredient safety, and compliance documentation — instead
of losing that trail in email.

Built as a UX/UI intern hiring assignment. Frontend and backend are both real and functional;
data persists in SQLite and survives a restart.

## Product Decisions

**1. The problem.** QA teams ask suppliers safety-critical questions constantly — is this
ingredient RSPO-certified, has this certificate expired, what's the allergen declaration on this
batch. Handled over email, these questions get buried and nobody can answer "is anything overdue?"
without re-reading a thread.

**2. Target user.** A QA Manager who checks this once or twice a day, needs to know instantly who
needs a follow-up, and occasionally raises a new query when something comes up during inspection.

**3. User flow.** `Login → Supplier List → select supplier → Raise Query → Submit → Query Status →
Supplier Response → QA Review → Resolved`. It mirrors how the QA manager already thinks about the
problem — supplier first, then the specific question, then tracking it to close.

**4. Key UX decisions.**
- The supplier list sorts by urgency (overdue first) automatically — the manager shouldn't have to
  filter to find out who needs attention.
- Status is never color-only: every badge pairs an icon + text label.
- The Raise Query form uses **progressive disclosure** — selecting "Allergen Information" reveals
  product/allergen fields; "Certificate / Compliance" reveals certificate type/number/expiry.
  Nobody sees fields irrelevant to their question.
- The 5-stage timeline (Raised → Sent → Responded → QA Review → Resolved) is driven by real
  backend events, not a static illustration — advancing it via the action buttons on the Query
  Status page actually writes to the database.
- Certificate expiry is surfaced everywhere a QA manager would need it (supplier table, the form's
  supplier-context panel) with the same icon + text + date pattern for valid / expiring-soon /
  expired.

**5. Accessibility decisions.** Every status/priority pairing (Pending vs. Medium, both amber in an
earlier draft) was deliberately recolored so no two different concepts share a color at a glance.
Priority selection uses real `<input type="radio">` elements (not styled `<button>`s) for full
native keyboard support. All animation respects `prefers-reduced-motion` globally via Framer
Motion's `MotionConfig`.

**6. Technical architecture.** See below — a small Express + SQLite API behind a typed fetch layer,
no ORM, no auth framework, no state management library. Kept deliberately boring.

**7. Why a lightweight backend, not a "real" one.** This is a UX/UI assignment, not a backend
engineering one. The backend exists to make the demo credible (real persistence, real validation,
real SLA computation) without spending the budget on infrastructure nobody asked to see.

**8. What's next for production.** Real authentication (this login checks a fixed demo credential
pair, not a real user store), file upload storage for attachments (currently just a filename),
multi-user concurrency handling, and an actual notification channel to suppliers (currently
simulated).

**Demo login:** `ganesh@smartfoodco.com` / `demo123` (also shown on the login screen itself).

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Framer Motion, Lucide icons |
| Backend | Node.js, Express, TypeScript (`tsx` for dev), Zod validation |
| Database | SQLite via `better-sqlite3` |

## Project Structure

```
src/                          Frontend (Vite root)
  api/                        Typed fetch layer — suppliers.ts, queries.ts, client.ts
  components/
    ui/                       Shared primitives: Button, Card, badges, form fields, states
    layout/                   AppShell (header/nav), PageTransition (route animation)
    supplier/                 SupplierTable, SupplierFilters, SupplierStatsBar
    query/                    PrioritySelector, QueryTimeline, QueryActions, contextualFields
    login/                    HoloBackground (decorative)
  pages/                      Login, SupplierList, RaiseQuery, QueryStatus
  hooks/                      useFetch (data loading), useDocumentTitle
  types.ts                    Shared frontend type contracts (mirrors API responses)

server/                       Backend (separate package)
  src/
    db.ts                     SQLite connection + schema
    seed.ts                   Realistic food-safety demo data
    lib/derive.ts              Status/timeline/certificate computation (pure functions)
    lib/serialize.ts           DB row → API response shaping
    routes/suppliers.ts, queries.ts
    index.ts                  Express app entry
  data/app.db                 SQLite file (gitignored, created by seed script)
```

## Running it locally

Two one-time setup steps, then a single command for daily use.

```bash
# 1. Install both the frontend and backend dependencies, and seed the database
npm run setup

# 2. Start everything (frontend on :5173, API on :4000)
npm run dev
```

Open **http://localhost:5173**. Keep the terminal running — closing it stops both servers.

Other useful commands:

```bash
npm run seed          # reset the database back to the demo dataset
npm run build          # type-check + production build the frontend
```

If you ever need to run the pieces separately: `npm run dev:client` / `npm run dev:server`.

## API Reference

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/suppliers` | List suppliers, sorted by urgency, with computed status/certificate info |
| GET | `/api/suppliers/:id` | Single supplier |
| GET | `/api/queries` | List all queries |
| GET | `/api/queries/:id` | Single query with timeline + supplier response |
| POST | `/api/queries` | Create a query (validated with Zod) |
| PATCH | `/api/queries/:id/status` | Advance a query one lifecycle stage (rejects out-of-order transitions with `409`) |
| GET | `/api/queries/:id/timeline` | Timeline only |

Status (`pending` / `in-progress` / `resolved` / `overdue`) is never stored directly — it's derived
on every request from the query's events and due date, so "overdue" is always accurate to the
current moment, not whatever it was when the query was last touched.
