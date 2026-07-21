import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/CTABand";
import { ReviewStars } from "@/components/ui/ReviewStars";
import { reviews } from "@/data/reviews";
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
          <p className="mt-4 text-lg text-white/80">
            [PLACEHOLDER: this page is structured to display real Google
            reviews — either via an embedded Google review widget or a
            manually curated, permissioned set. No reviews are fabricated;
            the cards below are placeholders pending real content.]
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {reviews.map((review, i) => (
              <div
                key={i}
                className="rounded-2xl border border-dashed border-border bg-card p-6"
              >
                <ReviewStars rating={review.rating} />
                <p className="mt-4 text-sm italic text-muted">&ldquo;{review.text}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-navy">{review.author}</p>
                <p className="text-xs text-muted">via {review.source}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted">
            [PLACEHOLDER: integration decision needed — embed a live Google
            Business Profile review widget, or manually curate reviews with
            written customer permission to display. Never fabricate ratings
            or counts, including in structured data.]
          </p>
        </Container>
      </section>

      <CTABand
        heading="Had a great experience with us?"
        subheading="We'd love a review — it helps other Brampton homeowners find us."
      />
    </>
  );
}
