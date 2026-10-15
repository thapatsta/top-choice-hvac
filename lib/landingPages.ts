// Copy and settings for the two config-driven Google Ads landing pages:
//
//   repair  → /lp/furnace-repair        (mockup A: call first)
//   install → /lp/furnace-installation  (mockup B: price first; live in ads)
//
// components/lp/LpTemplate.tsx renders either one; each route file only picks
// its entry. Every page-specific string lives here, not in JSX.
//
// Claims (tests/lpPages.test.ts scans this file's configs and the rendered
// pages): only the approved facts below. No street address, no round-the-
// clock wording, no credential claims, no years in business, no invented
// numbers. The other four ad pages still use lib/legacyLandingPages.ts.

// NAP-free on purpose (no lib/site.ts import): client components import this
// file, and nothing here may pull the street address into the browser bundle.

import {
  LP_PAGE_SLUGS,
  type LandingService,
  type LpContext,
  type LpPageKey,
} from "@/lib/landingPage";
import { GOOGLE_REVIEWS, googleMapsUrl } from "@/lib/googleReviews";
import { PHONE } from "@/lib/phone";
import { SERVICE_AREAS } from "@/lib/serviceAreas";

// ---------------------------------------------------------------------------
// Single constants
// ---------------------------------------------------------------------------

/** The advertised install price. Higher-efficiency models cost more. */
export const PRICE_FROM = "$2,199";

/**
 * How soon we call a landing-page lead back. Used on both pages, the legacy
 * pages and the thank-you card.
 * TODO confirm: does this hold outside business hours? (see the build report)
 */
export const CALLBACK_PROMISE = "usually within 15 minutes";

/**
 * TODO confirm: the Google listing showed 66 reviews on 2026-10-08
 * (GOOGLE_REVIEWS.count). This label is the owner's figure and is NOT
 * verified against the listing it sits next to.
 */
export const REVIEW_COUNT_LABEL = "100+ reviews";

/** From GOOGLE_REVIEWS (lib/site.ts), the one source of truth. */
export const GOOGLE_RATING = GOOGLE_REVIEWS.rating.toFixed(1);

/**
 * The Nov 1 maintenance offer: the slim banner, the tune-up section and the
 * install form's checkbox. No price or discount terms are confirmed, so none
 * are stated. Hidden automatically from `endsAt` (midnight, Toronto time;
 * EDT is still in effect then) by isPromoActive(), on the server and in the
 * browser, so a page built before the deadline also hides it after.
 */
export const MAINTENANCE_PROMO = {
  enabled: true,
  endsAt: "2026-11-01T00:00:00-04:00",
  pill: "Before Nov 1",
  text: "Preferred maintenance pricing",
  checkboxLabel: "Also tell me about maintenance pricing (before Nov 1)",
  section: {
    heading: "Book your furnace tune-up before November 1",
    body: "A check-up now catches problems before the first cold snap. Book before November 1 and you get preferred pricing on maintenance.",
    cta: "Ask about maintenance pricing",
  },
} as const;

