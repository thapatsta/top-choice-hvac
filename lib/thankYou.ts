// The /thank-you confirmation URL. GA4 records full page URLs, so the query
// string carries only non-identifying enums: the form that sent the lead and,
// for the quote form, its need/system/urgency choices. Never add a name,
// phone, email or free text here.

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

export interface QuoteThankYouDetails {
  need?: QuoteNeed;
  system?: QuoteSystemType;
  urgency?: QuoteUrgency;
}

/** Parsed query string. `source` undefined means the generic state. */
export interface ThankYouParams extends QuoteThankYouDetails {
  source?: LeadSource;
}

/** Builds "/thank-you?source=..." with the quote details that were given. */
export function thankYouHref(source: LeadSource, details: QuoteThankYouDetails = {}): string {
  const params = new URLSearchParams({ source });
  if (details.need) params.set("need", details.need);
  if (details.system) params.set("system", details.system);
  if (details.urgency) params.set("urgency", details.urgency);
  return `${THANK_YOU_PATH}?${params.toString()}`;
}

function oneOf<T extends string>(options: readonly { value: T }[], raw: string | null): T | undefined {
  return options.find((o) => o.value === raw)?.value;
}

/**
 * Validates the query string against the real enum lists. Unknown, empty or
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
