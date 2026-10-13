import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The real route, lib/callIntent.ts, lib/notify.ts and lib/rateLimit.ts run.
// Only the Cloudflare env is faked: an in-memory KV, two in-memory rate
// limiters (per binding, so the test can prove they are separate), and the
// Resend fetch.

const kvData = new Map<string, { value: string; options?: { metadata?: unknown; expirationTtl?: number } }>();
const kv = {
  put: vi.fn(async (key: string, value: string, options?: { metadata?: unknown; expirationTtl?: number }) => {
    kvData.set(key, { value, options });
  }),
  get: vi.fn(async (key: string) => kvData.get(key)?.value ?? null),
};

function makeLimiter(limit: number) {
  const counts = new Map<string, number>();
  return {
    counts,
    limit: vi.fn(async ({ key }: { key: string }) => {
      const n = (counts.get(key) ?? 0) + 1;
      counts.set(key, n);
      return { success: n <= limit };
    }),
  };
}
let callLimiter = makeLimiter(10);
let leadLimiter = makeLimiter(5);

const env: Record<string, unknown> = {};
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(async () => ({ env })),
}));

import { POST as callPOST } from "@/app/api/call-intent/route";
import { POST as leadsPOST } from "@/app/api/leads/route";
import {
  CALL_INTENT_CAPS,
  CALL_INTENT_TTL_SECONDS,
  callIntentSubject,
  logCallIntent,
  resetCallIntentIsolateCounts,
} from "@/lib/notify";
import type { CallIntentPayload } from "@/lib/callIntent";

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

const tap: CallIntentPayload = {
  link_location: "lp_sticky_bar",
  lp_slug: "furnace-repair",
  lp_region: "core",
  lp_service: "repair",
  device_class: "touch",
  intent: "general",
  post_lead: false,
  page_path: "/lp/furnace-repair",
  swapped: false,
  attribution: { gclid: "TEST123", landing_path: "/lp/furnace-repair" },
};

let resend: ReturnType<typeof vi.fn<typeof fetch>>;

