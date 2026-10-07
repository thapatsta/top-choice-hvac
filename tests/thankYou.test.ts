import { afterEach, describe, expect, it, vi } from "vitest";
import { needOptions, systemTypeOptions, urgencyOptions } from "@/lib/estimate";
import type { LeadSource } from "@/lib/leadAdapter";
import {
  encodeThankYou,
  parseThankYouParams,
  prepareThankYou,
  readStoredThankYou,
  THANK_YOU_STORAGE_KEY,
  type ThankYouParams,
} from "@/lib/thankYou";

const parse = (query: string) => parseThankYouParams(new URLSearchParams(query));

describe("encodeThankYou", () => {
  it("encodes only the source for each form", () => {
    expect(encodeThankYou("get-quote")).toBe("source=get-quote");
    expect(encodeThankYou("emergency-service")).toBe("source=emergency-service");
    expect(encodeThankYou("contact")).toBe("source=contact");
    expect(encodeThankYou("landing-page")).toBe("source=landing-page");
  });

  it("adds quote details only when given", () => {
    expect(
      encodeThankYou("get-quote", { need: "repair", system: "heat-pump", urgency: "emergency" })
    ).toBe("source=get-quote&need=repair&system=heat-pump&urgency=emergency");
    expect(encodeThankYou("get-quote", { need: "maintenance" })).toBe(
      "source=get-quote&need=maintenance"
    );
    expect(encodeThankYou("get-quote", {})).toBe("source=get-quote");
  });
});

describe("prepareThankYou", () => {
  function stubStorage(storage: Partial<Storage>) {
    vi.stubGlobal("sessionStorage", storage);
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the plain /thank-you path and stores the details", () => {
    const store = new Map<string, string>();
    stubStorage({
      setItem: (k, v) => void store.set(k, v),
      getItem: (k) => store.get(k) ?? null,
    });
    expect(prepareThankYou("get-quote", { need: "repair", urgency: "emergency" })).toBe(
      "/thank-you"
    );
    expect(store.get(THANK_YOU_STORAGE_KEY)).toBe("source=get-quote&need=repair&urgency=emergency");
    expect(readStoredThankYou()).toBe("source=get-quote&need=repair&urgency=emergency");
  });

  it("still returns /thank-you when storage is blocked", () => {
    const blocked = () => {
      throw new Error("SecurityError");
    };
    stubStorage({ setItem: blocked, getItem: blocked });
    expect(prepareThankYou("contact")).toBe("/thank-you");
    expect(readStoredThankYou()).toBeNull();
  });
});

describe("parseThankYouParams", () => {
  it("accepts every lead source", () => {
    for (const source of ["get-quote", "emergency-service", "contact", "landing-page"] as LeadSource[]) {
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

  it("round-trips encodeThankYou", () => {
    const cases: [LeadSource, ThankYouParams][] = [
      ["contact", { source: "contact" }],
      ["emergency-service", { source: "emergency-service" }],
      ["get-quote", { source: "get-quote" }],
      ["get-quote", { source: "get-quote", need: "replacement", system: "ac", urgency: "this-week" }],
    ];
    for (const [source, expected] of cases) {
      const { need, system, urgency } = expected;
      expect(parse(encodeThankYou(source, { need, system, urgency }))).toEqual(expected);
    }
  });
});
