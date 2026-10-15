// Lead plumbing for the Google Ads landing pages under /lp/*. Client-safe and
// React-free: lib/leadAdapter.ts validates the service choice with
// isLandingService() and the landing page with isLpPageKey(). Page copy lives
// in lib/landingPages.ts (repair / install) and lib/legacyLandingPages.ts
// (the other four ad groups).

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
 * The two config-driven landing pages (lib/landingPages.ts). Sent with the
 * lead as `landingPage` and on generate_lead as `landing_page`.
 */
export const LP_PAGE_KEYS = ["repair", "install"] as const;
export type LpPageKey = (typeof LP_PAGE_KEYS)[number];

export function isLpPageKey(value: unknown): value is LpPageKey {
  return LP_PAGE_KEYS.some((key) => key === value);
}

/** Only a real boolean counts; "true", 1 and the like are dropped. */
export function isMaintenanceInterest(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * The six ad landing-page routes, one per Google Ads ad group. The page copy
 * lives in lib/landingPages.ts and lib/legacyLandingPages.ts; these plain lists are here so the lead
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

/** The route each config-driven page lives at. */
export const LP_PAGE_SLUGS = {
  repair: "furnace-repair",
  install: "furnace-installation",
} as const satisfies Record<LpPageKey, LpSlug>;

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

export interface LandingLeadForm {
  service: LandingService | "";
  name: string;
  phone: string;
  /** Legacy pages only; the repair and install forms don't ask. */
  email?: string;
  /** Legacy pages only; the repair and install forms don't ask. */
  postalCode?: string;
  /** The install form's optional maintenance-pricing checkbox. */
  maintenanceInterest?: boolean;
}

/**
 * The landing-page form's JSON body: the form fields, the lp_* hidden fields
 * and, on the repair and install pages, which of the two sent it.
 */
export function buildLandingLeadBody(
  form: LandingLeadForm,
  lp: LpContext,
  landingPage?: LpPageKey
): Record<string, string | boolean> {
  return {
    service: form.service,
    name: form.name,
    phone: form.phone,
    ...(form.email !== undefined ? { email: form.email } : {}),
    ...(form.postalCode !== undefined ? { postalCode: form.postalCode } : {}),
    ...(form.maintenanceInterest !== undefined
      ? { maintenanceInterest: form.maintenanceInterest }
      : {}),
    source: "landing-page",
    ...lp,
    ...(landingPage ? { landingPage } : {}),
  };
}
