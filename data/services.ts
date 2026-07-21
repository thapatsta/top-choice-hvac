export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceProcessStep {
  title: string;
  description: string;
}

export interface Service {
  slug: string;
  name: string;
  icon:
    | "flame"
    | "snowflake"
    | "wind"
    | "layout-panel-left"
    | "droplets"
    | "sparkles"
    | "calendar-check"
    | "building-2";
  heroTagline: string;
  intro: string;
  signsYouNeedIt: string[];
  process: ServiceProcessStep[];
  financingNote: string;
  rebateNote: string;
  faqs: ServiceFAQ[];
  metaDescription: string;
}

const standardProcess: ServiceProcessStep[] = [
  {
    title: "Call or book online",
    description:
      "Reach us by phone or submit a request through our instant estimate tool. We'll ask a few quick questions about your system and the issue.",
  },
  {
    title: "Free in-home assessment",
    description:
      "A technician inspects your system on-site, diagnoses the issue, and walks you through your options in plain language — no jargon.",
  },
  {
    title: "Upfront, written quote",
    description:
      "You get a clear price before any work begins. No surprise charges after the job is done.",
  },
  {
    title: "Work completed, area cleaned up",
    description:
      "We complete the repair or install, test the system thoroughly, and leave your home the way we found it.",
  },
];

