import { ShieldCheck, Award, Clock, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";
import { aggregateRating } from "@/data/reviews";

// "Certified Dealer Network" was a fake placeholder claim — swapped for
// "Since <founded year>" until real certifications are confirmed, at which
// point it can be restored (see CONTENT-NEEDED.md).
// Rating label reads from data/reviews.ts's aggregateRating (last checked
// 2026-09-22) instead of a separate hardcoded string, so it can't drift.
const items = [
  {
    icon: Clock,
    label: "5+ Years in Business",
  },
  {
    icon: ShieldCheck,
    label: "Licensed & Insured",
  },
  {
    icon: Star,
    label: aggregateRating
      ? `${aggregateRating.ratingValue}★ (${aggregateRating.reviewCount} Google Reviews)`
      : "See our Google Reviews",
  },
  {
    icon: Award,
    label: `Since ${site.founded}`,
  },
];

export function TrustBar() {
  return (
    <section className="border-b border-border bg-card py-6">
      <Container className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon size={26} className="text-ember" aria-hidden="true" />
            <span className="text-sm font-semibold text-navy">{label}</span>
          </div>
        ))}
      </Container>
    </section>
  );
}
