// Google tag IDs (GA4 + Google Ads). Client-safe and NAP-free: lib/analytics.ts
// imports these for conversions, and lib/site.ts re-exports them.
//
// Placeholder pattern: a value starting with "[PLACEHOLDER" turns the matching
// feature off (no config, no conversion, no number swap), so the code can be
// merged before an ID exists. Never swap in a fake-looking real ID.

export const GA4_ID = "G-NVWFCHZ8S3";

/** Google Ads conversion ID. (The account's Google tag is GT-WKRL9HS5; we load gtag.js by the GA4 ID and add this as a second destination.) */
export const ADS_ID = "AW-18478339536";

export const ADS_CONVERSION_LABELS = {
  /** "Form lead": primary. Fired by lib/submitLead.ts on a delivered lead. */
  lead: "Jge2CKHz9JsdENCrlOtE",
  /** "Call tap": secondary (observation only). Touch devices, not after a lead. */
  callTap: "b-N2CMfU-JsdENCrlOtE",
  /** "Calls from website": primary. Google forwarding number, counted by Google on a real call. */
  callFromWebsite: "KMBECOjV9psdENCrlOtE",
} as const;

export type AdsConversionLabels = { [K in keyof typeof ADS_CONVERSION_LABELS]: string };

export function isRealTagValue(value: string | undefined | null): value is string {
  return typeof value === "string" && value.trim() !== "" && !value.startsWith("[PLACEHOLDER");
}
