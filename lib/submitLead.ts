import { track, type AnalyticsEventParams } from "@/lib/analytics";
import { readAttribution } from "@/lib/attribution";
import { BASE_PATH } from "@/lib/basePath";
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

/**
 * Posts a lead from a browser form, with the stored attribution attached.
 * Fires generate_lead once per delivered lead, or form_submit_error once on a
 * non-ok response or network error. Never throws; the caller owns the UI.
 */
export async function submitLead({
  endpoint,
  body,
  leadSource,
  leadParams,
}: SubmitLeadOptions): Promise<SubmitLeadResult> {
  let ok = false;
  try {
    const attribution = readAttribution();
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
    return { ok: true };
  }
  track("form_submit_error", { lead_source: leadSource });
  return { ok: false };
}
