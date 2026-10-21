// The city page publish guard and the doorway-page checks. The real data files
// are all ready: false until Robin and Patrick supply jobs and reviews, so:
//  - the guard runs on every city with ready: true (none today, but the
//    moment one is flipped on, a violation fails the build and blocks deploy);
//  - the guard itself is tested against synthetic cities that break each rule;
//  - the real written copy is also run through the guard with test fixtures
//    standing in for the missing jobs and reviews, so copy problems show up now.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ALL_CITIES,
  cityPath,
  getCity,
  isServable,
  lastReviewedDate,
  publishedCities,
} from "@/content/cities";
import { TODO } from "@/content/cities/facts";
import {
  MAX_OVERLAP,
  allStrings,
  contentRuleViolations,
  guardViolations,
  localCopy,
  shingleOverlap,
  wordCount,
} from "@/content/cities/guard";
import { SHARED_ISSUES } from "@/content/cities/shared-issues";
import type { CityContent } from "@/content/cities/types";
import sitemap from "@/app/sitemap";
import { cityH1, cityJsonLd, cityMetadata, jsonLdScript } from "@/lib/cityPages";
import { site } from "@/lib/site";
import { scanCopy } from "./lpScan";
import { FILLED_CITIES, filledCity } from "./cityFixtures";

const ready = publishedCities();

describe("publish guard: ready cities", () => {
  it("lists no violation for any city with ready: true", () => {
    for (const city of ready) expect(guardViolations(city), city.slug).toEqual([]);
  });

  it("covers the four launch cities", () => {
    expect(ALL_CITIES.map((c) => c.slug)).toEqual(["brampton", "mississauga", "vaughan", "etobicoke"]);
    expect(new Set(ALL_CITIES.map((c) => c.slug)).size).toBe(4);
  });

  it("keeps a city not ready while it still has a placeholder", () => {
    for (const city of ALL_CITIES) {
      const hasTodo = allStrings(city).some((s) => s.includes(TODO));
      if (hasTodo) expect(city.ready, `${city.slug} has TODO_REAL_CONTENT but ready: true`).toBe(false);
    }
  });
});

describe("publish guard: the rules themselves", () => {
  const base = filledCity(ALL_CITIES[1]); // Mississauga, filled

  it("passes the real written copy once the missing jobs and reviews are in", () => {
    for (const city of FILLED_CITIES) expect(guardViolations(city), city.slug).toEqual([]);
  });

  const cases: [string, (c: CityContent) => CityContent, RegExp][] = [
    ["a placeholder string", (c) => ({ ...c, introParagraph: TODO }), /placeholder/],
    ["an unverified job", (c) => ({ ...c, jobs: c.jobs.map((j) => ({ ...j, verified: false })) }), /verified/],
    ["too few reviews", (c) => ({ ...c, reviews: c.reviews.slice(0, 1) }), /reviews/],
    [
      "a review with no citySource",
      (c) => ({ ...c, reviews: c.reviews.map((r) => ({ ...r, citySource: undefined as never })) }),
      /citySource/,
    ],
    ["too few issues", (c) => ({ ...c, issues: c.issues.slice(0, 3) }), /issues/],
    [
      "a general issue that names a neighbourhood",
      (c) => ({ ...c, issues: [{ ...SHARED_ISSUES["no-heat"], whatWeDo: "We cover the Streetsville neighbourhood." }, ...c.issues.slice(1)] }),
      /reads as local/,
    ],
    [
      "a general issue that mentions a home type",
      (c) => ({ ...c, issues: [{ ...SHARED_ISSUES["no-heat"], whatWeDo: "Common in a condo." }, ...c.issues.slice(1)] }),
      /reads as local/,
    ],
    [
      "a general issue with appliesTo",
      (c) => ({ ...c, issues: [{ ...SHARED_ISSUES["no-heat"], appliesTo: "Everyone" }, ...c.issues.slice(1)] }),
      /appliesTo/,
    ],
    [
      "a consultant issue with a digit",
      (c) => ({ ...c, issues: [{ ...c.issues.find((i) => i.source === "consultant")!, title: "Furnaces last 15 years" }, ...c.issues.slice(1)] }),
      /digit/,
    ],
    [
      "a consultant issue with an absolute",
      (c) => ({ ...c, issues: [{ ...c.issues.find((i) => i.source === "consultant")!, whatWeDo: "We always fix it." }, ...c.issues.slice(1)] }),
      /absolute/,
    ],
    ["an answer block that is too short", (c) => ({ ...c, answerBlock: "Short answer." }), /answerBlock/],
    ["too few FAQs", (c) => ({ ...c, faqs: c.faqs.slice(0, 4) }), /FAQs/],
    ["too few city-specific FAQs", (c) => ({ ...c, faqs: c.faqs.map((f) => ({ ...f, cityspecific: false })) }), /city-specific/],
    ["a missing lastReviewed", (c) => ({ ...c, lastReviewed: "" }), /lastReviewed/],
    ["a street address", (c) => ({ ...c, introParagraph: "Visit us at 3 Lloyd Cres." }), /banned/],
    ["duct cleaning", (c) => ({ ...c, introParagraph: "We also offer duct cleaning." }), /banned/],
    ["a rebate mention", (c) => ({ ...c, introParagraph: "Ask about the rebate." }), /banned/],
    ["TSSA", (c) => ({ ...c, introParagraph: "TSSA licence 12345." }), /banned/],
    ["an aggregateRating", (c) => ({ ...c, introParagraph: "aggregateRating 4.9" }), /banned/],
    ["filler", (c) => ({ ...c, introParagraph: "Look no further for state-of-the-art service." }), /banned/],
  ];
  for (const [name, mutate, expected] of cases) {
    it(`fails on ${name}`, () => {
      const problems = guardViolations(mutate(base));
      expect(problems.join("\n"), name).toMatch(expected);
    });
  }

  it("allows a city with no jobs, but every job shown must be verified", () => {
    const home = filledCity(ALL_CITIES[0]);
    expect(guardViolations({ ...home, jobs: [] })).toEqual([]);
    expect(guardViolations({ ...home, jobs: [{ ...home.jobs[0], verified: false }] }).join()).toMatch(/verified/);
  });

  it("requires three reviews and five issues for the home base", () => {
    const home = filledCity(ALL_CITIES[0]);
    expect(guardViolations(home)).toEqual([]);
    expect(guardViolations({ ...home, reviews: home.reviews.slice(0, 2) }).join()).toMatch(/reviews \(needs 3\)/);
    expect(guardViolations({ ...home, issues: home.issues.slice(0, 4) }).join()).toMatch(/issues \(needs 5\)/);
  });
});

