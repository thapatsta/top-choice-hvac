# Top Choice HVAC — Website (Phase 1)

Marketing site + on-site lead-gen funnel for Top Choice HVAC, a residential/
light-commercial HVAC contractor based in Brampton, ON serving the GTA.

**Before launch:** read [`CONTENT-NEEDED.md`](./CONTENT-NEEDED.md) — it lists
every real business fact, photo, and integration this build is waiting on.
Every placeholder in the code is also marked inline with `[PLACEHOLDER: ...]`.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 (theme tokens in `app/globals.css`, no `tailwind.config.js`)
- Route handlers for lead capture (`app/api/leads`, `app/api/contact`) with a
  pluggable backend adapter (`lib/leadAdapter.ts`) — currently logs only
- Structured content in `data/*.ts` rather than hardcoded copy, so non-dev
  staff can eventually edit it without touching layout code
- `lucide-react` for iconography (no stock photography used anywhere yet —
  see `CONTENT-NEEDED.md` for what real photography is needed)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build   # production build
npm run lint    # eslint
```

## Project structure

- `app/` — routes (see the site map in the PR description / project docs)
- `components/` — shared UI, page-section components (`components/home/`,
  `components/quote/`, etc.)
- `data/` — structured content: services, rebates, promotions, reviews,
  blog outlines, FAQs, nav, service areas
- `lib/` — site config/NAP (`site.ts`), metadata helper, lead adapter,
  instant-estimate pricing logic

## Design system

Palette: **Slate & Ember** — deep charcoal-navy (`--color-navy`) + a rust/
ember accent (`--color-ember`) on a warm cream background. Typography:
Archivo (display/headings) + Inter (body). All tokens live in
`app/globals.css`.
