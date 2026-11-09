import { Container } from "@/components/ui/Container";
import { REBATES_HANDLED, rebatesHandledLabel } from "@/data/rebates";
import { GOOGLE_REVIEWS, REVIEW_COUNT_LABEL } from "@/lib/googleReviews";

/**
 * One line of proof under the finder. The rebate count is the owner's real
 * figure (data/rebates.ts); rating and review count come from the site's
 * single source (lib/googleReviews.ts).
 */
export function ProofStrip() {
  const handled = rebatesHandledLabel(REBATES_HANDLED);
  const parts = [
    ...(handled ? [handled] : []),
    `${GOOGLE_REVIEWS.rating} on Google (${REVIEW_COUNT_LABEL})`,
    "We file the paperwork",
  ];
  return (
    <section aria-label="Why homeowners trust us with their rebates" className="pt-6">
      <Container className="max-w-4xl">
        <p className="text-center font-display text-sm font-bold text-navy sm:text-base">
          {parts.join(" · ")}
        </p>
      </Container>
    </section>
  );
}
