import { Container } from "@/components/ui/Container";
import { ReviewStars } from "@/components/ui/ReviewStars";
import { reviews } from "@/data/reviews";

export function ReviewsSection() {
  return (
    <section className="bg-card py-16 sm:py-20">
      <Container>
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            What Customers Are Saying
          </h2>
          <p className="max-w-lg text-muted">
            Real reviews are pending collection and display permission — see{" "}
            <a href="/reviews" className="font-semibold text-ember hover:underline">
              our Reviews page
            </a>{" "}
            for the current status.
          </p>
        </div>
        <div className="mt-10 flex snap-x gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="w-[85%] shrink-0 snap-start rounded-2xl border border-dashed border-border bg-cream p-6 sm:w-auto"
            >
              <ReviewStars rating={review.rating} />
              <p className="mt-4 text-sm italic text-muted">&ldquo;{review.text}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-navy">{review.author}</p>
              <p className="text-xs text-muted">via {review.source}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
