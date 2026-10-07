import { describe, expect, it } from "vitest";
import { needOptions, systemTypeOptions, urgencyOptions } from "@/lib/estimate";
import type { LeadSource } from "@/lib/leadAdapter";
import { parseThankYouParams, thankYouHref, type ThankYouParams } from "@/lib/thankYou";

function parseHref(href: string): ThankYouParams {
  const [path, query = ""] = href.split("?");
  expect(path).toBe("/thank-you");
  return parseThankYouParams(new URLSearchParams(query));
}

const parse = (query: string) => parseThankYouParams(new URLSearchParams(query));

describe("thankYouHref", () => {
  it("builds a source-only URL for each form", () => {
    expect(thankYouHref("get-quote")).toBe("/thank-you?source=get-quote");
    expect(thankYouHref("emergency-service")).toBe("/thank-you?source=emergency-service");
    expect(thankYouHref("contact")).toBe("/thank-you?source=contact");
  });

  it("adds quote details only when given", () => {
    expect(
      thankYouHref("get-quote", { need: "repair", system: "heat-pump", urgency: "emergency" })
    ).toBe("/thank-you?source=get-quote&need=repair&system=heat-pump&urgency=emergency");
    expect(thankYouHref("get-quote", { need: "maintenance" })).toBe(
      "/thank-you?source=get-quote&need=maintenance"
    );
    expect(thankYouHref("get-quote", {})).toBe("/thank-you?source=get-quote");
  });
});

describe("parseThankYouParams", () => {
  it("accepts every lead source", () => {
    for (const source of ["get-quote", "emergency-service", "contact"] as LeadSource[]) {
      expect(parse(`source=${source}`).source).toBe(source);
    }
  });

  it("accepts every need, system and urgency value", () => {
    for (const { value } of needOptions) {
      expect(parse(`source=get-quote&need=${value}`).need).toBe(value);
    }
    for (const { value } of systemTypeOptions) {
      expect(parse(`source=get-quote&system=${value}`).system).toBe(value);
    }
    for (const { value } of urgencyOptions) {
      expect(parse(`source=get-quote&urgency=${value}`).urgency).toBe(value);
    }
  });

  it("treats a missing or unknown source as the generic state", () => {
    expect(parse("")).toEqual({});
    expect(parse("source=")).toEqual({});
    expect(parse("source=nonsense")).toEqual({});
    expect(parse("source=emergency")).toEqual({});
    expect(parse("source=toString")).toEqual({});
    expect(parse("source=__proto__")).toEqual({});
  });

  it("drops unknown or empty quote values", () => {
    expect(parse("source=get-quote&need=gold-plated&system=&urgency=yesterday")).toEqual({
      source: "get-quote",
    });
  });

  it("ignores quote details on other sources", () => {
    expect(parse("source=contact&need=repair&system=ac&urgency=emergency")).toEqual({
      source: "contact",
    });
  });

  it("ignores extra keys such as a name", () => {
    const parsed = parse("source=nonsense&name=Robin&phone=6475550100");
    expect(parsed).toEqual({});
    expect(JSON.stringify(parse("source=get-quote&need=repair&name=Robin"))).not.toMatch(/Robin/);
  });

  it("round-trips thankYouHref", () => {
    const cases: [LeadSource, ThankYouParams][] = [
      ["contact", { source: "contact" }],
      ["emergency-service", { source: "emergency-service" }],
      ["get-quote", { source: "get-quote" }],
      ["get-quote", { source: "get-quote", need: "replacement", system: "ac", urgency: "this-week" }],
    ];
    for (const [source, expected] of cases) {
      const { need, system, urgency } = expected;
      expect(parseHref(thankYouHref(source, { need, system, urgency }))).toEqual(expected);
    }
  });
});
