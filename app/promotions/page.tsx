import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/CTABand";
import { promotions } from "@/data/promotions";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Seasonal Promotions & Offers",
  description:
    "Current seasonal HVAC offers from Top Choice HVAC — tune-up specials, inspection deals, and new customer offers.",
  path: "/promotions",
});

export default function PromotionsPage() {
  return (
    <>
      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Current Promotions</h1>
          <p className="mt-4 text-lg text-white/80">
            Seasonal offers that change throughout the year — here’s what’s
            running right now.
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => (
            <div key={promo.slug} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
              {promo.badge && (
                <span className="w-fit rounded-full bg-ember-light px-3 py-1 text-xs font-bold uppercase tracking-wide text-ember-dark">
                  {promo.badge}
                </span>
              )}
              <h2 className="font-display text-xl font-bold text-navy">{promo.title}</h2>
              <p className="text-muted">{promo.description}</p>
              <p className="mt-auto text-sm font-semibold text-navy">{promo.validity}</p>
            </div>
          ))}
        </Container>
      </section>

      <CTABand
        heading="Claim a current promotion"
        subheading="Mention the offer when you request your free quote and we’ll apply it."
      />
    </>
  );
}
