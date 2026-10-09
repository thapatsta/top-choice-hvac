// Copy and settings for the six Google Ads landing pages under /lp/*, one
// per ad group. components/lp/LandingPage.tsx renders any of them; each
// app/lp/**/page.tsx route just picks its entry by slug.
//
// Claims rules (enforced by tests/lp-content.test.ts, which runs in CI before
// deploy): only the facts below may appear on these pages. No credential-type
// claims unless `credentialClaims` is switched on with a `verifiedBy`, no
// street address or postal code, no superlatives, no prices on the heating &
// cooling pages, and round-the-clock wording on the repair pages only.

import type { Metadata } from "next";
import {
  CALLBACK_PROMISE,
  type LandingService,
  type LpContext,
  type LpRegion,
  type LpService,
  type LpSlug,
} from "@/lib/landingPage";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export interface LpBenefit {
  title: string;
}

export interface LpFaqItem {
  question: string;
  answer: string;
  /** Optional link rendered after the answer. */
  link?: { href: string; label: string };
}

/** A link to another landing page, carrying the visitor's query string. */
export interface LpCrosslinkTarget {
  slug: LpSlug;
  label: string;
}

export type LpCrossSell =
  | {
      kind: "repair-or-replace";
      text: string;
      link: LpCrosslinkTarget;
    }
  | {
      kind: "choices";
      heading: string;
      cards: { title: string; body: string; link?: LpCrosslinkTarget }[];
    };

/**
 * Licensing / insurance / certification badges are off on every page until
 * the business owner has verified the exact wording. Turning them on needs a
 * named person who verified them, and the badge text itself.
 */
export type CredentialClaims =
  | { enabled: false }
  | { enabled: true; verifiedBy: string; verifiedOn: string; badge: string };

export interface LandingPageConfig {
  slug: LpSlug;
  region: LpRegion;
  service: LpService;
  /** Towns the ad group targets, for reference and tests. */
  towns: readonly string[];
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  subhead: string;
  /** Required whenever the page shows a price. */
  priceNote?: string;
  formHeading: string;
  formButton: string;
  defaultService: LandingService;
  benefits: LpBenefit[];
  faq: LpFaqItem[];
  serviceAreaLine: string;
  bottomCta: string;
  bottomCtaText: string;
  /** Round-the-clock wording. Only allowed on the repair pages. */
  showEmergency247: boolean;
  crossSell?: LpCrossSell;
  credentialClaims: CredentialClaims;
}

// ---------------------------------------------------------------------------
// Shared facts
// ---------------------------------------------------------------------------

export const INSTALL_PRICE = "$2,199";

/**
 * Open around the clock, read from site.hours (confirmed against the Google
 * Business Profile on 2026-09-22). If the hours there change, the repair
 * pages drop their round-the-clock wording automatically.
 */
export const OPEN_247 = site.hours.display === "Always open";

const INSTALL_PRICE_NOTE = `From ${INSTALL_PRICE} for a base-tier furnace, installed. Your final price depends on the model and your home, and is confirmed in writing at your free in-home quote.`;

const CORE_TOWNS = ["Brampton", "Mississauga"] as const;
const OUTSKIRTS_TOWNS = [
  "Caledon",
  "Bolton",
  "Orangeville",
  "Halton Hills",
  "Georgetown",
  "Acton",
  "Milton",
  "Barrie",
] as const;

const OUTSKIRTS_EYEBROW_TOWNS = "Caledon, Bolton, Orangeville, Halton Hills, Milton & Barrie";
const OUTSKIRTS_LIST = "Caledon, Bolton, Orangeville, Halton Hills, Milton and Barrie";

// The nearby areas the furnace page already listed (site.serviceAreas minus
// the two core cities). Nothing new is added here.
const coreNearby = site.serviceAreas.filter(
  (area) => !(CORE_TOWNS as readonly string[]).includes(area)
);
const coreNearbyList = `${coreNearby.slice(0, -1).join(", ")} and ${coreNearby.at(-1)}`;

const CORE_AREA_LINE = `Serving Brampton and Mississauga, plus ${coreNearbyList}.`;
const OUTSKIRTS_AREA_LINE = `Brampton-based, serving Caledon, Bolton, Orangeville, Halton Hills (including Georgetown and Acton), Milton and Barrie.`;

/** Shown under the hero on every page. */
export const TRUST_ITEMS: { title: string; detail: string }[] = [
  { title: "Free quote", detail: "no obligation" },
  { title: "Fast callback", detail: CALLBACK_PROMISE },
  { title: "10-year labour warranty", detail: "on every installation" },
  { title: "Satisfaction guarantee", detail: "we make it right" },
];

