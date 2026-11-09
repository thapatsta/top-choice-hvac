// Ontario rebate data for /rebates. Verified against official program pages
// on REBATES_VERIFIED. Rebate programs change often: when you update an
// amount, a status or a rule here, bump REBATES_VERIFIED too, and re-read the
// source page listed on the program. Never add an amount you haven't read on
// the program's own page.
//
// Sources read on 2026-11-07:
//  - Home Renovation Savings heat pump page + Heat Pump Stream Requirements
//    (homerenovationsavings.ca, version dated May 2025)
//  - Save on Energy Energy Affordability Program FAQs (saveonenergy.ca)
//  - City of Toronto Home Energy Loan Program page (toronto.ca)
//  - Natural Resources Canada Greener Homes pages (natural-resources.canada.ca)

import { formatCAD } from "@/lib/format";
import type { FAQ } from "@/data/faqs";

export const REBATES_VERIFIED = "November 7, 2026";

/**
 * Real count of rebate applications Top Choice has handled, from the owner
 * (2026-11-07). Update it when it changes; set to null to hide the stat.
 * Never put a number here the owner hasn't given you.
 */
export const REBATES_HANDLED: number | null = 108;

/** "108 rebates handled", or null when there is no real number to show. */
export function rebatesHandledLabel(n: number | null): string | null {
  if (n === null || !Number.isInteger(n) || n <= 0) return null;
  return `${n} rebates handled`;
}

export type ProgramStatus = "open" | "announced" | "closed";
export type ProgramLevel = "Provincial" | "Federal" | "Municipal";

export interface RebateProgram {
  id: string;
  name: string;
  level: ProgramLevel;
  /** Who runs it, in plain words. */
  provider: string;
  status: ProgramStatus;
  /** Short line shown on the stamp ticket, e.g. "Up to $7,500". */
  amount: string;
  summary: string;
  /** Who it is for. */
  whoFor: string;
  /** How a homeowner gets it. Empty for closed programs. */
  howToGet: string[];
  sourceLabel: string;
  sourceUrl: string;
}

