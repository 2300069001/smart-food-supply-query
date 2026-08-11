# Project Brief — Supplier Query Management (for UI/UX + Framer Motion planning)

Paste this whole file into ChatGPT as context, then ask it to propose a Framer Motion plan.

## 1. What this project is

A **React/TypeScript frontend prototype** built for a **UX/UI Intern hiring assignment** at a food-safety
company ("Smart Food Co."). It's a QA Manager tool for tracking supplier queries about allergens,
certificates, ingredient safety, and compliance documentation.

**This is being graded as a hiring submission.** The brief it was built against explicitly said:
- Professional, trustworthy, clean, modern, enterprise-ready, safety-focused
- **"Do not add unnecessary features such as analytics dashboards, chatbots, complicated
  navigation, or excessive animations."**
- Avoid over-designing — a QA manager should be able to use this daily without friction
- Accessibility matters: never communicate status using color alone, visible focus states,
  logical hierarchy

**Implication for any Framer Motion plan:** the goal is *industry-grade restraint*, not a flashy
portfolio/agency-site feel. Think Linear, Stripe Dashboard, Notion — subtle, purposeful motion that
clarifies state changes — not landing-page hero animation, parallax, or scroll-jacking.

## 2. Tech stack (exact versions)

```
react: ^19.2.8
react-dom: ^19.2.8
react-router-dom: ^7.18.2
lucide-react: ^1.31.0 (icon set — keep using this, don't introduce a second icon library)

typescript: ~6.0.2
vite: ^8.2.0
@vitejs/plugin-react: ^6.0.4
tailwindcss: ^4.3.3 (using the new CSS-first @theme config, not tailwind.config.js)
@tailwindcss/vite: ^4.3.3
```

No state management library (just React useState/useMemo), no CSS-in-JS, no component library
(everything is hand-built on Tailwind utility classes). No backend — all data is an in-memory mock
dataset (`src/data/mockData.ts`).

**Framer Motion is not yet installed.** That's the ask: `npm install framer-motion` and integrate it
where it earns its place.

## 3. Routes / screens

| Route | Page | Purpose |
|---|---|---|
| `/login` | `src/pages/Login.tsx` | Mock sign-in screen with a dark holographic decorative background |
| `/` | `src/pages/SupplierList.tsx` | Main dashboard — searchable/filterable supplier table with status badges |
| `/queries/new` | `src/pages/RaiseQuery.tsx` | Form to raise a new query (validated) |
| `/queries/:id` | `src/pages/QueryStatus.tsx` | Query detail + 5-stage visual timeline + supplier response |

Flow: Login → Supplier List → (select supplier) → Raise Query → Submit → Query Status → (repeat).

## 4. File structure

```
src/
  App.tsx                        route definitions
  main.tsx
  types.ts                       Supplier, QueryQuery, TimelineStage, etc.
  constants.ts                   QUERY_CATEGORIES
  index.css                      Tailwind v4 @theme tokens + all custom CSS/keyframes
  data/mockData.ts                mock suppliers + queries, computed getters (getSuppliers, addQuery, etc.)
  utils/format.ts                 date formatting helpers
  hooks/useDocumentTitle.ts       sets document.title per route

  components/
    ui/          Button.tsx, Card.tsx, StatusBadge.tsx, PriorityBadge.tsx,
                  FormField.tsx (TextField/TextAreaField/SelectField), EmptyState.tsx
    layout/       AppShell.tsx  (header, top accent bar, page transition wrapper)
    supplier/     SupplierStatsBar.tsx, SupplierFilters.tsx, SupplierTable.tsx
    query/        PrioritySelector.tsx, AttachmentField.tsx, QueryTimeline.tsx,
                  SupplierResponseCard.tsx
    login/        HoloBackground.tsx  (decorative CSS/SVG background for /login)

  pages/
    Login.tsx, SupplierList.tsx, RaiseQuery.tsx, QueryStatus.tsx
```

Every UI primitive (Button, Card, badges, form fields) is a shared component reused across all
screens — the design system is intentionally small and consistent, not one-off per page.

## 5. Design system currently in place

**Typography**
- Body/UI/data: **Inter** (loaded via Google Fonts `<link>` in `index.html`) — used for everything
  data-dense: tables, forms, labels, badges. Chosen because tables/forms need to stay highly scannable.
- Display: **Fraunces** (a characterful serif) — used *only* for page-level `<h1>` headings
  (`font-display` Tailwind utility, generated from `--font-display` in the `@theme` block). Not used
  anywhere in tables, forms, or badges.
- `tabular-nums` applied to all dates/IDs/counts for aligned columns.

