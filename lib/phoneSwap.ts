// Google forwarding-number store. For Google Ads visitors, the "calls from
// website" snippet in app/layout.tsx calls phone_conversion_callback with a
// Google forwarding number; the callback writes it to
// window.__tchForwardingNumber and dispatches FORWARDING_EVENT. Components
// read it through useSyncExternalStore (components/Phone.tsx), so React itself
// renders the swapped number: it survives re-renders and client navigation,
// and nothing that isn't a <PhoneLink>/<PhoneText> (JSON-LD, metadata, the
// footer NAP) can ever be swapped.
//
// Client-safe and React-free.

import { PHONE, phoneDigits } from "@/lib/phone";

export const FORWARDING_EVENT = "tch:forwarding-number";

declare global {
  interface Window {
    /** Set by phone_conversion_callback in app/layout.tsx (raw, untrusted values). */
    __tchForwardingNumber?: { formatted?: unknown; plain?: unknown };
  }
}

export interface ForwardingNumber {
  /** As Google formatted it, e.g. "(647) 555-0123". */
  display: string;
  /** tel:+1XXXXXXXXXX */
  href: string;
  /** National digits, for matching a clicked href. */
  digits: string;
}

/** Only digits, spaces and ()+.- in a short string: never render anything else. */
const DISPLAY_RE = /^[0-9 ()+.\-]{10,20}$/;

/**
 * Validates what the callback received. Null for anything that isn't a
 * 10-digit North American number, or that is our own number (no swap).
 */
export function normalizeForwardingNumber(formatted: unknown, plain: unknown): ForwardingNumber | null {
  const display = typeof formatted === "string" ? formatted.trim() : "";
  const raw = typeof plain === "string" || typeof plain === "number" ? String(plain) : display;
  const digits = phoneDigits(raw);
  if (!/^\d{10}$/.test(digits)) return null;
  if (digits === phoneDigits(PHONE.href)) return null;
  // Fall back to our own format if Google's display string looks odd.
  const safeDisplay =
    DISPLAY_RE.test(display) && phoneDigits(display) === digits
      ? display
      : `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return { display: safeDisplay, href: `tel:+1${digits}`, digits };
}

let cachedSource: Window["__tchForwardingNumber"];
let cachedValue: ForwardingNumber | null = null;

/** The current forwarding number, or null. Stable identity between changes. */
export function getForwardingNumber(): ForwardingNumber | null {
  if (typeof window === "undefined") return null;
  const source = window.__tchForwardingNumber;
  if (source !== cachedSource) {
    cachedSource = source;
    cachedValue = source ? normalizeForwardingNumber(source.formatted, source.plain) : null;
  }
  return cachedValue;
}

export function subscribeForwardingNumber(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(FORWARDING_EVENT, onChange);
  return () => window.removeEventListener(FORWARDING_EVENT, onChange);
}

/**
 * The inline callback app/layout.tsx passes as phone_conversion_callback.
 * Google calls it with (formatted number, plain number). Kept as a string so
 * the layout can embed it in the raw HTML snippet; tests eval it.
 */
export const PHONE_CONVERSION_CALLBACK_JS = `function(formatted, plain){try{window.__tchForwardingNumber={formatted:formatted,plain:plain};window.dispatchEvent(new Event(${JSON.stringify(FORWARDING_EVENT)}));}catch(e){}}`;
