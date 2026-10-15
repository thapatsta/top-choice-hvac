# Claude Code prompt: build the repair and install ad landing pages (one shared template, two routes)

Paste everything below the line into Claude Code, run from the repo root. The mockups already live in this folder (`docs/lp-mockups/`: `repair-A.html`, `install-B.html` and two photos).

---

You are working in the Top Choice HVAC Next.js repo (Next.js 16, Tailwind v4, Cloudflare Workers). Build two Google Ads landing pages from ONE shared template:

- `/lp/furnace-repair` (new) = mockup `docs/lp-mockups/repair-A.html` ("A": call first, for the repair campaign)
- `/lp/furnace-installation` (exists, ads are live on it) = mockup `docs/lp-mockups/install-B.html` ("B": price first, for the install campaign)

Do NOT build two separate copies of everything. The two pages share about 90% (header, sticky bar, review carousel, form plumbing, FAQ, backend). Make a template component plus one config object per page.

## Read first (do not skip)
0. `AGENTS.md`: this Next.js version has breaking changes. Read the relevant guides in `node_modules/next/dist/docs/` before writing code. Branch from `main` and open the PR into `main`.
1. Open both mockups in a browser at 390px and 1440px. They are the visual and copy source of truth. Mockup photos are 900px resizes: copy them to `public/lp/` and use `next/image`. I will swap in full-resolution originals later.
2. The existing page and parts: `app/lp/furnace-installation/page.tsx`, `components/lp/LpLeadForm.tsx`, `LpStickyBar.tsx`, `GoogleReviewsCollage.tsx`, `components/SiteChrome.tsx`, `lib/landingPage.ts`, `lib/leadAdapter.ts`, `lib/notify.ts`, `app/api/leads/route.ts`, `components/thankyou/ThankYouContent.tsx`, `data/reviews.ts`, `lib/site.ts`, `lib/metadata.ts`, and the tests.
3. Project notes if present in the repo: `Claude outputs/ad-landing-page-build-2026-10-07.md` and `landing-page-changes.md`.

## Structure
- `lib/landingPages.ts`: a typed config per page (`repair`, `install`): slug, metadata title and description, H1, subhead, hero CTA labels, teaser (text, href, tracking id), form variant, FAQ list, photo, theme, sticky-bar buttons. Single constants for: `PRICE_FROM = "$2,199"`, `CALLBACK_PROMISE = "usually within 15 minutes"`, `REVIEW_COUNT_LABEL = "100+ reviews"`, `GOOGLE_RATING = "4.9"`, and the Nov 1 promo (see below). Every page-specific string lives here, not in JSX.
- `components/lp/` shared pieces: `LpHeader` (logo not linked, tap-to-call), `LpHero`, `LpTeaser`, `LpReviewsCarousel`, `LpFaq`, `LpStickyBar`, `LpForm` (variant-driven), `PromoBanner`. Reuse existing ones where they fit and extend them; delete anything left unused.
- `app/lp/furnace-repair/page.tsx` and `app/lp/furnace-installation/page.tsx` are thin: pick the config, render the template. Both `noindex`, NOT disallowed in `robots.ts` (Google Ads must crawl them), NOT in the sitemap. `SiteChrome` already hides the global header, footer and sticky bar on `/lp/*`; keep it that way.
- Drop the mockups' `?service=` URL switching and `data-svc` toggling. Each route renders one intent only.

## Page content (from the mockups)
**Repair page (A)**
- Slim promo banner, then H1 "Furnace broken? Call us for a repair." Subhead: repairs across the GTA, "you will know the price before we start any repair" (see claims below).
- Primary: full-width call button (`site.phone`). Secondary: 2-field form (name, phone), button "Call me", line "Rather not talk right now? Leave your number and we'll call you, usually within 15 minutes."
- Teaser under the form: "Furnace old, or failing again? New furnace installation starts at $2,199" linking to the repair-or-replace section on the same page (`#fork`).
- Google row (4.9, stars, "100+ reviews"), one photo, repair-or-replace section (two cards: Furnace repair, New furnace), review carousel, FAQ, closing CTA, sticky bar: Call + "Call me back" (scrolls to the form).
**Install page (B)**
- Same promo banner, H1 "A new furnace, installed, from" with a very large "$2,199" under it, note "Larger and higher-efficiency models cost more. You get your exact price in writing at a free visit to your home, before any work starts."
- Checklist with the animated check marks from the mockup (CSS stagger on load; respect `prefers-reduced-motion`). Google row. Form card "Get your price": name, phone, "What do you need?" select (New furnace preselected; Furnace repair; Not sure yet), optional checkbox "Also tell me about maintenance pricing (before Nov 1)", button "Get my price", line with the phone number.
- Teaser under the checklist: "Furnace not working right now? We repair too. Call (647) 763-2970" as a tap-to-call link.
- Review carousel, one install photo, FAQ, closing CTA, sticky bar: Call + "Free quote" (scrolls to the form).

