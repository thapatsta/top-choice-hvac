// First-visit lead attribution: where a visitor came from (Google Ads click
// ID, UTM parameters, landing page, referrer), kept in localStorage and
// attached to the lead when they submit a form. See README "Lead attribution".
//
// Client-safe and React-free. lib/leadAdapter.ts imports the key list and
// cleanAttributionValue() so the browser and the server agree on the shape.
//
// Never pass any of this to track(): attribution goes to the lead record,
// email and SMS only, never to GA events.

export interface LeadAttribution {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing_path?: string;
  referrer_host?: string;
  first_seen?: string;
}

export type AttributionKey = keyof LeadAttribution;

export const CLICK_ID_KEYS = ["gclid", "gbraid", "wbraid"] as const;

/** The eight keys read straight from the landing URL's query string. */
const QUERY_KEYS = [
  ...CLICK_ID_KEYS,
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

/** Every allowed key, in display order. */
export const ATTRIBUTION_KEYS: readonly AttributionKey[] = [
  ...QUERY_KEYS,
  "landing_path",
  "referrer_host",
  "first_seen",
];

export const ATTRIBUTION_MAX_LENGTH = 200;

export const ATTRIBUTION_STORAGE_KEY = "tch_attribution";

export const ATTRIBUTION_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/** Our own hosts: a referrer from one of these is navigation, not a source. */
const INTERNAL_HOST_RE = /^((www\.)?topchoicehvac\.ca|localhost)$/i;

// C0/C1 control characters (newlines included) plus the Unicode line and
// paragraph separators.
const CONTROL_CHARS_RE = /[\p{Cc}\p{Zl}\p{Zp}]/gu;

/** Strips control characters, trims and caps length. "" means "drop it". */
export function cleanAttributionValue(value: string): string {
  return value.replace(CONTROL_CHARS_RE, "").trim().slice(0, ATTRIBUTION_MAX_LENGTH).trim();
}

export function hasClickId(attribution: LeadAttribution): boolean {
  return CLICK_ID_KEYS.some((key) => Boolean(attribution[key]));
}

function set(out: LeadAttribution, key: AttributionKey, value: string | null | undefined) {
  if (!value) return;
  const clean = cleanAttributionValue(value);
  if (clean) out[key] = clean;
}

/** Pure: builds a LeadAttribution from a page URL, its referrer and a time. */
export function parseAttribution(url: string | URL, referrer: string, now: Date): LeadAttribution {
  const out: LeadAttribution = {};
  let page: URL | null = null;
  try {
    page = new URL(url);
  } catch {
    // Not a URL: no query params, no landing path.
  }
  if (page) {
    for (const key of QUERY_KEYS) set(out, key, page.searchParams.get(key));
    set(out, "landing_path", page.pathname);
  }
  if (referrer) {
    try {
      const host = new URL(referrer).hostname;
      if (!INTERNAL_HOST_RE.test(host)) set(out, "referrer_host", host);
    } catch {
      // Unparseable referrer: leave it out.
    }
  }
  out.first_seen = now.toISOString();
  return out;
}

interface StoredAttribution {
  value: LeadAttribution;
  /** Epoch ms after which the stored value is ignored. */
  expires: number;
}

/** Keeps only allowlisted, non-empty string values. */
function pickAttribution(raw: unknown): LeadAttribution | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const source = raw as Record<string, unknown>;
  const out: LeadAttribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = source[key];
    if (typeof value === "string") set(out, key, value);
  }
  return Object.keys(out).length ? out : undefined;
}

function readStored(now: number): LeadAttribution | undefined {
  const json = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
  if (!json) return undefined;
  const parsed = JSON.parse(json) as Partial<StoredAttribution> | null;
  if (!parsed || typeof parsed.expires !== "number" || parsed.expires <= now) return undefined;
  return pickAttribution(parsed.value);
}

/**
 * Records this page load's attribution. First touch wins, except that a new
 * Google Ads click (gclid / gbraid / wbraid in the URL) replaces whatever was
 * stored. Expired values count as nothing stored. Never throws.
 */
export function captureAttribution(): void {
  try {
    if (typeof window === "undefined") return;
    const now = new Date();
    const next = parseAttribution(window.location.href, document.referrer, now);
    let stored: LeadAttribution | undefined;
    try {
      stored = readStored(now.getTime());
    } catch {
      // Malformed JSON: treat as nothing stored and overwrite it.
    }
    if (stored && !hasClickId(next)) return;
    const record: StoredAttribution = { value: next, expires: now.getTime() + ATTRIBUTION_TTL_MS };
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage unavailable (private mode, blocked): no attribution.
  }
}

/** The stored attribution, or undefined if missing, expired, malformed or unreadable. */
export function readAttribution(): LeadAttribution | undefined {
  try {
    if (typeof window === "undefined") return undefined;
    return readStored(Date.now());
  } catch {
    return undefined;
  }
}
