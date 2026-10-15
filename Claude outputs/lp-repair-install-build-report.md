# Repair and install ad landing pages: build report

Date: 2026-10-15. Branch `claude/lp-repair-and-install` (from `main` at 4ec2b33). **Not pushed, not deployed. No Google Ads URL was changed.**

| Route | Mockup | Intent | Config |
|---|---|---|---|
| `/lp/furnace-repair` | `docs/lp-mockups/repair-A.html` | call first | `LP_PAGES.repair` |
| `/lp/furnace-installation` (live in ads) | `docs/lp-mockups/install-B.html` | price first | `LP_PAGES.install` |

Screenshots of the built pages, at 390×844 and 1440×900, are in `Claude outputs/lp-screenshots/`.

## 1. What was built

### The repo was not in the state the prompt assumed
- `/lp/furnace-repair` already existed. Six `/lp/*` pages were live on one template (`components/lp/LandingPage.tsx` + `lib/landing-pages.ts`): core furnace-installation, core furnace-repair, core heating-cooling, and three `/lp/outskirts/*` pages.
- `components/SiteChrome.tsx` no longer exists. Site chrome is kept off `/lp/*` by the `app/(site)` route group plus `app/lp/layout.tsx`. That is unchanged.
- The two project-notes files (`Claude outputs/ad-landing-page-build-2026-10-07.md`, `landing-page-changes.md`) are not in the repo.

**What I decided:** only the two core pages moved to the new template. The other four routes may be in running ads, so they stay on the old template, renamed to make that explicit: `LegacyLandingPage.tsx` and `lib/legacyLandingPages.ts`. None of the six URLs changed. Every old shared component is still in use (`LpLeadForm`, `GoogleReviewsCollage`, `LpCrosslink`, `LpFooter` by the legacy pages), so I deleted nothing.

### Structure
- **`lib/landingPages.ts`** holds a typed `LpPageConfig` per page:
  - slug, meta, H1, subhead or price note, checklist, hero call
  - photo, form variant, teaser (label, href or call, tracking id)
  - repair-or-replace cards, review headings, steps, FAQ, closing CTA, sticky buttons
  - the `lp_*` analytics context

  It also holds the single constants:
  - `PRICE_FROM`, `CALLBACK_PROMISE`, `REVIEW_COUNT_LABEL`
  - `GOOGLE_RATING`, derived from `GOOGLE_REVIEWS.rating` so there is still one source
  - `MAINTENANCE_PROMO` with `isPromoActive()`

  The file deliberately does not import `lib/site.ts`, which contains the street address. Client components import it, and the existing smoke test fails if the address reaches LP JavaScript. The rating, listing link and town list moved into two new NAP-free modules, `lib/googleReviews.ts` and `lib/serviceAreas.ts`. `lib/site.ts` re-exports them, so its API is unchanged.
- **`components/lp/LpTemplate.tsx`** is the shared server template. The routes are thin: they pick the config, export `noindex` metadata and render the template.
- **Shared pieces in `components/lp/`:**
  - `LpHeader`: logo not linked; tap-to-call shown from 760px up, as in the mockups. Legacy variant kept.
  - `PromoBanner` and `PromoGate`
  - `LpHero` (includes the Google row)
  - `LpTeaser`
  - `LpForm`: `callback` and `quote` variants
  - `LpReviewsCarousel`
  - `LpFaq`: themed variant added
  - `LpStickyBar`: themed variant added
  - `styles.ts` and `fonts.ts`
- **Theme:** page-scoped tokens on `.lpt[data-theme]` in `globals.css`, exposed to Tailwind as `bg-lp-cta`, `text-lp-muted` and so on.
  - Repair: orange `#e8590c` / `#c2410c` on a navy `#111827` header.
  - Install: green `#157a3a` / `#0e5e2b` on a white header.
- **Fonts:** Barlow Semi Condensed and Source Sans 3 via `next/font`, loaded only by the LP templates.
- **Images:** the mockup photos are in `public/lp/` and rendered with `next/image`, with explicit width/height and descriptive alt text. The repair hero uses `preload`, because Next 16 deprecates `priority` in favour of `preload`. The install photo is lazy.
- **Install checklist:** staggered pop-in of the check marks.
- **Review carousel:** star pop on the active card. Both animations are off under `prefers-reduced-motion`.
- **`?service=` switching and `data-svc` are gone.** Each route renders one intent. The repair-or-replace buttons and "Ask about maintenance pricing" now set the form's service or maintenance interest in place (`data-lp-pick`, `data-lp-maintenance`).

### Backend and tracking
- **Lead requirements:** `landing-page` leads require name, phone and service. Postal code and email are optional.
- **New lead fields:** `landingPage` (`repair` | `install`) and `maintenanceInterest` (boolean) are checked with type guards. **Invalid values are dropped and the lead is kept.** I chose not to return a 400, so an odd optional field can never lose a paid lead. Tell me if you would rather reject.
- **Email:**
  - Subject: `New Ad Landing Page Lead (Repair) — {name · phone}` or `(Install)`. I kept the phone after the name, as every other subject in `notify.ts` does.
  - New rows: "Ad landing page: Repair (/lp/furnace-repair)" and "Maintenance pricing: Yes / No".
