import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("leaves out the noindex /thank-you page", () => {
    const urls = sitemap().map((entry) => new URL(entry.url).pathname);
    expect(urls).toContain("/get-quote");
    expect(urls.some((path) => path.startsWith("/thank-you"))).toBe(false);
  });

  it("leaves out the noindex /lp/* ad landing pages", () => {
    const urls = sitemap().map((entry) => new URL(entry.url).pathname);
    expect(urls.some((path) => path.startsWith("/lp/"))).toBe(false);
  });
});
