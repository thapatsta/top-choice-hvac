// Typed GA4 event tracking on top of the gtag snippet in app/layout.tsx.
//
// Never send PII (name, phone, email, postal code, address or free-text
// message content) in event params — it breaks Google's policy and PIPEDA.
// Only non-identifying enums and paths belong here. sanitize() is a last line
// of defence against a PII-named key slipping through, not a licence to pass
// form state in.

import type { LeadSource } from "@/lib/leadAdapter";
import type { QuoteNeed, QuoteUrgency } from "@/lib/estimate";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Hostnames that report to the production GA4 property. app/layout.tsx
 * interpolates this same regex into the inline gtag snippet, so page views
 * and events are gated by one pattern.
 */
export const PRODUCTION_HOST_RE = /^(www\.)?topchoicehvac\.ca$/i;

interface FormParams {
  lead_source: LeadSource;
}

interface LinkParams {
  /** Nearest ancestor `data-track-location`, or "body". */
  link_location: string;
}

/**
 * Params per event. `page_path` is added by track() itself (pathname only,
 * never the query string), so callers don't pass it.
 */
export interface AnalyticsEventParams {
  generate_lead: FormParams & { service_need?: QuoteNeed; urgency?: QuoteUrgency };
  form_start: FormParams;
  form_submit_error: FormParams;
  click_to_call: LinkParams;
  click_email: LinkParams;
}

export type AnalyticsEvent = keyof AnalyticsEventParams;

type ParamValue = string | number | boolean;

const PII_KEY_RE = /name|phone|email|postal|address|message/i;

/** Drops PII-looking keys and anything that isn't a plain primitive. */
export function sanitize(params: Record<string, unknown>): Record<string, ParamValue> {
  const clean: Record<string, ParamValue> = {};
  for (const [key, value] of Object.entries(params)) {
    if (PII_KEY_RE.test(key)) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      clean[key] = value;
    }
  }
  return clean;
}

export function isProductionHost(hostname?: string): boolean {
  if (hostname === undefined) {
    if (typeof window === "undefined") return false;
    hostname = window.location.hostname;
  }
  return PRODUCTION_HOST_RE.test(hostname);
}

/**
 * Sends a GA4 event. Safe to call anywhere: no-ops on the server and when
 * gtag hasn't loaded, logs via console.debug instead of sending on
 * non-production hosts, and never throws.
 */
export function track<E extends AnalyticsEvent>(event: E, params: AnalyticsEventParams[E]): void {
  try {
    if (typeof window === "undefined") return;
    const payload = sanitize({ ...params, page_path: window.location.pathname });
    if (!isProductionHost()) {
      console.debug("[analytics]", event, payload);
      return;
    }
    if (typeof window.gtag !== "function") return;
    window.gtag("event", event, payload);
  } catch {
    // Analytics must never break the page.
  }
}
