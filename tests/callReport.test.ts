import { describe, expect, it } from "vitest";
import { buildReport, keysInRange, sourceLabel, torontoDayRange, torontoToday } from "../scripts/call-report.mjs";

describe("torontoDayRange", () => {
  it("EDT day: 04:00Z to 04:00Z, spanning two UTC dates", () => {
    expect(torontoDayRange("2026-10-13")).toEqual({
      start: "2026-10-13T04:00:00.000Z",
      end: "2026-10-14T04:00:00.000Z",
      utcDates: ["2026-10-13", "2026-10-14"],
    });
  });

  it("EST day: 05:00Z to 05:00Z, across a year boundary", () => {
    expect(torontoDayRange("2026-12-31")).toEqual({
      start: "2026-12-31T05:00:00.000Z",
      end: "2027-01-01T05:00:00.000Z",
      utcDates: ["2026-12-31", "2027-01-01"],
    });
  });

  it("spring-forward day is 23 hours", () => {
    const r = torontoDayRange("2026-03-08");
    expect(r.start).toBe("2026-03-08T05:00:00.000Z");
    expect(r.end).toBe("2026-03-09T04:00:00.000Z");
  });

  it("fall-back day is 25 hours", () => {
    const r = torontoDayRange("2026-11-01");
    expect(r.start).toBe("2026-11-01T04:00:00.000Z");
    expect(r.end).toBe("2026-11-02T05:00:00.000Z");
  });

  it("rejects a bad date", () => {
    expect(() => torontoDayRange("13/10/2026")).toThrow();
  });
});

describe("torontoToday", () => {
  it("is still the previous day at 11pm Toronto (03:00Z next day)", () => {
    expect(torontoToday(new Date("2026-10-14T03:00:00.000Z"))).toBe("2026-10-13");
    expect(torontoToday(new Date("2026-10-14T04:00:00.000Z"))).toBe("2026-10-14");
  });
});

describe("keysInRange", () => {
  it("keeps a late-evening Toronto tap stored under the next UTC date, drops the day after", () => {
    const range = torontoDayRange("2026-10-13");
    const keys = [
      { name: "calls:2026-10-13T03:59:59.999Z:a" }, // 11:59pm on the 12th: out
      { name: "calls:2026-10-13T04:00:00.000Z:b" }, // midnight on the 13th: in
      { name: "calls:2026-10-14T02:30:00.000Z:c" }, // 10:30pm on the 13th: in
      { name: "calls:2026-10-14T04:00:00.000Z:d" }, // midnight on the 14th: out
      { name: "callcap:2026-10-13" }, // not a record
    ];
    expect(keysInRange(keys, range).map((k: { name: string }) => k.name)).toEqual([
      "calls:2026-10-13T04:00:00.000Z:b",
      "calls:2026-10-14T02:30:00.000Z:c",
    ]);
  });
});

describe("buildReport", () => {
  const calls = [
    { name: "calls:1", metadata: { loc: "lp_sticky_bar", lp: "furnace-repair", dev: "touch", intent: "general", post: false, swap: true, src: "Google Ads" } },
    { name: "calls:2", metadata: { loc: "lp_header", lp: "furnace-repair", dev: "touch", intent: "general", post: false, swap: true, src: "Google Ads" } },
    { name: "calls:3", metadata: { loc: "header", lp: null, dev: "pointer", intent: "general", post: false, swap: false, src: "organic" } },
    { name: "calls:4", metadata: { loc: "thank_you_emergency", lp: null, dev: "touch", intent: "emergency", post: true, swap: false, src: "organic" } },
  ];
  const leads = [
    { source: "landing-page", attribution: { gclid: "x" } },
    { source: "emergency-service", attribution: undefined },
  ];

  it("counts taps by page/button, device, intent, source, and the ratio", () => {
    const r = buildReport("2026-10-13", calls, leads);
    expect(r.calls).toMatchObject({ total: 4, newIntent: 3, mobileNewIntent: 2, postLead: 1, swapped: 2 });
    expect(r.calls.byLocation).toEqual({
      "furnace-repair / lp_sticky_bar": 1,
      "furnace-repair / lp_header": 1,
      header: 1,
      thank_you_emergency: 1,
    });
    expect(r.calls.byDevice).toEqual({ mobile: 3, desktop: 1 });
    expect(r.calls.byIntent).toEqual({ general: 3, emergency: 1 });
    expect(r.calls.bySource).toEqual({ "Google Ads": 2, organic: 2 });
    expect(r.leads).toEqual({
      total: 2,
      bySource: { "landing-page": 1, "emergency-service": 1 },
      byOrigin: { "Google Ads": 1, organic: 1 },
    });
    expect(r.tapsPerLead).toBe(1);
  });

  it("no leads: ratio is null", () => {
    expect(buildReport("2026-10-13", calls, []).tapsPerLead).toBeNull();
  });

  it("carries no PII: only counts", () => {
    const r = buildReport("2026-10-13", calls, [{ source: "contact", attribution: { utm_source: "gbp" }, name: "Jane" }]);
    expect(JSON.stringify(r)).not.toContain("Jane");
  });

  it("sourceLabel matches lib/notify.ts callSourceLabel", async () => {
    const { callSourceLabel } = await import("@/lib/notify");
    for (const a of [undefined, { gclid: "x" }, { wbraid: "y" }, { utm_source: "gbp" }, { referrer_host: "bing.com" }]) {
      expect(sourceLabel(a)).toBe(callSourceLabel(a));
    }
  });
});
