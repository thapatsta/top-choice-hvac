import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getGaJoinKeys,
  isProductionHost,
  resetPageViewDedupe,
  sanitize,
  track,
  trackAdsConversion,
  trackPageView,
} from "@/lib/analytics";
import { ADS_CONVERSION_LABELS, ADS_ID, GA4_ID } from "@/lib/googleTag";

function stubWindow(hostname: string, gtag?: (...args: unknown[]) => void) {
  vi.stubGlobal("window", { location: { hostname, pathname: "/get-quote" }, gtag });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("isProductionHost", () => {
  it("accepts only the production domains", () => {
    expect(isProductionHost("topchoicehvac.ca")).toBe(true);
    expect(isProductionHost("www.topchoicehvac.ca")).toBe(true);
    expect(isProductionHost("localhost")).toBe(false);
    expect(isProductionHost("127.0.0.1")).toBe(false);
    expect(isProductionHost("top-choice-hvac.example.workers.dev")).toBe(false);
    expect(isProductionHost("topchoicehvac.ca.evil.com")).toBe(false);
    expect(isProductionHost("staging.topchoicehvac.ca")).toBe(false);
  });

  it("is false on the server", () => {
    expect(isProductionHost()).toBe(false);
  });
});

describe("track", () => {
  it("is a no-op on the server", () => {
    expect(() => track("form_start", { lead_source: "contact" })).not.toThrow();
  });

  it("is a no-op without window.gtag on a production host", () => {
    stubWindow("topchoicehvac.ca");
    expect(() => track("form_start", { lead_source: "contact" })).not.toThrow();
  });

  it("logs instead of sending on non-production hosts", () => {
    const gtag = vi.fn();
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    stubWindow("localhost", gtag);

    track("click_to_call", {
      link_location: "header",
      device_class: "touch",
      intent: "general",
      post_lead: false,
      swapped: false,
    });

    expect(gtag).not.toHaveBeenCalled();
    expect(debug).toHaveBeenCalledWith("[analytics]", "click_to_call", {
      link_location: "header",
      device_class: "touch",
      intent: "general",
      post_lead: false,
      swapped: false,
      page_path: "/get-quote",
    });
  });

  it("sends the event with page_path on a production host", () => {
    const gtag = vi.fn();
    stubWindow("www.topchoicehvac.ca", gtag);

    track("generate_lead", { lead_source: "get-quote", service_need: "repair", urgency: "emergency" });

    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith("event", "generate_lead", {
      lead_source: "get-quote",
      service_need: "repair",
      urgency: "emergency",
      page_path: "/get-quote",
      send_to: GA4_ID,
    });
  });

  it("never throws when gtag throws", () => {
    stubWindow("topchoicehvac.ca", () => {
      throw new Error("boom");
    });
    expect(() => track("form_submit_error", { lead_source: "emergency-service" })).not.toThrow();
  });

  it("strips PII even if a caller forces it through", () => {
    const gtag = vi.fn();
    stubWindow("topchoicehvac.ca", gtag);

    track("form_start", { lead_source: "contact", email: "jane@example.com" } as never);

    expect(gtag.mock.calls[0][2]).toEqual({
      lead_source: "contact",
      page_path: "/get-quote",
      send_to: GA4_ID,
    });
  });
});

describe("sanitize", () => {
  it("strips PII-like keys and keeps safe enums", () => {
    expect(
      sanitize({
        name: "Jane Doe",
        first_name: "Jane",
        phone: "647-555-0100",
        phoneNumber: "647-555-0100",
        email: "jane@example.com",
        postalCode: "L6X 1A1",
        address: "1 Main St",
        message: "My furnace is broken",
        lead_source: "get-quote",
        service_need: "repair",
        urgency: "emergency",
        link_location: "footer",
        page_path: "/contact",
      }),
    ).toEqual({
      lead_source: "get-quote",
      service_need: "repair",
      urgency: "emergency",
      link_location: "footer",
      page_path: "/contact",
    });
  });

  it("drops non-primitive and undefined values", () => {
    expect(sanitize({ a: undefined, b: null, c: { nested: 1 }, d: 2, e: false })).toEqual({
      d: 2,
      e: false,
    });
  });
});

describe("trackAdsConversion", () => {
  const real = { adsId: ADS_ID, labels: ADS_CONVERSION_LABELS };

  it("sends one conversion to AW-ID/label on a production host", () => {
    const gtag = vi.fn();
    stubWindow("topchoicehvac.ca", gtag);

    trackAdsConversion("lead", { transactionId: "tx-1" }, real);

    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith("event", "conversion", {
      send_to: `${ADS_ID}/${ADS_CONVERSION_LABELS.lead}`,
      transaction_id: "tx-1",
    });
  });

  it("uses the callTap label for call taps", () => {
    const gtag = vi.fn();
    stubWindow("topchoicehvac.ca", gtag);
    trackAdsConversion("callTap", {}, real);
    expect(gtag).toHaveBeenCalledWith("event", "conversion", {
      send_to: `${ADS_ID}/${ADS_CONVERSION_LABELS.callTap}`,
    });
  });

  it("is inert while the ID or the label is a placeholder", () => {
    const gtag = vi.fn();
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    stubWindow("topchoicehvac.ca", gtag);

    trackAdsConversion("lead", {}, { ...real, adsId: "[PLACEHOLDER: ADS_ID]" });
    trackAdsConversion("lead", {}, { ...real, labels: { ...real.labels, lead: "[PLACEHOLDER: LEAD]" } });

    expect(gtag).not.toHaveBeenCalled();
    expect(debug).not.toHaveBeenCalled();
  });

  it("never sends off production (logs instead)", () => {
    const gtag = vi.fn();
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    stubWindow("top-choice-hvac.example.workers.dev", gtag);
    trackAdsConversion("lead", {}, real);
    expect(gtag).not.toHaveBeenCalled();
    expect(debug).toHaveBeenCalledOnce();
  });

  it("is a no-op on the server and without gtag", () => {
    expect(() => trackAdsConversion("lead")).not.toThrow();
    stubWindow("topchoicehvac.ca");
    expect(() => trackAdsConversion("lead")).not.toThrow();
  });
});

describe("trackPageView", () => {
  afterEach(() => resetPageViewDedupe());

  function stubPage(hostname: string, href: string, gtag?: (...args: unknown[]) => void) {
    vi.stubGlobal("window", { location: { hostname, href }, gtag });
    vi.stubGlobal("document", { title: "Furnace Repair" });
  }

  it("sends one page_view to GA4 with the full URL (GA4 needs utm/gclid for attribution)", () => {
    const gtag = vi.fn();
    stubPage("topchoicehvac.ca", "https://topchoicehvac.ca/lp/furnace-repair?gclid=abc", gtag);

    trackPageView("/lp/furnace-repair");

    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith("event", "page_view", {
      page_location: "https://topchoicehvac.ca/lp/furnace-repair?gclid=abc",
      page_path: "/lp/furnace-repair",
      send_to: GA4_ID,
    });
  });

  it("sends the same pathname only once in a row (thank-you yields exactly one)", () => {
    const gtag = vi.fn();
    stubPage("topchoicehvac.ca", "https://topchoicehvac.ca/thank-you", gtag);
    trackPageView("/thank-you");
    trackPageView("/thank-you");
    expect(gtag).toHaveBeenCalledOnce();
    trackPageView("/");
    trackPageView("/thank-you");
    expect(gtag).toHaveBeenCalledTimes(3);
  });

  it("doesn't send off production", () => {
    const gtag = vi.fn();
    vi.spyOn(console, "debug").mockImplementation(() => {});
    stubPage("localhost", "http://localhost:3000/", gtag);
    trackPageView("/");
    expect(gtag).not.toHaveBeenCalled();
  });
});

describe("getGaJoinKeys", () => {
  it("returns client_id and session_id from gtag('get')", async () => {
    const gtag = vi.fn((cmd: string, _id: string, field: string, cb: (v: unknown) => void) => {
      if (cmd === "get") cb(field === "client_id" ? "123456789.1700000000" : 1700000123);
    });
    stubWindow("topchoicehvac.ca", gtag as never);
    await expect(getGaJoinKeys()).resolves.toEqual({
      ga_client_id: "123456789.1700000000",
      ga_session_id: "1700000123",
    });
    expect(gtag).toHaveBeenCalledWith("get", GA4_ID, "client_id", expect.any(Function));
  });

  it("drops malformed values", async () => {
    const gtag = vi.fn((_c: string, _i: string, _f: string, cb: (v: unknown) => void) => cb("jane@example.com"));
    stubWindow("topchoicehvac.ca", gtag as never);
    await expect(getGaJoinKeys()).resolves.toEqual({});
  });

  it("times out to {} when gtag never answers, and is {} off production", async () => {
    stubWindow("topchoicehvac.ca", vi.fn());
    await expect(getGaJoinKeys(10)).resolves.toEqual({});
    stubWindow("localhost", vi.fn());
    await expect(getGaJoinKeys(10)).resolves.toEqual({});
  });
});
