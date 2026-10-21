// Typed GA4 event tracking on top of the gtag snippet in app/layout.tsx.
//
// Never send PII (name, phone, email, postal code, address or free-text
// message content) in event params — it breaks Google's policy and PIPEDA.
// Only non-identifying enums and paths belong here. sanitize() is a last line
// of defence against a PII-named key slipping through, not a licence to pass
// form state in.

import type { LeadSource } from "@/lib/leadAdapter";
import type { QuoteNeed, QuoteUrgency } from "@/lib/estimate";
import type { LpContext, LpPageKey, LpSlug } from "@/lib/landingPage";
import { isGaClientId, isGaSessionId } from "@/lib/attribution";
import {
  ADS_CONVERSION_LABELS,
  ADS_ID,
  GA4_ID,
  isRealTagValue,
  type AdsConversionLabels,
} from "@/lib/googleTag";

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

export type DeviceClass = "touch" | "pointer";
export type CallIntentKind = "general" | "emergency";

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
  // lp_slug / lp_region / lp_service: which /lp/* ad landing page, when the
  // event comes from one.
  // landing_page: "repair" / "install" on the two config-driven pages. Same
  // event as every other lead (no new conversion), one extra param.
  generate_lead: FormParams & {
    service_need?: QuoteNeed;
    urgency?: QuoteUrgency;
    landing_page?: LpPageKey;
  } & Partial<LpContext>;
  form_start: FormParams;
  form_submit_error: FormParams;
  click_to_call: LinkParams &
    Partial<LpContext> & {
      /** "touch" (coarse primary pointer: phones, tablets) or "pointer" (mouse). */
      device_class: DeviceClass;
      intent: CallIntentKind;
      /** On /thank-you, or after a lead was sent from this tab: not a new lead. */
      post_lead: boolean;
      /** The link showed a Google forwarding number instead of ours. */
      swapped: boolean;
      /** City name, on /service-area/<city> pages only (data-city-page). */
      city_page?: string;
    };
  click_email: LinkParams;
  /** A link from one landing page to another (e.g. repair → install). */
  lp_crosslink: LinkParams & LpContext & { lp_destination: LpSlug };
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
    // send_to keeps GA4 events out of the Google Ads destination, which is
    // also configured on this page. Ads only gets the conversions below.
    window.gtag("event", event, { ...payload, send_to: GA4_ID });
  } catch {
    // Analytics must never break the page.
  }
}

export type AdsConversionKind = "lead" | "callTap";

export interface AdsConfig {
  adsId: string;
  labels: AdsConversionLabels;
}

const DEFAULT_ADS_CONFIG: AdsConfig = { adsId: ADS_ID, labels: ADS_CONVERSION_LABELS };

/**
 * Sends one Google Ads conversion. No-ops on the server, off production
 * (console.debug instead), without gtag, and while the ID or label is a
 * "[PLACEHOLDER" value. Never throws. `transactionId` lets Google drop a
 * duplicate of the same conversion; it must be random, never derived from
 * anything the visitor typed.
 */
export function trackAdsConversion(
  kind: AdsConversionKind,
  opts: { transactionId?: string } = {},
  config: AdsConfig = DEFAULT_ADS_CONFIG
): void {
  try {
    if (typeof window === "undefined") return;
    const label = config.labels[kind];
    if (!isRealTagValue(config.adsId) || !isRealTagValue(label)) return;
    const params: Record<string, string> = { send_to: `${config.adsId}/${label}` };
    if (opts.transactionId) params.transaction_id = opts.transactionId;
    if (!isProductionHost()) {
      console.debug("[analytics:ads]", kind, params);
      return;
    }
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "conversion", params);
  } catch {
    // Analytics must never break the page.
  }
}

let lastPageViewPath: string | null = null;

/**
 * GA4 page_view, sent by components/PageViewTracker.tsx on every pathname
 * change (the GA4 config in app/layout.tsx has send_page_view: false, so this
 * is the only page_view). page_location is the full URL on purpose: GA4 reads
 * utm_* and gclid from it to attribute the session; dropping the query string
 * would report all ad traffic as Direct. Our own page_path param stays
 * pathname-only. The same pathname twice in a row is sent once (React dev
 * double effects, query-only changes).
 */
export function trackPageView(pathname: string): void {
  try {
    if (typeof window === "undefined") return;
    if (pathname === lastPageViewPath) return;
    lastPageViewPath = pathname;
    // No page_title: on a client navigation Next sets document.title after
    // this effect runs, so gtag's own default (read when it sends) is right.
    const params = {
      page_location: window.location.href,
      page_path: pathname,
    };
    if (!isProductionHost()) {
      console.debug("[analytics]", "page_view", params);
      return;
    }
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", { ...params, send_to: GA4_ID });
  } catch {
    // Analytics must never break the page.
  }
}

/** Test hook: forget the last page_view path. */
export function resetPageViewDedupe(): void {
  lastPageViewPath = null;
}

export interface GaJoinKeys {
  ga_client_id?: string;
  ga_session_id?: string;
}

/**
 * GA4 client_id / session_id, so a lead in KV can be joined to its GA4
 * session. They go to the lead record and email only, never into GA params.
 * Resolves {} off production, without gtag, or if gtag doesn't answer within
 * `timeoutMs` (gtag.js blocked or still loading). Never rejects.
 */
export function getGaJoinKeys(timeoutMs = 300): Promise<GaJoinKeys> {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined" || !isProductionHost() || typeof window.gtag !== "function") {
        resolve({});
        return;
      }
      const out: GaJoinKeys = {};
      let pending = 2;
      const timer = setTimeout(() => resolve(out), timeoutMs);
      const done = () => {
        pending -= 1;
        if (pending === 0) {
          clearTimeout(timer);
          resolve(out);
        }
      };
      window.gtag("get", GA4_ID, "client_id", (value: unknown) => {
        if (isGaClientId(value)) out.ga_client_id = value;
        done();
      });
      window.gtag("get", GA4_ID, "session_id", (value: unknown) => {
        const id = typeof value === "number" ? String(value) : value;
        if (isGaSessionId(id)) out.ga_session_id = id;
        done();
      });
    } catch {
      resolve({});
    }
  });
}
