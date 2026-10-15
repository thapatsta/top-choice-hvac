// Call intent: a tap on one of our own tel: links. An intent signal, not a
// connected call (the visitor can cancel the dialer). See README "Call
// tracking".
//
// Client-safe and React-free. The browser builds the payload
// (components/AnalyticsListeners.tsx) and the server validates it
// (app/api/call-intent/route.ts) with parseCallIntentPayload(), so both agree
// on one strict allowlist. Nothing here may carry a name, phone number, email
// or free text.

import {
  ATTRIBUTION_KEYS,
  cleanAttributionValue,
  isAllowedAttributionValue,
  type AttributionKey,
  type LeadAttribution,
} from "@/lib/attribution";
import type { CallIntentKind, DeviceClass } from "@/lib/analytics";
import { BASE_PATH } from "@/lib/basePath";
import { LP_REGIONS, LP_SERVICES, LP_SLUGS, type LpContext } from "@/lib/landingPage";

export const CALL_INTENT_ENDPOINT = `${BASE_PATH}/api/call-intent`;

/** Bigger bodies are refused before parsing. A real payload is well under 2 KB. */
export const CALL_INTENT_MAX_BYTES = 4096;

/** A second tap on the same location within this window is ignored (per page load). */
export const TAP_DEDUPE_MS = 5000;

export interface CallIntentPayload extends Partial<LpContext> {
  link_location: string;
  device_class: DeviceClass;
  intent: CallIntentKind;
  post_lead: boolean;
  /** Pathname only, never the query string. */
  page_path: string;
  swapped: boolean;
  attribution?: LeadAttribution;
}

const PAYLOAD_KEYS = new Set<string>([
  "link_location",
  "lp_slug",
  "lp_region",
  "lp_service",
  "device_class",
  "intent",
  "post_lead",
  "page_path",
  "attribution",
  "swapped",
]);

/** data-track-location values are snake_case identifiers. */
const LINK_LOCATION_RE = /^[a-z0-9_]{1,40}$/;
/** A pathname: no query, no fragment, no spaces. */
const PAGE_PATH_RE = /^\/[A-Za-z0-9/_\-.]{0,150}$/;

// Free-text attribution values (utm_*, paths) that look like an email or a
// formatted phone number are dropped from a call-intent record. Bare digit
// runs are kept on purpose: Ads campaign IDs ({campaignid}) are 10-11 digits.
const EMAIL_LIKE_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_LIKE_RE = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;
const PII_CHECKED_KEYS: readonly AttributionKey[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "landing_path",
  "referrer_host",
];

export type ParseResult = { ok: true; value: CallIntentPayload } | { ok: false; error: string };

function isPlainObject(raw: unknown): raw is Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const proto = Object.getPrototypeOf(raw);
  return proto === Object.prototype || proto === null;
}

function oneOf<T extends string>(list: readonly T[], value: unknown): T | undefined {
  return list.find((item) => item === value);
}

/** Strict: unknown keys anywhere (attribution included) reject the payload. */
function parseAttribution(raw: unknown): { ok: true; value?: LeadAttribution } | { ok: false } {
  if (raw === undefined) return { ok: true };
  if (!isPlainObject(raw)) return { ok: false };
  const out: LeadAttribution = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!(ATTRIBUTION_KEYS as readonly string[]).includes(key)) return { ok: false };
    if (typeof value !== "string") return { ok: false };
    const k = key as AttributionKey;
    const clean = cleanAttributionValue(value);
    if (!clean || !isAllowedAttributionValue(k, clean)) continue;
    if (PII_CHECKED_KEYS.includes(k) && (EMAIL_LIKE_RE.test(clean) || PHONE_LIKE_RE.test(clean))) continue;
    out[k] = clean;
  }
  return { ok: true, value: Object.keys(out).length ? out : undefined };
}

/** Server-side gate for POST /api/call-intent. */
export function parseCallIntentPayload(raw: unknown): ParseResult {
  if (!isPlainObject(raw)) return { ok: false, error: "not an object" };
  for (const key of Object.keys(raw)) {
    if (!PAYLOAD_KEYS.has(key)) return { ok: false, error: `unknown key: ${key.slice(0, 40)}` };
  }
  const { link_location, device_class, intent, post_lead, page_path, swapped } = raw;
  if (typeof link_location !== "string" || !LINK_LOCATION_RE.test(link_location)) {
    return { ok: false, error: "link_location" };
  }
  const device = oneOf(["touch", "pointer"] as const, device_class);
  if (!device) return { ok: false, error: "device_class" };
  const kind = oneOf(["general", "emergency"] as const, intent);
  if (!kind) return { ok: false, error: "intent" };
  if (typeof post_lead !== "boolean") return { ok: false, error: "post_lead" };
  if (typeof swapped !== "boolean") return { ok: false, error: "swapped" };
  if (typeof page_path !== "string" || !PAGE_PATH_RE.test(page_path)) {
    return { ok: false, error: "page_path" };
  }

  const value: CallIntentPayload = {
    link_location,
    device_class: device,
    intent: kind,
    post_lead,
    page_path,
    swapped,
  };
  // lp_* are optional, but a present one must be a known value.
  for (const [key, list] of [
    ["lp_slug", LP_SLUGS],
    ["lp_region", LP_REGIONS],
    ["lp_service", LP_SERVICES],
  ] as const) {
    if (raw[key] === undefined) continue;
    const v = oneOf<string>(list, raw[key]);
    if (!v) return { ok: false, error: key };
    (value as unknown as Record<string, string>)[key] = v;
  }
  const attribution = parseAttribution(raw.attribution);
  if (!attribution.ok) return { ok: false, error: "attribution" };
  if (attribution.value) value.attribution = attribution.value;
  return { ok: true, value };
}

