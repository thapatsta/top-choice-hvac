import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CALL_INTENT_ENDPOINT,
  createTapDeduper,
  deviceClass,
  isAutomatedBrowser,
  isBotUserAgent,
  isPostLead,
  LEAD_SENT_STORAGE_KEY,
  parseCallIntentPayload,
  sendCallIntent,
  type CallIntentPayload,
} from "@/lib/callIntent";

afterEach(() => vi.unstubAllGlobals());

const valid: CallIntentPayload = {
  link_location: "lp_sticky_bar",
  lp_slug: "furnace-repair",
  lp_region: "core",
  lp_service: "repair",
  device_class: "touch",
  intent: "general",
  post_lead: false,
  page_path: "/lp/furnace-repair",
  swapped: true,
  attribution: { gclid: "Cj0KCQ-test", utm_campaign: "21345678901", landing_path: "/lp/furnace-repair" },
};

const CHROME_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";

describe("parseCallIntentPayload (strict allowlist)", () => {
  it("accepts a valid payload unchanged (Ads campaign-ID digit runs kept)", () => {
    expect(parseCallIntentPayload(valid)).toEqual({ ok: true, value: valid });
  });

  it("accepts the minimal payload", () => {
    const minimal: CallIntentPayload = {
      link_location: valid.link_location,
      device_class: valid.device_class,
      intent: valid.intent,
      post_lead: valid.post_lead,
      page_path: valid.page_path,
      swapped: valid.swapped,
    };
    expect(parseCallIntentPayload(minimal)).toEqual({ ok: true, value: minimal });
  });

  it.each([
    ["name", { name: "Jane Doe" }],
    ["phone", { phone: "647-555-0100" }],
    ["email", { email: "jane@example.com" }],
    ["message", { message: "No heat" }],
    ["page_location", { page_location: "https://topchoicehvac.ca/?gclid=x" }],
    ["__proto__-ish", { constructor: "x" }],
  ])("rejects an unknown top-level key: %s", (_label, extra) => {
    expect(parseCallIntentPayload({ ...valid, ...extra }).ok).toBe(false);
  });

  it("rejects unknown attribution keys", () => {
    expect(parseCallIntentPayload({ ...valid, attribution: { gclid: "x", phone: "647-555-0100" } }).ok).toBe(false);
  });

  it.each([
    ["link_location free text", { link_location: "Call Jane at 647-555-0100" }],
    ["link_location too long", { link_location: "a".repeat(41) }],
    ["page_path with query", { page_path: "/lp/furnace-repair?gclid=x" }],
    ["page_path with email", { page_path: "/jane@example.com" }],
    ["page_path not a path", { page_path: "https://evil.example/" }],
    ["device_class", { device_class: "phone" }],
    ["intent", { intent: "urgent" }],
    ["post_lead as string", { post_lead: "false" }],
    ["swapped missing", { swapped: undefined }],
    ["unknown lp_slug", { lp_slug: "made-up" }],
    ["attribution non-string", { attribution: { gclid: 123 } }],
    ["attribution array", { attribution: ["x"] }],
  ])("rejects %s", (_label, override) => {
    const payload = { ...valid, ...override } as Record<string, unknown>;
    if ("swapped" in override && override.swapped === undefined) delete payload.swapped;
    expect(parseCallIntentPayload(payload).ok).toBe(false);
  });

  it("rejects non-objects", () => {
    for (const raw of [null, "x", 1, [], [valid]]) expect(parseCallIntentPayload(raw).ok).toBe(false);
  });

  it("drops attribution values that look like an email or a formatted phone number", () => {
    const result = parseCallIntentPayload({
      ...valid,
      attribution: {
        gclid: "abc",
        utm_term: "jane@example.com",
        utm_content: "(647) 555-0100",
        utm_campaign: "call 647-555-0100 now",
      },
    });
    expect(result).toEqual({ ok: true, value: { ...valid, attribution: { gclid: "abc" } } });
  });

  it("strips control characters and caps attribution length", () => {
    const result = parseCallIntentPayload({
      ...valid,
      attribution: { utm_source: "goo\ngle", utm_campaign: "x".repeat(500) },
    });
    expect(result.ok && result.value.attribution).toEqual({ utm_source: "google", utm_campaign: "x".repeat(200) });
  });
});

