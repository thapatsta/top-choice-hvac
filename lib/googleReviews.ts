// The Google Business Profile's review facts and links. NAP-free (no
// address), so client components can import it; lib/site.ts re-exports it.

/**
 * Google review rating and count: the single source of truth for every page
 * that shows them (the /lp/* ad landing pages, /reviews, and everything that
 * reads data/reviews.ts's aggregateRating, which is derived from this).
 *
 * Update these from the live Google Business Profile, and bump `asOf` when
 * you do. Never hardcode the rating or count anywhere else;
 * tests/lp-content.test.ts fails the build if a landing page does.
 */
export const GOOGLE_REVIEWS = {
  rating: 4.9,
  count: 66,
  asOf: "2026-10-08",
} as const;

// Verified 2026-09-22 against the live Google Business Profile listing.
export const googlePlaceId = "ChIJyRbRXAn8kaYRzRKD7SJFXMs";
export const googleListingName = "Top Choice Air System Inc";
export const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleListingName)}&query_place_id=${googlePlaceId}`;
