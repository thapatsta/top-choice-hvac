// Central site configuration. NAP (Name/Address/Phone) values here must stay
// identical everywhere they render and must match the Google Business Profile
// once one exists. Every value marked with a TODO below is a plausible fake
// placeholder — see CONTENT-NEEDED.md for the full list.

import { aggregateRating } from "@/data/reviews";

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
    // TODO: confirm real hours of operation
    weekday: "7:00 AM – 8:00 PM",
    saturday: "8:00 AM – 4:00 PM",
    sunday: "Emergency calls only",
    // TODO: confirm real emergency response commitment
    emergency: "24/7 emergency service",
  },

  founded: "2021",
  // TODO: real HVAC contractor license / TSSA number — this is a fake placeholder
  license: "TSSA #123456",
  // TODO: confirm exact required licensing/insurance wording
  insurance: "Fully licensed and insured",

  social: {
    // Confirmed: no Facebook page exists yet.
    facebook: null as string | null,
    instagram: "https://instagram.com/topchoiceairsystem",
    // TODO: real Google Business Profile URL/short link — this is a fake placeholder
    google: "https://g.page/topchoicehvac",
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

// TODO: name mismatch pending resolution — the Google Business Profile is
// currently listed as "Top choice air system inc", which does not match the
// site brand name below ("Top Choice HVAC") or legalName ("Top Choice HVAC
// Inc."). Decision (2026-08-20): keep the site's name here and update the
// Google Business Profile listing name to match instead, rather than
// changing the site's branding. Until the GBP name is changed, this is a
// live NAP inconsistency that can weaken local search ranking signals.
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
