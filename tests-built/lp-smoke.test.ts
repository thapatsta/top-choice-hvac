// Smoke test of the six ad landing pages against the production build: the
// four legacy pages and the config-driven repair / install pages.
// Run `npm run build` first, then `npm run test:built`. CI runs both before
// deploy (see .github/workflows/deploy.yml).

import { spawn, type ChildProcess } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { LP_PAGES, REVIEW_COUNT_LABEL, GOOGLE_RATING } from "@/lib/landingPages";
import { LEGACY_LANDING_PAGES as LANDING_PAGES } from "@/lib/legacyLandingPages";
import { GOOGLE_REVIEWS, site } from "@/lib/site";
import { ADDRESS_TERMS, CREDENTIAL_TERMS, forbiddenHits, scanCopy } from "../tests/lpScan";

const PORT = 3217;
const BASE = `http://127.0.0.1:${PORT}`;
let server: ChildProcess;

async function waitForServer() {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/robots.txt`);
      if (res.ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("next start did not come up; did you run `npm run build`?");
}

beforeAll(async () => {
  // Never test against a stale server left on the port by an earlier run.
  const stale = await fetch(`${BASE}/robots.txt`).then(() => true, () => false);
  if (stale) throw new Error(`Port ${PORT} is already in use; stop that server first.`);
  // node directly (not npx) so the pid we kill is the server itself.
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(PORT), "-H", "127.0.0.1"],
    { stdio: "ignore", detached: true }
  );
  await waitForServer();
});

afterAll(() => {
  if (server?.pid) process.kill(-server.pid);
});

const htmlCache = new Map<string, string>();
async function page(path: string): Promise<{ status: number; html: string }> {
  const res = await fetch(`${BASE}${path}`);
  const html = await res.text();
  htmlCache.set(path, html);
  return { status: res.status, html };
}

/** Visible-ish text: tags and scripts removed, entities decoded. */
function textOf(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ");
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/'/g, "&#x27;");
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Every page shows the review count as "100+", never the listing's exact
// number (which only appears in JSON-LD, inside <script>).
describe("review count on the built pages", () => {
  const paths = [
    "/",
    "/reviews",
    "/contact",
    ...LANDING_PAGES.map((c) => `/lp/${c.slug}`),
    ...Object.values(LP_PAGES).map((c) => `/lp/${c.slug}`),
  ];
  for (const path of paths) {
    it(`${path}: shows 100+ reviews and never the exact count`, async () => {
      const { status, html } = await page(path);
      expect(status).toBe(200);
      const text = textOf(html);
      expect(text).not.toMatch(new RegExp(`\\b${GOOGLE_REVIEWS.count}\\b`));
      expect(text).toMatch(/100\+ (Google )?[Rr]eviews/);
    });
  }
});

describe("ad landing pages (production build)", () => {
  it("the live ad URL /lp/furnace-installation still returns 200", async () => {
    const { status, html } = await page("/lp/furnace-installation");
    expect(status).toBe(200);
    expect(textOf(html)).toContain("A new furnace, installed, from $2,199");
  });

  for (const config of Object.values(LP_PAGES)) {
    const path = `/lp/${config.slug}`;

    describe(`${path} (${config.key})`, () => {
      it("renders its h1, form, call links, Google row and reviews", async () => {
        const { status, html } = await page(path);
        expect(status).toBe(200);
        const text = textOf(html);
        expect(text).toContain(config.h1);
        expect(html).toContain(`name="landingPage" value="${config.key}"`);
        expect(html).toContain(`name="lp_slug" value="${config.slug}"`);
        expect(html).toContain('id="quote"');
        expect(html).toContain(`href="${site.phone.href}"`);
        expect(text).toContain(`Google ${GOOGLE_RATING}`);
        expect(text).toContain(REVIEW_COUNT_LABEL);
        expect((html.match(/data-review=""/g) ?? []).length).toBe(9);
        expect(html).toContain(`href="${site.googleReviewsUrl.replace(/&/g, "&amp;")}"`);
        // One intent per route: no ?service= switching left over.
        expect(html).not.toContain("data-svc");
      });

      it("is noindex, nofollow and self-canonical", async () => {
        const html = htmlCache.get(path) ?? (await page(path)).html;
        expect(html).toContain('<meta name="robots" content="noindex, nofollow"/>');
        expect(html).toContain(`<link rel="canonical" href="${site.url}${path}"/>`);
      });

      it("never renders the site chrome", async () => {
        const html = htmlCache.get(path) ?? (await page(path)).html;
        expect(html).not.toMatch(/<nav\b/);
      });

      it("has no business address, forbidden string or banned claim anywhere", async () => {
        const html = htmlCache.get(path) ?? (await page(path)).html;
        for (const re of ADDRESS_TERMS) expect(html).not.toMatch(re);
        for (const re of CREDENTIAL_TERMS) expect(textOf(html)).not.toMatch(re);
        expect(forbiddenHits(textOf(html))).toEqual([]);
        const problems = scanCopy(textOf(html)).filter(
          (p) => !p.startsWith("unqualified same-day") && !p.startsWith("heat pump / AC price")
        );
        expect(problems).toEqual([]);
      });

      it("loads no JavaScript that contains the business address", async () => {
        const html = htmlCache.get(path) ?? (await page(path)).html;
        const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)]
          .map((m) => m[1])
          .filter((src) => src.startsWith("/"));
        expect(scripts.length).toBeGreaterThan(0);
        for (const src of scripts) {
          const js = await (await fetch(new URL(src, BASE))).text();
          for (const re of ADDRESS_TERMS) expect(js, src).not.toMatch(re);
        }
      });
    });
  }

  for (const config of LANDING_PAGES) {
    const path = `/lp/${config.slug}`;

    describe(path, () => {
      it("renders with its h1, form, call button and reviews", async () => {
        const { status, html } = await page(path);
        expect(status).toBe(200);
        expect(html).toMatch(new RegExp(`<h1[^>]*>${escapeRegExp(escapeHtml(config.h1))}</h1>`));
        expect(html).toContain(`name="lp_slug" value="${config.slug}"`);
        expect(html).toContain(`name="lp_region" value="${config.region}"`);
        expect(html).toContain(`name="lp_service" value="${config.service}"`);
        expect(html).toContain(`href="${site.phone.href}"`);
        expect(textOf(html)).toContain(
          `${GOOGLE_REVIEWS.rating.toFixed(1)} from 100+ Google reviews`
        );
      });

      it("is noindex, nofollow and self-canonical", async () => {
        const html = htmlCache.get(path) ?? (await page(path)).html;
        expect(html).toContain('<meta name="robots" content="noindex, nofollow"/>');
        expect(html).toContain(`<link rel="canonical" href="${site.url}${path}"/>`);
      });

      it("contains no business address, anywhere in the HTML (incl. JSON-LD and the RSC payload)", async () => {
        const html = htmlCache.get(path) ?? (await page(path)).html;
        for (const re of ADDRESS_TERMS) expect(html).not.toMatch(re);
      });

      it("loads no JavaScript that contains the business address", async () => {
        const html = htmlCache.get(path) ?? (await page(path)).html;
        // Our own bundles only: gtag.js (googletagmanager.com) is Google's code.
        const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)]
          .map((m) => m[1])
          .filter((src) => src.startsWith("/"));
        expect(scripts.length).toBeGreaterThan(0);
        for (const src of scripts) {
          const js = await (await fetch(new URL(src, BASE))).text();
          for (const re of ADDRESS_TERMS) expect(js, src).not.toMatch(re);
        }
      });

      it("contains no credential-type claims, 24/7 outside repair, or other banned copy", async () => {
        const html = htmlCache.get(path) ?? (await page(path)).html;
        if (!config.credentialClaims.enabled) {
          for (const re of CREDENTIAL_TERMS) expect(html).not.toMatch(re);
        }
        const problems = scanCopy(textOf(html), {
          allowCredentials: config.credentialClaims.enabled,
          allowAlwaysOpen: config.service === "repair" && config.showEmergency247,
          noPrices: config.service === "heating-cooling",
        })
          // These rules are per sentence, so they can't run on a whole page
          // (e.g. "$2,199" and the form's "Heat pump" option are unrelated).
          // tests/lp-content.test.ts applies them to every copy unit.
          .filter(
            (p) =>
              !p.startsWith("unqualified same-day") &&
              !p.startsWith("heat pump / AC price") &&
              !p.startsWith("rebate amount")
          );
        expect(problems).toEqual([]);
      });
    });
  }
});
