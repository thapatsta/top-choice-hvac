import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PhoneLink, PhoneText } from "@/components/Phone";
import { RebateFinder } from "@/components/rebates/RebateFinder";
import { ProgramBoard } from "@/components/rebates/ProgramBoard";
import { PreApprovalTimeline } from "@/components/rebates/PreApprovalTimeline";
import { ProofStrip } from "@/components/rebates/ProofStrip";
import { HeroIllustration } from "@/components/rebates/graphics/HeroIllustration";
import { buttonClasses } from "@/components/ui/Button";
import { formatCAD } from "@/lib/format";
import { heatPumpRate, rebateFaqs, REBATES_VERIFIED } from "@/data/rebates";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Ontario HVAC & Heat Pump Rebates: What's Open (2026)",
  description: `Which Ontario HVAC rebates are open right now? Heat pump rebates up to $7,500, what's closed, and how pre-approval works. Checked ${REBATES_VERIFIED}.`,
  path: "/rebates",
});

// The five questions people actually ask, in the order they ask them. Shown
// and marked up as the same list so the FAQ schema matches the page.
const SHOWN_FAQ_QUESTIONS = [1, 2, 3, 0, 7];
const shownFaqs = SHOWN_FAQ_QUESTIONS.map((i) => rebateFaqs[i]);

export default function RebatesPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: shownFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const maxRebate = formatCAD(heatPumpRate("electric").cap);
  const gasRebate = formatCAD(heatPumpRate("gas").cap);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero: answers the search ("rebates") in the first screen, then hands off to the finder. */}
      <section className="bg-navy pb-28 pt-12 text-white sm:pb-36 sm:pt-16">
        <Container className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ember-light">
              Ontario rebates · Checked {REBATES_VERIFIED}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Up to {maxRebate} back on a heat pump in Ontario.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/80">
              {gasRebate} if you heat with Enbridge gas. Most of the rebates Google shows have closed.
              Answer four questions to see what you&rsquo;d get. We handle the approval paperwork.
            </p>
          </div>
          <HeroIllustration className="mx-auto hidden w-full max-w-md lg:block" />
        </Container>
      </section>

      {/* Finder overlaps the hero */}
      <section className="-mt-20 sm:-mt-28">
        <Container className="max-w-4xl">
          <RebateFinder />
          <p className="mt-4 text-center text-sm text-muted">
            Estimates use each program&rsquo;s published formula. Final eligibility and amounts are
            set by the program, and we confirm them at your free assessment.
          </p>
        </Container>
      </section>

      <ProofStrip />

      <section className="py-14 sm:py-16">
        <Container>
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            What&rsquo;s open today
          </h2>
          <div className="mt-8">
            <ProgramBoard />
          </div>
        </Container>
      </section>

      <section className="bg-card py-14 sm:py-16">
        <Container className="max-w-3xl">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ember">
            The step that costs people money
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-navy sm:text-4xl">
            Approval comes first. Install comes second.
          </h2>
          <p className="mt-3 text-lg text-muted">
            We&rsquo;re a participating contractor, so we prepare and submit both applications. You
            don&rsquo;t fill out program forms.
          </p>
          <div className="mt-8">
            <PreApprovalTimeline />
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container className="max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            Rebate questions, answered
          </h2>
          <div className="mt-8">
            <FAQAccordion items={shownFaqs} />
          </div>
        </Container>
      </section>

      <section data-track-location="rebates_contact" className="bg-navy py-14 text-white sm:py-16">
        <Container className="flex flex-col items-center gap-5 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Call before you sign anything.
          </h2>
          <p className="max-w-xl text-lg text-white/80">
            Tell us your heating fuel and what you&rsquo;re replacing. We&rsquo;ll tell you honestly
            whether a rebate applies, including when it doesn&rsquo;t.
          </p>
          <PhoneLink className={buttonClasses("primary", "lg")}>
            <Phone size={20} aria-hidden="true" />
            <span>
              Call <PhoneText />
            </span>
          </PhoneLink>
          <Link
            href="/get-quote?system=heat-pump"
            className="text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-white"
          >
            Prefer to type? Get a free quote
          </Link>
        </Container>
      </section>
    </>
  );
}
