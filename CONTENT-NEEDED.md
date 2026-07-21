# Content & Assets Needed Before Launch

This is the Phase 1 build of the Top Choice HVAC website. It is fully
functional end-to-end (every page renders, the instant estimate tool submits
real leads, navigation and forms all work), but a number of real business
facts, assets, and integrations are placeholders. Search the codebase for the
literal string `[PLACEHOLDER` to find every instance inline — this document
groups them by topic for a client handoff.

## 1. Core business identity (highest priority)

- **Legal business name** — `lib/site.ts` → `site.legalName`
- **Real phone number** — `lib/site.ts` → `site.phone` (currently a fake
  placeholder number, used in `tel:` links sitewide, the sticky mobile call
  bar, and JSON-LD)
- **Real email address** — `lib/site.ts` → `site.email`
- **Physical street address, postal code** — `lib/site.ts` → `site.address`
  (used in the footer NAP block, `/contact`, and LocalBusiness JSON-LD on
  Home + Contact — must match the Google Business Profile exactly once one
  exists)
- **Domain name** — `lib/site.ts` → `site.url` / `site.domain` (currently
  `topchoicehvac.example`; update before launch, including in
  `metadataBase`)
- **Year founded** — `lib/site.ts` → `site.founded`
- **License / TSSA number** — `lib/site.ts` → `site.license` (shown in
  footer, `/about`, `/faq`)
- **Insurance wording** — `lib/site.ts` → `site.insurance`
- **Hours of operation & real emergency response commitment** —
  `lib/site.ts` → `site.hours` (currently plausible placeholders)
- **Social media handles** — `lib/site.ts` → `site.social` (not yet linked
  anywhere in the UI — add once handles exist)
- **Google Business Profile URL** — `lib/site.ts` → `site.social.google`

## 2. Service area

- **Confirm the complete, accurate list of GTA cities/regions served** —
  `lib/site.ts` → `site.serviceAreas`. Shown on the homepage service-area
  strip, the footer, and the dedicated `/service-area` page (built so it can
  be split into individual city landing pages in a later local-SEO phase).

## 3. Differentiators & trust signals

- **Real "Why Top Choice" differentiators** — `components/home/WhyUs.tsx`
  currently uses a plausible-but-generic starting set ("fast response",
  "upfront pricing", "local team", "we explain, don't upsell"). Confirm
  which of these are actually true and swap in anything more specific.
- **Years in business, star rating, review count, manufacturer
  certifications** — `components/home/TrustBar.tsx` (all placeholders)
- **Team bios and headshots** — `/about` page (currently 3 placeholder
  cards with no names)
- **Founding story** — `/about` page "Our Story" section

## 4. Reviews

- **Real, permissioned customer reviews.** No testimonials, star ratings,
  or review counts have been fabricated anywhere, including in structured
  data — this was treated as a hard rule throughout the build. `/reviews`,
  the homepage reviews section, and `data/reviews.ts` are all wired up with
  placeholder cards ready to receive real content.
- **Decision needed:** embed a live Google Business Profile review widget,
  or manually curate reviews with written customer permission to display.

## 5. Photography

No stock photography was used anywhere on the site — every visual is an
original icon/graphic treatment in the site's palette rather than a generic
stock photo, per the design brief. Real photos are needed for:

- Hero section imagery (currently an abstract icon graphic)
- `/gallery` — before/after job photos, company van, technicians on site
  (currently 6 labeled placeholder cards)
- `/about` — team headshots
- Social sharing image — currently a programmatically generated OG image
  (`app/opengraph-image.tsx`) with the wordmark and tagline; swap for a real
  branded image if desired

Once real photos exist, use `next/image` for anything added (already the
project convention) — sized, lazy-loaded below the fold, with descriptive
alt text — to keep Core Web Vitals green.

## 6. Pricing & financing

- **All dollar ranges in the instant estimate tool are placeholders** —
  `lib/estimate.ts` (`installedRanges`, `repairRanges`). These directly
  affect the "Good/Better/Best" framing shown to every `/get-quote` and
  `/emergency-service` submission.
- **Pricing philosophy** — flat-rate vs. estimate-based — referenced in
  `/faq` and several service pages
- **Financing partner and real terms** — `/financing` page; the payment
  calculator is fully functional but its interest-rate default and framing
  are illustrative only
- **Maintenance plan tiers and pricing** — `data/services.ts` →
  `maintenance-plans` entry

## 7. Rebates & promotions (change frequently — verify close to launch)

- **`data/rebates.ts`** — every program name, provider, and dollar amount is
  a placeholder. These are the fastest-changing content on the site and
  should be re-verified periodically even after launch.
- **`data/promotions.ts`** — seasonal offer copy, real discount amounts, and
  real date ranges

## 8. Commercial HVAC scope

- **Confirm whether Top Choice HVAC serves commercial/light-commercial
  clients at all**, and if so, what specifically. The `/services/commercial-hvac`
  page is built but every claim on it is flagged `[PLACEHOLDER: confirm
  commercial scope]` pending an answer.

## 9. Blog

- `/blog` currently ships 5 **starter outlines only** (title, meta
  description, target keyword, and section structure) — no fabricated full
  articles, per the brief. Full copy should come from the client or a
  follow-up content phase. See `data/blog.ts`.

## 10. Analytics & tracking

- **Google Analytics 4 measurement ID** — `lib/site.ts` → `site.ga4Id`
- **Google Tag Manager container ID** — `lib/site.ts` → `site.gtmId`
- Both are wired into `app/layout.tsx` behind a check that skips loading the
  scripts entirely while the IDs remain placeholders, so nothing fires
  until real IDs are set.
- **Google Search Console** — not yet set up; verify domain once live.

## 11. Lead delivery backend

- Leads from `/get-quote`, `/emergency-service`, and the `/contact` form
  currently only log server-side (see `app/api/leads/route.ts`,
  `app/api/contact/route.ts`, and `lib/leadAdapter.ts`). Nothing is lost,
  but nothing reaches a human automatically yet either.
- **Decide on a backend**: transactional email (Resend/SendGrid), a CRM
  webhook, or a spreadsheet/Zapier webhook. `lib/leadAdapter.ts` is the
  single integration point — see `.env.example` for the relevant
  environment variables to add once a provider is chosen.

## 12. Hosting & domain

- Real domain purchase/DNS
- Vercel (or equivalent) project + environment variables from this document
- Google Business Profile setup (explicitly out of scope for this phase,
  per the build brief, but required before the NAP data on this site can be
  considered final)

---

### How to find everything inline

Every placeholder in the codebase is also marked at the point of use with
the literal text `[PLACEHOLDER: ...]` describing exactly what's needed —
search the repo for `[PLACEHOLDER` to cross-reference this document against
the actual code.