## Review carousel (both pages)
Port from the mockup: scroll-snap track, filter chips (All, New furnace, Repairs and tune-ups), prev/next buttons, dots, auto-advance that starts only when visible (IntersectionObserver), pauses on touch/hover/focus for 12 seconds, no auto-advance under `prefers-reduced-motion`, animated star pop on the active card, keyboard accessible, labels for screen readers. Client component, no new dependencies.
Reviews: extract the 9 reviews from the mockup HTML into `data/reviews.ts` (first name, text, tags `install` / `repair`, `rating`). First names only, no surnames or photos. The star rating per review is NOT verified: store `rating: 5` as a field, add a `// TODO verify against Google` comment, and list it in your report. "Read reviews on Google" links to the real Google listing (`site.googleReviewsUrl`).

## Backend and tracking (important)
Reuse the existing `landing-page` lead source and `submitLead()`; do not add a new conversion event (it would double count in Google Ads).
- `lib/landingPage.ts` / `lib/leadAdapter.ts`: the form no longer collects postal code or email. Make `postalCode` and `email` optional for `landing-page` (required: `name`, `phone`, `service`). Add `landingPage: "repair" | "install"` and `maintenanceInterest?: boolean` to the lead, validated with type guards. Repair page posts `service: "furnace-repair"`; install page posts the select value.
- `lib/notify.ts`: email subject "New Ad Landing Page Lead (Repair) — {name}" / "(Install)"; add rows for landing page and maintenance interest.
- Keep attribution (gclid/utm), rate limiting and the `generate_lead` event exactly as they work today. If the analytics helper can pass a `landing_page` parameter on `generate_lead` without a new event, add it; otherwise skip.
- Thank-you page: keep the `landing-page` state, update the copy to the 15-minute promise via `CALLBACK_PROMISE`, and add a call button.
- Click-to-call taps use the existing `click_to_call` listener. Give every call link on the pages a `data-track-location` (e.g. `lp_repair_hero`, `lp_install_teaser`, `lp_sticky`).

## Claims: only these are approved
Approved: new furnace installation starts at $2,199 (higher-efficiency models cost more; exact price in writing at a free in-home quote); 10-year labour warranty on installs; satisfaction guarantee; same-day installs in many cases; Google 4.9; "100+ reviews"; phone (647) 763-2970; service area GTA (Brampton, Mississauga, Vaughan, Caledon, Etobicoke, Georgetown, Bolton); callback usually within 15 minutes.
Do NOT include: the street address anywhere; "24/7"; "licensed", "insured" or certifications; years in business; duct cleaning; invented reviews, ratings or numbers; competitor names.
Nov 1 maintenance banner: copy "Before Nov 1 | Preferred maintenance pricing". Put it behind `MAINTENANCE_PROMO` in `lib/landingPages.ts` with `enabled: true` and an expiry of 2026-11-01 00:00 America/Toronto; hide it automatically after that. Do not invent any price or discount terms. The repair-price promise and the diagnostic fee are unconfirmed: keep the mockup wording and list both in your report.

## Design rules
- Use repo Tailwind tokens and components (`Container`, `Button`, lucide-react). Add page-scoped CTA tokens: repair page orange `#e8590c` (dark `#c2410c`) on a dark navy header `#111827`; install page green `#157a3a` (dark `#0e5e2b`) on a white header. Contrast must meet WCAG AA for text and buttons.
- Fonts: the mockups use Barlow Semi Condensed and Source Sans 3. Use `next/font` (not a Google Fonts `<link>`), only on `/lp/*` routes, or fall back to the existing site fonts if that complicates the build.
- Mobile first. At 390px: hero headline, primary CTA and Google row visible in the first screen, sticky bar never covers a form field or button, no horizontal scroll. At 1440px: two-column hero as in the mockups.
- Images: `priority` on the hero image only, explicit width/height, descriptive alt text.

## Tests and verification
- Update and add tests: leadAdapter (landing-page without postal code or email; `landingPage` and `maintenanceInterest` fields; invalid values rejected), handlers, notify subject, sitemap exclusion for BOTH routes, robots not disallowing them.
- Add a guard test that scans the two page configs and rendered output for forbidden strings: "24/7", "licensed", "insured", "Lloyd", "base-tier", "66 reviews", "30 minutes", "duct".
- Run tests, lint, typecheck and the production build. With a local production build, use Playwright at 390x844 and 1440x900 on both routes: screenshots, no horizontal scroll, `noindex` meta present, form posts with gclid/utm attached, exactly one `generate_lead` per submit, teaser and sticky-bar links work, carousel filters and arrows work, reduced-motion respected. Run a mobile Lighthouse pass if available and report LCP.
- Compare your screenshots to the mockups and fix visible differences.

## Delivery
Work on a branch `claude/lp-repair-and-install`. Commit in logical steps. Do NOT push, deploy, or change any Google Ads URL. Write `Claude outputs/lp-repair-install-build-report.md` covering: what was built, what was verified vs not (real lead delivery needs Cloudflare bindings), every unconfirmed item (review star ratings, "100+ reviews" next to a Google listing that shows 66, price promise and diagnostic fee, Nov 1 pricing terms, callback business hours), and the steps to point the repair ads at `/lp/furnace-repair` and install ads at `/lp/furnace-installation`.
