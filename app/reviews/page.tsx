import type { Metadata } from "next";
import { Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/CTABand";
import { reviews, aggregateRating } from "@/data/reviews";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Customer Reviews",
  description: "Real customer reviews for Top Choice HVAC in Brampton & the GTA.",
  path: "/reviews",
});

export default function ReviewsPage() {
  return (
    <>
      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Customer Reviews</h1>
          {aggregateRating && (
            <p className="mt-4 flex items-center justify-center gap-1 text-lg text-white/80">
              <Star size={20} className="fill-ember text-ember" aria-hidden="true" />
              {aggregateRating.ratingValue.toFixed(1)} stars from {aggregateRating.reviewCount}{" "}
              Google reviews
            </p>
          )}
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {reviews.map((review) => (
              <div
                key={review.author}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
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

      <CTABand
        heading="Had a great experience with us?"
        subheading="We'd love a review — it helps other Brampton homeowners find us."
      />
    </>
  );
}
