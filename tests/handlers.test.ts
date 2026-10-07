import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Lead } from "@/lib/leadAdapter";

// Replace the real pipeline so we can assert each handler actually calls it.
vi.mock("@/lib/notify", () => ({
  sendLeadNotification: vi.fn(),
}));

// The real lib/rateLimit.ts runs; only the Cloudflare env it reads is faked,
// with an in-memory stand-in for the LEAD_RATE_LIMITER binding.
const RATE_LIMIT = 5;
const rateCounts = new Map<string, number>();
const limiter = {
  limit: vi.fn(async ({ key }: { key: string }) => {
    const n = (rateCounts.get(key) ?? 0) + 1;
    rateCounts.set(key, n);
    return { success: n <= RATE_LIMIT };
  }),
};
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(async () => ({ env: { LEAD_RATE_LIMITER: limiter } })),
}));

import { sendLeadNotification } from "@/lib/notify";
import { POST as leadsPOST } from "@/app/api/leads/route";
import { POST as contactPOST } from "@/app/api/contact/route";

const send = vi.mocked(sendLeadNotification);

function post(body: unknown, ip = "203.0.113.7"): Request {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": ip },
    body: JSON.stringify(body),
  });
}

const deliveredResult = {
  key: "leads:x:y",
  kv: "sent",
  email: "sent",
  sms: "skipped",
  delivered: true,
} as const;

const quotePayload = {
  need: "replacement",
  systemType: "furnace",
  homeSize: "1500-2500",
  systemAge: "15+",
  urgency: "this-week",
  name: "Jane Doe",
  phone: "647-555-0100",
  email: "jane@example.com",
  postalCode: "L6Y 1A1",
  preferredContact: "phone",
  source: "get-quote",
};

const emergencyPayload = {
  issue: "no-heat",
  name: "Sam",
  phone: "905-555-0199",
  email: "",
  note: "Furnace died",
  source: "emergency-service",
};

const landingPayload = {
  service: "new-furnace-install",
  name: "Priya",
  phone: "647-555-0142",
  email: "",
  postalCode: "L6P 2T4",
  source: "landing-page",
};

const contactPayload = {
  name: "Alex",
  email: "alex@example.com",
  phone: "416-555-0123",
  message: "Do you service Mississauga?",
};

beforeEach(() => {
  send.mockReset();
  send.mockResolvedValue({ ...deliveredResult });
  rateCounts.clear();
  limiter.limit.mockClear();
});

function sentLead(): Lead {
  expect(send).toHaveBeenCalledTimes(1);
  return send.mock.calls[0][0];
}