export const HOW_IT_WORKS: { title: string; body: string }[] = [
  { title: "Tell us what you need", body: "Fill in the short form. It takes about a minute." },
  { title: "We call you back", body: `A Top Choice expert calls you back, ${CALLBACK_PROMISE}.` },
  { title: "Free in-home assessment", body: "We confirm the exact price, then book the work." },
];

// Reused answers from the original /lp/furnace-installation page.
const FAQ_WARRANTY: LpFaqItem = {
  question: "What does the 10-year labour warranty cover?",
  answer:
    "Every furnace we install is backed by a 10-year labour warranty, in addition to the manufacturer's equipment warranty. We go over the details with you at your in-home assessment.",
};
const FAQ_FREE_QUOTE: LpFaqItem = {
  question: "Is the quote really free?",
  answer:
    "Yes. Your quote and in-home assessment are free, with no obligation. You get the price in writing before any work begins.",
};
const FAQ_FREE_QUOTE_SHORT: LpFaqItem = { ...FAQ_FREE_QUOTE, question: "Is the quote free?" };

const INSTALL_COST_ANSWER = `Installs start at ${INSTALL_PRICE} for a base-tier furnace. Larger and higher-efficiency models cost more. We confirm your exact price in writing at a free in-home quote, before any work begins.`;

const REPAIR_OR_REPLACE = `Repair costs adding up on an older furnace? A new furnace installed from ${INSTALL_PRICE} may be the better value.`;

// ---------------------------------------------------------------------------
// Shared page blocks
// ---------------------------------------------------------------------------

function installPage(region: LpRegion): Omit<LandingPageConfig, "slug" | "region" | "towns" | "metaTitle" | "metaDescription" | "eyebrow" | "subhead" | "faq" | "serviceAreaLine"> {
  return {
    service: "install",
    h1: `New Furnace Installed From ${INSTALL_PRICE}`,
    priceNote: INSTALL_PRICE_NOTE,
    formHeading: "Get your free furnace quote",
    formButton: "Get my free quote",
    defaultService: "new-furnace-install",
    benefits: [
      { title: "Priced upfront, in writing" },
      { title: "10-year labour warranty on every installation" },
      { title: "Free in-home quote, no pressure" },
      {
        title:
          region === "core"
            ? "A local Brampton team, not a call centre"
            : "A Brampton-based team that comes to you",
      },
    ],
    bottomCta: "Ready for a warmer winter?",
    bottomCtaText: `Get your free quote, or call us at ${site.phone.display}.`,
    showEmergency247: false,
    credentialClaims: { enabled: false },
  };
}

function repairPage(region: LpRegion): Omit<LandingPageConfig, "slug" | "region" | "towns" | "metaTitle" | "metaDescription" | "eyebrow" | "faq" | "serviceAreaLine"> {
  const installSlug: LpSlug =
    region === "core" ? "furnace-installation" : "outskirts/furnace-installation";
  return {
    service: "repair",
    h1: "Furnace Not Working? Get It Repaired",
    subhead: `Tell us what's going on and a Top Choice expert calls you back, ${CALLBACK_PROMISE}. Prefer to talk now? Call ${site.phone.display}.`,
    // The repair-or-replace panel shows the install price.
    priceNote: INSTALL_PRICE_NOTE,
    formHeading: "Request a repair callback",
    formButton: "Request my callback",
    defaultService: "furnace-repair",
    benefits: [
      ...(OPEN_247 ? [{ title: "Call any time, we're open 24/7" }] : []),
      { title: "You get the price in writing before work begins" },
      { title: "Free quote, no obligation" },
      {
        title: region === "core" ? "A local Brampton team" : "A Brampton-based team that comes to you",
      },
    ],
    bottomCta: "Need your heat back?",
    bottomCtaText: OPEN_247
      ? `Request a callback, or call ${site.phone.display} any time. We're open 24/7.`
      : `Request a callback, or call us at ${site.phone.display}.`,
    showEmergency247: OPEN_247,
    crossSell: {
      kind: "repair-or-replace",
      text: REPAIR_OR_REPLACE,
      link: { slug: installSlug, label: "See new furnace installation" },
    },
    credentialClaims: { enabled: false },
  };
}

function repairFaq(areaItem: LpFaqItem): LpFaqItem[] {
  return [
    {
      question: "My furnace won't turn on. What can I check first?",
      answer:
        "Make sure the thermostat is set to heat and above room temperature, the furnace switch and breaker are on, and the filter isn't clogged. If it still won't run, call us.",
    },
    {
      question: "What if I smell gas?",
      answer:
        "Leave the house right away and call your gas utility's emergency line or 911 from outside. Don't use switches, flames or phones inside. Call us once it's safe.",
    },
    areaItem,
    {
      question: "Should I repair or replace?",
      answer: `${REPAIR_OR_REPLACE} ${INSTALL_PRICE_NOTE}`,
    },
    FAQ_FREE_QUOTE_SHORT,
  ];
}

