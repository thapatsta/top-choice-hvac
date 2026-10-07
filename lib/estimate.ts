// Good/Better/Best style *range framing* only — not a real-time pricing
// engine. Every dollar figure here is a placeholder and MUST be verified
// with the client before launch (see CONTENT-NEEDED.md) — except the furnace
// installation starting price, which is the client-confirmed advertised offer
// in data/offers.ts.

import { furnaceInstallOffer } from "@/data/offers";
import { formatCAD } from "@/lib/format";

export type QuoteNeed = "repair" | "replacement" | "new-install" | "maintenance";
export type QuoteSystemType =
  | "furnace"
  | "ac"
  | "heat-pump"
  | "ductless"
  | "water-heater"
  | "not-sure";
export type QuoteUrgency = "emergency" | "this-week" | "researching";

export const needOptions: { value: QuoteNeed; label: string; description: string }[] = [
  { value: "repair", label: "Repair", description: "Something's broken or not working right" },
  { value: "replacement", label: "Replacement", description: "My current system needs to be replaced" },
  { value: "new-install", label: "New Install", description: "Adding a system where none exists" },
  { value: "maintenance", label: "Maintenance", description: "Routine tune-up or maintenance plan" },
];

export const systemTypeOptions: { value: QuoteSystemType; label: string }[] = [
  { value: "furnace", label: "Furnace" },
  { value: "ac", label: "Air Conditioner" },
  { value: "heat-pump", label: "Heat Pump" },
  { value: "ductless", label: "Ductless Mini-Split" },
  { value: "water-heater", label: "Water Heater" },
  { value: "not-sure", label: "Not Sure" },
];

export const homeSizeOptions = [
  { value: "under-1500", label: "Under 1,500 sq ft" },
  { value: "1500-2500", label: "1,500–2,500 sq ft" },
  { value: "2500-3500", label: "2,500–3,500 sq ft" },
  { value: "3500-plus", label: "3,500+ sq ft" },
  { value: "not-sure", label: "Not sure" },
] as const;

export const systemAgeOptions = [
  { value: "under-5", label: "Under 5 years" },
  { value: "5-10", label: "5–10 years" },
  { value: "10-15", label: "10–15 years" },
  { value: "15-plus", label: "15+ years" },
  { value: "not-sure", label: "Not sure / new construction" },
] as const;

export const urgencyOptions: { value: QuoteUrgency; label: string; description: string }[] = [
  { value: "emergency", label: "Emergency", description: "No heat, no AC, or unsafe right now" },
  { value: "this-week", label: "This Week", description: "Would like it handled soon" },
  { value: "researching", label: "Just Researching", description: "Comparing options, no rush" },
];

interface EstimateRange {
  low: number;
  high: number;
}

// [PLACEHOLDER: confirm real installed-price ranges with client before launch]
// Furnace is deliberately absent: furnace installs quote the advertised
// starting price from data/offers.ts instead of a range, because the client
// hasn't given an upper price. Excluding the key keeps the lookup type-safe —
// getEstimateFraming must handle furnace before it can index this table.
const installedRanges: Record<Exclude<QuoteSystemType, "furnace">, EstimateRange> = {
  ac: { low: 4000, high: 7500 },
  "heat-pump": { low: 7000, high: 14000 },
  ductless: { low: 3500, high: 9000 },
  "water-heater": { low: 1800, high: 4500 },
  "not-sure": { low: 3000, high: 12000 },
};

// [PLACEHOLDER: confirm real repair-price ranges with client before launch]
const repairRanges: Record<QuoteSystemType, EstimateRange> = {
  furnace: { low: 250, high: 900 },
  ac: { low: 250, high: 900 },
  "heat-pump": { low: 300, high: 1100 },
  ductless: { low: 250, high: 800 },
  "water-heater": { low: 200, high: 700 },
  "not-sure": { low: 200, high: 900 },
};

// TODO: every dollar figure returned by this function is a placeholder —
// confirm real pricing ranges with the client before launch (see
// installedRanges/repairRanges above). The one exception is the furnace
// installation starting price, which comes from data/offers.ts.
export function getEstimateFraming(need: QuoteNeed, systemType: QuoteSystemType): string {
  const systemLabel =
    systemTypeOptions.find((s) => s.value === systemType)?.label.toLowerCase() ?? "system";

  if (need === "maintenance") {
    return "Maintenance plans are priced by coverage tier rather than a job range — we'll show you plan options during your free assessment.";
  }

  if (need === "repair") {
    const r = repairRanges[systemType];
    return `Most ${systemLabel} repairs like yours run between ${formatCAD(r.low)}–${formatCAD(
      r.high
    )}.`;
  }

  if (systemType === "furnace") {
    return `Furnace installations start from ${formatCAD(
      furnaceInstallOffer.priceFrom
    )} for a base-tier furnace. We'll confirm your exact price after a quick, free in-home assessment.`;
  }

  const r = installedRanges[systemType];
  return `Most ${systemLabel} ${
    need === "new-install" ? "installs" : "replacements"
  } like yours run between ${formatCAD(r.low)}–${formatCAD(
    r.high
  )} installed — we'll confirm your exact price after a quick, free in-home assessment.`;
}
