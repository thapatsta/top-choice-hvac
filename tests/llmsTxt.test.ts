import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GET } from "@/app/llms.txt/route";
import robots from "@/app/robots";
import { ALL_CITIES, cityPath } from "@/content/cities";
import { BANNED_CONTENT } from "@/content/cities/guard";
import { services } from "@/data/services";
import { buildLlmsTxt } from "@/lib/llmsTxt";
import { site } from "@/lib/site";
import { FILLED_CITIES } from "./cityFixtures";

/** Does this site path resolve to a real route in app/ or a published city/service? */
function routeExists(path: string): boolean {
  if (path === "/") return true;
  const [first, second] = path.split("/").filter(Boolean);
  if (first === "services" && second) return services.some((s) => s.slug === second);
  if (first === "service-area" && second) return ALL_CITIES.some((c) => c.slug === second);
  return existsSync(join("app", "(site)", first, "page.tsx"));
}

function urlsIn(text: string): string[] {
  return [...text.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
}

describe("/llms.txt", () => {
  it("responds 200 as plain text starting with the business name", async () => {
    const res = GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    const body = await res.text();
    expect(body.startsWith("# Top Choice HVAC\n")).toBe(true);
    expect(body).toMatch(/^> /m);
    for (const heading of ["## Services", "## Service areas", "## About and contact", "## Optional"]) {
      expect(body).toContain(heading);
    }
  });

  it("lists only URLs that resolve to a real route, on the canonical base URL", () => {
    const urls = urlsIn(buildLlmsTxt(FILLED_CITIES));
    expect(urls.length).toBeGreaterThan(10);
    for (const url of urls) {
      expect(url.startsWith(site.url), url).toBe(true);
      expect(routeExists(new URL(url).pathname), url).toBe(true);
    }
  });

  it("lists the three services and the hub", () => {
    const body = buildLlmsTxt([]);
    for (const path of ["/services/furnace-repair", "/services/furnace-installation", "/services/ac-installation", "/service-area", "/get-quote", "/about"]) {
      expect(body).toContain(`${site.url}${path})`);
    }
  });

  it("lists a city only when it is ready, with its hub line", () => {
    const [brampton, ...rest] = FILLED_CITIES;
    const only = buildLlmsTxt([brampton]);
    expect(only).toContain(`${site.url}${cityPath(brampton)})`);
    expect(only).toContain(brampton.hubLine);
    for (const city of rest) expect(only).not.toContain(cityPath(city));
    // The real registry has no ready city yet.
    for (const city of ALL_CITIES.filter((c) => !c.ready)) expect(buildLlmsTxt()).not.toContain(cityPath(city));
  });

  it("states the phone number exactly as the site does, and nothing banned", () => {
    const body = buildLlmsTxt(FILLED_CITIES);
    expect(body).toContain(site.phone.display);
    for (const re of BANNED_CONTENT) expect(body, String(re)).not.toMatch(re);
    expect(body).not.toMatch(/\/lp\/|thank-you|\/api\//);
    expect(body).not.toMatch(/licen[cs]e|\d\.\d (stars|rating)|promo/i);
  });

  it("is not blocked by robots.txt", () => {
    const rules = robots().rules;
    const list = Array.isArray(rules) ? rules : [rules];
    for (const rule of list) {
      const disallow = ([] as string[]).concat(rule.disallow ?? []);
      expect(disallow.some((d) => d === "/" || "/llms.txt".startsWith(d))).toBe(false);
    }
  });
});