describe("written copy rules (all cities, ready or not)", () => {
  for (const city of ALL_CITIES) {
    it(`${city.slug}: meets the copy rules`, () => {
      expect(contentRuleViolations(city)).toEqual([]);
    });

    it(`${city.slug}: passes the shared claims scan (no unverified claims, prices only where allowed)`, () => {
      const units = [
        ...allStrings({ ...city, faqs: undefined, issues: undefined }),
        ...city.faqs.map((f) => `${f.q} ${f.a}`),
        ...city.issues.map((i) => allStrings(i).join(" ")),
      ].filter((s) => !s.includes(TODO));
      const problems = units.flatMap((u) => scanCopy(u, { allowAlwaysOpen: true }));
      expect(problems).toEqual([]);
    });

    it(`${city.slug}: picks between 4 and 6 issues, with no repeated issue`, () => {
      expect(city.issues.length).toBeGreaterThanOrEqual(city.isHomeBase ? 5 : 4);
      expect(city.issues.length).toBeLessThanOrEqual(6);
      expect(new Set(city.issues.map((i) => i.title)).size).toBe(city.issues.length);
    });
  }

  it("orders and selects pool issues differently for each city", () => {
    const orders = ALL_CITIES.map((c) => c.issues.filter((i) => i.source === "general").map((i) => i.title).join("|"));
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("keeps the shared pool free of local claims", () => {
    for (const issue of Object.values(SHARED_ISSUES)) {
      expect(contentRuleViolations({ ...ALL_CITIES[0], issues: [issue] }).filter((v) => /reads as local|appliesTo/.test(v))).toEqual([]);
    }
  });
});

describe("duplicate-content check (doorway pages)", () => {
  // Method: for each city take the city-specific copy (jobs, intro, answer
  // block, issues intro, local FAQs, consultant / robin / patrick issues;
  // the shared pool and shared FAQs are left out), cut it into overlapping
  // 5-word shingles, and compare each pair of cities. Overlap = shared
  // shingles / the smaller city's shingle count. More than 30% fails.
  const pairs = (list: CityContent[]) =>
    list.flatMap((a, i) => list.slice(i + 1).map((b) => [a, b] as const));

  it("keeps every pair of ready cities at or below 30% overlap", () => {
    for (const [a, b] of pairs(ready)) {
      expect(shingleOverlap(a, b), `${a.slug} vs ${b.slug}`).toBeLessThanOrEqual(MAX_OVERLAP);
    }
  });

  it("does the same on the real copy with fixtures standing in for jobs and reviews", () => {
    for (const [a, b] of pairs(FILLED_CITIES)) {
      expect(shingleOverlap(a, b), `${a.slug} vs ${b.slug}`).toBeLessThanOrEqual(MAX_OVERLAP);
    }
  });

  it("catches a swapped-city-name page", () => {
    const [a] = FILLED_CITIES;
    const clone = { ...a, slug: "clone", name: "Clone" } as CityContent;
    expect(shingleOverlap(a, clone)).toBeGreaterThan(MAX_OVERLAP);
  });

  it("measures local copy only", () => {
    const copy = localCopy(ALL_CITIES[0]).join(" ");
    expect(copy).not.toContain(SHARED_ISSUES["no-heat"].whatsUsuallyGoingOn);
  });
});

describe("uniqueness", () => {
  const list = [...ready, ...ALL_CITIES.filter((c) => !c.ready)];
  const dup = (values: string[]) => values.filter((v, i) => values.indexOf(v) !== i);

  it("gives every page its own title, description, H1, answer block and canonical", () => {
    expect(dup(list.map((c) => c.seoTitle))).toEqual([]);
    expect(dup(list.map((c) => c.metaDescription))).toEqual([]);
    expect(dup(list.map((c) => cityH1(c)))).toEqual([]);
    expect(dup(list.map((c) => c.answerBlock))).toEqual([]);
    expect(dup(list.map((c) => c.hubLine))).toEqual([]);
    expect(dup(list.map((c) => c.introParagraph))).toEqual([]);
    expect(dup(list.map((c) => String(cityMetadata(c).alternates?.canonical)))).toEqual([]);
  });
});

describe("publishing: unready pages stay out", () => {
  it("serves an unready city in development only", () => {
    const unready = { ...ALL_CITIES[0], ready: false };
    expect(isServable(unready, "development")).toBe(true);
    expect(isServable(unready, "production")).toBe(false);
    expect(isServable({ ...unready, ready: true }, "production")).toBe(true);
  });

  it("noindexes an unready page's metadata and leaves a ready one indexable", () => {
    const [city] = ALL_CITIES;
    expect(cityMetadata({ ...city, ready: false }).robots).toEqual({ index: false, follow: false });
    expect(cityMetadata({ ...city, ready: true }).robots).toBeUndefined();
  });

  it("leaves unready cities out of the sitemap", () => {
    const urls = sitemap().map((e) => new URL(e.url).pathname);
    for (const city of ALL_CITIES) {
      expect(urls.includes(cityPath(city)), city.slug).toBe(city.ready);
    }
    expect(urls).toContain("/service-area");
  });

  it("uses lastReviewed, not the build time, for a city's lastmod", () => {
    const entry = sitemap().find((e) => e.url.endsWith("/service-area/brampton"));
    if (entry) expect(entry.lastModified).toEqual(lastReviewedDate(getCity("brampton")!));
    expect(lastReviewedDate({ lastReviewed: "2026-10" }).toISOString()).toBe("2026-10-01T00:00:00.000Z");
  });
});

describe("structured data", () => {
  for (const city of FILLED_CITIES) {
    it(`${city.slug}: one valid, connected graph with no address or ratings`, () => {
      const json = jsonLdScript(cityJsonLd(city));
      const graph = JSON.parse(json) as { "@graph": Record<string, unknown>[] };
      const types = graph["@graph"].map((n) => n["@type"]);
      expect(types).toEqual(["HVACBusiness", "WebPage", "BreadcrumbList", "Service", "Service", "Service", "FAQPage"]);

      const business = graph["@graph"][0] as Record<string, unknown>;
      expect(business.name).toBe("Top Choice HVAC");
      expect(business.telephone).toBe("+16477632970");
      expect(business.areaServed).toEqual({
        "@type": "City",
        name: city.name,
        containedInPlace: { "@type": "AdministrativeArea", name: city.region },
      });
      for (const service of graph["@graph"].filter((n) => n["@type"] === "Service")) {
        expect(service.provider).toEqual({ "@id": business["@id"] });
        expect((service.areaServed as { name: string }).name).toBe(city.name);
      }

      const faq = graph["@graph"].find((n) => n["@type"] === "FAQPage") as { mainEntity: { name: string }[] };
      expect(faq.mainEntity.map((q) => q.name)).toEqual(city.faqs.map((f) => f.q));

      const page = graph["@graph"][1] as { dateModified: string };
      expect(page.dateModified).toBe(`${city.lastReviewed}-01`);

      const crumbs = (graph["@graph"][2] as { itemListElement: { name: string; item: string }[] }).itemListElement;
      expect(crumbs.map((c) => c.name)).toEqual(["Home", "Service Area", city.name]);
      expect(crumbs.at(-1)?.item).toBe(`${site.url}${cityPath(city)}`);

      expect(json).not.toMatch(/aggregateRating|"review"|PostalAddress|streetAddress|"geo"|Lloyd|legalName/);
    });
  }
});

describe("copy sanity", () => {
  it("counts words the way the guard does", () => {
    expect(wordCount("  one two   three ")).toBe(3);
  });
});

describe("Robin intake file", () => {
  // Every claim written on a city page must be listed for Robin to confirm or strike.
  const intake = readFileSync("content/cities/INTAKE.md", "utf8");
  for (const city of ALL_CITIES) {
    it(`${city.slug}: lists the intro, every consultant issue and every local FAQ`, () => {
      expect(intake, "intro").toContain(city.introParagraph);
      expect(intake, "issues intro").toContain(city.issuesIntro);
      for (const issue of city.issues.filter((i) => i.source === "consultant")) {
        expect(intake, issue.title).toContain(issue.title);
        expect(intake, issue.title).toContain(issue.whatsUsuallyGoingOn);
      }
      for (const faq of city.faqs.filter((f) => f.cityspecific)) {
        expect(intake, faq.q).toContain(faq.a);
      }
    });
  }
});
