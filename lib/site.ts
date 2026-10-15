import { ADS_CONVERSION_LABELS, ADS_ID, GA4_ID } from "@/lib/googleTag";
import { GOOGLE_REVIEWS, googleListingName, googleMapsUrl, googlePlaceId } from "@/lib/googleReviews";
import { PHONE } from "@/lib/phone";
import { SERVICE_AREAS } from "@/lib/serviceAreas";

// Central site configuration. NAP (Name/Address/Phone) values here must stay
// identical everywhere they render and must match the Google Business Profile
// once one exists. Every value marked with a TODO below is a plausible fake
// placeholder — see CONTENT-NEEDED.md for the full list.

// GOOGLE_REVIEWS and the listing links live in lib/googleReviews.ts, and the
// service areas in lib/serviceAreas.ts: both are NAP-free, so client code
// (the /lp/* pages) can import them without bundling the address below.
export { GOOGLE_REVIEWS };

export const site = {
  name: "Top Choice HVAC",
  legalName: "Top Choice HVAC Inc.",
  tagline: "Brampton & GTA Heating and Cooling, Done Right",
  domain: "topchoicehvac.ca",
  url: "https://topchoicehvac.ca",

  // The single display format: see lib/phone.ts.
  phone: PHONE,
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
  // Same GBP Maps link used for "Read our N Google reviews" elsewhere
  // (e.g. GoogleMapEmbed) — named separately here for reviews-context use.
  googleReviewsUrl: googleMapsUrl,

  // Sourced from GOOGLE_REVIEWS above, so the rating/count can't drift.
  rating: GOOGLE_REVIEWS.rating as number | undefined,
  reviewCount: GOOGLE_REVIEWS.count as number | undefined,

  social: {
    // Confirmed: no Facebook page exists yet.
    facebook: null as string | null,
    instagram: "https://instagram.com/topchoiceairsystem",
    google: googleMapsUrl,
  },

  // Optional hero photo for the homepage hero's right-hand slot. While
  // unset, the hero shows the decorative flame/snowflake illustration
  // instead. See CONTENT-NEEDED.md — no real hero photography exists yet.
  heroImage: undefined as { src: string; alt: string } | undefined,

  // Individual Instagram POST permalinks (https://www.instagram.com/p/<id>/)
  // shown on the homepage "See Our Recent Installs" section. Profile URLs
  // don't work here — Instagram renders profile embeds blank. While empty,
  // the section shows only the heading, copy, and follow button.
  instagramPosts: [] as string[],

  serviceAreas: SERVICE_AREAS,

  // GA4 measurement ID is now live. GTM container ID is still a TODO — left
  // as a literal "[PLACEHOLDER..." string on purpose, since app/layout.tsx
  // checks for that exact prefix to decide whether to inject the GTM script
  // tag, so swapping in a fake ID here would make the site start firing
  // real requests to Google's servers referencing an ID that doesn't exist.
  ga4Id: GA4_ID,
  gtmId: "[PLACEHOLDER: GTM_ID]",

  // Google Ads (see lib/googleTag.ts, which holds the values so client code
  // can import them without this file's NAP). Same placeholder rule as
  // above: a "[PLACEHOLDER..." value switches that conversion off.
  adsId: ADS_ID,
  adsConversionLabels: ADS_CONVERSION_LABELS,
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
  // Never fabricate this: it comes from GOOGLE_REVIEWS, which is copied
  // from the Google Business Profile.
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: GOOGLE_REVIEWS.rating,
    reviewCount: GOOGLE_REVIEWS.count,
  },
};
