import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { aggregateRating } from "@/data/reviews";
import {
  HOW_IT_WORKS,
  LANDING_PAGES,
  TRUST_ITEMS,
  getLandingPage,
  lpMetadata,
  type LandingPageConfig,
} from "@/lib/landing-pages";
import { LP_SLUGS, isLandingService } from "@/lib/landingPage";
import { GOOGLE_REVIEWS, site } from "@/lib/site";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import {
  ADDRESS_TERMS,
  PRICE,
  collectStrings,
  listFiles,
  readSource,
  scanCopy,
  stripSource,
  type ScanRules,
} from "./lpScan";

/** Copy units for one page: each field on its own, each FAQ as Q + A. */
function copyUnits(config: LandingPageConfig): string[] {
  const { faq, ...rest } = config;
  return [
    ...collectStrings(rest),
    ...faq.map((item) => collectStrings(item).join(" ")),
  ];
}

function rulesFor(config: LandingPageConfig): ScanRules {
  return {
    allowCredentials:
      config.credentialClaims.enabled && config.credentialClaims.verifiedBy.trim() !== "",
    allowAlwaysOpen: config.service === "repair" && config.showEmergency247,
    noPrices: config.service === "heating-cooling",
  };
}

// Everything the template renders that isn't per-page config: the shared
// copy constants and the component source under components/lp.
const componentFiles = listFiles("components/lp", /\.tsx?$/);
const routeFiles = listFiles("app/lp", /\.tsx?$/);
const sharedCopy = [...collectStrings(TRUST_ITEMS), ...collectStrings(HOW_IT_WORKS)];