export const services: Service[] = [
  {
    slug: "furnace-repair",
    name: "Furnace Repair",
    icon: "flame",
    heroTagline: "Fast, honest furnace repair when the heat goes out.",
    intro:
      "A furnace that won't start, won't stay lit, or is blowing cold air is more than an inconvenience in a Canadian winter — it's a safety issue. Our technicians diagnose the actual cause instead of guessing at parts, and explain what's wrong before any work begins.",
    signsYouNeedIt: [
      "Furnace won't turn on or keeps shutting off shortly after starting",
      "Blowing cold or lukewarm air instead of heat",
      "Strange smells (especially a burning or gas odour) when the furnace runs",
      "Loud banging, screeching, or rattling noises from the unit",
      "Noticeably higher gas bills with no change in usage",
      "Thermostat set correctly but the house still won't warm up",
    ],
    process: standardProcess,
    financingNote:
      "Repairs can often be billed on the spot; larger repairs may qualify for our financing options. See /financing for details.",
    rebateNote:
      "Repairs generally don't qualify for efficiency rebates, but if a repair isn't cost-effective, we'll tell you honestly when replacement makes more sense — and what rebates apply to a new install.",
    faqs: [
      {
        question: "How quickly can you get to my home?",
        answer:
          "For no-heat emergencies, we prioritize same-day response whenever possible.", // TODO: confirm real response-time commitment before launch
      },
      {
        question: "Do you repair all furnace brands?",
        answer:
          "Yes — our technicians work on all major residential furnace brands, regardless of where it was purchased or installed.",
      },
      {
        question: "Is the diagnostic visit free?",
        answer:
          "The in-home assessment is free, and you'll always get a written quote before we do any paid work.",
      },
    ],
    metaDescription:
      "24/7 furnace repair in Brampton & the GTA. Upfront pricing, honest diagnosis, and fast response when your heat goes out. Book a free assessment.",
  },
  {
    slug: "furnace-installation",
    name: "Furnace Installation & Replacement",
    icon: "flame",
    heroTagline: "A properly sized furnace, installed right the first time.",
    intro:
      "An oversized or undersized furnace wastes money and wears out faster. We size every replacement to your actual home — not a one-size-fits-all guess — and walk you through efficiency tiers so you know exactly what you're paying for and why.",
    signsYouNeedIt: [
      "Furnace is 15+ years old or was previously repaired multiple times in one season",
      "Rising repair costs that are approaching the cost of a new unit",
      "Uneven heating between rooms or floors",
      "You're renovating or adding square footage and need updated capacity",
      "You want to upgrade to a higher-efficiency model to cut heating bills",
    ],
    process: standardProcess,
    financingNote:
      "Furnace replacements are financeable — see our /financing page for estimated monthly payments on different loan terms.",
    rebateNote:
      "High-efficiency furnace upgrades may qualify for Ontario/federal rebate programs. See /rebates for current programs (verify amounts before purchase — they change).",
    faqs: [
      {
        question: "How long does a furnace replacement take?",
        answer:
          "Most residential furnace replacements are completed in a single day.", // TODO: confirm typical install time
      },
      {
        question: "What size furnace do I need?",
        answer:
          "Sizing depends on your home's square footage, insulation, window count, and layout — not just square footage alone. Our free in-home assessment includes a proper load calculation rather than a rule-of-thumb estimate.",
      },
      {
        question: "Do you remove the old furnace?",
        answer:
          "Yes, removal and disposal of your old unit is included in every installation.",
      },
    ],
    metaDescription:
      "Furnace installation and replacement in Brampton, ON. Properly sized systems, upfront pricing, and rebate guidance. Get a free in-home quote.",
  },
  {
    slug: "ac-repair",
    name: "Air Conditioner Repair",
    icon: "snowflake",
    heroTagline: "AC down on the hottest day? We get it running again.",
    intro:
      "Air conditioner problems always seem to show up during a heat wave. Our technicians carry common parts on the truck to fix most issues in a single visit, and will always tell you honestly when a repair isn't worth it versus replacing an aging unit.",
    signsYouNeedIt: [
      "AC is running but not cooling the house",
      "Warm air coming from the vents",
      "Ice forming on the indoor coil or refrigerant lines",
      "Water pooling near the indoor unit",
      "Unusual noises or a burning smell when the system runs",
      "AC cycles on and off frequently (short cycling)",
    ],
    process: standardProcess,
    financingNote:
      "Repairs can typically be billed directly; larger repairs may be financed — see /financing.",
    rebateNote:
      "Repairs don't typically qualify for rebates. If your unit is near end-of-life, ask about replacement rebates during your visit.",
    faqs: [
      {
        question: "Why is my AC running but not cooling?",
        answer:
          "This is commonly low refrigerant (a sign of a leak), a failing compressor, a dirty condenser coil, or a clogged filter restricting airflow. A technician can pinpoint the exact cause on-site.",
      },
      {
        question: "Can you service my AC the same day I call?",
        answer:
          "We prioritize no-cooling calls during heat waves whenever possible.", // TODO: confirm same-day capacity commitment
      },
    ],
    metaDescription:
      "Air conditioner repair in Brampton & the GTA. Same-system diagnostics, upfront pricing, and fast response during heat waves.",
  },
  {
    slug: "ac-installation",
    name: "Air Conditioner Installation & Replacement",
    icon: "snowflake",
    heroTagline: "A right-sized cooling system for the way you actually live.",
    intro:
      "An oversized AC cools fast but leaves your home humid and uncomfortable; an undersized one runs constantly and still can't keep up. We size and install systems based on a proper load calculation, not a guess based on your old unit's tonnage.",
    signsYouNeedIt: [
      "AC is 12–15+ years old",
      "Uses the older R-22 refrigerant, which is being phased out and increasingly expensive to service",
      "Frequent repairs in the last two summers",
      "Rooms that never cool evenly no matter what you do",
      "You want a quieter, more efficient system",
    ],
    process: standardProcess,
    financingNote: "AC replacements are financeable — see /financing for estimated monthly payments.",
    rebateNote:
      "Higher-SEER systems may qualify for utility or provincial rebates. See /rebates (verify current amounts before purchase).",
    faqs: [
      {
        question: "How long does an AC installation take?",
        answer: "Most residential AC installations are completed in a single day.", // TODO: confirm typical install time
      },
      {
        question: "Should I replace my furnace and AC at the same time?",
        answer:
          "Not necessarily, but if both systems are aging, replacing them together can reduce total labour cost and ensure the systems are properly matched. We'll give you an honest recommendation either way.",
      },
    ],
    metaDescription:
      "Air conditioner installation and replacement in Brampton, ON. Properly sized systems, upfront pricing, rebate guidance. Free in-home quote.",
  },
  {
    slug: "heat-pumps",
    name: "Heat Pumps",
    icon: "wind",
    heroTagline: "One system for heating and cooling, built for Canadian winters.",
    intro:
      "Modern cold-climate heat pumps can heat efficiently well below freezing, and cool your home in summer from the same outdoor unit. We help you decide whether a heat pump makes sense as a furnace replacement, an AC replacement, or a dual-fuel setup alongside your existing furnace.",
    signsYouNeedIt: [
      "You want to lower reliance on gas heating",
      "You're replacing an aging furnace and AC at the same time",
      "You're interested in provincial or federal heat pump incentive programs",
      "You want a single system that both heats and cools",
    ],
    process: standardProcess,
    financingNote: "Heat pump installations are financeable — see /financing.",
    rebateNote:
      "Heat pumps are currently a priority category for several Ontario and federal incentive programs. See /rebates for current program details (verify before purchase — this is the fastest-changing rebate category).",
    faqs: [
      {
        question: "Do heat pumps actually work in Canadian winters?",
        answer:
          "Cold-climate heat pump models are designed to keep working efficiently well below freezing. In extreme cold, a dual-fuel setup (heat pump + backup furnace) can be the more practical choice — we'll help you evaluate both.",
      },
      {
        question: "Can a heat pump replace my furnace entirely?",
        answer:
          "It can, depending on your home's heat loss and your comfort expectations in extreme cold. We'll walk through the tradeoffs during your in-home assessment rather than pushing a one-size-fits-all answer.",
      },
    ],
    metaDescription:
      "Heat pump installation in Brampton & the GTA. Honest guidance on cold-climate performance, dual-fuel setups, and current rebate programs.",
  },
  {
    slug: "ductless-mini-split",
    name: "Ductless Mini-Split Systems",
    icon: "layout-panel-left",
    heroTagline: "Targeted heating and cooling without adding ductwork.",
    intro:
      "Additions, finished basements, garages, and older homes without existing ductwork are all good candidates for ductless mini-split systems. They heat and cool individual zones efficiently and quietly, without the cost of extending ducting.",
    signsYouNeedIt: [
      "A room addition or finished basement with no ductwork",
      "A garage, workshop, or in-law suite that needs independent temperature control",
      "Rooms that are consistently too hot or cold compared to the rest of the house",
      "You want zone-by-zone control instead of one thermostat for the whole home",
    ],
    process: standardProcess,
    financingNote: "Ductless systems are financeable — see /financing.",
    rebateNote:
      "Ductless heat pump systems may qualify for the same incentive programs as central heat pumps. See /rebates (verify eligibility for your specific configuration).",
    faqs: [
      {
        question: "How many indoor units can one outdoor unit support?",
        answer:
          "Multi-zone outdoor units can typically support 2–8 indoor heads depending on the system, letting you condition several rooms independently from one outdoor unit.",
      },
      {
        question: "Are ductless systems noisy?",
        answer:
          "Modern indoor units run quietly enough for bedrooms and living spaces — quieter than most window units.",
      },
    ],
    metaDescription:
      "Ductless mini-split installation in Brampton & the GTA — ideal for additions, basements, and homes without existing ductwork.",
  },
  {
    slug: "water-heaters",
    name: "Tankless & Water Heaters",
    icon: "droplets",
    heroTagline: "Reliable hot water — tank or tankless, repaired or replaced.",
    intro:
      "From a tank unit that's stopped heating to a tankless system giving you cold surprises mid-shower, we service and install both conventional and tankless water heaters, and can help you decide which type suits your household.",
    signsYouNeedIt: [
      "No hot water, or hot water that runs out quickly",
      "Rusty or discoloured water from the tap",
      "Popping or rumbling noises from the tank",
      "Visible leaking around the base of the tank",
      "Unit is 10+ years old (conventional tanks) or acting unreliable",
    ],
    process: standardProcess,
    financingNote: "Water heater installs are financeable — see /financing.",
    rebateNote:
      "Some high-efficiency and heat-pump water heaters may qualify for rebates. See /rebates for current details.",
    faqs: [
      {
        question: "Tank or tankless — which is right for me?",
        answer:
          "Tankless units provide continuous hot water and take up less space, but cost more upfront and need adequate gas/electrical capacity. Conventional tanks cost less upfront but run out of hot water under heavy demand. We'll walk through the tradeoffs for your household size and usage.",
      },
      {
        question: "How long does a water heater installation take?",
        answer: "Most replacements are completed in a few hours.", // TODO: confirm typical install time
      },
    ],
    metaDescription:
      "Water heater repair and installation in Brampton & the GTA — tank and tankless systems, upfront pricing.",
  },
  {
    slug: "indoor-air-quality",
    name: "Indoor Air Quality",
    icon: "sparkles",
    heroTagline: "Cleaner, better-balanced air throughout your home.",
    intro:
      "Furnaces and AC systems condition temperature — not necessarily air quality. HRV/ERV ventilators, whole-home filtration, and humidifiers address the air you're actually breathing, especially in newer, tightly-sealed homes.",
    signsYouNeedIt: [
      "Persistent stuffiness or stale air, especially in newer, well-sealed homes",
      "Excess winter dryness (static shocks, dry skin, cracking wood trim)",
      "Condensation on windows in colder months",
      "Household allergy or dust sensitivity concerns",
      "Noticeable odours that linger after cooking or showers",
    ],
    process: standardProcess,
    financingNote: "IAQ equipment can be financed as a standalone install or bundled with a furnace/AC replacement — see /financing.",
    rebateNote:
      "Some IAQ equipment (particularly HRV/ERV systems) may qualify for provincial rebate programs. See /rebates for current details.",
    faqs: [
      {
        question: "What's the difference between an HRV and an ERV?",
        answer:
          "Both exchange stale indoor air for fresh outdoor air while recovering energy. An ERV also transfers some humidity between the incoming and outgoing air streams, which can suit homes wanting more humidity control. We'll recommend the right fit for your home during the assessment.",
      },
      {
        question: "Will a whole-home humidifier fix dry winter air?",
        answer:
          "In most homes, yes — a furnace-mounted humidifier maintains a consistent comfort level house-wide, rather than relying on portable units room by room.",
      },
    ],
    metaDescription:
      "Indoor air quality solutions in Brampton & the GTA — HRV/ERV ventilation, whole-home filtration, and humidifiers.",
  },
  {
    slug: "maintenance-plans",
    name: "Maintenance Plans",
    icon: "calendar-check",
    heroTagline: "Fewer breakdowns, longer equipment life, priority scheduling.",
    intro:
      "Most HVAC failures are preventable with regular maintenance. Our maintenance plans keep your furnace and AC tuned twice a year, catch small issues before they become expensive ones, and move you to the front of the line during peak season.",
    signsYouNeedIt: [
      "You've never had your system professionally maintained",
      "You want priority scheduling during peak heating/cooling season",
      "You want to protect a manufacturer's warranty that requires documented maintenance",
      "You'd rather catch small issues early than pay for emergency repairs",
    ],
    process: [
      {
        title: "Choose a plan",
        description: "Choose from Basic, Standard, or Premium coverage — each includes seasonal furnace and AC tune-ups.", // TODO: confirm real plan tier names and pricing
      },
      {
        title: "Scheduled visits",
        description: "We proactively schedule your seasonal tune-ups — you don't have to remember to call.",
      },
      {
        title: "Full system check",
        description: "Each visit includes a multi-point inspection, cleaning, and safety check of your furnace and/or AC.",
      },
      {
        title: "Member pricing & priority booking",
        description: "Plan members get priority scheduling and discounted rates on any repairs found during a visit.",
      },
    ],
    financingNote: "Maintenance plans are billed annually or in convenient monthly installments.", // TODO: confirm real billing terms
    rebateNote: "Maintenance plans don't have associated rebates, but keeping documented maintenance can be required to preserve manufacturer warranties on newer equipment.",
    faqs: [
      {
        question: "What's included in a tune-up visit?",
        answer:
          "A full multi-point inspection and cleaning of your furnace and/or AC, including safety checks, filter service, and a written summary of anything found.", // TODO: confirm exact checklist
      },
      {
        question: "How much do maintenance plans cost?",
        answer: "Plans start at $19/month for a single seasonal tune-up, with higher tiers covering both furnace and AC visits plus priority scheduling.", // TODO: confirm real plan pricing
      },
    ],
    metaDescription:
      "HVAC maintenance plans in Brampton & the GTA — seasonal tune-ups, priority scheduling, and fewer surprise breakdowns.",
  },
  {
    slug: "commercial-hvac",
    name: "Commercial HVAC",
    icon: "building-2",
    heroTagline: "Reliable heating and cooling for light-commercial spaces.",
    intro:
      "Top Choice HVAC supports light-commercial heating and cooling needs across the GTA, from small offices to retail units. Contact us to discuss your building's system and service needs.", // TODO: confirm commercial scope with client — this is a scope decision, not just a content gap
    signsYouNeedIt: [
      "Rooftop unit or packaged system in need of repair or replacement",
      "Inconsistent heating/cooling across a retail or office space",
      "You need a maintenance contract for a commercial property",
      "You're planning a tenant fit-out that requires HVAC work",
    ],
    process: standardProcess,
    financingNote: "Commercial financing terms vary by project scope — contact us for details.", // TODO: confirm real commercial financing terms
    rebateNote: "Some commercial efficiency upgrades may qualify for utility incentive programs.", // TODO: confirm applicable programs
    faqs: [
      {
        question: "Do you service light-commercial rooftop units?",
        answer: "Yes, we service a range of light-commercial rooftop and packaged units.", // TODO: confirm accuracy pending commercial scope decision
      },
      {
        question: "Can you set up a maintenance contract for our building?",
        answer: "Yes, we offer maintenance contracts tailored to commercial properties.", // TODO: confirm commercial maintenance contract offerings
      },
    ],
    metaDescription:
      "Commercial HVAC services in Brampton & the GTA for light-commercial and retail spaces.", // TODO: confirm commercial scope
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
