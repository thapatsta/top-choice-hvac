// No real reviews exist yet. Do NOT fabricate testimonials, star ratings, or
// review counts here — that's a common and risky SEO/trust malpractice.
// Replace this placeholder set with real, permissioned Google reviews (or an
// embedded Google review widget) before launch. See CONTENT-NEEDED.md.

export interface Review {
  placeholder: true;
}

// Intentionally just empty placeholder slots — no fake name, quote, or star
// rating is attached to any of them. A rendered 5-star rating next to a
// "[name pending]" label would still visually read as a real testimonial,
// which is exactly what must not be faked here.
export const reviews: Review[] = [{ placeholder: true }, { placeholder: true }, { placeholder: true }];

// aggregateRating is intentionally left undefined until real review data
// exists — never fabricate this for AggregateRating structured data.
export const aggregateRating: { ratingValue: number; reviewCount: number } | undefined =
  undefined;
