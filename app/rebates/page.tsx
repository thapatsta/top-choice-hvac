import type { Metadata } from "next";
import { Gift } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/CTABand";
import { rebatePrograms } from "@/data/rebates";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Current HVAC Rebates & Incentives",
  description:
    "Federal, provincial, and utility rebate programs for furnace, AC, and heat pump upgrades in Ontario. See what you may qualify for.",
  path: "/rebates",
});

export default function RebatesPage() {
  return (
    <>
      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Current Rebate Programs
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Rebate programs and dollar amounts change frequently. The
            programs below are directional — we’ll confirm exact eligibility
            and amounts during your free assessment.
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          {/* TODO: verify every program name and dollar amount below before launch — these are plausible placeholders, not confirmed real programs */}
          <div className="mb-8 rounded-xl border border-dashed border-ember bg-ember-light p-4 text-sm text-ember-dark">
            <strong>Note:</strong> rebate amounts are estimates and subject to
            change — we’ll confirm exact eligibility during your free
            assessment.
          </div>
          <div className="flex flex-col gap-6">
            {rebatePrograms.map((program) => (
              <div key={program.name} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <Gift size={24} className="mt-1 shrink-0 text-ember" aria-hidden="true" />
                  <div>
                    <h2 className="font-display text-xl font-bold text-navy">{program.name}</h2>
                    <p className="text-sm font-semibold text-muted">{program.provider}</p>
                    <p className="mt-3 text-navy">{program.summary}</p>
                    <p className="mt-3 font-display text-lg font-bold text-ember">
                      {program.amount}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      Applies to: {program.appliesTo.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CTABand
        heading="See what rebates you qualify for"
        subheading="Get a free estimate and we’ll flag every rebate program your project may be eligible for."
      />
    </>
  );
}
