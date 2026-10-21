// The city pages against the production build. Run `npm run build` first,
// then `npm run test:built` (CI does both before deploy).
//
// While a city is ready: false it must be a real 404 in production and absent
// from the sitemap, hub and /llms.txt. For every ready city the raw HTML (no
// JavaScript) must already contain the issues and FAQ answers, one h1, valid
// JSON-LD, and none of the banned content.

import { spawn, type ChildProcess } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ALL_CITIES, cityPath, publishedCities } from "@/content/cities";
import { BANNED_CONTENT } from "@/content/cities/guard";
import { cityH1 } from "@/lib/cityPages";
import { site } from "@/lib/site";

const PORT = 3219;
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
  const stale = await fetch(`${BASE}/robots.txt`).then(() => true, () => false);
  if (stale) throw new Error(`Port ${PORT} is already in use; stop that server first.`);
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

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, type: res.headers.get("content-type") ?? "", body: await res.text() };
}

const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&rsquo;/g, "’");
const textOf = (html: string) => decode(html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));

describe("unready city pages", () => {
  // One test that loops, so it passes (checking nothing) once every city is ready.
  it("404s any city that is not ready, and lists it nowhere", async () => {
    expect((await get("/service-area/not-a-city")).status).toBe(404);
    for (const city of ALL_CITIES.filter((c) => !c.ready)) {
      expect((await get(cityPath(city))).status, city.slug).toBe(404);
      expect((await get("/sitemap.xml")).body).not.toContain(cityPath(city));
      expect((await get("/service-area")).body).not.toContain(cityPath(city));
      expect((await get("/")).body).not.toContain(cityPath(city));
      expect((await get("/services/furnace-repair")).body).not.toContain(cityPath(city));
      expect((await get("/llms.txt")).body).not.toContain(cityPath(city));
    }
  });
});

describe("site-wide", () => {
  it("serves the hub, the sitemap and /llms.txt", async () => {
    expect((await get("/service-area")).status).toBe(200);
    expect((await get("/sitemap.xml")).body).toContain(`${site.url}/service-area<`);
    const llms = await get("/llms.txt");
    expect(llms.status).toBe(200);
    expect(llms.type).toContain("text/plain");
    expect(llms.body.startsWith("# Top Choice HVAC")).toBe(true);
  });

  it("does not block /llms.txt or the city pages for any crawler", async () => {
    const robots = (await get("/robots.txt")).body;
    expect(robots).not.toMatch(/Disallow:\s*\/\s*$/m);
    expect(robots).not.toMatch(/Disallow:.*(llms|service-area)/);
  });
});

describe("ready city pages (raw HTML)", () => {
  // One test that loops, so it passes (checking nothing) while no city is ready.
  it("serves every ready city with all text and schema in the server HTML", async () => {
    for (const city of publishedCities()) {
      const { status, body } = await get(cityPath(city));
      expect(status, city.slug).toBe(200);
      expect(body.match(/<h1[ >]/g), city.slug).toHaveLength(1);
      expect(decode(body)).toContain(`<title>${city.seoTitle}</title>`);
      expect(body).toContain(`rel="canonical" href="${site.url}${cityPath(city)}"`);
      expect(body).not.toMatch(/name="robots" content="[^"]*noindex/);
      const text = textOf(body);
      expect(text).toContain(cityH1(city));
      for (const issue of city.issues) expect(text).toContain(issue.whatsUsuallyGoingOn);
      for (const faq of city.faqs) expect(text).toContain(faq.a);
      const ld = [...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      expect(ld, city.slug).toHaveLength(1);
      expect(JSON.parse(ld[0][1])["@graph"]).toHaveLength(7);
      // The page content, not the site header and footer (which carry the
      // business address and the Rebates link on every page).
      const main = textOf(body.slice(body.indexOf("<main"), body.indexOf("</main>")));
      for (const re of BANNED_CONTENT) expect(main, `${city.slug} ${re}`).not.toMatch(re);
      expect(ld[0][1]).not.toMatch(/aggregateRating|streetAddress|"review"/);
      expect((await get("/sitemap.xml")).body).toContain(`${site.url}${cityPath(city)}<`);
    }
  });
});