describe("landing page config", () => {
  it("has exactly the six ad-group pages, with unique slugs", () => {
    const slugs = LANDING_PAGES.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(6);
    expect([...slugs].sort()).toEqual([...LP_SLUGS].sort());
  });

  it("has unique meta titles, and unique h1s within each campaign region", () => {
    // The install h1 ("New Furnace Installed From $2,199") is the same in
    // both regions by design; within a campaign every h1 differs.
    expect(new Set(LANDING_PAGES.map((p) => p.metaTitle)).size).toBe(6);
    for (const region of ["core", "outskirts"] as const) {
      const h1s = LANDING_PAGES.filter((p) => p.region === region).map((p) => p.h1);
      expect(new Set(h1s).size).toBe(3);
    }
  });

  it("matches region and service to the slug", () => {
    for (const page of LANDING_PAGES) {
      expect(page.region).toBe(page.slug.startsWith("outskirts/") ? "outskirts" : "core");
      const base = page.slug.replace(/^outskirts\//, "");
      const expected = { "furnace-installation": "install", "furnace-repair": "repair", "heating-cooling": "heating-cooling" }[base];
      expect(page.service).toBe(expected);
      expect(isLandingService(page.defaultService)).toBe(true);
    }
  });

  it("has a route file for every page that renders its own config", () => {
    for (const page of LANDING_PAGES) {
      const file = `app/lp/${page.slug}/page.tsx`;
      expect(existsSync(file), file).toBe(true);
      expect(readSource(file)).toContain(`getLandingPage("${page.slug}")`);
    }
    // The live ad URL keeps its route.
    expect(getLandingPage("furnace-installation").h1).toBe("New Furnace Installed From $2,199");
  });

  it("has a price note on every page that shows a price", () => {
    for (const page of LANDING_PAGES) {
      if (copyUnits(page).some((s) => PRICE.test(s))) {
        expect(page.priceNote, page.slug).toBeTruthy();
      }
    }
  });

  it("shows no price anywhere on the heating & cooling pages", () => {
    for (const page of LANDING_PAGES.filter((p) => p.service === "heating-cooling")) {
      expect(copyUnits(page).filter((s) => PRICE.test(s)), page.slug).toEqual([]);
    }
  });

  it("allows 24/7 on repair pages only", () => {
    for (const page of LANDING_PAGES) {
      if (page.showEmergency247) expect(page.service, page.slug).toBe("repair");
    }
  });

  it("keeps credential claims off unless someone verified them", () => {
    for (const page of LANDING_PAGES) {
      const claims = page.credentialClaims;
      if (claims.enabled) {
        expect(claims.verifiedBy.trim(), page.slug).not.toBe("");
        expect(claims.verifiedOn.trim(), page.slug).not.toBe("");
      }
    }
  });

  it("is noindex, nofollow and self-canonical", () => {
    for (const page of LANDING_PAGES) {
      const meta = lpMetadata(page);
      expect(meta.robots).toEqual({ index: false, follow: false });
      expect(meta.alternates?.canonical).toBe(`${site.url}/lp/${page.slug}`);
    }
  });

  it("is left out of the sitemap but not blocked in robots.txt (Google Ads must crawl it)", () => {
    const urls = sitemap().map((entry) => new URL(entry.url).pathname);
    expect(urls.some((path) => path.startsWith("/lp"))).toBe(false);
    const rules = [robots().rules].flat();
    for (const rule of rules) {
      const disallow = [rule?.disallow ?? []].flat();
      expect(disallow.some((path) => "/lp/".startsWith(path) || path.startsWith("/lp"))).toBe(false);
    }
  });
});

describe("banned-terms scan", () => {
  it("passes for every page's config copy", () => {
    for (const page of LANDING_PAGES) {
      const problems = copyUnits(page).flatMap((unit) => scanCopy(unit, rulesFor(page)));
      expect(problems, page.slug).toEqual([]);
    }
  });

  it("passes for the shared copy and the components under components/lp", () => {
    expect(sharedCopy.flatMap((s) => scanCopy(s))).toEqual([]);
    for (const file of [...componentFiles, ...routeFiles]) {
      expect(scanCopy(stripSource(readSource(file))), file).toEqual([]);
    }
  });

  it("catches the claims the old page made", () => {
    expect(scanCopy("Licensed & insured")).not.toEqual([]);
    expect(scanCopy("Fully licensed and insured")).not.toEqual([]);
    expect(scanCopy("TSSA registered")).not.toEqual([]);
    expect(scanCopy("No heat in January? We're open 24/7.")).not.toEqual([]);
    expect(scanCopy("The best furnace team in the GTA")).not.toEqual([]);
    expect(scanCopy("#1 rated in Brampton")).not.toEqual([]);
    expect(scanCopy("Same-day installs.")).not.toEqual([]);
    expect(scanCopy("Heat pumps from $4,999")).not.toEqual([]);
    expect(scanCopy("Get $7,500 in rebates")).not.toEqual([]);
    expect(scanCopy("We arrive within 60 minutes")).not.toEqual([]);
    expect(scanCopy("Price includes $2,199 install", { noPrices: true })).not.toEqual([]);
    // ...and lets the allowed facts through.
    expect(scanCopy("Same-day installs available in many cases.")).toEqual([]);
    expect(scanCopy("Callback typically within 30 minutes. Satisfaction guarantee.")).toEqual([]);
    expect(scanCopy("Call any time, we're open 24/7", { allowAlwaysOpen: true })).toEqual([]);
  });
});

describe("address scan", () => {
  it("finds no street address or postal code in any page's config", () => {
    for (const page of LANDING_PAGES) {
      for (const unit of copyUnits(page)) {
        for (const re of ADDRESS_TERMS) expect(re.test(unit), `${page.slug}: ${unit}`).toBe(false);
      }
    }
  });

  it("never reads the address or the address JSON-LD in /lp code", () => {
    for (const file of [...componentFiles, ...routeFiles, "lib/landing-pages.ts"]) {
      const source = readSource(file);
      expect(source, file).not.toMatch(/site\.address|NAP_JSON_LD|application\/ld\+json/);
      for (const re of ADDRESS_TERMS) expect(source, file).not.toMatch(re);
    }
  });
});

describe("Google reviews", () => {
  it("has one source of truth", () => {
    expect(GOOGLE_REVIEWS).toEqual({ rating: 4.9, count: 66, asOf: "2026-10-08" });
    expect(site.rating).toBe(GOOGLE_REVIEWS.rating);
    expect(site.reviewCount).toBe(GOOGLE_REVIEWS.count);
    expect(aggregateRating).toEqual({
      ratingValue: GOOGLE_REVIEWS.rating,
      reviewCount: GOOGLE_REVIEWS.count,
    });
  });

  it("is never hardcoded on the landing pages or /reviews", () => {
    const files = [
      ...componentFiles,
      ...routeFiles,
      "lib/landing-pages.ts",
      "app/(site)/reviews/page.tsx",
      "data/reviews.ts",
    ];
    for (const file of files) {
      const code = stripSource(readSource(file));
      expect(code.match(/(?<![\w./-])(60|66|4\.9)(?![\w%.])/g), file).toBeNull();
    }
    expect(readSource("components/lp/GoogleReviewsCollage.tsx")).toContain("GOOGLE_REVIEWS.count");
    expect(readSource("components/lp/LandingPage.tsx")).toContain("GOOGLE_REVIEWS.count");
    expect(readSource("app/(site)/reviews/page.tsx")).toContain("GOOGLE_REVIEWS.count");
  });
});
