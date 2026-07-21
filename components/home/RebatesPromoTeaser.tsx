import Link from "next/link";
import { Gift, Percent } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function RebatesPromoTeaser() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/rebates"
          className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm hover:shadow-md"
        >
          <Percent size={32} className="text-ember" aria-hidden="true" />
          <h3 className="font-display text-2xl font-bold text-navy">
            Current Rebate Programs
          </h3>
          <p className="text-muted">
            Federal, provincial, and utility incentives can offset the cost of
            a new furnace, AC, or heat pump. See what you may qualify for.
          </p>
          <span className="mt-auto font-semibold text-ember group-hover:underline">
            View rebates →
          </span>
        </Link>
        <Link
          href="/promotions"
          className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm hover:shadow-md"
        >
          <Gift size={32} className="text-ember" aria-hidden="true" />
          <h3 className="font-display text-2xl font-bold text-navy">
            Seasonal Promotions
          </h3>
          <p className="text-muted">
            Tune-up specials and seasonal offers that change throughout the
            year — check the current lineup.
          </p>
          <span className="mt-auto font-semibold text-ember group-hover:underline">
            View promotions →
          </span>
        </Link>
      </Container>
    </section>
  );
}