export const rebatePrograms: RebateProgram[] = [
  {
    id: "hrs",
    name: "Home Renovation Savings: Heat Pumps",
    level: "Provincial",
    provider: "Save on Energy and Enbridge Gas, supported by the Government of Ontario",
    status: "open",
    amount: "Up to $7,500",
    summary:
      "A per-ton rebate on a cold-climate heat pump. It pays $1,250 per ton (up to $7,500) if your home heats with electricity, oil, propane or wood, and $500 per ton (up to $2,000) if you heat with Enbridge natural gas. Ground-source systems reach $12,000.",
    whoFor:
      "Owners of a detached, semi-detached, row or townhome, or mobile home on a permanent foundation. New builds occupied six months or less don't qualify.",
    howToGet: [
      "Confirm your home and heating fuel qualify.",
      "Pick a participating HVAC contractor. They submit the pre-installation application.",
      "Wait for written approval. Work started before approval is not eligible.",
      "Install. The contractor submits the post-installation application.",
      "Your cheque arrives by mail, about 60 days after approval.",
    ],
    sourceLabel: "homerenovationsavings.ca",
    sourceUrl: "https://www.homerenovationsavings.ca/without-assessment/heat-pumps",
  },
  {
    id: "eap",
    name: "Energy Affordability Program",
    level: "Provincial",
    provider: "Save on Energy",
    status: "open",
    amount: "Free for income-qualified homes",
    summary:
      "Income-qualified households can get a free cold-climate heat pump, installed, with a 10-year parts and labour warranty. Heat pumps are offered to electrically heated homes, and to oil-heated homeowners with above-ground tanks for a limited time.",
    whoFor:
      "Ontario households that meet the income or benefit rules. Delivered by Save on Energy's own agents, not by contractors like us.",
    howToGet: [
      "Apply on the Save on Energy website, or call the program.",
      "A program agent contacts you, usually within three business days.",
      "If you don't qualify, we are the paid route. Ask us about the Home Renovation Savings rebate instead.",
    ],
    sourceLabel: "saveonenergy.ca",
    sourceUrl: "https://saveonenergy.ca/EAP",
  },
  {
    id: "toronto-hel",
    name: "Home Energy Loan Program",
    level: "Municipal",
    provider: "City of Toronto",
    status: "open",
    amount: "Loans up to $125,000",
    summary:
      "A low fixed-rate loan, repaid through your property tax bill. It covers heat pumps, high-efficiency furnaces and air conditioners, and more. Rates run from 3.83% (5 years) to 5.12% (20 years) through December 31, 2026.",
    whoFor:
      "Owners of eligible low-rise homes in Toronto (postal codes starting with M), which includes Etobicoke. Other cities may run their own programs. Ask us.",
    howToGet: [
      "Apply online and wait for the City's approval and funding offer.",
      "Heat pump-only projects don't need an EnerGuide assessment.",
      "Sign the property owner agreement, then hire your contractor.",
      "Finish the work and submit your invoices. You repay through property tax.",
    ],
    sourceLabel: "toronto.ca",
    sourceUrl:
      "https://www.toronto.ca/services-payments/water-environment/environmental-grants-incentives/home-energy-loan-program/",
  },
  {
    id: "national-hp",
    name: "National Heat Pump Rebate",
    level: "Federal",
    provider: "Government of Canada",
    status: "announced",
    amount: "$2,000 to $10,000 announced",
    summary:
      "Announced October 8, 2026: $2,000 for most households and up to $10,000 for below-median-income households. It is not open yet and the details haven't been published. The City of Toronto says it expects a launch in early 2027, and that eligible heat pumps installed on or after November 1, 2026 may qualify. Treat that as unconfirmed until the program rules are out.",
    whoFor: "Not defined yet. The income threshold hasn't been published.",
    howToGet: [
      "Nothing to apply for today.",
      "Keep your invoices and the install date from any heat pump installed this winter.",
      "We'll check the official rules the day they're published.",
    ],
    sourceLabel: "Natural Resources Canada",
    sourceUrl:
      "https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative",
  },
  {
    id: "cghg",
    name: "Canada Greener Homes Grant",
    level: "Federal",
    provider: "Government of Canada",
    status: "closed",
    amount: "Closed",
    summary: "No longer accepting applications. Grants already approved are not affected.",
    whoFor: "Closed to new applicants.",
    howToGet: [],
    sourceLabel: "Natural Resources Canada",
    sourceUrl:
      "https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative",
  },
  {
    id: "cghl",
    name: "Canada Greener Homes Loan",
    level: "Federal",
    provider: "Government of Canada",
    status: "closed",
    amount: "Closed",
    summary: "The interest-free loan stopped taking applications on October 1, 2025.",
    whoFor: "Closed to new applicants.",
    howToGet: [],
    sourceLabel: "Natural Resources Canada",
    sourceUrl:
      "https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative",
  },
  {
    id: "ohpa",
    name: "Oil to Heat Pump Affordability Program",
    level: "Federal",
    provider: "Government of Canada",
    status: "closed",
    amount: "Closed",
    summary:
      "The federal program stopped taking new applications in 2026. Income-qualified oil-heated homeowners should look at the Energy Affordability Program above.",
    whoFor: "Closed to new applicants.",
    howToGet: [],
    sourceLabel: "Natural Resources Canada",
    sourceUrl:
      "https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative",
  },
  {
    id: "her-plus",
    name: "Enbridge Home Efficiency Rebate Plus",
    level: "Provincial",
    provider: "Enbridge Gas",
    status: "closed",
    amount: "Replaced",
    summary:
      "Folded into Home Renovation Savings, which Enbridge now co-delivers. Old blog posts and ads that still quote HER+ amounts are out of date.",
    whoFor: "Replaced by Home Renovation Savings.",
    howToGet: [],
    sourceLabel: "homerenovationsavings.ca",
    sourceUrl: "https://www.homerenovationsavings.ca/",
  },
];

export function programsByStatus(status: ProgramStatus): RebateProgram[] {
  return rebatePrograms.filter((p) => p.status === status);
}

// ---------------------------------------------------------------------------
// Finder logic (pure, so tests/rebates.test.ts can cover it)
// ---------------------------------------------------------------------------

export type HeatSource = "gas" | "electric" | "oil" | "propane-wood" | "not-sure";
export type Project = "furnace" | "ac" | "heat-pump" | "not-sure";
export type HomeType = "house" | "condo" | "rent";
export type IncomeAnswer = "yes" | "no" | "unsure";

export interface FinderAnswers {
  heat: HeatSource;
  project: Project;
  home: HomeType;
  income: IncomeAnswer;
}

export const TON_OPTIONS = [2, 3, 4, 5] as const;
export type Tons = (typeof TON_OPTIONS)[number];

const GAS_RATE = { perTon: 500, cap: 2000 } as const;
const NON_GAS_RATE = { perTon: 1250, cap: 7500 } as const;