- **Unchanged:** same `submitLead()`, same `landing-page` source, same attribution, same rate limiting, same single `generate_lead` plus the Ads `lead` conversion. `generate_lead` now also carries `landing_page`; it is the same event, not a new one.
- **Thank-you card:** "We'll call you back, usually within 15 minutes", large call button, no 24/7.
- **Call tracking:** every call link sits under a `data-track-location`, either on itself or an ancestor: `lp_header`, `lp_repair_hero`, `lp_install_teaser`, `lp_install_form`, `lp_repair_closing` / `lp_install_closing`, `lp_sticky`, `lp_footer`. The pages keep `data-lp-*` so `click_to_call` still gets `lp_slug` / `lp_service`. `PhoneLink` gained a `trackLocation` prop.
- **Callback promise:** `CALLBACK_PROMISE` is now "usually within 15 minutes". That also updates the four legacy pages, which said "typically within 30 minutes".

### Deliberate differences from the mockups
1. **Repair, phones only:** the Google row sits directly under the call button rather than at the bottom of the column. That keeps it in the first screen at 390px, as the spec requires. From 900px it is where the mockup has it.
2. **Sticky bar size:** labels are 19px rather than 17px. White on `#e8590c` is 3.6:1, which passes WCAG AA only as large text (≥ 18.66px bold). All orange button labels are ≥ 19px bold. Small orange text (teaser, links) uses `#c2410c` (5.2:1).
3. **Sticky bar hiding:** the bar slides away while a form field, a form button or another marked button is in its strip, or while a field has focus. On the install page at 390px it is therefore hidden on first load, because the Name field sits where the bar would be. It reappears once you scroll.
4. **Install form sub-line:** reads "We call you back, usually within 15 minutes." It is built from `CALLBACK_PROMISE` rather than the mockup's "We usually call back within 15 minutes."
5. **Tune-up section:** "Book your furnace tune-up before November 1" from the mockups is on both pages, behind the promo flag.
6. **Repair-only section:** "What happens when you call" is on the repair page only, as in the mockups.

## 2. Verified, and what was not

### Verified
- **Unit tests:** `npm test` passes, 335 tests. New and updated tests:
  - leadAdapter: no postal code or email; `landingPage` and `maintenanceInterest` kept; 6 invalid-value cases dropped
  - handlers: repair and install payloads return 200 with `landingPage`; a missing phone returns 400
  - notify subjects and rows
  - sitemap excludes both routes; robots doesn't disallow them; promo expiry
  - forbidden-strings guard over both configs, the shared constants, the reviews, **and** the rendered markup of both pages: "24/7", "licensed", "insured", "Lloyd", "base-tier", "66 reviews", "30 minutes", "duct"
  - every call link has a tracking location; form bodies; one `generate_lead` with `landing_page` on a production host; carousel filters; promo hiding
  - All in `tests/lpPages.test.tsx`.
- **Lint and types:** `npm run lint` and `npm run typecheck` are clean.
- **Build:** `npm run build` succeeds.
- **Production-build tests:** `npm run test:built` passes, 78 tests. Both routes:
  - return 200 with `noindex, nofollow` and a self-canonical
  - have no address in HTML or JavaScript, no forbidden strings and no site chrome
  - show 9 reviews
  - show the number only in the approved format
- **Playwright against `next start`, at 390×844 and 1440×900, 54 checks:**
  - no horizontal scroll; `noindex` present; images load
  - each form posts once with `gclid`/`utm_*` attached and the right `service` / `landingPage` / `maintenanceInterest`, with no `postalCode` or `email`
  - exactly one `generate_lead` per submit, then `/thank-you`
  - repair teaser lands on `#fork`; install teaser is `tel:`
  - "Call me back" and "Free quote" scroll to the form, and the sticky bar covers no field or button there
  - carousel prev/next, filter chips and arrow keys work
  - auto-advance runs only while visible, pauses after a touch, and never runs under reduced motion, where the check and star animations are also off
- **First screen at 390px:** on repair, the H1, call button (bottom at 432px) and Google row (480px) are visible above the sticky bar (top at 775px). On install, the H1, price, checklist and Google row (644px) are visible.
- **Lighthouse 12, mobile preset, local production server:**

| Page | Performance | Accessibility | Best practices | LCP | CLS | TBT |
|---|---|---|---|---|---|---|
| repair | 94 | 100 | 96 | 3.0 s | 0 | 40 ms |
| install | 94 | 100 | 96 | 3.1 s | 0 | 60 ms |

  LCP is simulated slow 4G. The LCP element is the hero paragraph, with TTFB 9 ms and render delay about 160 ms. Expect better from the Cloudflare edge, but this was not measured there.
- **Screenshots vs mockups:** compared at both sizes. I fixed:
  - a double space in "Call  (647)…"
  - the FAQ row height
  - link underlines

  What remains is the list in "Deliberate differences" above.

