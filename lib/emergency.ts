export type EmergencyIssue = "no-heat" | "no-cooling" | "water-leak" | "smell-gas" | "other";

export const issueOptions: { value: EmergencyIssue; label: string }[] = [
  { value: "no-heat", label: "No heat" },
  { value: "no-cooling", label: "No AC / cooling" },
  { value: "water-leak", label: "Water leak" },
  { value: "smell-gas", label: "Smell gas" },
  { value: "other", label: "Other" },
];
