import type { CityContent } from "./types";
import imported from "./imports/etobicoke.json";
import { orPlaceholders } from "./placeholders";
import { sharedReviews } from "./shared-reviews";
import { pickShared } from "./shared-issues";
import { sharedFaq } from "./shared-faqs";

// Etobicoke: City of Toronto. Area claims are source "consultant" (Appendix
// A.2, authorized by Patrick, hedged). Mimico and Humber Bay appear as
// geographic context for housing type only, never as a record of our work.
// Robin confirms or strikes the claims via INTAKE.md.

const etobicoke: CityContent = {
  slug: "etobicoke",
  name: "Etobicoke",
  region: "City of Toronto",
  seoTitle: "Furnace Repair & Installation in Etobicoke | Top Choice HVAC",
  metaDescription:
    "Furnace repair, furnace and AC installation in Etobicoke. Brampton-based, open 24/7, and we call you back, usually within 15 minutes.",
  answerBlock:
    "Top Choice HVAC is a residential HVAC contractor based in Brampton, Ontario, and we serve Etobicoke in the City of Toronto and nearby cities. We repair furnaces and install furnaces and air conditioners. Call us 24/7, and when you call or request a quote we call you back, usually within 15 minutes.",
  introParagraph:
    "A large share of Etobicoke's housing is older, including many mid-century houses, and there are condos near the waterfront in areas like Mimico and Humber Bay. Older houses can come with older ductwork and chimney-vented furnaces, which affects what a replacement involves. Condos and low-rise buildings have their own limits on space and venting. We serve Etobicoke from our base in Brampton. We have completed furnace and AC installations in Etobicoke over the past few years.",
  isHomeBase: false,
  // Supplied by Patrick (2026-10): no neighbourhood or year given, so none is shown.
  // Add more with the import script or here; see README.md.
  jobs: [
    ...imported.jobs,
    { service: "furnace-install", problem: "The furnace had died.", work: "Replaced the furnace.", photos: [], verified: true },
  ],
  // Real reviews reused across cities (shared-reviews.ts) until Robin tags reviews to Etobicoke.
  reviews: orPlaceholders(imported.reviews, sharedReviews("Jasmeen D.", "Shubminder R.")),
  issuesIntro:
    "Etobicoke is part of the City of Toronto, and a lot of its housing is older. The first two problems below follow from that: ductwork that is as old as the house, and furnaces that still vent through a chimney. The rest can happen to any system.",
  issues: [
    {
      title: "Older ductwork that limits how well new equipment works",
      homeownerSays: "Some rooms stay uncomfortable, or the system is louder than it should be.",
      whatsUsuallyGoingOn:
        "Older houses can have ductwork as old as the house itself, and the return side is often too small for modern equipment. New equipment can move more air than undersized returns can supply, which means noise, uneven comfort and a system that works harder than it should. Airflow is worth checking before a size is chosen.",
      whatWeDo:
        "We check the duct condition and the return capacity before sizing equipment, and tell you if the ducts need work for the new system to perform.",
      repairOrReplace:
        "Part of a replacement. If ductwork changes are needed, they belong in the quote from the start, not as a surprise later.",
      emergency: { is: false },
      season: "year-round",
      appliesTo: "Older houses, including many mid-century houses",
      source: "consultant",
    },
    {
      title: "Older chimney-vented furnaces and tight mechanical spaces",
      homeownerSays: "The old furnace vents through a chimney, and the space around it is tight.",
      whatsUsuallyGoingOn:
        "Older chimney-vented furnaces often need new venting when they are replaced with a high-efficiency model, along with a condensate drain. Condos and low-rise buildings can also have tight mechanical spaces, which limit which equipment fits and how it can be vented.",
      whatWeDo:
        "We look at the existing vent and the space it sits in before we quote, and we put any venting or drain work in the written price.",
      repairOrReplace:
        "A replacement job. The venting and the space decide the scope more than the furnace itself does.",
      emergency: { is: false },
      season: "winter",
      appliesTo: "Older chimney-vented furnaces, condos and low-rise buildings",
      source: "consultant",
    },
    ...pickShared("short-cycling", "r22-ac", "safety"),
  ],
  neighbourhoodsServed: [],
  serviceBlurbs: {
    furnaceRepair:
      "We find the fault before quoting the repair, and if the furnace is old enough that repair stops making sense, we say so.",
    furnaceInstall:
      "Furnace installation in Etobicoke starts from $2,199 for a base-tier furnace. In an older house we check the ductwork and the vent before we price it.",
    acInstall:
      "We install and replace air conditioners in Etobicoke, and we check the ductwork and returns first so the new unit can move the air it is rated for.",
  },
  faqs: [
    {
      q: "What does replacing an older chimney-vented furnace in Etobicoke involve?",
      a: "More than swapping the furnace. A high-efficiency replacement usually vents through plastic pipe out a wall or the roof instead of the chimney, and it needs a condensate drain. We check the existing vent and the space before quoting, and any venting work appears in the written price.",
      cityspecific: true,
    },
    {
      q: "Does the ductwork need work when new equipment goes into an older Etobicoke house?",
      a: "Sometimes. Older ductwork and undersized returns can limit how well new equipment performs, so we check airflow before choosing a size. If the ducts need changes, we tell you what and why. If they are fine, we leave them alone and say so.",
      cityspecific: true,
    },
    {
      q: "Can you replace a furnace or AC in an Etobicoke condo or low-rise building?",
      a: "Often, yes. Condos and low-rise buildings can have tight mechanical spaces and rules about equipment changes, so we check the space and access before choosing a model. We suggest confirming the building's rules with your property manager before a replacement is booked.",
      cityspecific: true,
    },
    sharedFaq("pricing", "Etobicoke"),
    sharedFaq("callback", "Etobicoke"),
    sharedFaq("gas-and-co", "Etobicoke"),
  ],
  hubLine: "Furnace and AC work in Etobicoke, from older chimney-vented furnaces to ductwork checks before a new install.",
  lastReviewed: "2026-10",
  ready: true,
};

export default etobicoke;
