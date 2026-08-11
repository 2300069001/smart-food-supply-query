# Project Progress

Development traceability log. Not part of the final submission, kept for reference.

## Completed

- Frontend prototype: 3 core screens (Supplier List, Raise Query, Query Status) + a demo Login
  screen, React Router, shared design system (Inter + Fraunces, brand/warn/info/danger tokens)
- Full-stack conversion: Express + TypeScript + SQLite backend, replacing all in-memory mock data
- REST API: suppliers + queries endpoints, Zod-validated POST/PATCH, real 404/409 error handling
- Real persistence verified — submitted queries and status changes survive a full page reload
- Status/timeline/overdue-days computed server-side from event history, not stored directly
- Certificate expiry tracking (valid / expiring-soon / expired) surfaced on the supplier table and
  the Raise Query form's supplier-context panel
- Progressive-disclosure contextual fields on Raise Query, keyed by category (Allergen Information,
  Certificate / Compliance, Ingredient Safety)
- Status-progression actions on Query Status (Log Supplier Response → Move to QA Review → Resolve),
  each backed by a real PATCH call and only shown for the query's current stage
- Framer Motion integrated: page transitions, form-error mount/unmount, banner entrance, timeline
  stagger reveal, table row entrance, button press feedback — all under `MotionConfig
  reducedMotion="user"` so `prefers-reduced-motion` is respected app-wide
- Responsive audit: no horizontal overflow at mobile (375px) or tablet (768px) on any of the 4
  screens; table scroll is intentionally contained, not page-level
- Accessibility spot-check: logical tab order, visible focus rings (brand-colored inset ring),
  native radio inputs for priority (full keyboard support), status never color-only

## V2 refinement pass

- Login now validates real demo credentials (`ganesh@smartfoodco.com` / `demo123`) instead of
  accepting any input — invalid credentials show an accessible error and never navigate
- Added a restrained ~450ms login→dashboard transition (button: idle → checking → success) before
  navigating, so authentication feels like entering the workspace rather than a hard cut
- Replaced the login's dark holographic background with the same light background/brand-accent
  language used everywhere else in the app, per explicit consistency requirements — deleted the
  now-unused `HoloBackground` component
- Replaced every "Riya Sharma" reference (header, QA-manager action attribution in
  `QueryActions.tsx`, backend event-actor defaults, seed data) with "Ganesh" — left all supplier
  contact names (Meera Krishnan, Daniel Osei, etc.) untouched since those are domain data, not the
  QA-manager identity

## Issues found & fixed along the way

- `better-sqlite3` risk on Windows (native compile) — verified it installs with prebuilt binaries,
  no fallback needed
- Preview tooling injected a `PORT=5173` env var for the frontend, which the backend was also
  reading — renamed the backend's port env var to `API_PORT` to avoid the collision
- `formatDate()` assumed bare `YYYY-MM-DD` strings; broke ("Invalid Date") once the API started
  returning full ISO timestamps — fixed to detect and handle both formats
- Supplier list lost its urgency-sort once data moved server-side (API returned DB order) — moved
  the sort into the `/api/suppliers` route
- A validation-summary banner bug from the earlier frontend-only version (stale `undefined` keys
  kept it visible after fields were fixed) — root-caused and fixed by deleting cleared error keys
  instead of nulling them
- **Critical: in-app navigation was silently broken.** Wrapping `<Routes>` in
  `<AnimatePresence mode="wait">` (added for route exit/enter transitions) caused `navigate()` to
  update the URL via `pushState` without the matched route's content ever re-rendering — clicking
  any nav button changed the address bar but left the old page on screen. This had gone undetected
  because prior verification happened to always land on already-correct pages rather than a fresh
  button-click navigation after the change was introduced. Fixed by reverting to plain `<Routes>`
  and keeping only the enter-animation (`PageTransition`'s `initial`→`animate`, which fires
  naturally on every page mount regardless of `AnimatePresence`) — correctness over a symmetrical
  exit fade. Verified via direct DOM inspection (URL vs. rendered `<h1>` mismatch) across two fresh
  tabs and a full dev-server restart before concluding it was a code bug, not environment flakiness.

## Decisions

- Kept the backend to two tables' worth of real complexity (`suppliers`, `queries`,
  `query_events`) — no ORM, no migrations framework, no auth framework. The brief is UX-focused;
  the backend exists to make the demo credible, not to showcase backend architecture.
- Login is explicitly a demo (any credentials work) — called out in the UI copy itself rather than
  pretending it's real auth.
- Framer Motion was scoped to state-change animations (errors appearing, banners, timeline reveal,
  page transitions) and explicitly kept out of anything that would read as "excessive" per the
  brief — no parallax, no idle looping attention animation on primary screens.

## Verification

- **Build:** `npm run build` — passes clean (`tsc -b && vite build`)
- **Typecheck:** `npx tsc -b` on both `src/` and `server/src/` — zero errors
- **Manual UX review:** full create → validate → submit → track → advance-to-resolved flow tested
  live in-browser against the real backend, including error/empty/not-found states, mobile/tablet
  layout, and keyboard focus
