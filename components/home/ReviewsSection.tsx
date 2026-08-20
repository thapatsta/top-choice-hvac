import { Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { reviews, aggregateRating } from "@/data/reviews";

export function ReviewsSection() {
  const featured = reviews.slice(0, 3);

  return (
    <section className="bg-card py-16 sm:py-20">
      <Container>
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            What Customers Are Saying
          </h2>
          {aggregateRating && (
            <p className="flex items-center gap-1 font-semibold text-navy">
              <Star size={18} className="fill-ember text-ember" aria-hidden="true" />
              {aggregateRating.ratingValue.toFixed(1)} ({aggregateRating.reviewCount} Google
              Reviews)
            </p>
          )}
          <p className="max-w-lg text-muted">
            See all reviews on{" "}
            <a href="/reviews" className="font-semibold text-ember hover:underline">
              our Reviews page
            </a>
            .
          </p>
        </div>
        <div className="mt-10 flex snap-x gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible">
          {featured.map((review) => (
            <div
              key={review.author}
              className="flex w-[85%] shrink-0 snap-start flex-col gap-3 rounded-2xl border border-border bg-cream p-6 sm:w-auto"
            >
              <div className="flex" aria-hidden="true">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-ember text-ember" />
                ))}
              </div>
              <p className="text-sm text-navy">{review.text}</p>
              <p className="text-xs font-semibold text-muted">
                {review.author} · {review.source}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
