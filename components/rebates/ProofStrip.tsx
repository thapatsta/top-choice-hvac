import { ClipboardCheck, FileCheck2, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { REBATES_HANDLED, rebatesHandledLabel } from "@/data/rebates";
import { GOOGLE_REVIEWS, REVIEW_COUNT_LABEL } from "@/lib/googleReviews";

/**
 * Proof under the finder. Every item is something we can stand behind:
 * the rebate count is the owner's real figure (data/rebates.ts), the rating
 * and review count come from the site's single source (lib/googleReviews.ts),
 * and the free assessment and written quote are the site-wide promise.
 */
export function ProofStrip() {
  const handled = rebatesHandledLabel(REBATES_HANDLED);
  const items = [
    ...(handled
      ? [
          {
            icon: FileCheck2,
            title: handled,
            body: "We've done the pre-approval paperwork before. You won't be our first.",
          },
        ]
      : []),
    {
      icon: Star,
      title: `${GOOGLE_REVIEWS.rating} on Google`,
      body: `${REVIEW_COUNT_LABEL} from homeowners across the GTA.`,
    },
    {
      icon: ClipboardCheck,
      title: "Free assessment, written quote",
      body: "Before any work begins. No surprise charges after.",
    },
  ];

  return (
    <section aria-label="Why homeowners trust us with their rebates" className="pt-10">
      <Container className="max-w-4xl">
        <ul
          className={`grid grid-cols-1 gap-3 ${items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
        >
          {items.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <Icon size={24} className="mt-0.5 shrink-0 text-ember" aria-hidden="true" />
              <div>
                <p className="font-display text-lg font-extrabold text-navy">{title}</p>
                <p className="text-sm text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
