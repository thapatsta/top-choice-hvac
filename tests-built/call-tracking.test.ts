// Call tracking against the production build: the Google tag is in the raw
// HTML, the number swap is scoped to marked elements, structured data keeps
// the real number, and no other format of the number is served.
// Run `npm run build` first, then `npm run test:built`.

import { spawn, type ChildProcess } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { LANDING_PAGES } from "@/lib/landing-pages";
import { ADS_CONVERSION_LABELS, ADS_ID, GA4_ID } from "@/lib/googleTag";
import { PHONE } from "@/lib/phone";

const PORT = 3218;
const BASE = `http://127.0.0.1:${PORT}`;
let server: ChildProcess;

beforeAll(async () => {
  const stale = await fetch(`${BASE}/robots.txt`).then(() => true, () => false);
  if (stale) throw new Error(`Port ${PORT} is already in use; stop that server first.`);
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(PORT), "-H", "127.0.0.1"],
    { stdio: "ignore", detached: true }
  );
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (await fetch(`${BASE}/robots.txt`).then((r) => r.ok, () => false)) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("next start did not come up; did you run `npm run build`?");
});

afterAll(() => {
  if (server?.pid) process.kill(-server.pid);
});

const cache = new Map<string, { html: string; headers: Headers; status: number }>();
async function get(path: string) {
  const hit = cache.get(path);
  if (hit) return hit;
  const res = await fetch(`${BASE}${path}`);
  const out = { html: await res.text(), headers: res.headers, status: res.status };
  cache.set(path, out);
  return out;
}

const PAGES = [
  "/",
  "/get-quote",
  "/emergency-service",
  "/contact",
  "/services/furnace-repair",
  "/thank-you",
  "/this-page-does-not-exist",
  ...LANDING_PAGES.map((c) => `/lp/${c.slug}`),
];

const headOf = (html: string) => html.slice(0, html.indexOf("</head>"));

/** Every <a> tag whose href is a tel: link. */
const telAnchors = (html: string) => [...html.matchAll(/<a\b[^>]*href="tel:[^"]*"[^>]*>/g)].map((m) => m[0]);

describe("Google tag in the raw HTML <head>", () => {
  for (const path of PAGES) {
    it(`${path}: gtag.js loader and the GA4 + Ads config are real <script> tags`, async () => {
      const head = headOf((await get(path)).html);
      expect(head).toContain(`<script async="" src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>`);
      expect(head).toContain('<script id="gtag-init">');
      expect(head).toContain(`gtag('config', "${GA4_ID}", { send_page_view: false });`);
      expect(head).toContain(`gtag('config', "${ADS_ID}");`);
      expect(head).toContain(`gtag('config', "${ADS_ID}/${ADS_CONVERSION_LABELS.callFromWebsite}", {`);
      // Exactly the format the page shows.
      expect(head).toContain(`'phone_conversion_number': "${PHONE.display}",`);
      expect(head).toContain("'phone_conversion_callback': function(formatted, plain)");
      // No Google class-based DOM rewrite.
      expect(head).not.toContain("phone_conversion_css_class");
    });
  }

  it("the config is gated to the production host", async () => {
    const head = headOf((await get("/")).html);
    const init = head.slice(head.indexOf('<script id="gtag-init">'));
    expect(init.indexOf("topchoicehvac")).toBeLessThan(init.indexOf("gtag('config'"));
  });
});

describe("phone links and number format", () => {
  for (const path of PAGES) {
    it(`${path}: every link to our number is marked data-call-link`, async () => {
      const { html } = await get(path);
      const ours = telAnchors(html).filter((a) => a.includes(`href="${PHONE.href}"`));
      for (const a of ours) expect(a).toContain('data-call-link=""');
      // Any other tel: link (gas utility) is never marked.
      for (const a of telAnchors(html).filter((x) => !x.includes(`href="${PHONE.href}"`))) {
        expect(a).not.toContain("data-call-link");
      }
    });

    it(`${path}: the number appears only as "${PHONE.display}" or E.164`, async () => {
      const { html } = await get(path);
      const any = /(?:\+?1[\s.-]?)?\(?647\)?[\s.-]*763[\s.-]*2970/g;
      const formats = new Set([...html.matchAll(any)].map((m) => m[0]));
      for (const f of formats) expect([PHONE.display, "+16477632970"]).toContain(f);
    });
  }

  it("landing pages render the number in swappable spans and swappable links", async () => {
    for (const c of LANDING_PAGES) {
      const { html } = await get(`/lp/${c.slug}`);
      expect(html).toMatch(/<span class="js-swap-phone" data-phone-text="">\(647\) 763-2970<\/span>/);
      expect(html).toContain('data-swappable="true"');
      expect(telAnchors(html).length).toBeGreaterThanOrEqual(4); // header, closing CTA, footer, sticky bar
    }
  });

  it("the footer NAP block and the contact page keep the real number (swap off)", async () => {
    for (const path of ["/", "/contact"]) {
      const { html } = await get(path);
      expect(html).toContain('data-swappable="false"');
    }
  });

  it("the server HTML never contains a forwarding number (the swap is client-only)", async () => {
    for (const path of PAGES) {
      const { html } = await get(path);
      expect(html).not.toContain("data-swapped");
    }
  });
});

describe("structured data and metadata keep the real number", () => {
  // The NAP JSON-LD pages must carry it; any other page's JSON-LD that has a
  // telephone must carry the same one.
  for (const [path, required] of [["/", true], ["/contact", true], ["/services/furnace-repair", false]] as const) {
    it(`${path}: JSON-LD telephone is +16477632970`, async () => {
      const { html } = await get(path);
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
      expect(blocks.length).toBeGreaterThan(0);
      const phones = blocks.join("").match(/"telephone":"[^"]*"/g) ?? [];
      if (required) expect(phones.length).toBeGreaterThan(0);
      for (const p of phones) expect(p).toBe('"telephone":"+16477632970"');
    });
  }
});

describe("Content-Security-Policy", () => {
  it("allows the Google Ads hosts and reports violations", async () => {
    const csp = (await get("/")).headers.get("content-security-policy") ?? "";
    for (const host of [
      "https://www.googleadservices.com",
      "https://googleads.g.doubleclick.net",
      "https://www.google.com",
    ]) {
      expect(csp).toContain(host);
    }
    expect(csp).toMatch(/connect-src 'self'/);
    expect(csp).toContain("report-uri /api/csp-report");
    // Nothing else loosened.
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-eval'/);
  });
});
