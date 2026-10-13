import { getGaJoinKeys, track, trackAdsConversion, type AnalyticsEventParams } from "@/lib/analytics";
import { readAttribution, type LeadAttribution } from "@/lib/attribution";
import { BASE_PATH } from "@/lib/basePath";
import { markLeadSent } from "@/lib/callIntent";
import type { LeadSource } from "@/lib/leadAdapter";

export interface SubmitLeadOptions {
  endpoint: "/api/leads" | "/api/contact";
  /** The form's own fields. Attribution is added here, not by the caller. */
  body: Record<string, unknown>;
  leadSource: LeadSource;
  /** Extra generate_lead params (non-PII enums only). */
  leadParams?: Omit<AnalyticsEventParams["generate_lead"], "lead_source">;
}

export type SubmitLeadResult = { ok: true } | { ok: false };

/** Random, never derived from the lead: lets Google drop a duplicate conversion ping. */
function randomTransactionId(): string {
  return crypto.randomUUID();
}

/**
 * Posts a lead from a browser form, with the stored attribution (plus the GA4
 * client/session IDs as join keys) attached. Fires generate_lead and the
 * Google Ads "lead" conversion once per delivered lead, or form_submit_error
 * once on a non-ok response or network error. Never throws; the caller owns
 * the UI.
 */
export async function submitLead({
  endpoint,
  body,
  leadSource,
  leadParams,
}: SubmitLeadOptions): Promise<SubmitLeadResult> {
  let ok = false;
  try {
    const gaKeys = await getGaJoinKeys();
    const stored = readAttribution();
    const attribution: LeadAttribution | undefined =
      stored || Object.keys(gaKeys).length ? { ...stored, ...gaKeys } : undefined;
    const res = await fetch(`${BASE_PATH}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attribution ? { ...body, attribution } : body),
    });
    ok = res.ok;
  } catch {
    ok = false;
  }
  if (ok) {
    track("generate_lead", { lead_source: leadSource, ...leadParams });
    trackAdsConversion("lead", { transactionId: randomTransactionId() });
    // Later call taps in this tab are post_lead: not a new lead.
    markLeadSent();
    return { ok: true };
  }
  track("form_submit_error", { lead_source: leadSource });
  return { ok: false };
}
