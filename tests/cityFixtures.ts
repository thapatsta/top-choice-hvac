// Test-only stand-ins for the jobs, reviews and home-base paragraph that
// Robin and Patrick still have to supply. They let the tests prove that the
// real written copy in content/cities/*.ts passes the publish guard and the
// duplicate-content check once the real slots are filled. Never imported by
// app code, and nothing here is published.

import { ALL_CITIES } from "@/content/cities";
import type { CityContent, Job, Review } from "@/content/cities/types";

const SERVICES: Job["service"][] = ["furnace-install", "furnace-repair", "ac-install", "furnace-install"];

/** A city with every placeholder slot filled with distinct, plausible test text. */
export function filledCity(city: CityContent, ready = true): CityContent {
  const need = city.isHomeBase ? 4 : 2;
  const jobs: Job[] = Array.from({ length: need }, (_, i) => ({
    neighbourhood: `Test Street ${i + 1} area`,
    service: SERVICES[i % SERVICES.length],
    problem: `Fixture problem ${i + 1} for ${city.slug}: the system stopped partway through the ${city.slug} winter test.`,
    work: `Fixture work ${i + 1} for ${city.slug}: replaced the part that failed and tested the system.`,
    year: 2025,
    photos: [],
    verified: true,
  }));
  const reviews: Review[] = Array.from({ length: city.isHomeBase ? 3 : 2 }, (_, i) => ({
    firstName: `Tester${i + 1}`,
    stars: 5,
    text: `Fixture review ${i + 1} for ${city.slug}. The work was done on time and explained clearly.`,
    citySource: "robin-tagged",
  }));
  return {
    ...city,
    jobs,
    reviews,
    homeBaseParagraph: city.isHomeBase ? "Fixture paragraph: we live and work in this city." : city.homeBaseParagraph,
    ready,
  };
}

export const FILLED_CITIES = ALL_CITIES.map((c) => filledCity(c));
