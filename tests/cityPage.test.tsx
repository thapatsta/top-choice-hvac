// The city page template and the places that link to city pages, rendered to
// static HTML (what a crawler sees). Uses fixtures for the jobs and reviews
// that are still placeholders in the real data files.

import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/service-area/brampton" }));
const state = vi.hoisted(() => ({ published: [] as unknown[] }));
vi.mock("@/content/cities", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/content/cities")>();
  return { ...actual, publishedCities: () => state.published };
});

import ServiceAreaPage from "@/app/(site)/service-area/page";
import ServiceDetailPage from "@/app/(site)/services/[slug]/page";
import { CityPage } from "@/components/city/CityPage";
import { Footer } from "@/components/Footer";
import { ServiceAreaStrip } from "@/components/home/ServiceAreaStrip";
import { cityPath } from "@/content/cities";
import { BANNED_CONTENT } from "@/content/cities/guard";
import type { CityContent } from "@/content/cities/types";
import { cityH1 } from "@/lib/cityPages";
import { PHONE } from "@/lib/phone";
import { FILLED_CITIES } from "./cityFixtures";

const FILLED = FILLED_CITIES as CityContent[];
const [brampton, mississauga] = FILLED;

const html = (city: CityContent) => renderToStaticMarkup(<CityPage city={city} />);
const text = (markup: string) =>
  markup
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&rsquo;|&#8217;/g, "'")
    .replace(/\s+/g, " ");
const count = (markup: string, re: RegExp) => (markup.match(re) ?? []).length;

beforeEach(() => {
  state.published = FILLED;
});