### Not verified
- **Real lead delivery:** KV, Resend email and the new subject line in a real inbox. This needs the Cloudflare bindings and secrets, so in the browser tests `/api/leads` was intercepted and answered 200. The route itself is covered by `tests/handlers.test.ts`.
- **Real Google traffic:** the proxy in this environment blocks `googletagmanager.com`. GA4/Ads hits were checked through the site's off-production `console.debug` path and a unit test that simulates the production host, not on the wire. Please do a Tag Assistant check after deploy: one `generate_lead` and one Ads `lead` conversion per submit, and the call-from-website swap on the new call buttons.
- **Image optimisation on Cloudflare:** `wrangler.jsonc` has no `images` binding, so the OpenNext image route returns the original files (900px, about 130 KB each). That works, but the images are not resized. Add an `IMAGES` binding when you swap in the full-resolution photos, otherwise large originals will be served as-is.
- **Real devices:** I did not test a real iPhone or Android, including keyboard or safe-area behaviour.
- **Promo expiry after deploy:** the pages are prerendered. After Nov 1 the browser hides the banner, tune-up section and checkbox on load, which is tested. The HTML still contains them until the next deploy, so redeploy (or set `enabled: false`) after Nov 1 to remove them from the HTML too.

## 3. Unconfirmed items (please confirm before or soon after launch)
1. **Review star ratings:** all nine are stored as `rating: 5` with `// TODO verify against Google` in `data/reviews.ts`. They are first names only, copied word for word from the mockups. I did not check that each review exists on the listing or what its stars are.
2. **"100+ reviews" next to a Google listing that showed 66.** `GOOGLE_REVIEWS.count` is still 66 (as of 2026-10-08). `REVIEW_COUNT_LABEL = "100+ reviews"` is the owner's figure and sits right beside the Google logo and rating. If the listing still shows fewer than 100, this is a claim a visitor or Google Ads review can check. It is one constant to change.
3. **Repair price promise:** "You will know the price before we start any repair" appears in the repair hero, the repair card ("You know the repair price before work starts") and the FAQ. The wording is kept from the mockup.
4. **Diagnostic / service-call fee:** unconfirmed. The pages say nothing about a fee, and the promise above could be read as free diagnosis.
5. **Nov 1 maintenance pricing terms:** only "Preferred maintenance pricing" / "preferred pricing on maintenance" is stated, with no price, discount or conditions. Is there an actual offer staff can quote when someone ticks the box?
6. **Callback promise outside business hours:** "usually within 15 minutes" is shown at all hours, and the old 24/7 wording is gone. What happens to a lead at 2 a.m.? It also now appears on the four legacy pages and the thank-you card.
7. **"Tell you what we can do today" and "same day":** the repair hero's "we will tell you what we can do today" is mockup copy. Same-day install is always qualified with "in many cases".

## 4. Seen in passing, not changed (outside this task)
- **Thank-you page chrome:** visitors land on `/thank-you`, which uses the normal site header and footer. The footer shows "Fully licensed and insured" (`site.insurance`) and the address, and the header/footer show "24/7". The card itself is clean.
- **Legacy pages:** `/lp/outskirts/furnace-installation` and `/lp/outskirts/furnace-repair` still say "base-tier furnace", and the outskirts repair page still shows 24/7 wording. Those pages were outside this brief, but the same claim rules probably apply.
- **Root metadata:** the default meta description in `app/layout.tsx` says "Licensed HVAC contractor". The LP pages override it with their own description.

## 5. Pointing the ads at the pages (after this branch is merged and deployed)
`main` is the only branch that deploys. These steps are for whoever owns the Google Ads account. Nothing here was done.

1. Merge into `main` and wait for the Deploy workflow. It runs lint, typecheck, unit tests, the build and the production-build smoke test, then deploys.
2. Open both URLs on a phone: `https://topchoicehvac.ca/lp/furnace-repair` and `https://topchoicehvac.ca/lp/furnace-installation`. Submit one test lead on each, confirm the email arrives with "(Repair)" or "(Install)" in the subject, and check Tag Assistant as described above.
3. **Install campaign:** ads already point at `/lp/furnace-installation`. Nothing to change, but the page content changed, so watch conversion rate and Quality Score for a week or two.
4. **Repair campaign:** in Google Ads → Campaigns → the furnace-repair campaign → Ads, edit each ad's **Final URL** to `https://topchoicehvac.ca/lp/furnace-repair`. Keep any tracking template or `{lpurl}` suffix as it is; gclid auto-tagging needs no change. If the repair ad group pointed at `/lp/furnace-repair` already, there is nothing to change. Editing a final URL sends the ad back through review.
5. **Sitelinks and call assets:** check that none still point at a removed `?service=` URL. Those were mockup-only and never live.
6. **After Nov 1:** set `MAINTENANCE_PROMO.enabled = false`, or leave it and redeploy once, so the expired offer is out of the HTML too.

## 6. Branch and commits
`claude/lp-repair-and-install`, 4 commits on top of `main`:
1. Move Google review facts and service areas into NAP-free modules
2. Landing-page leads: optional postal code/email, `landingPage` and `maintenanceInterest`
3. Repair and install landing pages from one config-driven template
4. Polish the landing pages after comparing them with the mockups

The report and screenshots are the fifth commit.
