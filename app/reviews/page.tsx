import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/CTABand";
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
          {/* TODO: this page is structured to display real Google reviews — either via an embedded Google review widget or a manually curated, permissioned set. Never fabricate testimonials, ratings, or counts */}
          <p className="mt-4 text-lg text-white/80">
            Real customer reviews are coming soon.
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {reviews.map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center"
              >
                <MessageSquareText size={28} className="text-muted" aria-hidden="true" />
                <p className="text-sm text-muted">Review coming soon</p>
              </div>
            ))}
          </div>
          {/* TODO: integration decision needed — embed a live Google Business Profile review widget, or manually curate reviews with written customer permission to display. Never fabricate ratings or counts, including in structured data */}
          <p className="mt-8 text-center text-sm text-muted">
            Reviews will appear here once collected.
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