describe("city page template", () => {
  for (const city of FILLED) {
    it(`${city.slug}: heading structure, server-rendered answers and no banned content`, () => {
      const markup = html(city);
      expect(count(markup, /<h1[ >]/g)).toBe(1);
      expect(markup).toContain(`>${cityH1(city).replace("&", "&amp;")}</h1>`);
      for (const title of ["Recent jobs in", "customers say", "Common heating and cooling problems we hear about in", "Other areas we serve"]) {
        expect(markup).toContain(title);
      }
      // Every issue title, FAQ question and FAQ answer is in the HTML, even though the FAQ is collapsed.
      const body = text(markup);
      for (const issue of city.issues) {
        expect(markup).toMatch(new RegExp(`<h3[^>]*>${issue.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</h3>`));
        expect(body).toContain(issue.homeownerSays);
      }
      for (const faq of city.faqs) {
        expect(body).toContain(faq.q.replace("&", "&"));
        expect(body).toContain(faq.a.replace(/'/g, "'"));
      }
      expect(body).toContain(city.answerBlock);
      expect(body).toContain(`Last reviewed`);
      for (const re of BANNED_CONTENT) expect(body, String(re)).not.toMatch(re);
      expect(body).not.toMatch(/\bTODO_REAL_CONTENT\b/);
    });
  }

  it("keeps FAQ questions as h3 and the sections as h2", () => {
    const markup = html(mississauga);
    expect(count(markup, /<h2[ >]/g)).toBeGreaterThanOrEqual(8);
    for (const faq of mississauga.faqs) expect(markup).toContain(`>${faq.q.replace("&", "&amp;")}</h3>`);
  });

  it("has a tap-to-call link in the hero and near the bottom, both the one real number", () => {
    const markup = html(mississauga);
    expect(count(markup, new RegExp(`href="${PHONE.href.replace("+", "\\+")}"`, "g"))).toBe(2);
    expect(markup).not.toContain("data-swapped");
    expect(markup).toContain('data-track-location="city_hero"');
    expect(markup).toContain('data-track-location="city_cta"');
    expect(markup).toContain('data-city-page="Mississauga"');
    expect(count(markup, /href="\/get-quote"/g)).toBeGreaterThanOrEqual(2);
  });

  it("links to the three services, the hub, breadcrumbs and the other ready cities with varied anchors", () => {
    const markup = html(mississauga);
    for (const href of ["/services/furnace-repair", "/services/furnace-installation", "/services/ac-installation", "/service-area", "/reviews", "/"]) {
      expect(markup).toContain(`href="${href}"`);
    }
    for (const other of FILLED.filter((c) => c !== mississauga)) expect(markup).toContain(`href="${cityPath(other)}"`);
    expect(markup).not.toContain(`href="${cityPath(mississauga)}"`);
    const anchors = [...markup.matchAll(/href="\/service-area\/[a-z]+"[^>]*>([^<]+)</g)].map((m) => m[1]);
    expect(new Set(anchors).size).toBe(anchors.length);
  });

  it("links only ready cities under 'other areas'", () => {
    state.published = [mississauga];
    const markup = html(mississauga);
    expect(markup).not.toContain(cityPath(brampton));
    expect(markup).toContain('href="/service-area"');
  });

  it("never calls reused reviews local: generic heading unless every review is tagged to the city", () => {
    const reused: CityContent = {
      ...mississauga,
      reviews: mississauga.reviews.map((r) => ({ ...r, citySource: "not-city-specific" as const })),
    };
    expect(html(reused)).toContain("What our customers say");
    expect(html(reused)).not.toContain("Mississauga customers");
    expect(html(mississauga)).toContain("What Mississauga customers say");
  });

  it("shows the home-base paragraph and a link to /about for the home base only", () => {
    expect(html(brampton)).toContain('href="/about"');
    expect(html(mississauga)).not.toContain('href="/about"');
  });

  it("renders job cards without any image or placeholder when there are no photos", () => {
    const markup = html(mississauga);
    expect(markup).not.toContain("<img");
    expect(markup).not.toMatch(/coming soon/i);
    expect(markup).not.toContain("PHOTO_SLOT");
  });

  it("renders 1, 2 or 3 photos from the data file with sized, lazy, described images", () => {
    for (const n of [1, 2, 3]) {
      const photos = Array.from({ length: n }, (_, i) => ({
        src: `/images/cities/mississauga/job-${i}.webp`,
        alt: `New furnace installation in Streetsville, Mississauga ${i}`,
      }));
      const city: CityContent = { ...mississauga, jobs: [{ ...mississauga.jobs[0], photos }, mississauga.jobs[1]] };
      const markup = html(city);
      expect(count(markup, /<img /g)).toBe(n);
      expect(markup).toContain('loading="lazy"');
      expect(markup).toContain('width="800"');
      expect(markup).toContain('height="600"');
      expect(markup).toContain("New furnace installation in Streetsville, Mississauga 0");
    }
  });

  it("hides 'who this affects' unless Robin or Patrick supplied the issue", () => {
    const consultant = mississauga.issues.find((i) => i.source === "consultant")!;
    expect(consultant.appliesTo).toBeTruthy();
    expect(html(mississauga)).not.toContain("Who this affects");
    const robin: CityContent = { ...mississauga, issues: [{ ...consultant, source: "robin" }, ...mississauga.issues.slice(1)] };
    expect(html(robin)).toContain("Who this affects");
  });

  it("embeds one parseable JSON-LD graph", () => {
    const scripts = [...html(mississauga).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    expect(scripts).toHaveLength(1);
    expect(JSON.parse(scripts[0][1])["@graph"].length).toBe(7);
  });
});

describe("pages that link to city pages", () => {
  it("link only ready cities, and render nothing extra when none is ready", async () => {
    const service = async () => {
      const el = await ServiceDetailPage({ params: Promise.resolve({ slug: "furnace-repair" }) });
      return renderToStaticMarkup(el);
    };
    const surfaces = async () => ({
      hub: renderToStaticMarkup(<ServiceAreaPage />),
      strip: renderToStaticMarkup(<ServiceAreaStrip />),
      footer: renderToStaticMarkup(<Footer />),
      service: await service(),
    });

    state.published = [];
    const none = await surfaces();
    for (const [name, markup] of Object.entries(none)) expect(markup, name).not.toMatch(/href="\/service-area\/[a-z]/);
    expect(none.service).not.toContain("Areas we serve");

    state.published = [mississauga];
    const one = await surfaces();
    for (const [name, markup] of Object.entries(one)) expect(markup, name).toContain(`href="${cityPath(mississauga)}"`);
    expect(one.hub).toContain(mississauga.hubLine);
    expect(one.service).toContain("Furnace repair in Mississauga");
    for (const markup of Object.values(one)) expect(markup).not.toContain(cityPath(brampton));
  });

  it("leaves services without a city page alone", async () => {
    const el = await ServiceDetailPage({ params: Promise.resolve({ slug: "heat-pumps" }) });
    expect(renderToStaticMarkup(el)).not.toContain("Areas we serve");
  });
});