describe("/get-quote → POST /api/leads", () => {
  it("calls sendLeadNotification with a normalized get-quote Lead on success", async () => {
    const res = await leadsPOST(post(quotePayload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sentLead()).toMatchObject({
      source: "get-quote",
      name: "Jane Doe",
      phone: "647-555-0100",
      need: "replacement",
      postalCode: "L6Y 1A1",
    });
  });
});

describe("/emergency-service → POST /api/leads", () => {
  it("calls sendLeadNotification with an emergency-service Lead on success", async () => {
    const res = await leadsPOST(post(emergencyPayload));
    expect(res.status).toBe(200);
    expect(sentLead()).toMatchObject({
      source: "emergency-service",
      name: "Sam",
      phone: "905-555-0199",
      issue: "no-heat",
      message: "Furnace died",
    });
  });

  it("still routes the legacy `emergency` source as emergency-service", async () => {
    const res = await leadsPOST(post({ ...emergencyPayload, source: "emergency" }));
    expect(res.status).toBe(200);
    expect(sentLead().source).toBe("emergency-service");
  });
});

describe("/lp/* → POST /api/leads", () => {
  it("keeps the landing-page source with its service and postal code", async () => {
    const res = await leadsPOST(post(landingPayload));
    expect(res.status).toBe(200);
    expect(sentLead()).toMatchObject({
      source: "landing-page",
      name: "Priya",
      phone: "647-555-0142",
      service: "new-furnace-install",
      postalCode: "L6P 2T4",
    });
  });
});

describe("/contact → POST /api/contact", () => {
  it("calls sendLeadNotification with a normalized contact Lead on success", async () => {
    const res = await contactPOST(post(contactPayload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sentLead()).toMatchObject({
      source: "contact",
      name: "Alex",
      message: "Do you service Mississauga?",
    });
  });
});

describe("handlers never claim success for an undelivered lead", () => {
  it.each([
    ["get-quote", leadsPOST, quotePayload],
    ["emergency-service", leadsPOST, emergencyPayload],
    ["landing-page", leadsPOST, landingPayload],
    ["contact", contactPOST, contactPayload],
  ] as const)("%s returns 500 when no channel delivered", async (_name, handler, payload) => {
    send.mockResolvedValue({ ...deliveredResult, kv: "failed", email: "failed", delivered: false });
    const res = await handler(post(payload));
    expect(res.status).toBe(500);
    expect((await res.json()).ok).toBe(false);
  });
});

describe("invalid submissions are rejected before notifying", () => {
  it.each([
    ["get-quote", leadsPOST, { ...quotePayload, postalCode: "" }],
    ["emergency-service", leadsPOST, { ...emergencyPayload, issue: undefined }],
    ["landing-page (no service)", leadsPOST, { ...landingPayload, service: undefined }],
    ["landing-page (no postal code)", leadsPOST, { ...landingPayload, postalCode: "" }],
    ["contact", contactPOST, { ...contactPayload, message: "" }],
  ] as const)("%s with a missing field → 400, no notification", async (_name, handler, payload) => {
    const res = await handler(post(payload));
    expect(res.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });
});

describe("rate limiting (per CF-Connecting-IP, shared across both routes)", () => {
  it.each([
    ["get-quote", leadsPOST, quotePayload],
    ["emergency-service", leadsPOST, emergencyPayload],
    ["contact", contactPOST, contactPayload],
  ] as const)("%s → 429 once the IP is over the limit, no notification", async (_n, handler, payload) => {
    for (let i = 0; i < RATE_LIMIT; i++) {
      expect((await handler(post(payload))).status).toBe(200);
    }
    send.mockClear();
    const res = await handler(post(payload));
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(typeof json.error).toBe("string");
    expect(send).not.toHaveBeenCalled();
  });

  it("counts both routes against the same per-IP budget", async () => {
    for (let i = 0; i < RATE_LIMIT; i++) {
      await (i % 2 ? contactPOST(post(contactPayload)) : leadsPOST(post(emergencyPayload)));
    }
    expect((await contactPOST(post(contactPayload))).status).toBe(429);
    expect((await leadsPOST(post(emergencyPayload))).status).toBe(429);
  });

  it("a different IP is unaffected", async () => {
    for (let i = 0; i < RATE_LIMIT + 1; i++) await leadsPOST(post(emergencyPayload));
    expect((await leadsPOST(post(emergencyPayload, "198.51.100.9"))).status).toBe(200);
  });

  it("counts invalid submissions too (checked before parsing)", async () => {
    for (let i = 0; i < RATE_LIMIT; i++) {
      expect((await leadsPOST(post({}))).status).toBe(400);
    }
    expect((await leadsPOST(post(quotePayload))).status).toBe(429);
    expect(send).not.toHaveBeenCalled();
  });
});

describe("attribution", () => {
  it("a posted attribution object reaches the lead in normalized form", async () => {
    const attribution = {
      gclid: " TEST123 ",
      utm_source: "google",
      utm_medium: "cpc",
      landing_path: "/",
      first_seen: "2026-09-23T14:05:00.000Z",
    };
    const res = await leadsPOST(post({ ...quotePayload, attribution }));
    expect(res.status).toBe(200);
    expect(sentLead().attribution).toEqual({ ...attribution, gclid: "TEST123" });
  });

  it("a hostile attribution object is cleaned", async () => {
    const res = await contactPOST(
      post({
        ...contactPayload,
        attribution: {
          gclid: "g".repeat(5000),
          utm_source: "google\n\nBcc: x@evil.test",
          extra: "nope",
          utm_medium: { $ne: 1 },
          landing_path: ["/"],
        },
      })
    );
    expect(res.status).toBe(200);
    const { attribution } = sentLead();
    expect(Object.keys(attribution ?? {}).sort()).toEqual(["gclid", "utm_source"]);
    expect(attribution?.gclid).toHaveLength(200);
    expect(attribution?.utm_source).toBe("googleBcc: x@evil.test");
  });

  it("a lead without attribution is still accepted", async () => {
    const res = await leadsPOST(post({ ...emergencyPayload, attribution: null }));
    expect(res.status).toBe(200);
    expect(sentLead().attribution).toBeUndefined();
  });
});
