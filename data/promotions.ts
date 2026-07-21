// Seasonal offers — structured so staff can swap these without a developer.
// TODO: dates and dollar amounts below are plausible-but-fake placeholders
// until confirmed by the client.

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
      "Get your air conditioner inspected and tuned before the first heat wave hits — $99 (regularly $149).",
    validity: "April 1 – May 31", // TODO: confirm real price/discount and seasonal dates
    badge: "Seasonal",
  },
  {
    slug: "fall-furnace-inspection",
    title: "Fall Furnace Safety Inspection",
    description:
      "A full safety and efficiency check before winter — catch small issues before the cold hits. $99 (regularly $149).",
    validity: "September 1 – October 31", // TODO: confirm real price/discount and seasonal dates
    badge: "Seasonal",
  },
  {
    slug: "new-customer-offer",
    title: "New Customer Welcome Offer",
    description: "$50 off your first service call.",
    validity: "Ongoing", // TODO: confirm whether Top Choice HVAC wants to run a standing new-customer offer, and its real terms
    badge: "New Customers",
  },
];
