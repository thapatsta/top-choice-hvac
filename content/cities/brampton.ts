import type { CityContent } from "./types";
import { TODO } from "./facts";
import imported from "./imports/brampton.json";
import { orPlaceholders, todoJob } from "./placeholders";
import { sharedReviews } from "./shared-reviews";
import { pickShared } from "./shared-issues";
import { sharedFaq } from "./shared-faqs";

// Brampton: home base, Peel Region.
// Area claims below are source "consultant" (Appendix A.2, authorized by
// Patrick, hedged). Robin confirms or strikes them via INTAKE.md.

const brampton: CityContent = {
  slug: "brampton",
  name: "Brampton",
  region: "Peel Region",
  seoTitle: "Furnace Repair & Installation in Brampton | Top Choice HVAC",
  metaDescription:
    "Furnace repair, furnace installation and AC installation in Brampton. We're based here, open 24/7, and call you back, usually within 15 minutes.",
  answerBlock:
    "Top Choice HVAC is a residential heating and cooling contractor based in Brampton, Ontario. We repair furnaces and install furnaces and air conditioners for homeowners in Brampton and nearby cities. We are open 24/7, and when you call or send a quote request we call you back, usually within 15 minutes.",
  introParagraph:
    "Brampton has grown quickly over the last few decades, so one street can have a house with a furnace from the day it was built next to one that was replaced last year. Many neighbourhoods are newer subdivisions with older, established areas beside them, and the age of the furnace and AC can differ a lot from one street to the next. We work out of Brampton. We have completed furnace and AC installations in Brampton over the past few years.",
  isHomeBase: true,
  // TODO_REAL_CONTENT: Robin to write 1-2 sentences on being based in
  // Brampton (we live and work here) and confirm he is happy with it on the
  // page. Facts Robin confirms only.
  homeBaseParagraph: TODO,
  // TODO_REAL_CONTENT: 4-5 real, verified Brampton jobs from Robin or Patrick
  // (neighbourhood or street, year, service, problem, what we did).
  jobs: orPlaceholders(imported.jobs, [todoJob("furnace-install"), todoJob("furnace-repair"), todoJob("ac-install"), todoJob("furnace-install")]),
  // Real reviews reused across cities (shared-reviews.ts) until Robin tags reviews to Brampton.
  reviews: orPlaceholders(imported.reviews, sharedReviews("Jasmeen D.", "Amarinder R.", "Shubminder R.")),
  issuesIntro:
    "Brampton is in Peel Region. Two of the problems below follow from how the city has grown, with newer subdivisions and finished basements. The rest can happen to any furnace or AC in any city, and we've included them because they are what people search for during a cold snap or a heat wave.",
  issues: [
    ...pickShared("no-heat"),
    {
      title: "Furnace or AC that is still the original equipment",
      homeownerSays: "The furnace is the one that came with the house, and it's starting to show its age.",
      whatsUsuallyGoingOn:
        "Brampton has grown quickly, and in many newer subdivisions the furnace and AC can still be the units installed when the house was built. Furnaces commonly last somewhere in the range of fifteen to twenty years, so replacement conversations tend to come up for houses from that era. Age matters more than the brand on the unit: a well-kept furnace can outlast a neglected one.",
      whatWeDo:
        "We look at the unit's age, its repair history and how it's running, and tell you whether another repair is worth it or whether to start planning a replacement.",
      repairOrReplace:
        "Depends on age. A one-part repair on a furnace that has run well is fine; a repeat repair on one in that fifteen-to-twenty-year range is when we talk replacement.",
      emergency: { is: false },
      season: "year-round",
      appliesTo: "Houses in Brampton's newer subdivisions, where the equipment dates from when the house was built",
      source: "consultant",
    },
    {
      title: "Cold basement or noisy returns in a finished basement",
      homeownerSays: "The basement is colder than the rest of the house, or the return grille whistles.",
      whatsUsuallyGoingOn:
        "A finished basement or basement apartment adds rooms, and people, to a duct system that was often laid out for less space. The ducts and returns can end up serving more than they were sized for. That can show up as cold rooms, whistling or noisy return grilles, and a furnace that runs longer to catch up.",
      whatWeDo:
        "We measure airflow, check the supply and return paths to the basement, and recommend the smallest change that fixes it, such as an added return or rebalanced dampers.",
      repairOrReplace:
        "Usually an airflow fix. If the furnace is also too small for the added space, or near the end of its life, it becomes a replacement conversation.",
      emergency: { is: false },
      season: "winter",
      appliesTo: "Houses with a finished basement or a basement apartment",
      source: "consultant",
    },
    ...pickShared("short-cycling", "ac-not-cooling", "end-of-life"),
  ],
  neighbourhoodsServed: [],
  serviceBlurbs: {
    furnaceRepair:
      "Being based in Brampton means we're close by, day or night, and we diagnose the fault before we quote the repair.",
    furnaceInstall:
      "Replacing a Brampton furnace starts from $2,199 for a base-tier furnace. We look at the venting, the ducts and, in houses with a finished basement, the airflow before we recommend a size.",
    acInstall:
      "We install and replace air conditioners in Brampton, sized to the house and its ductwork rather than to the unit that was there before.",
  },
  faqs: [
    {
      q: "Can you replace a furnace in a Brampton home with a finished basement?",
      a: "Yes. A finished basement or basement apartment changes how much space the furnace has to heat, so we check airflow and the ducts and returns that serve that space before recommending a size. The furnace may need to be bigger, or the ducts may need a change, and we tell you which at the visit.",
      cityspecific: true,
    },
    {
      q: "Can I get same-day furnace service in Brampton?",
      a: "Same-day service is possible in some cases, and being based in Brampton helps because we are usually close by. Call us and we'll give you a straight answer on timing when we call back, usually within 15 minutes. If you have no heat in cold weather, say so and we treat it as urgent.",
      cityspecific: true,
    },
    {
      q: "How do I know if my Brampton furnace is due for replacement?",
      a: "Age and repair history tell you a lot. Furnaces commonly last somewhere in the range of fifteen to twenty years, so a unit from the day the house was built, needing repeat repairs, is a candidate. We look at the furnace and tell you honestly whether to repair or replace.",
      cityspecific: true,
    },
    sharedFaq("pricing", "Brampton"),
    sharedFaq("warranty", "Brampton"),
    sharedFaq("callback", "Brampton"),
    sharedFaq("gas-and-co", "Brampton"),
  ],
  hubLine: "Our home base. Furnace repair, furnace installation and AC installation across Brampton.",
  lastReviewed: "2026-10",
  // Stays false until Robin and Patrick supply the jobs, reviews and the
  // home-base paragraph, and tests/cityContent.test.ts passes.
  ready: false,
};

export default brampton;