**Color tokens** (defined as CSS custom properties in `src/index.css` under `@theme`, which
auto-generates Tailwind utilities like `bg-brand-600`):
```
brand   (green)  — 50/100/200/500/600/700/900 — primary actions, "Resolved" status, safety identity
warn    (amber)  — 50/100/500/600/700 — "Pending" status
info    (blue)   — 50/100/500/600/700 — "In Progress" status
danger  (red)    — 50/100/500/600/700 — "Overdue" status, high priority, form errors
violet  (Tailwind default, unmodified) — used only for "Medium" priority badge, deliberately
                    distinct from the four status colors above so priority and status badges
                    never collide visually when shown side by side
cyan (Tailwind default) — used only on the /login decorative background, not elsewhere
--color-surface: #f9fafb — base page background
```
Every status/priority badge pairs an icon + text label with its color — never color alone
(accessibility requirement from the brief).

**Spacing / shape**
- Tailwind's default 4px spacing scale throughout, no custom scale
- Cards: `rounded-xl`, `border border-slate-200`, `shadow-sm`
- Buttons/inputs: `rounded-lg`
- Badges: `rounded-full`
- Page container: `max-w-7xl` (list/status pages), `max-w-2xl` (form)

## 6. Motion/animation already implemented (plain CSS, no library yet)

All defined in `src/index.css`, all wrapped in `@media (prefers-reduced-motion: reduce)` guards:

| Class | Where used | What it does |
|---|---|---|
| `.page-enter` | `AppShell.tsx` main content, keyed by `location.pathname` | 0.32s fade + 6px rise on route change |
| `.stage-pulse` | `QueryTimeline.tsx`, the "current" stage's dot | soft box-shadow pulse ring, 2.2s loop |
| `.holo-ring` / `.holo-glow` / `.holo-panel` | `HoloBackground.tsx` (login only) | slow rotate / breathing opacity+scale / gentle drift on the decorative HUD panels |

`AppShell.tsx` also does `window.scrollTo(0, 0)` on route change (useEffect keyed on
`location.pathname`) — note this was just added/edited outside of this conversation, keep it.

## 7. Where Framer Motion would actually add value (vs. where it shouldn't)

Good candidates — things that are currently either static or done with blunt CSS transitions,
where Framer Motion's spring physics / `AnimatePresence` would read as more polished:

- **Page transitions**: replace the CSS `.page-enter` keyframe with `AnimatePresence` +
  route-level `motion.div` for a proper exit+enter crossfade between screens (currently there's
  no exit animation at all, only enter).
- **Validation error messages** in `RaiseQuery.tsx` (`src/components/ui/FormField.tsx`): errors
  currently just appear/disappear instantly. A quick height+opacity animation on mount/unmount
  would feel more considered.
- **Success/overdue banners** in `QueryStatus.tsx`: currently appear instantly; a slide-down +
  fade would match how banners behave in tools like Linear/Stripe.
- **Table row entrance** in `SupplierTable.tsx` when filters change: a subtle staggered
  fade-in of rows (short, ~150ms, minimal stagger) makes filtering feel responsive rather than
  jarring re-render.
- **QueryTimeline stage reveal**: animate each stage in on mount with a slight stagger, replacing
  the current instant render — reinforces the "progress" narrative the timeline is meant to tell.
- **Stat tile / card hover and press states** (`SupplierStatsBar.tsx`, table rows): tiny scale/lift
  on press for tactile feedback, spring-based rather than linear CSS transition.

Explicitly **not** good candidates (would violate the brief's "no excessive animation" rule and
read as over-designed for an enterprise QA tool):
- Scroll-triggered reveals, parallax, or scroll-jacking anywhere
- Animating the Login page's holographic background further (it's already the most decorative
  element in the app — it shouldn't get *more* elaborate)
- Looping/attention-seeking animation on anything in the main data screens (table, form, status
  page) — motion there should only ever communicate a *state change*, never run idle
- Page-transition duration/easing that feels "bouncy" or springy in a showy way — should feel
  quick and functional, sub-300ms

## 8. What to ask ChatGPT for

1. A concrete Framer Motion integration plan against the "good candidates" list above — which
   `motion.*` primitives, `AnimatePresence` usage, and variant patterns to use for each, given
   React Router v7 + React 19.
2. Suggested timing/easing values that read as "enterprise SaaS" (Linear/Stripe/Notion-tier)
   rather than "marketing site" — likely short durations (120–260ms), low-displacement transforms
   (4–8px), restrained easing curves.
3. Whether any of the existing plain-CSS animations (`.page-enter`, `.stage-pulse`,
   `.holo-*`) should be ported to Framer Motion for consistency, or left as CSS since they're
   already working and adding a dependency for them alone may not be worth it — get an opinion
   on where the line is.
4. How to keep `prefers-reduced-motion` respected once Framer Motion is introduced (it has its
   own `useReducedMotion` hook — confirm the plan uses it consistently with what's already in
   `index.css`).
