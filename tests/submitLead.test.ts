import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ATTRIBUTION_STORAGE_KEY } from "@/lib/attribution";
import { LEAD_SENT_STORAGE_KEY } from "@/lib/callIntent";
import { ADS_CONVERSION_LABELS, ADS_ID, GA4_ID } from "@/lib/googleTag";
import { submitLead } from "@/lib/submitLead";

const attribution = {
  gclid: "TEST123",
  utm_source: "google",
  landing_path: "/",
  first_seen: "2026-09-23T14:05:00.000Z",
};

let gtag: ReturnType<typeof vi.fn>;
let store: Map<string, string>;
let session: Map<string, string>;
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

beforeEach(() => {
  // Answers gtag('get', ...) like gtag.js does, so tests don't wait out the timeout.
  gtag = vi.fn((cmd: string, _id?: unknown, field?: unknown, cb?: unknown) => {
    if (cmd === "get" && typeof cb === "function") {
      cb(field === "client_id" ? "111222333.1700000000" : "1700000999");
    }
  });
  store = new Map();
  session = new Map();
  fetchMock = vi.fn<typeof fetch>(async () => new Response("{}", { status: 200 }));
  vi.stubGlobal("window", {
    location: { hostname: "topchoicehvac.ca", pathname: "/get-quote" },
    gtag,
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    },
    sessionStorage: {
      getItem: (k: string) => session.get(k) ?? null,
      setItem: (k: string, v: string) => void session.set(k, v),
    },
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

const events = (name: string) =>
  gtag.mock.calls.filter(([cmd, event]) => cmd === "event" && event === name);
const leadConversions = () =>
  events("conversion").filter(([, , p]) => p.send_to === `${ADS_ID}/${ADS_CONVERSION_LABELS.lead}`);
const gaKeys = { ga_client_id: "111222333.1700000000", ga_session_id: "1700000999" };

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
        {
          lead_source: "get-quote",
          service_need: "repair",
          urgency: "emergency",
          page_path: "/get-quote",
          send_to: GA4_ID,
        },
      ],
    ]);
    expect(events("form_submit_error")).toHaveLength(0);
  });

  it("on success: exactly one Google Ads lead conversion, with a random transaction_id", async () => {
    await submitLead(quote);
    expect(leadConversions()).toHaveLength(1);
    const params = leadConversions()[0][2];
    expect(params.transaction_id).toMatch(/^[0-9a-f-]{36}$/);
    // Never derived from the lead.
    expect(JSON.stringify(params)).not.toMatch(/Jane|647|555/);
    await submitLead(quote);
    expect(leadConversions()[1][2].transaction_id).not.toBe(params.transaction_id);
  });

  it("on failure: no Ads conversion, and the tab is not marked post-lead", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 500 }));
    await submitLead(quote);
    fetchMock.mockRejectedValueOnce(new TypeError("network down"));
    await submitLead(quote);
    expect(events("conversion")).toHaveLength(0);
    expect(session.has(LEAD_SENT_STORAGE_KEY)).toBe(false);
  });

  it("on success: marks the tab post-lead (later call taps are not new leads)", async () => {
    await submitLead(quote);
    expect(session.get(LEAD_SENT_STORAGE_KEY)).toBe("1");
  });

  it("adds the GA4 client/session IDs to the posted attribution, never to GA", async () => {
    await submitLead(quote);
    expect(postedBody()).toEqual({ ...quote.body, attribution: gaKeys });
    const gaEvents = gtag.mock.calls.filter(([cmd]) => cmd === "event");
    expect(JSON.stringify(gaEvents)).not.toMatch(/111222333|1700000999|ga_client_id/);
  });

  it("on a non-ok response: no generate_lead, one form_submit_error", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 500 }));
    expect(await submitLead(quote)).toEqual({ ok: false });
    expect(events("generate_lead")).toHaveLength(0);
    expect(events("form_submit_error")).toEqual([
      [
        "event",
        "form_submit_error",
        { lead_source: "get-quote", page_path: "/get-quote", send_to: GA4_ID },
      ],
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
    expect(postedBody()).toEqual({ ...quote.body, attribution: { ...attribution, ...gaKeys } });
  });

  it("omits the attribution key when nothing is stored and gtag has no IDs", async () => {
    gtag.mockImplementation(() => {});
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
    // And no form field reaches any gtag call.
    expect(JSON.stringify(gtag.mock.calls)).not.toMatch(/Jane|647-555-0100/);
  });
});
