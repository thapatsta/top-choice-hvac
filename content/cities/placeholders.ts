// Placeholders for slots that need real content. A ready city may contain
// none of these: the guard fails on any string with TODO_REAL_CONTENT.

import { TODO } from "./facts";
import type { Job, Review } from "./types";

/** A job slot waiting on Robin or Patrick. Never verified. */
export function todoJob(service: Job["service"]): Job {
  return {
    neighbourhood: TODO,
    service,
    problem: TODO,
    work: TODO,
    year: 0,
    photos: [],
    verified: false,
  };
}

/** A review slot waiting on city tags from Robin. */
export function todoReview(): Review {
  return { firstName: TODO, stars: 5, text: TODO, citySource: "robin-tagged" };
}

/** Real imported rows (scripts/import-city-content.ts) win over placeholders. */
export function orPlaceholders<T>(imported: unknown, placeholders: T[]): T[] {
  return Array.isArray(imported) && imported.length > 0 ? (imported as T[]) : placeholders;
}
