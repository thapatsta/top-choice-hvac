// Central site configuration. NAP (Name/Address/Phone) values here must stay
// identical everywhere they render and must match the Google Business Profile
// once one exists. Every value marked with a TODO below is a plausible fake
// placeholder — see CONTENT-NEEDED.md for the full list.

export const site = {
  name: "Top Choice HVAC",
  // TODO: confirm legal business name before launch
  legalName: "Top Choice HVAC Inc.",
  tagline: "Brampton & GTA Heating and Cooling, Done Right",
  // TODO: real domain once purchased — currently a placeholder
  domain: "topchoicehvac.ca",
  url: "https://patrickdes.ca/topchoice",

  phone: {
    // TODO: real phone number — this is a fake placeholder number
    display: "(905) 555-0142",
    href: "tel:+19055550142",
  },
  // TODO: real email address
  email: "info@topchoicehvac.ca",

  address: {
    // TODO: real street address — this is a fake placeholder
    street: "123 Queen Street East",
    city: "Brampton",
    region: "ON",
    // TODO: real postal code
    postalCode: "L6W 1A1",
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

  // TODO: confirm real founding year
  founded: "2015",
  // TODO: real HVAC contractor license / TSSA number — this is a fake placeholder
  license: "TSSA #123456",
  // TODO: confirm exact required licensing/insurance wording
  insurance: "Fully licensed and insured",

  // TODO: real social handles — these are fake placeholder URLs
  social: {
    facebook: "https://facebook.com/topchoicehvac",
    instagram: "https://instagram.com/topchoicehvac",
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

  // TODO: real GA4 measurement ID / GTM container ID. Left as literal
  // "[PLACEHOLDER..." strings on purpose — app/layout.tsx checks for that
  // exact prefix to decide whether to inject the GA4/GTM script tags at
  // all, so swapping in fake IDs here would make the site start firing
  // real requests to Google's servers referencing IDs that don't exist.
  ga4Id: "[PLACEHOLDER: GA4_ID]",
  gtmId: "[PLACEHOLDER: GTM_ID]",
} as const;

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
};