/** "not-sure" is treated as gas: most GTA homes heat with natural gas and it is the lower, safer figure. */
export function heatPumpRate(heat: HeatSource): { perTon: number; cap: number } {
  return heat === "gas" || heat === "not-sure" ? GAS_RATE : NON_GAS_RATE;
}

export function heatPumpRebate(heat: HeatSource, tons: number): number {
  const { perTon, cap } = heatPumpRate(heat);
  return Math.min(Math.round(tons * perTon), cap);
}

/** Bar length for a heating fuel, as a share of the largest cap (0 to 1). */
export function heatPumpBarShare(heat: HeatSource): number {
  return heatPumpRate(heat).cap / NON_GAS_RATE.cap;
}

export type LineKind = "open" | "announced" | "info";

export interface ResultLine {
  kind: LineKind;
  label: string;
  amount: string;
  detail: string;
}

export type Verdict = "stack" | "no-rebate-for-project" | "home-not-eligible";

export interface FinderResult {
  verdict: Verdict;
  headline: string;
  lead: string;
  /** True when the per-ton calculator should render. */
  showCalculator: boolean;
  lines: ResultLine[];
  /** System to prefill on /get-quote. */
  quoteSystem: "furnace" | "ac" | "heat-pump" | "not-sure";
}

export function getFinderResult(a: FinderAnswers): FinderResult {
  const gasLike = a.heat === "gas" || a.heat === "not-sure";
  const lines: ResultLine[] = [];

  const quoteSystem: FinderResult["quoteSystem"] =
    a.project === "not-sure" ? "heat-pump" : a.project;

  const incomeLine = (): ResultLine | null => {
    if (a.income === "no") return null;
    const heatsWithElectricOrOil = a.heat === "electric" || a.heat === "oil";
    return {
      kind: "open",
      label: "Energy Affordability Program",
      amount: heatsWithElectricOrOil ? "Possibly free" : "Ask Save on Energy",
      detail: heatsWithElectricOrOil
        ? "Income-qualified households can get a free heat pump through Save on Energy. It is worth checking before you pay for one. If you don't qualify, we can do the paid route."
        : "Income-qualified help exists through Save on Energy. Its free heat pumps go to electrically heated homes and some oil-heated ones, so check what applies to you.",
    };
  };

  const torontoLine: ResultLine = {
    kind: "info",
    label: "City of Toronto Home Energy Loan (Toronto homes only)",
    amount: "Loans up to $125,000",
    detail:
      "If your home is in Toronto, the City offers low fixed-rate loans for heat pumps, furnaces and ACs, repaid on your property tax bill.",
  };

  if (a.home === "condo") {
    const condoIncomeLine = incomeLine();
    return {
      verdict: "home-not-eligible",
      headline: "Apartments and most condos don't qualify for the heat pump rebate.",
      lead: "The Home Renovation Savings heat pump rebate covers detached, semi-detached, row and townhomes, and mobile homes on a permanent foundation. Some condo townhomes have their own system. Tell us yours and we'll check.",
      showCalculator: false,
      lines: condoIncomeLine ? [condoIncomeLine] : [],
      quoteSystem,
    };
  }

  const renterNote =
    a.home === "rent" ? " Your landlord, as the owner, has to be the one who applies." : "";

  if (a.project === "furnace" || a.project === "ac") {
    if (a.project === "furnace") {
      lines.push({
        kind: "info",
        label: "Straight furnace replacement",
        amount: "No rebate found",
        detail:
          "We haven't found a current Ontario rebate for replacing a gas furnace with another one, and we won't promise one. Our installs start at a clear price and we can talk about financing.",
      });
    } else {
      lines.push({
        kind: "info",
        label: "Straight AC replacement",
        amount: "No rebate found",
        detail:
          "We haven't found a current Ontario rebate for replacing an air conditioner with another one.",
      });
    }
    lines.push({
      kind: "open",
      label: "Switch to a cold-climate heat pump instead",
      amount: gasLike
        ? `Up to ${formatCAD(GAS_RATE.cap)}`
        : `Up to ${formatCAD(NON_GAS_RATE.cap)}`,
      detail:
        (a.project === "ac"
          ? "A cold-climate heat pump cools your home like an AC and heats it too. That's the version the rebate covers. "
          : "") +
        (gasLike
          ? "In a gas home you can keep your furnace as the backup and still get the rebate. The backup itself isn't rebated."
          : "Your heating fuel qualifies for the higher rate.") +
        renterNote,
    });
    const il = incomeLine();
    if (il) lines.push(il);
    lines.push(torontoLine);
    return {
      verdict: "no-rebate-for-project",
      headline:
        a.project === "furnace"
          ? "A like-for-like furnace swap has no rebate, but a heat pump does."
          : "A like-for-like AC swap has no rebate, but a heat pump does.",
      lead: "Rebates in Ontario follow heat pumps. If a heat pump suits your home, there's real money available. If not, we'll say so and quote the straightforward replacement.",
      showCalculator: true,
      lines,
      quoteSystem,
    };
  }

  // heat-pump or not-sure
  lines.push({
    kind: "open",
    label: "Home Renovation Savings (Ontario)",
    amount: `Up to ${formatCAD(heatPumpRate(a.heat).cap)}`,
    detail:
      (gasLike
        ? "Enbridge gas homes get $500 per ton, up to $2,000. You can keep your furnace as a backup. The backup isn't rebated. "
        : "Your heating fuel gets $1,250 per ton, up to $7,500. ") +
      "Needs written pre-approval before any work starts." +
      renterNote,
  });
  lines.push({
    kind: "announced",
    label: "National Heat Pump Rebate (announced, not open)",
    amount: "$2,000 to $10,000",
    detail:
      "Announced October 8, 2026. The launch date, income threshold and how it combines with Ontario's rebate haven't been published, so it isn't counted in your total.",
  });
  const il = incomeLine();
  if (il) lines.push(il);
  lines.push(torontoLine);

  return {
    verdict: "stack",
    headline:
      a.home === "rent"
        ? "Your landlord would need to apply for the heat pump rebate."
        : "You likely qualify for a heat pump rebate.",
    lead: "Here's what's open for a home like yours. The number is the program's own formula, not a guess. We confirm the final amount at your free assessment.",
    showCalculator: true,
    lines,
    quoteSystem,
  };
}

