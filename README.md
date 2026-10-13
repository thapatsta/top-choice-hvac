# Top Choice HVAC — Website (Phase 1)

Marketing site + on-site lead-gen funnel for Top Choice HVAC, a residential/
light-commercial HVAC contractor based in Brampton, ON serving the GTA.

**Before launch:** read [`CONTENT-NEEDED.md`](./CONTENT-NEEDED.md) — it lists
every real business fact, photo, and integration this build is waiting on.
Every placeholder in the code is also marked inline with `[PLACEHOLDER: ...]`.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 (theme tokens in `app/globals.css`, no `tailwind.config.js`)
- Route handlers for lead capture (`app/api/leads`, `app/api/contact`) feeding
  the lead delivery pipeline (KV log + email + emergency SMS) — see
  [Lead Delivery Pipeline](#lead-delivery-pipeline)
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
npm test        # vitest — lead pipeline regression tests
```

## Deployment

The site is hosted on Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare)
(`@opennextjs/cloudflare`), at the root of `topchoicehvac.ca`.

Deploys run automatically via [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)
on every push to the default branch (and can also be triggered manually from
the Actions tab via `workflow_dispatch`). The workflow runs lint + `npm test`
in a `test` job first; the `deploy` job `needs` it, so a failing test blocks
the deploy. It needs these repo secrets set under **Settings → Secrets and
variables → Actions** (plus the six lead-pipeline secrets listed in
[Lead Delivery Pipeline](#lead-delivery-pipeline)):

- `CLOUDFLARE_API_TOKEN` — a Cloudflare API token with permission to deploy
  Workers. Create one at
  [dash.cloudflare.com → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
  (the "Edit Cloudflare Workers" template covers this).
- `CLOUDFLARE_ACCOUNT_ID` — found on the Cloudflare dashboard's Workers &
  Pages overview page, or in the URL when viewing the account
  (`dash.cloudflare.com/<account-id>`).

To deploy manually instead of waiting on CI:

```bash
npm run deploy   # opennextjs-cloudflare build && wrangler deploy
```

This requires being logged in locally via `wrangler login`, or having
`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` set in the environment.

The custom domain is attached to the Worker from the Cloudflare dashboard:
**Workers & Pages → (this worker) → Settings → Domains & Routes → Add
Custom Domain**. This requires the `topchoicehvac.ca` zone to already be
active on Cloudflare (DNS managed by Cloudflare) before it can be attached.

## Lead Delivery Pipeline

Every form submission from `/get-quote`, `/emergency-service`, and `/contact`
goes through one pipeline:

```
form submit → route handler → normalize (lib/leadAdapter.ts)
            → sendLeadNotification (lib/notify.ts)
                ├─ KV log   (always)
                ├─ email    (always, via Resend)
                └─ SMS      (emergency-service only, via Twilio)
```

The three channels run independently: if one fails (e.g. Twilio is down or a
secret is still a placeholder), the others still run and the failure is logged
as `[lead:<channel>:FAILED] key=<lead key> source=<source>` plus the error.
Logs never include the lead body (name, phone, email, message) because Workers
Logs are retained. Use the key to find the record in LEADS_KV or the email. The
form only tells the customer "got it" if at least one channel succeeded;
if every channel fails it returns an error (and logs `[lead:UNDELIVERED]`) so
the customer is told to call instead.

### Files

- **`lib/leadAdapter.ts`**: the shared `Lead` type and one normalizer per
  source (`get-quote`, `contact`, `emergency-service`). Turns raw form JSON
  into a `Lead` without crashing on missing or mistyped fields. Also defines
  the required fields per source and the KV key format
  (`leads:<ISO timestamp>:<random suffix>`, which sorts chronologically).
- **`lib/notify.ts`**: `sendLeadNotification(lead)` plus the three
  independently callable channels `logLeadToKV(lead)`, `emailLead(lead)`,
  and `smsLead(lead)`. Each takes an optional `{ env, fetch }` second
  argument, which tests use to inject mocks. Any value starting with
  `REPLACE_ME` is refused and logged as an error rather than sent to the vendor.
- **`wrangler.jsonc`**: the `LEADS_KV` KV namespace binding (with its pinned id), plus
  `LEAD_FROM_EMAIL` under `vars` (the sender address, which isn't a secret).
- Call sites: `app/api/leads/route.ts` (quote + emergency) and
  `app/api/contact/route.ts`.

### Environment variables / secrets

| Name | Status | Where to get it |
| --- | --- | --- |
| `LEAD_NOTIFY_PHONE` | **Real value known.** Set it as a secret; it isn't committed | The phone that receives emergency SMS alerts, in E.164 format (`+1…`) |
| `RESEND_API_KEY` | Placeholder (needs a Resend account) | [Resend dashboard](https://resend.com) → **API Keys** → Create API Key |
| `LEAD_NOTIFY_EMAIL` | Placeholder (owner must choose the inbox) | The monitored inbox that should receive every lead email |
| `TWILIO_ACCOUNT_SID` | Placeholder (**Twilio account not yet created**) | [Twilio Console](https://console.twilio.com) → Account Info → Account SID |
| `TWILIO_AUTH_TOKEN` | Placeholder (**Twilio account not yet created**) | Twilio Console → Account Info → Auth Token |
| `TWILIO_FROM_NUMBER` | Placeholder (**Twilio account not yet created**) | Twilio Console → Phone Numbers → buy an SMS-capable number (E.164, e.g. `+1…`) |
| `LEAD_FROM_EMAIL` | Set in `wrangler.jsonc` `vars` (not a secret) | Defaults to Resend's shared test sender `onboarding@resend.dev`, which only delivers to the Resend account owner's own email. To send to any other inbox, verify a domain in Resend (Domains → Add Domain) and change this to an address on it |

Until the placeholders are replaced, leads are still captured in KV and
nothing crashes. Email/SMS fail loudly in the Worker logs on every lead.

**Every secret has to be set in two places.** Set it on the Worker, and
also as a GitHub Actions secret with the same name, because
`.github/workflows/deploy.yml` uploads the GitHub values to the Worker on
every deploy. If you set it only on the Worker, the next CI deploy
overwrites it. The deploy job fails early if any of the six GitHub secrets
is missing, and warns if one is still a `REPLACE_ME` placeholder.

```bash
# On the Worker (prompts for the value):
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put LEAD_NOTIFY_EMAIL
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_FROM_NUMBER
npx wrangler secret put LEAD_NOTIFY_PHONE
```

Then add the same six names/values under GitHub → **Settings → Secrets and
variables → Actions**.

For local dev, copy `.env.example` to `.dev.vars` (gitignored). `wrangler dev`
and `next dev` both read it.

### Lead attribution

Each lead carries where the visitor came from, so a Google Ads click can be
matched to a real lead.

- **What is captured** (`lib/attribution.ts`): the Google Ads click IDs
  (`gclid`, `gbraid`, `wbraid`), the five `utm_*` parameters, the landing
  page path (no query string), the referrer's hostname (only when it isn't
  our own site or localhost) and a `first_seen` timestamp. Values are
  trimmed and capped at 200 characters.
- **Where it lives in the browser**: `localStorage` key `tch_attribution`,
  captured once per page load by `components/AnalyticsListeners.tsx`, kept
  for 90 days. If storage is blocked, the lead simply has no attribution.
- **Overwrite rule**: first touch wins. A later visit keeps the stored value,
  unless its URL has a new `gclid` / `gbraid` / `wbraid`, which replaces it.
  An expired value counts as nothing stored.
- **On submit**: `lib/submitLead.ts` adds it to the POST body as
  `attribution`. The server (`normalizeAttribution()` in
  `lib/leadAdapter.ts`) keeps only the allowlisted string keys, strips
  control characters and caps length. It is optional; a lead without it is
  still valid.
- **Where it shows up**: the KV record (`attribution` field in the lead
  JSON; KV metadata is unchanged), an "Attribution" block at the end of the
  notification email (with a "Came from" summary row), and a short SMS
  suffix: ` [Google Ads]` for an ad click, else ` [<utm_source>]`.
- It is never sent to Google Analytics.

### Thank-you page

After a successful submit, each form calls `router.replace()` to
`/thank-you` (`app/thank-you/page.tsx`), so Back doesn't return to a
filled-in form.

- **Clean URL** (`lib/thankYou.ts`): the address bar always shows a plain
  `/thank-you`. Before navigating, the form stores `source`
  (`get-quote` | `emergency-service` | `contact`) and, for the quote form,
  `need`, `system` and `urgency` in `sessionStorage`; the page reads them to
  tailor its message. Nothing personal (no name) is ever stored. Unknown
  values are ignored; a direct visit (or blocked storage) gets a neutral
  "Thanks for getting in touch" with no claim that a request arrived.
- **Analytics**: `generate_lead` still fires once, in `lib/submitLead.ts`, on
  the form page. The thank-you page fires no event of its own, so a refresh,
  Back or direct visit can't create a lead. In GA4, `page_view` with
  `page_path = /thank-you` should roughly equal the `generate_lead` count.
- **Indexing**: `noindex, nofollow`, and left out of `app/sitemap.ts`. The
  page stays statically prerendered: `sessionStorage` is read on the client
  (`useSyncExternalStore`).

### Reading the lead log

```bash
# List every lead (oldest first; metadata shows source/name/phone):
npx wrangler kv key list --binding=LEADS_KV --remote

# Only leads from September 2026, for example:
npx wrangler kv key list --binding=LEADS_KV --remote --prefix="leads:2026-09"

# Full record for one lead:
npx wrangler kv key get "leads:2026-09-23T14:05:00.000Z:abc123def456" --binding=LEADS_KV --remote
```

Use `--local` instead of `--remote` to read what `wrangler dev` wrote locally.

#### KV namespace

`LEADS_KV` points at namespace `5e0fad8618184248b03f26b3b9b66408` (set as
`id` in `wrangler.jsonc`). If it's ever recreated, update that `id`
(`npx wrangler kv namespace list` shows it).

### Tests

```bash
npm test   # vitest run
```

Tests live in `tests/`:

- `leadAdapter.test.ts`: normalization for all three sources, including
  empty, null, and wrongly typed payloads (must not crash).
- `notify.test.ts`: Resend, Twilio (via mocked `fetch`), and KV are all
  mocked. Covers the KV key format, the email destination and the
  per-source subject line, and that SMS goes out only for emergency-service.
  Also covers **independent failure**: any one channel throwing must not
  stop the other two.
- `attribution.test.ts` / `submitLead.test.ts`: attribution capture and the
  first-touch rule, and the shared form submit helper (GA events fire once,
  attribution is posted but never tracked).
- `handlers.test.ts`: one test per form confirming its route handler
  actually calls `sendLeadNotification()`, returns 500 instead of "ok" when
  nothing was delivered, and rejects invalid submissions.
- Call tracking: `callIntent.test.ts` (payload allowlist, bot filter, de-dupe,
  beacon), `callTracking.test.ts` (the click listener in a DOM, including after
  a simulated number swap), `callIntentRoute.test.ts` (the route, rate limit,
  email caps, kill switch, no PII), `callReport.test.ts` (Toronto day bounds),
  `phoneFormat.test.ts`, `cspReport.test.ts`, `deployConfig.test.ts`.
- `tests-built/call-tracking.test.ts` (with `npm run test:built`): the Google
  tag in the raw `<head>`, phone link markers and number format on every page,
  JSON-LD, CSP.

The deploy workflow runs this suite before deploying and blocks on failure.

> This pipeline is designed to be reused by the planned voice receptionist
> work, so keep `lib/notify.ts`'s function signatures backward-compatible
> where reasonable.

## Call tracking

At the end of the day we want to know who called from the site, and for
Google Ads traffic whether a real call connected, from which campaign and
landing page, and for how long. There are three layers. **A tap is intent,
not a connected call**: the visitor can cancel the dialer.

| Layer | What it measures | Who | Where it lives |
| --- | --- | --- | --- |
| 1. Call intent | A tap on one of our "Call" links | Every visitor, every device | GA4 `click_to_call`; Google Ads "Call tap" (secondary); KV `calls:*` + an email |
| 2. Connected calls from ads | A real call to the Google forwarding number, with duration, campaign, ad group | Google Ads visitors only | Google Ads → Conversions → "Calls from website" (primary) |
| 3. Full call log | Every call, all sources (organic, direct, GBP) | Everyone | **Not built.** See [Future: full call log](#future-full-call-log) |

### Layer 1: call taps

- **One source of truth for the number.** `lib/phone.ts` holds
  `PHONE.display` = `(647) 763-2970`, the only format the number may appear in
  (Google's swap needs an exact match; `tests/phoneFormat.test.ts` and
  `tests-built/call-tracking.test.ts` fail on any other format). Every link to
  it is `<PhoneLink>` and every printed number is `<PhoneText>`
  (`components/Phone.tsx`). `<PhoneLink>` marks the link `data-call-link`.
  Third-party numbers (the gas utility, 911) must never use these.
- **The listener** (`lib/callTracking.ts`, installed by
  `components/AnalyticsListeners.tsx`) counts a click on any
  `[data-call-link]` (falling back to the real number's or the forwarding
  number's digits), so taps still count after the number swap.
- **Per tap** it sends GA4 `click_to_call` with `link_location`, `lp_slug` /
  `lp_region` / `lp_service` on `/lp/*`, `device_class` (`touch` = coarse
  primary pointer, or `pointer`), `intent` (`emergency` inside a
  `data-call-intent="emergency"` container: the emergency page and the
  emergency thank-you button; else `general`), `post_lead` (on `/thank-you`, or
  after a lead was sent from this tab) and `swapped` (the link showed a
  forwarding number).
- **Google Ads "Call tap"** fires only when `device_class` is `touch`, `post_lead`
  is false and the browser isn't automated. It is **secondary (observation
  only)** in Google Ads, so a person who taps and then calls isn't counted
  twice.
- **De-dupe**: a second tap on the same location within 5 s does nothing.
- **Server log**: the tap is also sent with `navigator.sendBeacon` (text/plain
  JSON, fetch keepalive fallback) to `POST /api/call-intent`, so it survives ad
  blockers and the hand-off to the dialer. Only from the production host and
  local dev, never preview hosts, never automation. The route checks, in
  order: per-IP rate limit (`CALL_RATE_LIMITER`, 10/min, separate from the lead
  forms' budget), same-site `Origin`, a bot user-agent filter (quiet 204), a
  4 KB size cap and a strict allowlist (unknown keys are rejected; attribution
  values that look like an email or phone number are dropped). Nothing
  personal is ever sent.
- **KV**: `calls:<ISO timestamp>:<random>` with a 90-day TTL. The KV metadata
  holds the report fields, so the report needs only `kv key list`.
- **Email** to `LEAD_NOTIFY_EMAIL` via Resend, e.g. `Call tap: furnace-repair
  (mobile) [Google Ads]` (🚨 prefix for emergency intent, "(after a form lead)"
  for post-lead taps). Never SMS (SMS stays for emergency form leads).
- **Caps** (`CALL_INTENT_CAPS` in `lib/notify.ts`, counted in KV doc
  `callcap:<UTC date>`): at most 20 emails per hour, 40 per day and 300 KV
  records per day. These are for the free plans: Resend allows 100
  emails/day and KV 1,000 writes/day, and form leads share both, so call taps
  can never use up the form leads' room. Over a cap, the tap is KV-only (or
  Worker-log only past 300). If the counter can't be read or written, no email
  is sent.
- **Kill switch**: `CALL_INTENT_NOTIFY` under `vars` in `wrangler.jsonc`,
  `email` (default) or `off` (KV only). It ships with every deploy; a
  dashboard edit is overwritten by the next deploy, so change it in the file.
- Form leads (`sendLeadNotification()`) are untouched: call taps use their own
  `logCallIntent()` and only share read-only formatting helpers.

### Layer 2: connected calls from ads (Google forwarding number)

- `app/layout.tsx` renders the Google tag as plain `<script>` tags in the
  server-rendered `<head>` (Google's tag checks need it in the raw HTML;
  `next/script` can't do that in this Next version). On the production host it
  configures GA4 (`send_page_view: false`), Google Ads (`AW-18478339536`) and
  Google's phone snippet:
  `gtag('config', 'AW-18478339536/<callFromWebsite label>', { phone_conversion_number: '(647) 763-2970', phone_conversion_callback })`.
- For a Google Ads visitor Google calls `phone_conversion_callback` with a
  forwarding number. The callback stores it (`lib/phoneSwap.ts`) and React
  re-renders every `<PhoneLink>` / `<PhoneText>` with it. Nothing else can
  change: JSON-LD, metadata and `NAP_JSON_LD` keep the real number, and the
  footer and contact-page NAP blocks are `swap={false}`. The server HTML always
  has the real number, for crawlers and organic visitors.
- We don't use `phone_conversion_css_class` (Google rewriting the DOM React owns
  breaks on hydration and client navigation) or `phone_conversion_options`
  (Google's defaults; its keys couldn't be checked against Google's docs).
- Google logs each call (time, duration, campaign, ad group) and counts a
  conversion above the minimum call length set in the account (30 s). Primary.
- Every Ads conversion is gated like the tag: no-op off production, without
  gtag, or while its ID/label in `lib/googleTag.ts` is a `"[PLACEHOLDER..."`
  value.

> **AI receptionist / phone tree caveat.** Google documents forwarding numbers
> as incompatible with phone trees that use "early media" (audio played before
> the call is answered): calls can be mis-reported as missed. Before putting an
> IVR or the planned AI voice receptionist in front of (647) 763-2970, test a
> call through the forwarding number and check it is reported correctly, or
> move layer 2 to our own tracking number (layer 3).

### Other conversions and GA4

- **Form lead** (`lead` label, primary): fired by `lib/submitLead.ts` right
  after `generate_lead`, only on a delivered lead, with a random
  `transaction_id`. Don't also import GA4 `generate_lead` into Ads as a primary
  conversion, or form leads count twice.
- **Page views**: `components/PageViewTracker.tsx` sends one GA4 `page_view`
  per pathname change, with `page_location` as the full URL (GA4 reads utm and
  gclid from it; without it ad traffic shows as Direct) and our own `page_path`
  pathname-only. **In GA4 → Admin → Data streams → Enhanced measurement, turn
  OFF "Page changes based on browser history events"**, or client navigations
  count twice.
- All GA4 events go with `send_to: G-NVWFCHZ8S3`, so they don't leak into the
  Ads destination.
- **Join keys**: the GA4 `client_id` / `session_id` ride along with each lead's
  attribution (`ga_client_id`, `ga_session_id`: KV record and email only, never
  GA params), so a lead can be matched to its GA4 session.
- **CSP**: `next.config.ts` allows the Google Ads hosts (each commented) and
  sends violations to `/api/csp-report`, which logs
  `[csp:BLOCKED] directive=… blocked=<origin>` in Workers Logs. After a deploy,
  search the logs for `csp:BLOCKED` to find any host still missing.

### End-of-day report

```bash
node scripts/call-report.mjs              # today, America/Toronto
node scripts/call-report.mjs 2026-10-13   # a given Toronto day
node scripts/call-report.mjs --local      # wrangler dev's local KV
```

It prints call taps by landing page/button, device, intent and source; form
leads by form and source; and mobile new-intent taps per form lead. Keys are
UTC, so a Toronto day spans two UTC dates; DST days are 23 and 25 hours
(tested in `tests/callReport.test.ts`). It prints counts only, never a lead's
details. Connected calls (layer 2) are in Google Ads, not KV.

**Emailing it at ~8pm ET** (not built): a Cloudflare cron needs a `scheduled`
handler, and the OpenNext worker (`.open-next/worker.js`) only exports
`fetch`. Adding one means a custom worker entry that wraps OpenNext's and
re-exports its Durable Objects: a risky change to the deploy path. The safer
option is a separate small Worker with its own `wrangler.jsonc`, a cron trigger
(`0 0 * * *` UTC = 8pm EDT / 7pm EST; there is no TZ in Workers crons) and a
binding to the same `LEADS_KV` namespace, reusing the report logic.

### Call tracking env vars

| Name | Kind | Notes |
| --- | --- | --- |
| `CALL_INTENT_NOTIFY` | `vars` in `wrangler.jsonc` | `email` (default) or `off` |
| `CALL_RATE_LIMITER` | rate-limit binding in `wrangler.jsonc` | 10 taps/min per IP, namespace 1002 |
| `LEAD_NOTIFY_EMAIL`, `RESEND_API_KEY` | existing secrets | reused for call-tap emails; already passed by `deploy.yml` (`tests/deployConfig.test.ts` checks) |

No new secrets.

### Future: full call log

Layer 3 (every call, including organic, direct and Google Business Profile)
needs our own tracking number: a Twilio number (Twilio is already in the
stack) that forwards to the real line and logs each call to KV, or the AI
receptionist platform's own call log. Sequencing: decide this together with the
AI voice receptionist, since that changes what answers the line (see the
phone-tree caveat above).

## Project structure

- `app/` — routes (see the site map in the PR description / project docs)
- `components/` — shared UI, page-section components (`components/home/`,
  `components/quote/`, etc.)
- `data/` — structured content: services, rebates, promotions, reviews,
  blog outlines, FAQs, nav, service areas
- `lib/` — site config/NAP (`site.ts`), metadata helper, lead adapter +
  delivery pipeline (`leadAdapter.ts`, `notify.ts`), instant-estimate pricing
  logic
- `tests/` — vitest suite (`npm test`)

## Design system

Palette: **Slate & Ember** — deep charcoal-navy (`--color-navy`) + a rust/
ember accent (`--color-ember`) on a warm cream background. Typography:
Archivo (display/headings) + Inter (body). All tokens live in
`app/globals.css`.
