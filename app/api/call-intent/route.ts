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

/** The Origin must be this site (or the production domain); sendBeacon always sends one. */
function isSameSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originHost = new URL(origin).host;
    return originHost === new URL(request.url).host || PRODUCTION_HOST_RE.test(new URL(origin).hostname);
  } catch {
    return false;
  }
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
