import { GOOGLE_REVIEWS, REVIEW_COUNT } from "@/lib/googleReviews";

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
  // Shown on the homepage (max 3); set by hand as stronger reviews are
  // pulled from the GBP.
  featured: boolean;
  tags: string[];
}

export const reviews: Review[] = [
  {
    author: "Jasmeen D.",
    rating: 5,
    text: "Very happy with the new AC installation and the AC repairs at my other properties. He really took a lot of stress off my shoulders. The experience was great, the work was professional and clean. He promises what he says and sticks to his word, which I really appreciate. Everything was done at a fair price and the AC is premium quality. Such a hardworking and ambitious guy, I always recommend him to others.",
    source: "Google review",
    featured: true,
    tags: ["installation", "repair", "professionalism", "pricing"],
  },
  {
    author: "Amarinder R.",
    rating: 5,
    text: "Very good service, saved me in the crazy heat. I recommend this to anyone and everyone looking for quick repairs.",
    source: "Google review",
    featured: false,
    tags: ["repair"],
  },
  {
    author: "Shubminder R.",
    rating: 5,
    text: "Thanks for the new installation at my house and my brothers for new tankless. the service was very good.",
    source: "Google review",
    featured: false,
    tags: ["installation"],
  },
  {
    author: "Mansi S.",
    rating: 5,
    text: "Professional staff and well educated 👌",
    source: "Google review",
    featured: false,
    tags: ["professionalism"],
  },
  {
    author: "Shubam B.",
    rating: 5,
    text: "They are professionals.",
    source: "Google review",
    featured: false,
    tags: ["professionalism"],
  },
  {
    author: "Ashish S.",
    rating: 5,
    text: "Reasonable price.",
    source: "Google review",
    featured: false,
    tags: ["pricing"],
  },
];

// The Google Business Profile's overall rating. Derived from GOOGLE_REVIEWS
// in lib/site.ts (the single source of truth); update it there, not here.
// reviewCount is the display label ("100+"), the only count pages show.
export const aggregateRating: { ratingValue: number; reviewCount: string } | undefined = {
  ratingValue: GOOGLE_REVIEWS.rating,
  reviewCount: REVIEW_COUNT,
};

/**
 * The nine reviews on the /lp/furnace-repair and /lp/furnace-installation
 * carousels, copied word for word from the approved mockups
 * (docs/lp-mockups/). First names only: no surnames, no photos.
 * `tags` drive the carousel filter (install = "New furnace",
 * repair = "Repairs and tune-ups").
 */
export interface LpReview {
  firstName: string;
  text: string;
  tags: ("install" | "repair")[];
  /** TODO verify against Google: the per-review star rating is not verified. */
  rating: number;
}

export const lpReviews: LpReview[] = [
  {
    firstName: "Kyle",
    text: "LIFE SAVER! My HVAC system went down right before the holidays, with a house full of family coming over. He came by, did a quick assessment, and got everything taken care of just in time. The price was VERY reasonable, the unit was clean, and everything worked perfectly all weekend.",
    tags: ["repair"],
    rating: 5, // TODO verify against Google
  },
  {
    firstName: "David",
    text: "Just had a new furnace installed. The technician was extremely professional and highly skilled. The installation was clean, efficient, and he took the time to explain everything to me patiently.",
    tags: ["install"],
    rating: 5, // TODO verify against Google
  },
  {
    firstName: "John",
    text: "Had Robin over for furnace tune up. Amazing job. He fixed everything that needed to be done, amazing service. Highly recommend.",
    tags: ["repair"],
    rating: 5, // TODO verify against Google
  },
  {
    firstName: "Prabhjot",
    text: "Robin did a great job installing my furnace and tankless water heater. Very professional, clean work, and everything works perfectly.",
    tags: ["install"],
    rating: 5, // TODO verify against Google
  },
  {
    firstName: "Nav",
    text: "Robin was prompt and explained everything clearly. The work looks very clean and my system has been running perfectly since. Fair pricing and I didn't feel like I was being upsold.",
    tags: ["install"],
    rating: 5, // TODO verify against Google
  },
  {
    firstName: "Punjab",
    text: "Robin recently installed a new furnace and heat pump in my home. The technicians showed great technical skill, arrived on time, and maintained a highly professional attitude. Everything is working perfectly.",
    tags: ["install"],
    rating: 5, // TODO verify against Google
  },
  {
    firstName: "Jason",
    text: "The quote they gave me was very reasonable with market price, very clean and professional work, they make sure they do the finishing perfect.",
    tags: ["install"],
    rating: 5, // TODO verify against Google
  },
  {
    firstName: "Sim",
    text: "Robin was incredibly reliable and even worked through the rain to get the job done.",
    tags: ["install"],
    rating: 5, // TODO verify against Google
  },
  {
    firstName: "Manpreet",
    text: "Robin came to do my furnace and did an amazing job. He was professional, knowledgeable, and took the time to make sure everything was working properly before leaving.",
    tags: ["repair", "install"],
    rating: 5, // TODO verify against Google
  },
];
