import type { CityContent } from "./types";
import imported from "./imports/mississauga.json";
import { orPlaceholders, todoJob, todoReview } from "./placeholders";
import { pickShared } from "./shared-issues";
import { sharedFaq } from "./shared-faqs";

// Mississauga: Peel Region. Area claims are source "consultant" (Appendix
// A.2, authorized by Patrick, hedged). Robin confirms or strikes them via
// INTAKE.md.

const mississauga: CityContent = {
  slug: "mississauga",
  name: "Mississauga",
  region: "Peel Region",
  seoTitle: "Furnace Repair & Install in Mississauga | Top Choice HVAC",
  metaDescription:
    "Furnace repair, furnace and AC installation in Mississauga. Brampton-based, open 24/7, and we call you back, usually within 15 minutes.",
  answerBlock:
    "Top Choice HVAC is a residential HVAC contractor based in Brampton, Ontario, serving Mississauga and nearby cities. We repair furnaces and install furnaces and air conditioners. You can reach us 24/7, and when you call or request a quote we call you back, usually within 15 minutes.",
  introParagraph:
    "Mississauga is a mix of eras. There are established older areas, newer builds, and a lot of townhomes and condos, and each one raises different questions when a furnace or AC needs work. An older furnace may need its venting changed, a townhome may put the equipment in a small closet, and a newer build may simply be due for its first replacement. We cover Mississauga from our base in Brampton, also in Peel Region.",
  isHomeBase: false,
  // TODO_REAL_CONTENT: 2-3 real, verified Mississauga jobs from Robin or Patrick.
  jobs: orPlaceholders(imported.jobs, [todoJob("furnace-install"), todoJob("ac-install")]),
  // TODO_REAL_CONTENT: 2+ Google reviews tagged to Mississauga by Robin.
  reviews: orPlaceholders(imported.reviews, [todoReview(), todoReview()]),
  issuesIntro:
    "Mississauga is in Peel Region and has a wide range of housing, so the problems below start with the ones that depend on the building and then cover the ones that can happen to any system. Two of them concern venting and tight mechanical closets, which can change what a furnace or AC replacement involves.",
  issues: [
    {
      title: "Replacing an older chimney-vented furnace",
      homeownerSays: "The new furnace quote came back bigger than a simple like-for-like swap.",
      whatsUsuallyGoingOn:
        "Many older furnaces vent up a chimney. A high-efficiency furnace gives off cooler exhaust that a chimney often can't carry safely, so it uses plastic vent pipe out through a wall or the roof, plus a condensate drain for the water the furnace produces. In Mississauga's older areas, that can make the job bigger than swapping one box for another.",
      whatWeDo:
        "We look at how the current furnace is vented, plan the new vent route and drain before we quote, and put the venting work in the quote up front.",
      repairOrReplace:
        "This is a replacement job. A repair is fine while the furnace is healthy; when it's time to replace, the venting is part of the scope.",
      emergency: { is: false },
      season: "winter",
      appliesTo: "Older furnaces that vent through a chimney, which can turn up in Mississauga's older areas",
      source: "consultant",
    },
    ...pickShared("condensate-drain"),
    {
      title: "Furnace or AC in a townhome or condo mechanical closet",
      homeownerSays: "The furnace sits in a small closet, and getting at it looks tight.",
      whatsUsuallyGoingOn:
        "Townhomes and condos often put the furnace or air handler in a compact mechanical closet with limited access. That affects which size and type of equipment will fit, how it can be vented and whether a replacement can be carried in. Building or condominium rules may also affect when work can be done and what equipment can be changed.",
      whatWeDo:
        "We check the closet, the way in and the venting before choosing equipment, and we tell you early if the building's rules need to be checked with the property manager.",
      repairOrReplace:
        "Either. A repair is much the same job anywhere, but a replacement may need a different model to fit the space.",
      emergency: { is: false },
      season: "year-round",
      appliesTo: "Townhomes and condos",
      source: "consultant",
    },
    ...pickShared("ac-not-cooling", "thermostat"),
  ],
  neighbourhoodsServed: [],
  serviceBlurbs: {
    furnaceRepair:
      "We diagnose the fault first and explain it before quoting the repair, whether the furnace is in a basement, a utility room or a closet.",
    furnaceInstall:
      "Furnace installation in Mississauga starts from $2,199 for a base-tier furnace. Older chimney-vented furnaces can need venting and a drain added, which we price before starting.",
    acInstall:
      "We install and replace air conditioners in Mississauga, and for townhomes and condos we check access and building rules before choosing a unit.",
  },
  faqs: [
    {
      q: "Can you replace a furnace or AC in a Mississauga condo or townhome?",
      a: "Yes, with a few extra checks. Condos and townhomes often have a compact mechanical closet with limited access, so we measure the space and the way in before choosing equipment. Building rules may also affect when work can be done or what can be changed, so we suggest checking with your property manager.",
      cityspecific: true,
    },
    {
      q: "Does a high-efficiency furnace need different venting?",
      a: "Usually, yes. A high-efficiency furnace uses plastic vent pipe and a condensate drain instead of an old chimney flue. When we replace an older chimney-vented furnace in Mississauga, the new vent route and drain are part of the job, and we show them in the quote before starting.",
      cityspecific: true,
    },
    {
      q: "Why can replacing an older Mississauga furnace cost more than a straight swap?",
      a: "Because the work around the furnace can change. An older chimney-vented unit may need a new vent route, a condensate drain and sometimes a different location for the equipment. We walk through each of those at the visit and put them in the written quote, so you aren't surprised partway through.",
      cityspecific: true,
    },
    sharedFaq("pricing", "Mississauga"),
    sharedFaq("no-heat", "Mississauga"),
    sharedFaq("gas-and-co", "Mississauga"),
  ],
  hubLine: "Furnace and AC replacements in Mississauga, including venting changes on older chimney-vented furnaces.",
  lastReviewed: "2026-10",
  // Stays false until Robin and Patrick supply the jobs and reviews and the
  // guard passes.
  ready: false,
};

export default mississauga;
