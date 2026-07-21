// Starter outlines only — titles + structure, not fabricated full articles.
// Real content should come from the client or a follow-up content phase.

export interface BlogOutline {
  slug: string;
  title: string;
  description: string;
  targetKeyword: string;
  outline: string[];
}

export const blogOutlines: BlogOutline[] = [
  {
    slug: "how-often-should-you-replace-your-furnace-filter",
    title: "How Often Should You Replace Your Furnace Filter?",
    description:
      "A practical guide to furnace filter types, replacement schedules, and warning signs your filter needs changing now.",
    targetKeyword: "how often replace furnace filter",
    outline: [
      "Why filter maintenance matters (airflow, efficiency, air quality)",
      "Typical replacement intervals by filter type (fibreglass, pleated, HEPA)",
      "Signs your filter needs changing right now",
      "How a dirty filter causes bigger, costlier problems",
      "CTA: book a maintenance visit",
    ],
  },
  {
    slug: "furnace-vs-heat-pump-which-is-right-for-a-brampton-home",
    title: "Furnace vs. Heat Pump: Which Is Right for a Brampton Home?",
    description:
      "Comparing gas furnaces and cold-climate heat pumps for Brampton and GTA homes — cost, comfort, and incentives.",
    targetKeyword: "furnace vs heat pump Brampton",
    outline: [
      "How each system works, in plain language",
      "Performance in Canadian winters — what 'cold-climate' actually means",
      "Upfront cost vs. long-term operating cost",
      "Current rebate programs affecting the decision",
      "Dual-fuel setups as a middle ground",
      "CTA: book a free in-home assessment",
    ],
  },
  {
    slug: "signs-your-air-conditioner-is-about-to-fail",
    title: "5 Signs Your Air Conditioner Is About to Fail",
    description:
      "The early warning signs that mean your AC needs attention before it fails on the hottest day of the year.",
    targetKeyword: "signs air conditioner failing",
    outline: [
      "Warm air from the vents",
      "Short cycling / frequent on-off",
      "Rising energy bills",
      "Unusual noises or smells",
      "Age + repair frequency as a replacement signal",
      "CTA: schedule an AC checkup",
    ],
  },
  {
    slug: "what-hvac-rebates-are-available-in-ontario-right-now",
    title: "What HVAC Rebates Are Available in Ontario Right Now?",
    description:
      "A plain-language rundown of current federal, provincial, and utility rebate programs for HVAC upgrades.",
    targetKeyword: "Ontario HVAC rebates",
    outline: [
      "Federal programs overview",
      "Provincial programs overview",
      "Utility-specific rebates",
      "How to check eligibility before buying equipment",
      "How Top Choice HVAC helps you apply",
      "CTA: see what you qualify for",
    ],
  },
  {
    slug: "ductless-mini-splits-explained",
    title: "Ductless Mini-Splits Explained: Are They Right for Your Home?",
    description:
      "What ductless mini-split systems are, where they make the most sense, and what installation involves.",
    targetKeyword: "ductless mini split explained",
    outline: [
      "How ductless systems work (no ductwork required)",
      "Best-fit scenarios: additions, basements, garages",
      "Single-zone vs. multi-zone setups",
      "Efficiency and rebate considerations",
      "What installation day looks like",
      "CTA: get a ductless quote",
    ],
  },
];
