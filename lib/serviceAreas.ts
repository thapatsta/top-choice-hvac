// The towns we serve. NAP-free, so client code can import it; lib/site.ts
// exposes it as site.serviceAreas.
export const SERVICE_AREAS = [
  "Brampton",
  "Mississauga",
  "Vaughan",
  "Caledon",
  "Etobicoke",
  "Georgetown",
  "Bolton",
  "Milton",
  "Orangeville",
  "Barrie",
  "Halton Hills",
  // TODO: confirm full list of GTA cities actually served
] as const;
