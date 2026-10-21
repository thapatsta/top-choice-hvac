// Registry of city pages. Adding a city: copy a data file, fill every slot,
// import it here and add it to ALL_CITIES. See README.md.
//
// Publishing rule: a city is public only when `ready` is true. Until then the
// page renders in development for preview only; in production it is a 404 and
// is left out of the sitemap, hub, strip, footer, service pages, other-areas
// links and /llms.txt. Use publishedCities() everywhere a link or list is
// built, never ALL_CITIES.

import brampton from "./brampton";
import etobicoke from "./etobicoke";
import mississauga from "./mississauga";
import vaughan from "./vaughan";
import type { CityContent } from "./types";

export const ALL_CITIES: CityContent[] = [brampton, mississauga, vaughan, etobicoke];

export function getCity(slug: string): CityContent | undefined {
  return ALL_CITIES.find((c) => c.slug === slug);
}

/** Cities that may be linked, listed and indexed. */
export function publishedCities(): CityContent[] {
  return ALL_CITIES.filter((c) => c.ready);
}

/** Whether the page itself may be served: ready, or any city when previewing in development. */
export function isServable(city: CityContent, env: string | undefined = process.env.NODE_ENV): boolean {
  return city.ready || env === "development";
}

export function cityPath(city: Pick<CityContent, "slug">): string {
  return `/service-area/${city.slug}`;
}

/** "2026-10" -> first of that month, for dateModified / sitemap lastmod. */
export function lastReviewedDate(city: Pick<CityContent, "lastReviewed">): Date {
  return new Date(`${city.lastReviewed}-01T00:00:00Z`);
}

export function formatLastReviewed(city: Pick<CityContent, "lastReviewed">): string {
  return new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric", timeZone: "UTC" }).format(lastReviewedDate(city));
}