// ---------------------------------------------------------------------------
// FAQ (also emitted as FAQPage JSON-LD)
// ---------------------------------------------------------------------------

export const rebateFaqs: FAQ[] = [
  {
    question: "Is there a rebate for a new gas furnace in Ontario?",
    answer:
      "We haven't found a current Ontario rebate for replacing a gas furnace with another gas furnace, and we won't suggest one exists. Rebates follow heat pumps. If you're open to a heat pump with your furnace kept as backup, up to $2,000 is available in Enbridge gas homes.",
  },
  {
    question: "How much is the Ontario heat pump rebate?",
    answer:
      "Through Home Renovation Savings, a cold-climate air-source heat pump gets $1,250 per ton (up to $7,500) in homes heated by electricity, oil, propane or wood, and $500 per ton (up to $2,000) in homes heated by Enbridge natural gas. Ground-source systems go up to $12,000 in non-gas homes.",
  },
  {
    question: "Do I have to be approved before the heat pump is installed?",
    answer:
      "Yes. Installations done before written approval are not eligible. Your contractor submits the pre-installation application first, so call us before you sign or buy anything.",
  },
  {
    question: "Who applies, me or the contractor?",
    answer:
      "The participating contractor submits both the pre-installation and post-installation applications. You must own the home and be the one paying. The cheque is mailed to you, about 60 days after the final approval.",
  },
  {
    question: "Can I keep my furnace if I get a heat pump?",
    answer:
      "Yes. In a gas home the heat pump can run most of the winter with your furnace as backup. The program rebates the heat pump, not the backup.",
  },
  {
    question: "Are the Greener Homes Grant and Loan still available?",
    answer:
      "No. The Canada Greener Homes Grant is closed, and the interest-free Greener Homes Loan stopped taking applications on October 1, 2025. The federal oil-to-heat-pump program also stopped taking new applications in 2026.",
  },
  {
    question: "What about the new federal heat pump rebate?",
    answer:
      "It was announced on October 8, 2026: $2,000 for most households and up to $10,000 for below-median-income households. It isn't open yet and the rules haven't been published, including the income cut-off and whether this fall's installs will count. We'll update this page when the details are official.",
  },
  {
    question: "I have a lower income. Can I get a free heat pump?",
    answer:
      "Possibly. Save on Energy's Energy Affordability Program installs free heat pumps for income-qualified households, mainly in electrically heated homes and some oil-heated ones. It is run by the program's own agents. If you don't qualify, we can do the paid install with the Home Renovation Savings rebate.",
  },
  {
    question: "Do rebates stack with financing?",
    answer:
      "The rebate arrives after the work is approved, so financing can cover the upfront cost in the meantime. See our financing page for payment estimates. In Toronto, the City's Home Energy Loan can also fund the project.",
  },
];
