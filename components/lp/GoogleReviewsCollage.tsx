import { Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { GoogleGIcon } from "@/components/icons/GoogleGIcon";
import { reviews } from "@/data/reviews";
import { site } from "@/lib/site";

/**
 * Every review in data/reviews.ts as a masonry wall: the landing page's
 * brand proof. Review text is shown exactly as posted on Google.
 */
export function GoogleReviewsCollage() {
  return (
    <section className="bg-card py-14 sm:py-20">
      <Container>
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            Don&apos;t take our word for it
          </h2>
          {site.rating !== undefined && site.reviewCount !== undefined && (
            <p className="flex items-center gap-2 font-semibold text-navy">
              <GoogleGIcon size={20} />
              {site.rating.toFixed(1)}
              <span className="flex" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-ember text-ember" />
                ))}
              </span>
              <span>Based on {site.reviewCount} Google reviews</span>
            </p>
          )}
        </div>

        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {reviews.map((review) => (
            <figure
              key={review.author}
              data-review-card
              className="mb-5 break-inside-avoid rounded-2xl border border-border bg-cream p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex" role="img" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-ember text-ember" aria-hidden="true" />
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

        {site.reviewCount !== undefined && (
          <p className="mt-6 text-center">
            <a
              href={site.googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ember hover:underline"
            >
              Read all {site.reviewCount} reviews on Google →
            </a>
          </p>
        )}
      </Container>
    </section>
  );
}
