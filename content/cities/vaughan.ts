import type { CityContent } from "./types";
import imported from "./imports/vaughan.json";
import { orPlaceholders } from "./placeholders";
import { sharedReviews } from "./shared-reviews";
import { pickShared } from "./shared-issues";
import { sharedFaq } from "./shared-faqs";

// Vaughan: York Region. Area claims are source "consultant" (Appendix A.2,
// authorized by Patrick, hedged). Woodbridge and Kleinburg appear as
// geographic context for housing type only, never as a record of our work.
// Robin confirms or strikes the claims via INTAKE.md.

const vaughan: CityContent = {
  slug: "vaughan",
  name: "Vaughan",
  region: "York Region",
  seoTitle: "Furnace Repair & Installation in Vaughan | Top Choice HVAC",
  metaDescription:
    "Furnace repair, furnace and AC installation in Vaughan. Brampton-based, open 24/7, and we call you back, usually within 15 minutes.",
  answerBlock:
    "Top Choice HVAC is a residential heating and cooling contractor based in Brampton, Ontario, and we serve Vaughan and nearby cities. We repair furnaces and install furnaces and air conditioners. We are open 24/7, and when you call or request a quote we call you back, usually within 15 minutes.",
  introParagraph:
    "Vaughan has a lot of larger, newer detached houses in subdivisions, with older village-style cores such as Woodbridge and Kleinburg alongside. Bigger floor plans make for harder heating and cooling jobs: more square footage, more floors, and more rooms for one furnace and one AC to balance. Equipment from the newer subdivisions is also getting older. We cover Vaughan from our base in Brampton. We have completed furnace and AC installations in Vaughan over the past few years.",
  isHomeBase: false,
  // Supplied by Patrick (2026-10): no neighbourhood or year given, so none is shown.
  // Add more with the import script or here; see README.md.
  jobs: [
    ...imported.jobs,
    { service: "furnace-install", problem: "The furnace had died.", work: "Replaced the furnace.", photos: [], verified: true },
    { service: "furnace-repair", problem: "Gunk was blocking the return vents.", work: "Removed the gunk blocking the return vents.", photos: [], verified: true },
  ],
  // Real reviews reused across cities (shared-reviews.ts) until Robin tags reviews to Vaughan.
  reviews: orPlaceholders(imported.reviews, sharedReviews("Amarinder R.", "Shubminder R.")),
  issuesIntro:
    "Vaughan is in York Region, and the first two problems below follow from the size of its houses. Comfort complaints in a big floor plan often come down to airflow and equipment choice rather than a broken part. The rest are common faults we can describe for any system.",
  issues: [
    ...pickShared("no-heat"),
    {
      title: "Hot and cold rooms in a larger, multi-storey house",
      homeownerSays: "The upstairs bedrooms are warm, and the main floor or basement feels cold.",
      whatsUsuallyGoingOn:
        "Bigger multi-storey houses are harder to heat and cool evenly. One thermostat and one furnace try to cover several floors, and heat rises. That is why two-stage or variable-speed equipment, which runs longer at a lower output, and zoning often come up. They don't replace good duct design, but they can help even out the rooms.",
      whatWeDo:
        "We look at the duct layout, the airflow and how the house is split across floors before recommending anything, and tell you whether the fix is an airflow change or different equipment.",
      repairOrReplace:
        "Sometimes a duct or airflow adjustment is enough. If a furnace is being replaced anyway, a two-stage or variable-speed model, or zoning, is worth pricing.",
      emergency: { is: false },
      season: "year-round",
      appliesTo: "Larger multi-storey detached houses",
      source: "consultant",
    },
    {
      title: "Aging equipment and an AC that struggles in a heat wave",
      homeownerSays: "The AC runs through the afternoon in a heat wave and the house still doesn't cool down.",
      whatsUsuallyGoingOn:
        "Many larger houses in newer subdivisions were built with equipment that is now getting older. An AC can lose capacity with age, and a big floor plan asks a lot of it. Capacity, ductwork and airflow each matter, and a unit that was marginal when new feels worse in a heat wave.",
      whatWeDo:
        "We check how the AC is running, then the airflow and duct sizing, and tell you whether the problem is a repair, an airflow fix, or an AC that is too small or too worn for the house.",
      repairOrReplace:
        "Depends on age. A repair makes sense on a unit in good shape; a worn or undersized AC is a replacement conversation, and sizing for the floor plan matters.",
      emergency: {
        is: false,
        note: "In a heat wave, call right away if an older adult, a baby or someone unwell is at home.",
      },
      season: "summer",
      appliesTo: "Larger houses in newer subdivisions",
      source: "consultant",
    },
    ...pickShared("noisy-blower", "end-of-life"),
  ],
  neighbourhoodsServed: [],
  serviceBlurbs: {
    furnaceRepair:
      "A furnace that fails in a large house has a lot of space to lose heat from, so we treat a no-heat call as urgent and diagnose before we quote.",
    furnaceInstall:
      "Furnace installation in Vaughan starts from $2,199 for a base-tier furnace. For a larger floor plan we also price two-stage and variable-speed options.",
    acInstall:
      "We size air conditioners for the floor plan and the ductwork, not just the unit being replaced, which matters in a larger house.",
  },
  faqs: [
    {
      q: "Is a two-stage or variable-speed furnace worth it in a larger Vaughan house?",
      a: "Often, yes. A two-stage or variable-speed furnace runs longer at a lower output, which can even out temperatures across several floors. It costs more than a base-tier furnace, and it does not fix poor ducts, so we look at the airflow first and tell you honestly whether the upgrade is worth it.",
      cityspecific: true,
    },
    {
      q: "How do you size an AC for a big floor plan in Vaughan?",
      a: "We size it from the house, not from the old unit. That means the floor area, how the floors are laid out, the ductwork and the airflow. Bigger is not better, because an AC that is too large cools in short bursts and leaves the house humid. We explain the size we recommend and why.",
      cityspecific: true,
    },
    {
      q: "Can anything fix hot and cold rooms in a multi-storey Vaughan house?",
      a: "Often, yes, and it is not always new equipment. Rebalancing dampers, adding a return or fixing a duct run can help, and zoning or a two-stage furnace is an option when a system is being replaced. We start by measuring airflow so we recommend the smallest change that works.",
      cityspecific: true,
    },
    sharedFaq("pricing", "Vaughan"),
    sharedFaq("same-day", "Vaughan"),
    sharedFaq("warranty", "Vaughan"),
    sharedFaq("gas-and-co", "Vaughan"),
  ],
  hubLine: "Furnace and AC installation for larger Vaughan houses, including two-stage and variable-speed options.",
  lastReviewed: "2026-10",
  ready: true,
};

export default vaughan;
