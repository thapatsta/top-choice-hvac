import { MessageSquareText } from "lucide-react";
import { Container } from "@/components/ui/Container";
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
            Real reviews are coming soon — see{" "}
            <a href="/reviews" className="font-semibold text-ember hover:underline">
              our Reviews page
            </a>{" "}
            for the current status.
          </p>
        </div>
        <div className="mt-10 flex snap-x gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible">
          {reviews.map((_, i) => (
            <div
              key={i}
              className="flex w-[85%] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-cream p-6 text-center sm:w-auto"
            >
              <MessageSquareText size={28} className="text-muted" aria-hidden="true" />
              <p className="text-sm text-muted">Review coming soon</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
