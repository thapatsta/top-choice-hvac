// Central site configuration. NAP (Name/Address/Phone) values here must stay
// identical everywhere they render and must match the Google Business Profile
// once one exists. Every [PLACEHOLDER] below is tracked in CONTENT-NEEDED.md.

export const site = {
  name: "Top Choice HVAC",
  legalName: "Top Choice HVAC [PLACEHOLDER: confirm legal business name]",
  tagline: "Brampton & GTA Heating and Cooling, Done Right",
  domain: "topchoicehvac.example", // [PLACEHOLDER: real domain once purchased]
  url: "https://topchoicehvac.example",

  phone: {
    display: "(905) 555-0142", // [PLACEHOLDER: real phone number]
    href: "tel:+19055550142",
  },
  email: "info@topchoicehvac.example", // [PLACEHOLDER: real email]

  address: {
    street: "[PLACEHOLDER: street address]",
    city: "Brampton",
    region: "ON",
    postalCode: "[PLACEHOLDER: postal code]",
    country: "CA",
  },

  hours: {
    weekday: "7:00 AM – 8:00 PM", // [PLACEHOLDER: confirm real hours]
    saturday: "8:00 AM – 4:00 PM",
    sunday: "Emergency calls only",
    emergency: "24/7 emergency service", // [PLACEHOLDER: confirm real commitment]
  },

  founded: "[PLACEHOLDER: year founded]",
  license: "[PLACEHOLDER: HVAC contractor license / TSSA number]",
  insurance: "Fully licensed and insured", // [PLACEHOLDER: confirm exact wording]

  social: {
    facebook: "", // [PLACEHOLDER: social handles]
    instagram: "",
    google: "", // [PLACEHOLDER: Google Business Profile URL]
  },

  serviceAreas: [
    "Brampton",
    "Mississauga",
    "Vaughan",
    "Caledon",
    "Etobicoke",
    "Georgetown",
    "Bolton",
    // [PLACEHOLDER: confirm full list of GTA cities actually served]
  ],

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