describe("bot filtering", () => {
  it.each([
    "Googlebot/2.1 (+http://www.google.com/bot.html)",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/128.0.0.0 Safari/537.36",
    "curl/8.5.0",
    "python-requests/2.31",
    "Mozilla/5.0 (compatible; Lighthouse)",
    "",
  ])("flags %s", (ua) => expect(isBotUserAgent(ua)).toBe(true));

  it("passes a normal mobile browser", () => {
    expect(isBotUserAgent(CHROME_UA)).toBe(false);
    expect(isBotUserAgent(null)).toBe(true);
  });

  it("flags navigator.webdriver", () => {
    expect(isAutomatedBrowser({ userAgent: CHROME_UA, webdriver: true })).toBe(true);
    expect(isAutomatedBrowser({ userAgent: CHROME_UA, webdriver: false })).toBe(false);
  });
});

describe("deviceClass", () => {
  it("is touch only for a coarse primary pointer", () => {
    expect(deviceClass({ matchMedia: () => ({ matches: true }) } as never)).toBe("touch");
    expect(deviceClass({ matchMedia: () => ({ matches: false }) } as never)).toBe("pointer");
    expect(deviceClass(undefined)).toBe("pointer");
    expect(
      deviceClass({
        matchMedia: () => {
          throw new Error("x");
        },
      } as never)
    ).toBe("pointer");
  });
});

describe("createTapDeduper (5 s, per location)", () => {
  it("ignores a second tap on the same location within 5 s", () => {
    const count = createTapDeduper();
    expect(count("header", 1000)).toBe(true);
    expect(count("header", 1500)).toBe(false);
    expect(count("header", 5999)).toBe(false);
    expect(count("header", 6000)).toBe(true);
  });

  it("counts different locations independently", () => {
    const count = createTapDeduper();
    expect(count("header", 1000)).toBe(true);
    expect(count("hero", 1100)).toBe(true);
  });
});

describe("isPostLead", () => {
  function stubSession(value: string | null) {
    vi.stubGlobal("window", { sessionStorage: { getItem: () => value } });
  }

  it("is true on /thank-you", () => {
    stubSession(null);
    expect(isPostLead("/thank-you")).toBe(true);
    expect(isPostLead("/")).toBe(false);
  });

  it("is true anywhere after a lead in this tab", () => {
    stubSession("1");
    expect(isPostLead("/lp/furnace-repair")).toBe(true);
    expect(LEAD_SENT_STORAGE_KEY).toBe("tch_lead_sent");
  });

  it("is false when storage throws", () => {
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
      },
    });
    expect(isPostLead("/")).toBe(false);
  });
});

describe("sendCallIntent", () => {
  it("uses sendBeacon with a text/plain JSON blob", async () => {
    const sendBeacon = vi.fn(() => true);
    const fetchMock = vi.fn();
    vi.stubGlobal("navigator", { sendBeacon });
    vi.stubGlobal("fetch", fetchMock);

    sendCallIntent(valid);

    expect(sendBeacon).toHaveBeenCalledOnce();
    const [url, blob] = sendBeacon.mock.calls[0] as unknown as [string, Blob];
    expect(url).toBe(CALL_INTENT_ENDPOINT);
    expect(blob.type).toBe("text/plain;charset=utf-8");
    expect(JSON.parse(await blob.text())).toEqual(valid);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to fetch keepalive when sendBeacon refuses or is missing", () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("navigator", { sendBeacon: () => false });
    sendCallIntent(valid);
    vi.stubGlobal("navigator", {});
    sendCallIntent(valid);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]).toEqual([
      CALL_INTENT_ENDPOINT,
      expect.objectContaining({ method: "POST", keepalive: true, body: JSON.stringify(valid) }),
    ]);
  });

  it("never throws", () => {
    vi.stubGlobal("navigator", {
      sendBeacon: () => {
        throw new Error("x");
      },
    });
    expect(() => sendCallIntent(valid)).not.toThrow();
  });
});
