// The review count shown to visitors is always "100+" (REVIEW_COUNT), never
// the exact number GOOGLE_REVIEWS.count. That number may only feed the
// JSON-LD in lib/site.ts. tests-built/lp-smoke.test.ts checks the built HTML.

import { describe, expect, it } from "vitest";
import { aggregateRating } from "@/data/reviews";
import { GOOGLE_REVIEWS, REVIEW_COUNT, REVIEW_COUNT_LABEL } from "@/lib/googleReviews";
import { REVIEW_COUNT_LABEL as LP_LABEL } from "@/lib/landingPages";
import { NAP_JSON_LD, site } from "@/lib/site";
import { listFiles, readSource } from "./lpScan";

const sources = [
  ...listFiles("app", /\.tsx?$/),
  ...listFiles("components", /\.tsx?$/),
  ...listFiles("lib", /\.tsx?$/),
  ...listFiles("data", /\.tsx?$/),
];

describe("review count", () => {
  it('is "100+" everywhere it is displayed', () => {
    expect(REVIEW_COUNT).toBe("100+");
    expect(REVIEW_COUNT_LABEL).toBe("100+ reviews");
    expect(LP_LABEL).toBe(REVIEW_COUNT_LABEL);
    expect(site.reviewCount).toBe(REVIEW_COUNT);
    expect(aggregateRating?.reviewCount).toBe(REVIEW_COUNT);
  });

  it("never reads the exact count outside the JSON-LD", () => {
    const allowed = new Set(["lib/googleReviews.ts", "lib/site.ts"]);
    for (const file of sources) {
      if (allowed.has(file)) continue;
      expect(readSource(file), file).not.toMatch(/GOOGLE_REVIEWS\.count|GOOGLE_REVIEWS\[["']count/);
    }
    // In lib/site.ts, only inside NAP_JSON_LD's aggregateRating.
    const site = readSource("lib/site.ts");
    expect(site.match(/GOOGLE_REVIEWS\.count/g)).toHaveLength(1);
    expect(site.slice(site.indexOf("aggregateRating: {"))).toContain("GOOGLE_REVIEWS.count");
  });

  it("never hardcodes the exact count in page code", () => {
    const re = new RegExp(`(?<![\\w./#-])${GOOGLE_REVIEWS.count}(?=\\s*(\\+|Google|reviews|Reviews))`);
    for (const file of sources) expect(readSource(file), file).not.toMatch(re);
  });

  it("keeps the JSON-LD on the listing's exact number (structured data needs one)", () => {
    expect(NAP_JSON_LD.aggregateRating.reviewCount).toBe(GOOGLE_REVIEWS.count);
  });
});
