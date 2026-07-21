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

// TODO: every program name, provider, and dollar amount below is a
// plausible-but-fake placeholder — real program names are deliberately
// generic here rather than guessing at a specific current government
// program (those change/lapse often and a wrong specific name is worse
// than a generic one). Confirm actual current programs before launch.
export const rebatePrograms: RebateProgram[] = [
  {
    name: "Home Energy Efficiency Rebate (Federal)",
    provider: "Government of Canada",
    summary:
      "Federal incentive program supporting home energy efficiency upgrades, including heat pumps and insulation.",
    amount: "Up to $5,000",
    appliesTo: ["Heat Pumps", "Indoor Air Quality"],
  },
  {
    name: "Local Utility HVAC Rebate",
    provider: "Local Gas/Electric Utility",
    summary:
      "Local utility incentive for high-efficiency furnace, water heater, or smart thermostat upgrades.",
    amount: "Up to $1,000",
    appliesTo: ["Furnace Installation", "Water Heaters"],
  },
  {
    name: "Provincial Heat Pump Incentive",
    provider: "Province of Ontario",
    summary:
      "Provincial incentive supporting cold-climate heat pump adoption.",
    amount: "Up to $2,000",
    appliesTo: ["Heat Pumps", "Ductless Mini-Split Systems"],
  },
];
