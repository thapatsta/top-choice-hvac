// Shared values for the Google Ads landing pages under /lp/*. Client-safe and
// React-free: lib/leadAdapter.ts validates the service choice with
// isLandingService(), and the page and thank-you copy read CALLBACK_PROMISE.

export type LandingService =
  | "furnace-replacement"
  | "new-furnace-install"
  | "furnace-repair"
  | "heat-pump"
  | "air-conditioner"
  | "not-sure";

export const landingServiceOptions: { value: LandingService; label: string }[] = [
  { value: "furnace-replacement", label: "Furnace replacement" },
  { value: "new-furnace-install", label: "New furnace install" },
  { value: "furnace-repair", label: "Furnace repair" },
  { value: "heat-pump", label: "Heat pump" },
  { value: "air-conditioner", label: "Air conditioner" },
  { value: "not-sure", label: "Not sure, I need advice" },
];

export function isLandingService(value: unknown): value is LandingService {
  return landingServiceOptions.some((o) => o.value === value);
}

/**
 * How soon we promise to call a landing-page lead back. Used in the form
 * intro, the "How it works" steps, the FAQ and the thank-you card, so it
 * changes in one place.
 */
export const CALLBACK_PROMISE = "typically within 30 minutes";

/**
 * The six ad landing-page variants, one per Google Ads ad group. The page
 * copy lives in lib/landing-pages.ts; these plain lists are here so the lead
 * adapter (server) can validate the lp_* hidden fields without importing
 * the copy.
 */
export const LP_SLUGS = [
  "furnace-installation",
  "furnace-repair",
  "heating-cooling",
  "outskirts/furnace-installation",
  "outskirts/furnace-repair",
  "outskirts/heating-cooling",
] as const;
export type LpSlug = (typeof LP_SLUGS)[number];

export const LP_REGIONS = ["core", "outskirts"] as const;
export type LpRegion = (typeof LP_REGIONS)[number];

export const LP_SERVICES = ["install", "repair", "heating-cooling"] as const;
export type LpService = (typeof LP_SERVICES)[number];

/** Which landing page a lead (or a GA4 event) came from. */
export interface LpContext {
  lp_slug: LpSlug;
  lp_region: LpRegion;
  lp_service: LpService;
}

function oneOf<T extends string>(list: readonly T[], value: unknown): T | undefined {
  return list.find((item) => item === value);
}

/** Picks the lp_* fields out of a raw body; unknown values are dropped. */
export function parseLpContext(raw: Record<string, unknown>): Partial<LpContext> {
  const out: Partial<LpContext> = {};
  const slug = oneOf(LP_SLUGS, raw.lp_slug);
  const region = oneOf(LP_REGIONS, raw.lp_region);
  const service = oneOf(LP_SERVICES, raw.lp_service);
  if (slug) out.lp_slug = slug;
  if (region) out.lp_region = region;
  if (service) out.lp_service = service;
  return out;
}

/** The landing-page form's JSON body: the five fields plus the lp_* hidden fields. */
export function buildLandingLeadBody(
  form: { service: LandingService | ""; name: string; phone: string; email: string; postalCode: string },
  lp: LpContext
): Record<string, string> {
  return {
    service: form.service,
    name: form.name,
    phone: form.phone,
    email: form.email,
    postalCode: form.postalCode,
    source: "landing-page",
    ...lp,
  };
}
