// Central site configuration. NAP (Name/Address/Phone) values here must stay
// identical everywhere they render and must match the Google Business Profile
// once one exists. Every value marked with a TODO below is a plausible fake
// placeholder — see CONTENT-NEEDED.md for the full list.

import { aggregateRating } from "@/data/reviews";

// Verified 2026-09-22 against the live Google Business Profile listing.
const googlePlaceId = "ChIJyRbRXAn8kaYRzRKD7SJFXMs";
const googleListingName = "Top Choice Air System Inc";
const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleListingName)}&query_place_id=${googlePlaceId}`;

export const site = {
  name: "Top Choice HVAC",
  legalName: "Top Choice HVAC Inc.",
  tagline: "Brampton & GTA Heating and Cooling, Done Right",
  domain: "topchoicehvac.ca",
  url: "https://topchoicehvac.ca",

  phone: {
    display: "(647) 763-2970",
    href: "tel:+16477632970",
  },
  // TODO: real email address
  email: "info@topchoicehvac.ca",

  address: {
    street: "3 Lloyd Cres",
    city: "Brampton",
    region: "ON",
    postalCode: "L7A 0G4",
    country: "CA",
  },

  hours: {
    // Confirmed 2026-09-22: open 24/7, matching the Google Business Profile.
    // Worded as "Always open" (rather than repeating "24/7") since the
    // emergency line below already says "24/7" — avoids showing it twice
    // wherever both render together.
    display: "Always open",
    // TODO: confirm real emergency response commitment
    emergency: "24/7 emergency service",
  },

  founded: "2021",
  // TODO: confirm exact required licensing/insurance wording
  insurance: "Fully licensed and insured",

  googlePlaceId,
  googleListingName,

  social: {
    // Confirmed: no Facebook page exists yet.
    facebook: null as string | null,
    instagram: "https://instagram.com/topchoiceairsystem",
    google: googleMapsUrl,
  },

  serviceAreas: [
    "Brampton",
    "Mississauga",
    "Vaughan",
    "Caledon",
    "Etobicoke",
    "Georgetown",
    "Bolton",
    // TODO: confirm full list of GTA cities actually served
  ],

  // GA4 measurement ID is now live. GTM container ID is still a TODO — left
  // as a literal "[PLACEHOLDER..." string on purpose, since app/layout.tsx
  // checks for that exact prefix to decide whether to inject the GTM script
  // tag, so swapping in a fake ID here would make the site start firing
  // real requests to Google's servers referencing an ID that doesn't exist.
  ga4Id: "G-NVWFCHZ8S3",
  gtmId: "[PLACEHOLDER: GTM_ID]",
} as const;

// TODO: name mismatch on hold (2026-09-22) — the Google Business Profile is
// currently listed as "Top Choice Air System Inc", which does not match the
// site brand name below ("Top Choice HVAC") or legalName ("Top Choice HVAC
// Inc."). The earlier decision (2026-08-20) to rename the GBP listing to
// match the site is on hold pending confirmation of the incorporated name
// and what's on the vehicles and invoices. The site keeps "Top Choice HVAC"
// for now. Until this is resolved, this is a live NAP inconsistency that can
// weaken local search ranking signals.
export const NAP_JSON_LD = {
  name: site.name,
  telephone: site.phone.href.replace("tel:", ""),
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  // 24/7 business hours, expressed per Google's documented pattern for
  // round-the-clock availability (dayOfWeek covering every day, midnight to
  // 23:59).
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
  sameAs: [site.social.instagram, site.social.google].filter(
    (url): url is string => Boolean(url),
  ),
  // Never fabricate this — only include it once data/reviews.ts has a real,
  // verified aggregateRating from the Google Business Profile.
  ...(aggregateRating
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: aggregateRating.ratingValue,
          reviewCount: aggregateRating.reviewCount,
        },
      }
    : {}),
};