export function isPromoActive(now: number = Date.now()): boolean {
  return MAINTENANCE_PROMO.enabled && now < Date.parse(MAINTENANCE_PROMO.endsAt);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LpFaqItem {
  question: string;
  answer: string;
  /** Optional link rendered after the answer. */
  link?: { href: string; label: string };
}

export interface LpPhoto {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

/** A call link (tap-to-call) or an in-page anchor. */
export type LpLink =
  | { kind: "call"; label: string; trackId: string }
  | { kind: "anchor"; label: string; href: `#${string}`; trackId: string };

export type LpFormConfig =
  | {
      /** Repair: name + phone in one row, fixed service. */
      variant: "callback";
      intro: string;
      button: string;
      service: LandingService;
      namePlaceholder: string;
      phonePlaceholder: string;
      /** Shown once the visitor picks "Ask about maintenance pricing". */
      maintenanceNote: string;
    }
  | {
      /** Install: card with name, phone, service select, checkbox. */
      variant: "quote";
      heading: string;
      sub: string;
      button: string;
      serviceLabel: string;
      serviceOptions: { value: LandingService; label: string }[];
      defaultService: LandingService;
      /** Fine print; the display number becomes a tap-to-call link. */
      fine: string;
    };

export interface LpForkCard {
  title: string;
  body: string;
  points: string[];
  button: string;
  /** Sets the form's service when the card's button is used. */
  pick: LandingService;
}

export interface LpPageConfig {
  key: LpPageKey;
  slug: (typeof LP_PAGE_SLUGS)[LpPageKey];
  /** lp_* values for the lead, GA4 events and click_to_call. */
  lp: LpContext;
  theme: LpPageKey;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** Install: the very large price under the h1. */
  heroPrice?: string;
  /** Repair: the lead paragraph. Install: the price note. */
  subhead: string;
  /** Install: the animated checklist. */
  checklist?: string[];
  /** Repair: the full-width call button. */
  heroCall?: LpLink & { kind: "call" };
  heroPhoto?: LpPhoto;
  form: LpFormConfig;
  teaser: LpLink;
  fork?: { heading: string; cards: [LpForkCard, LpForkCard] };
  reviews: { heading: string; lead?: string; googleLink: string };
  steps?: { heading: string; items: { lead: string; rest: string }[]; note: string };
  photoSection?: { heading: string; photo: LpPhoto };
  faqHeading: string;
  faq: LpFaqItem[];
  closing: { heading: string; cta: LpLink; fine?: string };
  sticky: { call: string; alt: { label: string; href: `#${string}` } };
}

// ---------------------------------------------------------------------------
// Shared copy
// ---------------------------------------------------------------------------

const CALL_LABEL = `Call ${PHONE.display}`;

const nearby = SERVICE_AREAS.filter((a) => a !== "Brampton" && a !== "Mississauga");
const AREA_LIST = `${nearby.slice(0, -1).join(", ")} and ${nearby.at(-1)}`;

/** Footer line on both pages. */
export const SERVICE_AREA_LINE = `Serving ${SERVICE_AREAS.slice(0, -1).join(", ")} and ${SERVICE_AREAS.at(-1)}.`;

/** The real Google listing (site.googleReviewsUrl). */
export const GOOGLE_REVIEWS_URL = googleMapsUrl;

// TODO confirm: the repair-price promise ("you will know the price before we
// start any repair") and whether a diagnostic / service-call fee applies.
// The wording is the mockup's; the page says nothing about a fee.
const REPAIR_PRICE_PROMISE = "You will know the price before we start any repair.";

const faqSameDay: LpFaqItem = {
  question: "Can you install it the same day?",
  answer: "In many cases, yes. It depends on the model and your home. We confirm timing when we quote.",
};
const faqWarranty: LpFaqItem = {
  question: "What does the 10-year labour warranty cover?",
  answer:
    "Every furnace we install has a 10-year labour warranty, on top of the manufacturer's equipment warranty. We go over the details with you at your visit.",
};
const faqArea: LpFaqItem = {
  question: "Where do you work?",
  answer: `Brampton and Mississauga, plus ${AREA_LIST}.`,
};
const faqRepairCost: LpFaqItem = {
  question: "How much does a furnace repair cost?",
  answer: `It depends on what's wrong. We tell you the price before we start any repair.`,
};

function faqFor(installPhrase: string): LpFaqItem[] {
  return [
    faqRepairCost,
    {
      question: "Should I repair or replace my furnace?",
      answer: `If the repair makes sense, we'll do it. If your furnace is old or the repair costs too much, we'll tell you straight and quote a replacement. ${installPhrase} ${PRICE_FROM}.`,
    },
    {
      question: "How much does a new furnace cost?",
      answer: `${installPhrase} ${PRICE_FROM}. Larger and higher-efficiency models cost more. We confirm your exact price in writing at a free in-home visit, before any work begins.`,
    },
    faqSameDay,
    faqWarranty,
    faqArea,
  ];
}

const googleLink = "Read reviews on Google";

// ---------------------------------------------------------------------------
// The two pages
// ---------------------------------------------------------------------------

const repair: LpPageConfig = {
  key: "repair",
  slug: LP_PAGE_SLUGS.repair,
  lp: { lp_slug: LP_PAGE_SLUGS.repair, lp_region: "core", lp_service: "repair" },
  theme: "repair",
  metaTitle: "Furnace Repair in Brampton, Mississauga & the GTA",
  metaDescription: `Furnace broken? Call ${PHONE.display} for a repair. You'll know the price before we start any repair. Or leave your number and we'll call you, ${CALLBACK_PROMISE}.`,
  h1: "Furnace broken? Call us for a repair.",
  subhead: `We repair furnaces across the GTA. Call, tell us what is happening, and we will tell you what we can do today. ${REPAIR_PRICE_PROMISE}`,
  heroCall: { kind: "call", label: CALL_LABEL, trackId: "lp_repair_hero" },
  heroPhoto: {
    src: "/lp/lennox.jpg",
    width: 900,
    height: 1125,
    alt: "A new Lennox gas furnace installed in a home, with its venting and gas line connected",
  },
  form: {
    variant: "callback",
    intro: `Rather not talk right now? Leave your number and we'll call you, ${CALLBACK_PROMISE}.`,
    button: "Call me",
    service: "furnace-repair",
    namePlaceholder: "Name",
    phonePlaceholder: "Phone number",
    maintenanceNote: "We'll also tell you about maintenance pricing.",
  },
  teaser: {
    kind: "anchor",
    label: `Furnace old, or failing again? New furnace installation starts at ${PRICE_FROM}`,
    href: "#fork",
    trackId: "lp_repair_teaser",
  },
  fork: {
    heading: "Repair it or replace it, we will tell you straight",
    cards: [
      {
        title: "Furnace repair",
        body: "Not heating, making noises, or just not right.",
        points: [
          "A technician comes to your home",
          "You know the repair price before work starts",
          "If replacing makes more sense, we say so",
        ],
        button: "Book a repair",
        pick: "furnace-repair",
      },
      {
        title: "New furnace",
        body: `New furnace installation starts at ${PRICE_FROM}.`,
        points: [
          "Free in-home quote, price in writing",
          "10-year labour warranty on every install",
          "Same-day install in many cases",
        ],
        button: "Get a new furnace quote",
        pick: "new-furnace-install",
      },
    ],
  },
  reviews: { heading: "What customers say", googleLink },
  steps: {
    heading: "What happens when you call",
    items: [
      { lead: "We pick up and ask about your furnace.", rest: "What it is doing, how old it is, the brand." },
      { lead: "We come to your home", rest: "and look at it." },
      {
        lead: "You get the price in writing before any work starts.",
        rest: "If you go ahead, we book it. In many cases we can install a new furnace the same day.",
      },
    ],
    note: "Every new furnace we install comes with a 10-year labour warranty.",
  },
  faqHeading: "Questions",
  faq: faqFor("New furnace installation starts at"),
  closing: {
    heading: "Cold house? Call now.",
    cta: { kind: "call", label: CALL_LABEL, trackId: "lp_repair_closing" },
  },
  sticky: { call: CALL_LABEL, alt: { label: "Call me back", href: "#quote" } },
};

const install: LpPageConfig = {
  key: "install",
  slug: LP_PAGE_SLUGS.install,
  lp: { lp_slug: LP_PAGE_SLUGS.install, lp_region: "core", lp_service: "install" },
  theme: "install",
  metaTitle: `New Furnace Installation in the GTA | From ${PRICE_FROM}`,
  metaDescription: `A new furnace, installed, from ${PRICE_FROM}. Larger and higher-efficiency models cost more. Exact price in writing at a free in-home visit. 10-year labour warranty.`,
  h1: "A new furnace, installed, from",
  heroPrice: PRICE_FROM,
  subhead:
    "Larger and higher-efficiency models cost more. You get your exact price in writing at a free visit to your home, before any work starts.",
  checklist: [
    "A technician comes to your home",
    "Price in writing before any work starts",
    "Honest repair-or-replace advice",
    "10-year labour warranty on every install",
  ],
  form: {
    variant: "quote",
    heading: "Get your price",
    sub: `We call you back, ${CALLBACK_PROMISE}.`,
    button: "Get my price",
    serviceLabel: "What do you need?",
    serviceOptions: [
      { value: "new-furnace-install", label: "New furnace" },
      { value: "furnace-repair", label: "Furnace repair" },
      { value: "not-sure", label: "Not sure yet" },
    ],
    defaultService: "new-furnace-install",
    fine: `We never sell your information. Prefer to talk? ${PHONE.display}`,
  },
  teaser: {
    kind: "call",
    label: `Furnace not working right now? We repair too. Call ${PHONE.display}`,
    trackId: "lp_install_teaser",
  },
  reviews: {
    heading: "Reviews from Google",
    lead: "Homeowners across the GTA, in their own words.",
    googleLink,
  },
  photoSection: {
    heading: "One of our installs",
    photo: {
      src: "/lp/basement.jpg",
      width: 900,
      height: 1125,
      alt: "A new gas furnace installed in a finished basement, with its venting run along the wall",
      caption: "New furnace in a finished basement, venting run neatly along the wall.",
    },
  },
  faqHeading: "Questions",
  faq: faqFor("New furnaces start at"),
  closing: {
    heading: "Ready to get your price?",
    cta: { kind: "anchor", label: "Get my price", href: "#quote", trackId: "lp_install_closing" },
    fine: `Or call ${PHONE.display}`,
  },
  sticky: { call: CALL_LABEL, alt: { label: "Free quote", href: "#quote" } },
};

export const LP_PAGES: Record<LpPageKey, LpPageConfig> = { repair, install };
