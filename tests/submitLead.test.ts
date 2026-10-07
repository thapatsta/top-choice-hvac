import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ATTRIBUTION_STORAGE_KEY } from "@/lib/attribution";
import { submitLead } from "@/lib/submitLead";

const attribution = {
  gclid: "TEST123",
  utm_source: "google",
  landing_path: "/",
  first_seen: "2026-09-23T14:05:00.000Z",
};

let gtag: ReturnType<typeof vi.fn>;
let store: Map<string, string>;
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

beforeEach(() => {
  gtag = vi.fn();
  store = new Map();
  fetchMock = vi.fn<typeof fetch>(async () => new Response("{}", { status: 200 }));
  vi.stubGlobal("window", {
    location: { hostname: "topchoicehvac.ca", pathname: "/get-quote" },
    gtag,
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    },
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

const events = (name: string) => gtag.mock.calls.filter(([, event]) => event === name);

function postedBody() {
  expect(fetchMock).toHaveBeenCalledOnce();
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe("/api/leads");
  return JSON.parse(String(init?.body));
}

const quote = {
  endpoint: "/api/leads",
  body: { name: "Jane", phone: "647-555-0100", source: "get-quote" },
  leadSource: "get-quote",
  leadParams: { service_need: "repair", urgency: "emergency" },
} as const;

describe("submitLead", () => {
  it("on success: one generate_lead, no form_submit_error", async () => {
    expect(await submitLead(quote)).toEqual({ ok: true });
    expect(events("generate_lead")).toEqual([
      [
        "event",
        "generate_lead",
        { lead_source: "get-quote", service_need: "repair", urgency: "emergency", page_path: "/get-quote" },
      ],
    ]);
    expect(events("form_submit_error")).toHaveLength(0);
  });

  it("on a non-ok response: no generate_lead, one form_submit_error", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 500 }));
    expect(await submitLead(quote)).toEqual({ ok: false });
    expect(events("generate_lead")).toHaveLength(0);
    expect(events("form_submit_error")).toEqual([
      ["event", "form_submit_error", { lead_source: "get-quote", page_path: "/get-quote" }],
    ]);
  });

  it("on a thrown fetch: no generate_lead, one form_submit_error, never throws", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("network down"));
    await expect(submitLead(quote)).resolves.toEqual({ ok: false });
    expect(events("generate_lead")).toHaveLength(0);
    expect(events("form_submit_error")).toHaveLength(1);
  });

  it("includes the stored attribution in the posted body", async () => {
    store.set(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify({ value: attribution, expires: Date.now() + 60_000 })
    );
    await submitLead(quote);
    expect(postedBody()).toEqual({ ...quote.body, attribution });
  });

  it("omits the attribution key when nothing is stored", async () => {
    await submitLead(quote);
    expect(postedBody()).toEqual(quote.body);
    expect("attribution" in postedBody()).toBe(false);
  });

  it("never sends attribution to GA", async () => {
    store.set(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify({ value: attribution, expires: Date.now() + 60_000 })
    );
    await submitLead(quote);
    expect(JSON.stringify(gtag.mock.calls)).not.toMatch(/TEST123|gclid|utm_/);
  });
});
