import { NextResponse } from "next/server";

/**
 * Per-IP abuse protection for the public lead-form endpoints
 * (/api/leads, /api/contact). Every accepted submission sends a Resend email
 * and writes to LEADS_KV, and emergency-service submissions also send a paid
 * Twilio SMS, so an unauthenticated POST loop costs real money.
 *
 * Backed by the LEAD_RATE_LIMITER Workers Rate Limiting binding (see
 * wrangler.jsonc). Both routes share one namespace keyed only on the client IP,
 * so alternating between endpoints doesn't double an attacker's budget.
 *
 * Fails OPEN: if the binding is missing or errors, the submission goes
 * through (with a loud log). Losing a real emergency lead to a limiter outage
 * is worse than briefly having no limit.
 */

/** Minimal slice of the Workers Rate Limiting binding API this module needs. */
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface RateLimitEnv {
  LEAD_RATE_LIMITER?: RateLimiter;
  /**
   * POST /api/call-intent. A separate namespace on
   * purpose: call taps must never use up the lead forms' budget (tap three
   * times, then submit the emergency form, and the form would get a 429).
   */
  CALL_RATE_LIMITER?: RateLimiter;
}

export type RateLimiterBinding = keyof RateLimitEnv;

export interface RateLimitDeps {
  /** Defaults to the Cloudflare request env (bindings). Injected in tests. */
  env?: RateLimitEnv;
}

export const RATE_LIMITED_ERROR =
  "Too many submissions from your network. Please wait a minute and try again, or call us.";

/**
 * Cloudflare sets (and overwrites any client-supplied) CF-Connecting-IP on
 * every request that reaches the Worker through the edge. It's only absent
 * outside Cloudflare (tests, plain `next dev`), where all such requests share
 * one bucket.
 */
export function rateLimitKey(request: Request): string {
  const ip = request.headers.get("CF-Connecting-IP")?.trim();
  return `ip:${ip || "unknown"}`;
}

async function resolveEnv(deps: RateLimitDeps): Promise<RateLimitEnv> {
  if (deps.env) return deps.env;
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = await getCloudflareContext({ async: true });
  return env as unknown as RateLimitEnv;
}

/**
 * Returns a 429 response (same `{ ok: false, error }` shape as the lead routes)
 * if this requester is over the limit, or null if the request may proceed.
 * Call it before parsing or notifying so every POST counts, valid or not.
 */
export async function checkLeadRateLimit(
  request: Request,
  deps: RateLimitDeps = {}
): Promise<NextResponse | null> {
  return checkRateLimit(request, "LEAD_RATE_LIMITER", RATE_LIMITED_ERROR, deps);
}

/** Same as checkLeadRateLimit, against any rate-limit binding. Fails open. */
export async function checkRateLimit(
  request: Request,
  binding: RateLimiterBinding,
  error: string,
  deps: RateLimitDeps = {}
): Promise<NextResponse | null> {
  const key = rateLimitKey(request);
  let limiter: RateLimiter | undefined;
  try {
    limiter = (await resolveEnv(deps))[binding];
  } catch (err) {
    console.error(`[ratelimit:env:FAILED] ${key} — allowing request`, err);
    return null;
  }
  if (!limiter || typeof limiter.limit !== "function") {
    console.error(
      `[ratelimit:UNCONFIGURED] ${binding} binding missing — check ratelimits in wrangler.jsonc; allowing request`
    );
    return null;
  }

  let success: boolean;
  try {
    ({ success } = await limiter.limit({ key }));
  } catch (err) {
    console.error(`[ratelimit:FAILED] ${key} — allowing request`, err);
    return null;
  }
  if (success) return null;

  console.warn(`[ratelimit:BLOCKED] ${binding} ${key}`);
  return NextResponse.json({ ok: false, error }, { status: 429 });
}
