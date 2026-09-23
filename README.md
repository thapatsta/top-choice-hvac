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
as `[lead:<channel>:FAILED] key=<lead key> ...` with the full lead JSON. The
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
- `handlers.test.ts`: one test per form confirming its route handler
  actually calls `sendLeadNotification()`, returns 500 instead of "ok" when
  nothing was delivered, and rejects invalid submissions.

The deploy workflow runs this suite before deploying and blocks on failure.

> This pipeline is designed to be reused by the planned voice receptionist
> work, so keep `lib/notify.ts`'s function signatures backward-compatible
> where reasonable.

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
