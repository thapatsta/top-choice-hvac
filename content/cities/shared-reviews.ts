// Real Google reviews (data/reviews.ts) reused on the city pages while no
// review has been tagged to a city. Text is taken as written; first name only.
// They are shown as "what our customers say", never as coming from that city.
// When Robin tags reviews to a city, add them to that city's imports file
// (citySource "robin-tagged") and the heading switches back to the city name.

import { reviews } from "@/data/reviews";
import type { Review } from "./types";

export function sharedReviews(...authors: string[]): Review[] {
  return authors.map((author) => {
    const found = reviews.find((r) => r.author === author);
    if (!found) throw new Error(`No review by ${author} in data/reviews.ts`);
    return {
      firstName: author.split(" ")[0],
      stars: found.rating as Review["stars"],
      text: found.text,
      citySource: "not-city-specific",
    };
  });
}
