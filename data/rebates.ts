// Rebate programs and dollar amounts change frequently. Every entry here is a
// placeholder shape to be verified against live program pages before launch.

export interface RebateProgram {
  name: string;
  provider: string;
  summary: string;
  amount: string;
  appliesTo: string[];
  learnMoreUrl?: string;
}

export const rebatePrograms: RebateProgram[] = [
  {
    name: "[PLACEHOLDER: Canada Greener Homes program name]",
    provider: "Government of Canada",
    summary:
      "Federal incentive program supporting home energy efficiency upgrades, including heat pumps and insulation. [PLACEHOLDER: verify current program status — this program has changed structure before].",
    amount: "[PLACEHOLDER: confirm current rebate amount]",
    appliesTo: ["Heat Pumps", "Indoor Air Quality"],
  },
  {
    name: "[PLACEHOLDER: Enbridge Gas / local utility rebate name]",
    provider: "[PLACEHOLDER: utility provider]",
    summary:
      "Local utility incentive for high-efficiency furnace, water heater, or smart thermostat upgrades. [PLACEHOLDER: confirm current offer].",
    amount: "[PLACEHOLDER: confirm current rebate amount]",
    appliesTo: ["Furnace Installation", "Water Heaters"],
  },
  {
    name: "[PLACEHOLDER: Ontario heat pump incentive name]",
    provider: "Province of Ontario",
    summary:
      "Provincial incentive supporting cold-climate heat pump adoption. [PLACEHOLDER: confirm program is currently active].",
    amount: "[PLACEHOLDER: confirm current rebate amount]",
    appliesTo: ["Heat Pumps", "Ductless Mini-Split Systems"],
  },
];