function heatingCoolingPage(region: LpRegion): Omit<LandingPageConfig, "slug" | "region" | "towns" | "metaTitle" | "metaDescription" | "eyebrow" | "faq" | "serviceAreaLine"> {
  const installSlug: LpSlug =
    region === "core" ? "furnace-installation" : "outskirts/furnace-installation";
  return {
    service: "heating-cooling",
    h1: "Heat Pump & Air Conditioner Installation",
    subhead:
      "One free in-home quote for heat pumps, central air conditioning and furnace upgrades. Priced upfront, in writing.",
    priceNote: "Your price is confirmed in writing at your free in-home assessment.",
    formHeading: "Get your free heating & cooling quote",
    formButton: "Get my free quote",
    defaultService: "heat-pump",
    benefits: [
      { title: "Heat pumps heat and cool your home with one system" },
      { title: "Free in-home assessment" },
      { title: "Priced in writing before work starts" },
      { title: "10-year labour warranty on every installation" },
    ],
    bottomCta: "Ready to plan your new system?",
    bottomCtaText: `Get your free quote, or call us at ${site.phone.display}.`,
    showEmergency247: false,
    crossSell: {
      kind: "choices",
      heading: "Which is right for you?",
      cards: [
        { title: "Heat pump", body: "Heating and cooling in one system." },
        { title: "Central air conditioner", body: "Cooling that pairs with your furnace." },
        {
          title: "Furnace upgrade",
          body: "A new furnace for dependable heat.",
          link: { slug: installSlug, label: "See furnace installation" },
        },
      ],
    },
    credentialClaims: { enabled: false },
  };
}

function heatingCoolingFaq(areaItem?: LpFaqItem): LpFaqItem[] {
  return [
    {
      question: "Heat pump or furnace?",
      answer:
        "It depends on your home and what you need. A heat pump heats and cools with one system. A furnace heats, and pairs with a central air conditioner for cooling. We'll go over the options at your free in-home assessment.",
    },
    {
      question: "Can a heat pump replace my air conditioner?",
      answer:
        "Yes. Heat pumps provide both heating and cooling, so one can take the place of a central air conditioner. We'll confirm it suits your home at your assessment.",
    },
    {
      question: "How do I get a price?",
      answer:
        "Book a free in-home assessment. You get the price in writing before any work starts.",
    },
    ...(areaItem ? [areaItem] : []),
    // /rebates exists, so link to it using that page's own wording.
    {
      question: "Are there rebates?",
      answer:
        "Rebate programs and dollar amounts change frequently. We'll confirm exact eligibility and amounts during your free assessment.",
      link: { href: "/rebates", label: "See current rebate programs" },
    },
  ];
}

const outskirtsAreaAnswer = `Yes. We're based in Brampton and serve ${OUTSKIRTS_LIST}. Enter your postal code and we'll confirm we can get to you.`;

// ---------------------------------------------------------------------------
// The six pages
// ---------------------------------------------------------------------------

