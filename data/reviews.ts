// No real reviews exist yet. Do NOT fabricate testimonials, star ratings, or
// review counts here — that's a common and risky SEO/trust malpractice.
// Replace this placeholder set with real, permissioned Google reviews (or an
// embedded Google review widget) before launch. See CONTENT-NEEDED.md.

export interface Review {
  placeholder: true;
  author: string;
  rating: number;
  text: string;
  source: string;
}

export const reviews: Review[] = [
  {
    placeholder: true,
    author: "[Customer name pending]",
    rating: 5,
    text: "[PLACEHOLDER: real customer review text will go here, with permission to display]",
    source: "Google",
  },
  {
    placeholder: true,
    author: "[Customer name pending]",
    rating: 5,
    text: "[PLACEHOLDER: real customer review text will go here, with permission to display]",
    source: "Google",
  },
  {
    placeholder: true,
    author: "[Customer name pending]",
    rating: 5,
    text: "[PLACEHOLDER: real customer review text will go here, with permission to display]",
    source: "Google",
  },
];

// aggregateRating is intentionally left undefined until real review data
// exists — never fabricate this for AggregateRating structured data.
export const aggregateRating: { ratingValue: number; reviewCount: number } | undefined =
  undefined;