function beacon(
  body: unknown,
  { ip = "203.0.113.7", ua = UA, origin = "https://topchoicehvac.ca" }: { ip?: string; ua?: string | null; origin?: string | null } = {}
): Request {
  const headers: Record<string, string> = { "Content-Type": "text/plain;charset=UTF-8", "CF-Connecting-IP": ip };
  if (ua) headers["User-Agent"] = ua;
  if (origin) headers.Origin = origin;
  return new Request("https://topchoicehvac.ca/api/call-intent", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const callRecords = () => [...kvData.keys()].filter((k) => k.startsWith("calls:"));
const emails = () => resend.mock.calls.filter(([url]) => String(url).includes("resend"));

beforeEach(() => {
  resetCallIntentIsolateCounts();
  kvData.clear();
  kv.put.mockClear();
  callLimiter = makeLimiter(10);
  leadLimiter = makeLimiter(5);
  resend = vi.fn<typeof fetch>(async () => new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", resend);
  Object.assign(env, {
    LEADS_KV: kv,
    CALL_RATE_LIMITER: callLimiter,
    LEAD_RATE_LIMITER: leadLimiter,
    RESEND_API_KEY: "re_test",
    LEAD_NOTIFY_EMAIL: "owner@example.com",
    TWILIO_ACCOUNT_SID: undefined,
    CALL_INTENT_NOTIFY: undefined,
  });
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/call-intent", () => {
  it("a sendBeacon-style text/plain JSON body is accepted: 204, KV record, one email", async () => {
    const res = await callPOST(beacon(tap));
    expect(res.status).toBe(204);
    expect(callRecords()).toHaveLength(1);
    const [key] = callRecords();
    expect(key).toMatch(/^calls:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z:[0-9a-f]{12}$/);
    const stored = kvData.get(key)!;
    expect(stored.options?.expirationTtl).toBe(90 * 24 * 60 * 60);
    expect(JSON.parse(stored.value)).toMatchObject(tap);
    expect(stored.options?.metadata).toEqual({
      loc: "lp_sticky_bar",
      lp: "furnace-repair",
      dev: "touch",
      intent: "general",
      post: false,
      swap: false,
      src: "Google Ads",
    });
    expect(emails()).toHaveLength(1);
    const sent = JSON.parse(String(emails()[0][1]?.body));
    expect(sent.to).toEqual(["owner@example.com"]);
    expect(sent.subject).toBe("Call tap: furnace-repair (mobile) [Google Ads]");
    expect(sent.text).toContain("not a confirmed call");
  });

  it("never sends an SMS", async () => {
    Object.assign(env, { TWILIO_ACCOUNT_SID: "AC", TWILIO_AUTH_TOKEN: "t", TWILIO_FROM_NUMBER: "+1", LEAD_NOTIFY_PHONE: "+1" });
    await callPOST(beacon({ ...tap, intent: "emergency" }));
    expect(resend.mock.calls.some(([url]) => String(url).includes("twilio"))).toBe(false);
  });

  it("rejects unknown keys and PII fields with 400 and stores nothing", async () => {
    for (const extra of [{ name: "Jane" }, { phone: "647-555-0100" }, { email: "a@b.co" }, { note: "hi" }]) {
      expect((await callPOST(beacon({ ...tap, ...extra }))).status).toBe(400);
    }
    expect((await callPOST(beacon("{not json"))).status).toBe(400);
    expect((await callPOST(beacon(JSON.stringify({ ...tap, x: "y".repeat(5000) })))).status).toBe(413);
    expect(callRecords()).toHaveLength(0);
    expect(emails()).toHaveLength(0);
  });

  it("bots get a quiet 204 with nothing stored or emailed", async () => {
    for (const ua of ["Googlebot/2.1", "curl/8.5.0", "HeadlessChrome/128", null]) {
      expect((await callPOST(beacon(tap, { ua }))).status).toBe(204);
    }
    expect(callRecords()).toHaveLength(0);
    expect(emails()).toHaveLength(0);
  });

  it("cross-site or origin-less requests get 403", async () => {
    expect((await callPOST(beacon(tap, { origin: "https://evil.example" }))).status).toBe(403);
    expect((await callPOST(beacon(tap, { origin: null }))).status).toBe(403);
    expect(callRecords()).toHaveLength(0);
  });

  it("rate limits per IP (429) on its own binding", async () => {
    for (let i = 0; i < 10; i++) expect((await callPOST(beacon(tap))).status).toBe(204);
    expect((await callPOST(beacon(tap))).status).toBe(429);
    expect((await callPOST(beacon(tap, { ip: "198.51.100.9" }))).status).toBe(204);
    expect(callLimiter.limit).toHaveBeenCalled();
    expect(leadLimiter.limit).not.toHaveBeenCalled();
  });

  it("call taps never use up the lead form's rate-limit budget", async () => {
    for (let i = 0; i < 10; i++) await callPOST(beacon(tap));
    const lead = new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.7" },
      body: JSON.stringify({ source: "emergency-service", name: "Sam", phone: "647-555-0142", issue: "no-heat" }),
    });
    expect((await leadsPOST(lead)).status).toBe(200);
  });

  it("CALL_INTENT_NOTIFY=off: KV record only, no email", async () => {
    env.CALL_INTENT_NOTIFY = "off";
    await callPOST(beacon(tap));
    expect(callRecords()).toHaveLength(1);
    expect(emails()).toHaveLength(0);
  });

  it("the kill switch fails closed on a typo (\"false\", \"0\", \"of\")", async () => {
    for (const value of ["false", "0", "of"]) {
      env.CALL_INTENT_NOTIFY = value;
      await callPOST(beacon(tap, { ip: `198.51.100.${value.length}` }));
    }
    expect(callRecords()).toHaveLength(3);
    expect(emails()).toHaveLength(0);
  });

  it("without Origin, accepts Sec-Fetch-Site: same-origin or a same-site Referer", async () => {
    const withHeaders = (h: Record<string, string>) => {
      const req = beacon(tap, { origin: null });
      for (const [k, v] of Object.entries(h)) req.headers.set(k, v);
      return req;
    };
    expect((await callPOST(withHeaders({ "Sec-Fetch-Site": "same-origin" }))).status).toBe(204);
    expect((await callPOST(withHeaders({ Referer: "https://topchoicehvac.ca/lp/furnace-repair" }))).status).toBe(204);
    expect((await callPOST(withHeaders({ "Sec-Fetch-Site": "cross-site" }))).status).toBe(403);
    expect((await callPOST(withHeaders({ Referer: "https://evil.example/" }))).status).toBe(403);
  });
});

describe("logCallIntent caps", () => {
  const at = (iso: string) => ({ env: env as never, fetch: resend as never, now: new Date(iso) });

  it("at most 20 emails per UTC hour; the rest are KV only", async () => {
    for (let i = 0; i < 25; i++) await logCallIntent(tap, { ...at(`2026-10-13T15:${String(i).padStart(2, "0")}:00.000Z`), id: `id${i}` });
    expect(emails()).toHaveLength(CALL_INTENT_CAPS.emailsPerHour);
    expect(callRecords()).toHaveLength(25);
    // A new hour gets a fresh hourly budget.
    await logCallIntent(tap, { ...at("2026-10-13T16:00:00.000Z"), id: "next" });
    expect(emails()).toHaveLength(21);
  });

  it("at most 40 emails per UTC day, leaving Resend room for form leads", async () => {
    for (let h = 0; h < 3; h++) {
      for (let i = 0; i < 20; i++) {
        await logCallIntent(tap, {
          ...at(`2026-10-13T${String(10 + h).padStart(2, "0")}:${String(i).padStart(2, "0")}:00.000Z`),
          id: `h${h}i${i}`,
        });
      }
    }
    expect(emails()).toHaveLength(CALL_INTENT_CAPS.emailsPerDay);
    expect(callRecords()).toHaveLength(60);
  });

  it("at most 300 KV records per UTC day; beyond it nothing is written", async () => {
    kvData.set("callcap:2026-10-13", { value: JSON.stringify({ records: 300, emails: 40, hours: {} }) });
    const result = await logCallIntent(tap, at("2026-10-13T20:00:00.000Z"));
    expect(result).toMatchObject({ kv: "skipped", email: "skipped" });
    expect(callRecords()).toHaveLength(0);
  });

  it("fails closed: no email and no record if the cap counter can't be written", async () => {
    kv.put.mockImplementationOnce(async () => {
      throw new Error("KV write limit");
    });
    const result = await logCallIntent(tap, at("2026-10-13T20:00:00.000Z"));
    expect(result).toMatchObject({ kv: "skipped", email: "skipped" });
    expect(emails()).toHaveLength(0);
    expect(callRecords()).toHaveLength(0);
  });

  it("fails closed when the cap counter can't be read", async () => {
    kv.get.mockImplementationOnce(async () => {
      throw new Error("KV down");
    });
    const result = await logCallIntent(tap, at("2026-10-13T20:00:00.000Z"));
    expect(result).toMatchObject({ kv: "skipped", email: "skipped" });
  });

  it("a stale KV counter can't push one isolate past its own hourly ceilings", async () => {
    // Simulate KV always returning an old, low count (eventual consistency).
    kv.get.mockImplementation(async () => JSON.stringify({ records: 0, emails: 0, hours: {} }));
    try {
      for (let i = 0; i < 70; i++) {
        await logCallIntent(tap, { ...at(`2026-10-13T15:${String(i % 60).padStart(2, "0")}:00.000Z`), id: `s${i}` });
      }
      expect(emails()).toHaveLength(CALL_INTENT_CAPS.isolateEmailsPerHour);
      expect(callRecords()).toHaveLength(CALL_INTENT_CAPS.isolateRecordsPerHour);
    } finally {
      kv.get.mockImplementation(async (key: string) => kvData.get(key)?.value ?? null);
    }
  });

  it("a failing Resend never throws and the KV record is kept", async () => {
    resend.mockResolvedValue(new Response("quota", { status: 429 }));
    const result = await logCallIntent(tap, at("2026-10-13T20:00:00.000Z"));
    expect(result).toMatchObject({ kv: "sent", email: "failed" });
  });

  it("records expire after 90 days", () => {
    expect(CALL_INTENT_TTL_SECONDS).toBe(7_776_000);
  });
});

describe("callIntentSubject", () => {
  it("names the page or button, device, source; flags emergency and post-lead", () => {
    expect(callIntentSubject({ ...tap, lp_slug: undefined, link_location: "header", device_class: "pointer", attribution: undefined })).toBe(
      "Call tap: header (desktop) [organic]"
    );
    expect(callIntentSubject({ ...tap, intent: "emergency", post_lead: true, attribution: { utm_source: "gbp" } })).toBe(
      "🚨 Call tap: furnace-repair (mobile) [gbp] (after a form lead)"
    );
  });
});

describe("no PII in the call-intent record, email or log", () => {
  it("contains none of a lead's fields", async () => {
    const log = vi.mocked(console.log);
    await callPOST(beacon(tap));
    const everything = JSON.stringify([...kvData.values()]) + JSON.stringify(emails()) + JSON.stringify(log.mock.calls);
    expect(everything).not.toMatch(/"(name|phone|email|message|postalCode)"/);
    expect(everything).not.toMatch(/763-2970|6477632970/);
  });
});
