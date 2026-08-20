// Real, publicly-posted Google reviews for "Top choice air system inc"
// (3 Lloyd Cres, Brampton, ON), pulled from the Google Business Profile on
// 2026-08-20. Attribution uses first name + last initial per standard
// practice rather than full last names. Do not add, edit, or fabricate any
// review, rating, or count here — only real, verifiable Google reviews.

export interface Review {
  author: string;
  rating: number;
  text: string;
  source: "Google review";
}

export const reviews: Review[] = [
  {
    author: "Jasmeen D.",
    rating: 5,
    text: "Very happy with the new AC installation and the AC repairs at my other properties. He really took a lot of stress off my shoulders. The experience was great, the work was professional and clean. He promises what he says and sticks to his word, which I really appreciate. Everything was done at a fair price and the AC is premium quality. Such a hardworking and ambitious guy, I always recommend him to others.",
    source: "Google review",
  },
  {
    author: "Amarinder R.",
    rating: 5,
    text: "Very good service, saved me in the crazy heat. I recommend this to anyone and everyone looking for quick repairs.",
    source: "Google review",
  },
  {
    author: "Shubminder R.",
    rating: 5,
    text: "Thanks for the new installation at my house and my brothers for new tankless. the service was very good.",
    source: "Google review",
  },
  {
    author: "Mansi S.",
    rating: 5,
    text: "Professional staff and well educated 👌",
    source: "Google review",
  },
  {
    author: "Shubam B.",
    rating: 5,
    text: "They are professionals.",
    source: "Google review",
  },
  {
    author: "Ashish S.",
    rating: 5,
    text: "Reasonable price.",
    source: "Google review",
  },
];

// Matches the Google Business Profile's overall rating as of 2026-08-20 —
// re-verify against the live listing periodically, since it will drift as
// new reviews come in.
export const aggregateRating: { ratingValue: number; reviewCount: number } | undefined = {
  ratingValue: 5.0,
  reviewCount: 23,
};
