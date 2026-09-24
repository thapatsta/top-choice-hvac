import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkLeadRateLimit,
  RATE_LIMITED_ERROR,
  rateLimitKey,
  type RateLimiter,
} from "@/lib/rateLimit";

/** In-memory stand-in for the Workers Rate Limiting binding: `limit` calls per key. */
function makeLimiter(limit: number) {
  const counts = new Map<string, number>();
  const limitFn = vi.fn(async ({ key }: { key: string }) => {
    const n = (counts.get(key) ?? 0) + 1;
    counts.set(key, n);
    return { success: n <= limit };
  });
  return { limiter: { limit: limitFn } as RateLimiter, limitFn };
}

function post(ip?: string): Request {
  return new Request("http://localhost/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(ip ? { "CF-Connecting-IP": ip } : {}),
    },
    body: "{}",
  });
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("rateLimitKey", () => {
  it("keys on CF-Connecting-IP", () => {
    expect(rateLimitKey(post("203.0.113.7"))).toBe("ip:203.0.113.7");
  });

  it("falls back to a shared bucket when the header is absent", () => {
    expect(rateLimitKey(post())).toBe("ip:unknown");
  });
});

describe("checkLeadRateLimit", () => {
  it("allows requests under the limit and passes the IP key to the binding", async () => {
    const { limiter, limitFn } = makeLimiter(5);
    const res = await checkLeadRateLimit(post("203.0.113.7"), {
      env: { LEAD_RATE_LIMITER: limiter },
    });
    expect(res).toBeNull();
    expect(limitFn).toHaveBeenCalledWith({ key: "ip:203.0.113.7" });
  });

  it("returns 429 with the { ok: false, error } shape once over the limit", async () => {
    const { limiter } = makeLimiter(2);
    const deps = { env: { LEAD_RATE_LIMITER: limiter } };
    expect(await checkLeadRateLimit(post("203.0.113.7"), deps)).toBeNull();
    expect(await checkLeadRateLimit(post("203.0.113.7"), deps)).toBeNull();
    const res = await checkLeadRateLimit(post("203.0.113.7"), deps);
    expect(res?.status).toBe(429);
    expect(await res?.json()).toEqual({ ok: false, error: RATE_LIMITED_ERROR });
  });

  it("limits each IP independently", async () => {
    const { limiter } = makeLimiter(1);
    const deps = { env: { LEAD_RATE_LIMITER: limiter } };
    expect(await checkLeadRateLimit(post("203.0.113.7"), deps)).toBeNull();
    expect((await checkLeadRateLimit(post("203.0.113.7"), deps))?.status).toBe(429);
    expect(await checkLeadRateLimit(post("198.51.100.9"), deps)).toBeNull();
  });

  describe("fails open (a limiter problem never blocks a real lead)", () => {
    it("allows the request and logs when the binding is missing", async () => {
      const res = await checkLeadRateLimit(post("203.0.113.7"), { env: {} });
      expect(res).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[ratelimit:UNCONFIGURED]")
      );
    });

    it("allows the request and logs when the binding throws", async () => {
      const limiter: RateLimiter = { limit: vi.fn(async () => Promise.reject(new Error("boom"))) };
      const res = await checkLeadRateLimit(post("203.0.113.7"), {
        env: { LEAD_RATE_LIMITER: limiter },
      });
      expect(res).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[ratelimit:FAILED]"),
        expect.any(Error)
      );
    });
  });
});
