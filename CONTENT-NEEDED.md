# Content & Assets Needed Before Launch

This is the Phase 1 build of the Top Choice HVAC website. It is fully
functional end-to-end (every page renders, the instant estimate tool submits
real leads, navigation and forms all work), but a number of real business
facts, assets, and integrations are placeholders. Search the codebase for the
literal string `[PLACEHOLDER` to find every instance inline — this document
groups them by topic for a client handoff.

## 1. Core business identity (highest priority)

- ~~**Legal business name**~~ **Confirmed:** `site.legalName` is
  "Top Choice HVAC Inc." — this is intentionally different from the Google
  Business Profile listing name ("Top choice air system inc"); see the
  open NAP name-mismatch item below.
- ~~**Real phone number**~~ **Done:** `site.phone` is now
  `(647) 763-2970`.
- **Real email address** — `lib/site.ts` → `site.email`
- ~~**Physical street address, postal code**~~ **Done:** `site.address` is
  now 3 Lloyd Cres, Brampton, ON L7A 0G4, matching the Google Business
  Profile.
- ~~**Domain name** — `lib/site.ts` → `site.url` / `site.domain`~~ **Done:**
  domain is now `https://topchoicehvac.ca`.
- ~~**Year founded**~~ **Done:** `site.founded` is now `"2021"`.
- **License / TSSA number** — `lib/site.ts` → `site.license` (shown in
  footer, `/about`, `/faq`) — still a fake placeholder, real number not yet
  provided.
- **Insurance wording** — `lib/site.ts` → `site.insurance`
- **Hours of operation & real emergency response commitment** —
  `lib/site.ts` → `site.hours` (currently plausible placeholders)
- ~~**Social media handles**~~ **Partially done:** `site.social.instagram`
  is now real (`https://instagram.com/topchoiceairsystem`). Confirmed no
  Facebook page exists (`site.social.facebook` is `null`).
  `site.social.google` is still a placeholder — GBP URL not yet provided.
- **Google Business Profile URL** — `lib/site.ts` → `site.social.google`
  (still a placeholder)
- **NAP name mismatch (open, flagged 2026-08-20):** the Google Business
  Profile is listed as "Top choice air system inc", which does not match
  `site.name` ("Top Choice HVAC") used in `NAP_JSON_LD`. Decision: keep the
  site's branding and rename the Google Business Profile listing to match
  instead — see the `TODO` above `NAP_JSON_LD` in `lib/site.ts`. This is a
  live NAP inconsistency until the GBP name is changed.

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
- ~~**Years in business, star rating, review count**~~ **Done:**
  `components/home/TrustBar.tsx` now shows "5+ Years in Business" (from
  `site.founded`) and "5.0★ (23 Google Reviews)". **Manufacturer
  certifications** ("Certified Dealer Network") is still a placeholder.
- **Team bios and headshots** — `/about` page (currently 3 placeholder
  cards with no names)
- **Founding story** — `/about` page "Our Story" section

## 4. Reviews

- ~~**Real, permissioned customer reviews.**~~ **Done (2026-08-20):**
  `data/reviews.ts` now holds 6 real, publicly-posted 5-star Google reviews
  (attributed as first name + last initial, e.g. "Jasmeen D.", per standard
  practice), and `aggregateRating` is set to the real 5.0★/23-review total
  from the Google Business Profile. `/reviews` and the homepage reviews
  section render these. Re-check the listing periodically for newer
  reviews to add.
- ~~**Decision needed:** embed a live Google Business Profile review
  widget, or manually curate reviews with written customer permission to
  display.~~ **Decided:** manual curation (see above), not a live widget.

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

- ~~**Google Analytics 4 measurement ID** — `lib/site.ts` → `site.ga4Id`~~
  **Done:** live GA4 measurement ID is `G-NVWFCHZ8S3` (property "Top Choice
  HVAC", web data stream for `https://topchoicehvac.ca`).
- **Google Tag Manager container ID** — `lib/site.ts` → `site.gtmId`
- Both are wired into `app/layout.tsx` behind a check that skips loading the
  scripts entirely while the IDs remain placeholders, so nothing fires
  until real IDs are set. GTM's script still won't load until a real
  container ID replaces its placeholder.
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
