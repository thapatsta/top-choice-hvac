import { afterEach, describe, expect, it, vi } from "vitest";
import { isProductionHost, sanitize, track } from "@/lib/analytics";

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

    track("click_to_call", { link_location: "header" });

    expect(gtag).not.toHaveBeenCalled();
    expect(debug).toHaveBeenCalledWith("[analytics]", "click_to_call", {
      link_location: "header",
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

    expect(gtag.mock.calls[0][2]).toEqual({ lead_source: "contact", page_path: "/get-quote" });
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
