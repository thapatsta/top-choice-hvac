// Data model for the /service-area/<city> pages. The template
// (components/city/CityPage.tsx) renders structure only; every local fact
// lives in a typed file here. See README.md in this folder.

export type Source = "robin" | "patrick" | "consultant" | "general";

export type Photo = { src: string; alt: string };

export type Job = {
  /** Neighbourhood or street. Never a house number. */
  neighbourhood: string;
  service: "furnace-repair" | "furnace-install" | "ac-install";
  problem: string;
  work: string;
  year: number;
  /** Empty for now. Files go in public/images/cities/<city>/. */
  photos?: Photo[];
  /** True only when Robin or Patrick supplied the job. */
  verified: boolean;
};

export type Review = {
  /** First name only. */
  firstName: string;
  stars: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** "2025-11" */
  date?: string;
  /** "not-city-specific": a real review shown on every city page, never labelled as from that city. */
  citySource: "robin-tagged" | "address-confirmed" | "not-city-specific";
};

export type Issue = {
  title: string;
  homeownerSays: string;
  whatsUsuallyGoingOn: string;
  whatWeDo: string;
  repairOrReplace: string;
  /** `is`: usually treated as urgent. `note`: when to call right away. */
  emergency: { is: boolean; note?: string };
  season: "winter" | "summer" | "year-round";
  /** Only for robin / patrick / consultant sources. */
  appliesTo?: string;
  source: Source;
};

export type Faq = { q: string; a: string; cityspecific: boolean };

export type CityContent = {
  /** "brampton". Also the URL segment. */
  slug: string;
  name: string;
  /** "Peel Region" | "York Region" | "City of Toronto" */
  region: string;
  /** Unique, <= 60 chars, brand included. Used as an absolute title. */
  seoTitle: string;
  /** Unique, <= 155 chars. */
  metaDescription: string;
  /** 40-60 words, standalone. */
  answerBlock: string;
  /** Unique per city. */
  introParagraph: string;
  isHomeBase: boolean;
  /** Home base only: the "Based in Brampton" paragraph. Facts Robin confirms. */
  homeBaseParagraph?: string;
  jobs: Job[];
  reviews: Review[];
  issuesIntro: string;
  issues: Issue[];
  /** Only neighbourhoods supplied by Robin or Patrick. May be empty. */
  neighbourhoodsServed: string[];
  serviceBlurbs: { furnaceRepair: string; furnaceInstall: string; acInstall: string };
  faqs: Faq[];
  /** One unique line for the hub card, llms.txt and the strip. */
  hubLine: string;
  /** "2026-10". Bump only when content actually changes. */
  lastReviewed: string;
  /** True only when every required slot is real and the guard passes. */
  ready: boolean;
};
