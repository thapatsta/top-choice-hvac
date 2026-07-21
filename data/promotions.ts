// Seasonal offers — structured so staff can swap these without a developer.
// Dates and dollar amounts are placeholders until confirmed by the client.

export interface Promotion {
  slug: string;
  title: string;
  description: string;
  validity: string;
  badge?: string;
}

export const promotions: Promotion[] = [
  {
    slug: "spring-ac-tune-up",
    title: "Spring AC Tune-Up Special",
    description:
      "Get your air conditioner inspected and tuned before the first heat wave hits. [PLACEHOLDER: confirm real price/discount].",
    validity: "[PLACEHOLDER: confirm seasonal dates, e.g. April 1 – May 31]",
    badge: "Seasonal",
  },
  {
    slug: "fall-furnace-inspection",
    title: "Fall Furnace Safety Inspection",
    description:
      "A full safety and efficiency check before winter — catch small issues before the cold hits. [PLACEHOLDER: confirm real price/discount].",
    validity: "[PLACEHOLDER: confirm seasonal dates, e.g. Sept 1 – Oct 31]",
    badge: "Seasonal",
  },
  {
    slug: "new-customer-offer",
    title: "New Customer Welcome Offer",
    description:
      "[PLACEHOLDER: confirm whether Top Choice HVAC wants to run a standing new-customer offer, and its terms].",
    validity: "[PLACEHOLDER: confirm ongoing or time-limited]",
    badge: "New Customers",
  },
];
