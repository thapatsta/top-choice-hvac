export type EmergencyIssue = "no-heat" | "no-cooling" | "water-leak" | "smell-gas" | "other";

export const issueOptions: { value: EmergencyIssue; label: string }[] = [
  { value: "no-heat", label: "No heat" },
  { value: "no-cooling", label: "No AC / cooling" },
  { value: "water-leak", label: "Water leak" },
  { value: "smell-gas", label: "Smell gas" },
  { value: "other", label: "Other" },
];

// Enbridge Gas is the natural gas utility serving Brampton & the GTA.
// Verified 2026-09-23 against Enbridge Gas's published smell-gas emergency
// guidance: https://www.enbridgegas.com/ontario/safety/smell-gas
export const gasEmergencyContact = {
  name: "Enbridge Gas",
  display: "1-866-763-5427",
  href: "tel:+18667635427",
};