export const LANDING_PAGES: readonly LandingPageConfig[] = [
  {
    ...installPage("core"),
    slug: "furnace-installation",
    region: "core",
    towns: CORE_TOWNS,
    metaTitle: `Furnace Installation in Brampton & Mississauga | From ${INSTALL_PRICE}`,
    metaDescription: `New gas furnace installed from ${INSTALL_PRICE} for a base-tier model in Brampton & Mississauga. Free in-home quote, price in writing, 10-year labour warranty.`,
    eyebrow: "Furnace installation · Brampton & Mississauga",
    subhead:
      "Free in-home quote. Your price in writing before any work starts. Same-day installs available in many cases.",
    faq: [
      {
        question: "How much does a new furnace cost in Brampton and Mississauga?",
        answer: INSTALL_COST_ANSWER,
      },
      {
        question: "Can you install it the same day?",
        answer:
          "In many cases, yes. Timing depends on the model and your home, so we confirm it when we quote.",
      },
      FAQ_WARRANTY,
      FAQ_FREE_QUOTE,
      {
        question: "Which areas do you serve?",
        answer: `Brampton and Mississauga, plus ${coreNearbyList}.`,
      },
    ],
    serviceAreaLine: CORE_AREA_LINE,
  },
  {
    ...repairPage("core"),
    slug: "furnace-repair",
    region: "core",
    towns: CORE_TOWNS,
    metaTitle: "Furnace Repair in Brampton & Mississauga | Free Quote",
    metaDescription: `Furnace not working? Request a repair callback from a local Brampton team, ${CALLBACK_PROMISE}. Free quote, price in writing before work begins.`,
    eyebrow: "Furnace repair · Brampton & Mississauga",
    faq: repairFaq({
      question: "How soon can someone come?",
      answer: "We'll tell you on the callback how soon we can get there.",
    }),
    serviceAreaLine: CORE_AREA_LINE,
  },
  {
    ...heatingCoolingPage("core"),
    slug: "heating-cooling",
    region: "core",
    towns: CORE_TOWNS,
    metaTitle: "Heat Pump & Air Conditioner Installation | Brampton & Mississauga",
    metaDescription:
      "Heat pump and central air conditioner installation in Brampton & Mississauga. One free in-home quote, priced upfront in writing. 10-year labour warranty.",
    eyebrow: "Heating & cooling · Brampton & Mississauga",
    faq: heatingCoolingFaq(),
    serviceAreaLine: CORE_AREA_LINE,
  },
  {
    ...installPage("outskirts"),
    slug: "outskirts/furnace-installation",
    region: "outskirts",
    towns: OUTSKIRTS_TOWNS,
    metaTitle: `Furnace Installation in Caledon, Orangeville, Milton & Barrie | From ${INSTALL_PRICE}`,
    metaDescription: `Brampton-based team installing new gas furnaces from ${INSTALL_PRICE} (base-tier) in ${OUTSKIRTS_EYEBROW_TOWNS}. Free in-home quote, price in writing.`,
    eyebrow: `Furnace installation · ${OUTSKIRTS_EYEBROW_TOWNS}`,
    subhead:
      "Brampton-based, and we come to you. Free in-home quote with your price in writing before work starts.",
    faq: [
      { question: "How much does a new furnace cost?", answer: INSTALL_COST_ANSWER },
      {
        question: "Do you install furnaces in Caledon, Orangeville, Milton and Barrie?",
        answer: outskirtsAreaAnswer,
      },
      {
        question: "Can you install it the same day?",
        answer:
          "Same-day installs are possible in some cases, and we confirm timing when we quote.",
      },
      FAQ_WARRANTY,
      FAQ_FREE_QUOTE,
    ],
    serviceAreaLine: OUTSKIRTS_AREA_LINE,
  },
  {
    ...repairPage("outskirts"),
    slug: "outskirts/furnace-repair",
    region: "outskirts",
    towns: OUTSKIRTS_TOWNS,
    metaTitle: "Furnace Repair in Caledon, Orangeville, Milton & Barrie | Free Quote",
    metaDescription: `Furnace not working? A Brampton-based team serving ${OUTSKIRTS_EYEBROW_TOWNS}. Callback ${CALLBACK_PROMISE}, price in writing before work begins.`,
    eyebrow: `Furnace repair · ${OUTSKIRTS_EYEBROW_TOWNS}`,
    faq: repairFaq({
      question: "Do you repair furnaces in Caledon, Orangeville, Milton and Barrie?",
      answer: `Yes, we're based in Brampton and serve ${OUTSKIRTS_LIST}. Enter your postal code and we'll confirm we can get to you.`,
    }),
    serviceAreaLine: OUTSKIRTS_AREA_LINE,
  },
  {
    ...heatingCoolingPage("outskirts"),
    slug: "outskirts/heating-cooling",
    region: "outskirts",
    towns: OUTSKIRTS_TOWNS,
    metaTitle: "Heat Pump & Air Conditioner Installation | Caledon, Orangeville, Milton & Barrie",
    metaDescription: `Heat pump and central air conditioner installation from a Brampton-based team serving ${OUTSKIRTS_EYEBROW_TOWNS}. Free in-home quote, priced in writing.`,
    eyebrow: `Heating & cooling · ${OUTSKIRTS_EYEBROW_TOWNS}`,
    faq: heatingCoolingFaq({
      question: "Do you install in Caledon, Orangeville, Milton and Barrie?",
      answer: outskirtsAreaAnswer,
    }),
    serviceAreaLine: OUTSKIRTS_AREA_LINE,
  },
];

export function getLandingPage(slug: LpSlug): LandingPageConfig {
  const config = LANDING_PAGES.find((page) => page.slug === slug);
  if (!config) throw new Error(`No landing page config for "${slug}"`);
  return config;
}

export function lpPath(slug: LpSlug): string {
  return `/lp/${slug}`;
}

/** The lp_* values sent with the lead and on GA4 events. */
export function lpContext(config: LandingPageConfig): LpContext {
  return { lp_slug: config.slug, lp_region: config.region, lp_service: config.service };
}

/** noindex/nofollow, self-canonical. Google Ads can still crawl the page. */
export function lpMetadata(config: LandingPageConfig): Metadata {
  return pageMetadata({
    title: config.metaTitle,
    description: config.metaDescription,
    path: lpPath(config.slug),
    noindex: true,
  });
}
