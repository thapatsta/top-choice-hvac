import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/CTABand";
import { PaymentCalculator } from "@/components/financing/PaymentCalculator";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "HVAC Financing Options",
  description:
    "Financing options for furnace, AC, and heat pump installations in Brampton & the GTA, plus an estimated monthly payment calculator.",
  path: "/financing",
});

export default function FinancingPage() {
  return (
    <>
      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Financing Options</h1>
          <p className="mt-4 text-lg text-white/80">
            A new furnace or AC is a big purchase — financing can spread the
            cost into manageable monthly payments.
            [PLACEHOLDER: confirm real financing partner and terms].
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="max-w-2xl">
          <PaymentCalculator />
          <p className="mt-6 text-center text-sm text-muted">
            Have questions about financing eligibility?{" "}
            <a href="/contact" className="font-semibold text-ember hover:underline">
              Contact us
            </a>{" "}
            or ask during your free in-home assessment.
          </p>
        </Container>
      </section>

      <CTABand />
    </>
  );
}
