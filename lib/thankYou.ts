// The /thank-you confirmation page. The URL stays a plain "/thank-you"; the
// form that sent the lead and, for the quote form, its need/system/urgency
// choices are handed over in sessionStorage. They are only non-identifying
// enums: never add a name, phone, email or free text here.

import { SOURCE_LABELS, type LeadSource } from "@/lib/leadAdapter";
import {
  needOptions,
  systemTypeOptions,
  urgencyOptions,
  type QuoteNeed,
  type QuoteSystemType,
  type QuoteUrgency,
} from "@/lib/estimate";

export const THANK_YOU_PATH = "/thank-you";

/** sessionStorage key holding the query-string-encoded ThankYouParams. */
export const THANK_YOU_STORAGE_KEY = "tc_thank_you";

export interface QuoteThankYouDetails {
  need?: QuoteNeed;
  system?: QuoteSystemType;
  urgency?: QuoteUrgency;
}

/** Parsed query string. `source` undefined means the generic state. */
export interface ThankYouParams extends QuoteThankYouDetails {
  source?: LeadSource;
}

/** Encodes the source and the quote details that were given, e.g. "source=get-quote&need=repair". */
export function encodeThankYou(source: LeadSource, details: QuoteThankYouDetails = {}): string {
  const params = new URLSearchParams({ source });
  if (details.need) params.set("need", details.need);
  if (details.system) params.set("system", details.system);
  if (details.urgency) params.set("urgency", details.urgency);
  return params.toString();
}

/**
 * Stores what the thank-you page should say and returns the plain
 * "/thank-you" path to navigate to. If storage is unavailable the page
 * falls back to its generic state.
 */
export function prepareThankYou(source: LeadSource, details: QuoteThankYouDetails = {}): string {
  try {
    sessionStorage.setItem(THANK_YOU_STORAGE_KEY, encodeThankYou(source, details));
  } catch {
    // Private mode or blocked storage: the generic card still shows.
  }
  return THANK_YOU_PATH;
}

/** Reads what prepareThankYou stored; null when nothing was stored or storage is blocked. */
export function readStoredThankYou(): string | null {
  try {
    return sessionStorage.getItem(THANK_YOU_STORAGE_KEY);
  } catch {
    return null;
  }
}

function oneOf<T extends string>(options: readonly { value: T }[], raw: string | null): T | undefined {
  return options.find((o) => o.value === raw)?.value;
}

/**
 * Validates the stored params against the real enum lists. Unknown, empty or
 * missing values become undefined; any other key is ignored. Quote details
 * are kept only when the source is the quote form.
 */
export function parseThankYouParams(params: { get(name: string): string | null }): ThankYouParams {
  const rawSource = params.get("source");
  const source =
    rawSource && Object.hasOwn(SOURCE_LABELS, rawSource) ? (rawSource as LeadSource) : undefined;
  if (source !== "get-quote") return { source };
  return {
    source,
    need: oneOf(needOptions, params.get("need")),
    system: oneOf(systemTypeOptions, params.get("system")),
    urgency: oneOf(urgencyOptions, params.get("urgency")),
  };
}
