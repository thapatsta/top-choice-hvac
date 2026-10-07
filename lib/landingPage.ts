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
