import { NextResponse } from "next/server";
import { PRODUCTION_HOST_RE } from "@/lib/analytics";
import {
  CALL_INTENT_MAX_BYTES,
  isBotUserAgent,
  parseCallIntentPayload,
} from "@/lib/callIntent";
import { logCallIntent } from "@/lib/notify";
import { checkRateLimit } from "@/lib/rateLimit";

// Receives call taps from lib/callIntent.ts sendCallIntent() (sendBeacon,
// text/plain JSON). Layers against abuse, in order: per-IP rate limit
// (CALL_RATE_LIMITER, its own namespace), same-origin check, bot UA filter,
// size cap, strict allowlist, then the daily KV and email caps in
// logCallIntent(). The response body is never read by the beacon, so every
// outcome other than a refusal is an empty 204.

const noContent = () => new NextResponse(null, { status: 204 });

function isOurHost(url: string, requestUrl: string): boolean {
  try {
    const u = new URL(url);
    return u.host === new URL(requestUrl).host || PRODUCTION_HOST_RE.test(u.hostname);
  } catch {
    return false;
  }
}

/**
 * The request must come from this site. Browsers send Origin on a beacon
 * POST; if one ever doesn't, Sec-Fetch-Site: same-origin or a same-site
 * Referer is accepted instead. (All spoofable by a script: this filters
 * drive-by cross-site posts, the rate limit and caps handle the rest.)
 */
function isSameSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin) return isOurHost(origin, request.url);
  if (request.headers.get("sec-fetch-site") === "same-origin") return true;
  const referer = request.headers.get("referer");
  return referer ? isOurHost(referer, request.url) : false;
}

export async function POST(request: Request) {
  const limited = await checkRateLimit(request, "CALL_RATE_LIMITER", "Too many requests");
  if (limited) return limited;

  if (!isSameSite(request)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  // Bots get a quiet 204: nothing stored, nothing emailed.
  if (isBotUserAgent(request.headers.get("user-agent"))) return noContent();

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > CALL_INTENT_MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Too large" }, { status: 413 });
  }
  let text: string;
  try {
    text = await request.text();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  if (text.length > CALL_INTENT_MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Too large" }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = parseCallIntentPayload(raw);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  await logCallIntent(parsed.value);
  return noContent();
}
