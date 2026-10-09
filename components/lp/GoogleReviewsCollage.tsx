import { Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { GoogleGIcon } from "@/components/icons/GoogleGIcon";
import { reviews } from "@/data/reviews";
import { GOOGLE_REVIEWS, site } from "@/lib/site";

// Longest reviews first so the one-liners sit at the end of the wall.
const reviewsByLength = [...reviews].sort((a, b) => b.text.length - a.text.length);

/**
 * Every review in data/reviews.ts as a masonry wall: the landing page's
 * brand proof. Review text is shown exactly as posted on Google; the rating
 * and count come from GOOGLE_REVIEWS only.
 */
export function GoogleReviewsCollage() {
  return (
    <section className="border-t border-border py-12 sm:py-20">
      <Container>
        <div className="flex flex-col gap-3">
          <h2 className="lp-black flex flex-wrap items-center gap-x-3 gap-y-2 text-2xl leading-tight tracking-[-0.02em] text-navy sm:text-4xl">
            <GoogleGIcon size={28} />
            {GOOGLE_REVIEWS.rating.toFixed(1)} from {GOOGLE_REVIEWS.count} Google reviews
          </h2>
          <span className="flex" role="img" aria-label="5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={20} className="fill-(--lp-star) text-(--lp-star)" aria-hidden="true" />
            ))}
          </span>
        </div>

        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {reviewsByLength.map((review) => (
            <figure
              key={review.author}
              data-review-card
              className="mb-4 break-inside-avoid rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex" role="img" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-(--lp-star) text-(--lp-star)" aria-hidden="true" />
                  ))}
                </div>
                <GoogleGIcon size={18} />
              </div>
              <blockquote className="mt-3 text-sm text-navy">{review.text}</blockquote>
              <figcaption className="mt-3 text-xs font-semibold text-muted">
                {review.author} · {review.source}
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-4">
          <a
            href={site.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center font-semibold text-navy underline underline-offset-4 hover:no-underline"
          >
            Read all {GOOGLE_REVIEWS.count} reviews on Google →
          </a>
        </p>
      </Container>
    </section>
  );
}