// ---------------------------------------------------------------------------
// Bot filtering
// ---------------------------------------------------------------------------

/** Crawlers, headless browsers, monitoring and HTTP libraries. */
export const BOT_UA_RE =
  /bot|crawl|spider|slurp|headless|phantom|puppeteer|playwright|selenium|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|preview|facebookexternalhit|curl|wget|python|httpclient|okhttp|axios|node-fetch|undici|go-http|java\/|libwww|scrapy/i;

export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua || ua.trim().length < 10) return true;
  return BOT_UA_RE.test(ua);
}

/** Browser-side: automation (navigator.webdriver) or a bot/headless UA. */
export function isAutomatedBrowser(nav: Pick<Navigator, "userAgent"> & { webdriver?: boolean }): boolean {
  return nav.webdriver === true || isBotUserAgent(nav.userAgent);
}

// ---------------------------------------------------------------------------
// Client helpers
// ---------------------------------------------------------------------------

/** "touch" when the primary pointer is coarse (phones, most tablets). */
export function deviceClass(win: Pick<Window, "matchMedia"> | undefined): DeviceClass {
  try {
    return win?.matchMedia?.("(pointer: coarse)").matches ? "touch" : "pointer";
  } catch {
    return "pointer";
  }
}

/** sessionStorage flag: a lead was sent from this tab. A boolean, nothing personal. */
export const LEAD_SENT_STORAGE_KEY = "tch_lead_sent";

/** Dispatched on window by markLeadSent(), so mounted <PhoneLink>s stop swapping. */
export const LEAD_SENT_EVENT = "tch:lead-sent";

let leadSentFallback = false;

export function markLeadSent(): void {
  leadSentFallback = true;
  try {
    window.sessionStorage.setItem(LEAD_SENT_STORAGE_KEY, "1");
  } catch {
    // Storage blocked: the in-memory flag and the thank-you path check still apply.
  }
  try {
    window.dispatchEvent(new Event(LEAD_SENT_EVENT));
  } catch {
    // No window (tests): nothing is listening.
  }
}

export function subscribeLeadSent(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(LEAD_SENT_EVENT, onChange);
  return () => window.removeEventListener(LEAD_SENT_EVENT, onChange);
}

/** A lead was sent from this tab (sessionStorage, or in memory if storage is blocked). */
export function leadSentInThisTab(): boolean {
  if (leadSentFallback) return true;
  try {
    return window.sessionStorage.getItem(LEAD_SENT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Test hook. */
export function resetLeadSentFallback(): void {
  leadSentFallback = false;
}

/** A tap on /thank-you, or anywhere after a lead in this tab, is not a new lead. */
export function isPostLead(pathname: string): boolean {
  return pathname === "/thank-you" || pathname.startsWith("/thank-you/") || leadSentInThisTab();
}

/**
 * Returns a function that says whether a tap should count: false for a second
 * tap on the same location within `windowMs` of the last counted one.
 */
export function createTapDeduper(windowMs = TAP_DEDUPE_MS): (location: string, now: number) => boolean {
  const last = new Map<string, number>();
  return (location, now) => {
    const prev = last.get(location);
    if (prev !== undefined && now - prev < windowMs) return false;
    last.set(location, now);
    return true;
  };
}

/**
 * Sends the payload so it survives the page handing off to the dialer:
 * sendBeacon first, fetch keepalive as the fallback. text/plain is a
 * CORS-safelisted type, so every browser accepts it in sendBeacon; the route
 * parses the text as JSON. Never throws.
 */
export function sendCallIntent(payload: CallIntentPayload, endpoint = CALL_INTENT_ENDPOINT): void {
  try {
    const body = JSON.stringify(payload);
    const type = "text/plain;charset=UTF-8";
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      if (navigator.sendBeacon(endpoint, new Blob([body], { type }))) return;
    }
    void fetch(endpoint, {
      method: "POST",
      body,
      keepalive: true,
      headers: { "Content-Type": type },
    }).catch(() => {});
  } catch {
    // Logging a tap must never break the call.
  }
}
