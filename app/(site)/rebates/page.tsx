import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, ClipboardList, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/CTABand";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PhoneLink, PhoneText } from "@/components/Phone";
import { RebateFinder } from "@/components/rebates/RebateFinder";
import { ProgramBoard } from "@/components/rebates/ProgramBoard";
import { PreApprovalTimeline } from "@/components/rebates/PreApprovalTimeline";
import { ProofStrip } from "@/components/rebates/ProofStrip";
import { programsByStatus, rebateFaqs, REBATES_VERIFIED } from "@/data/rebates";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Ontario HVAC & Heat Pump Rebates: What's Open (2026)",
  description: `Which Ontario HVAC rebates are open right now? Heat pump rebates up to $7,500, what's closed, and how pre-approval works. Checked ${REBATES_VERIFIED}.`,
  path: "/rebates",
});

export default function RebatesPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: rebateFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const counts = [
    { n: programsByStatus("open").length, label: "open" },
    { n: programsByStatus("announced").length, label: "announced" },
    { n: programsByStatus("closed").length, label: "closed" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero: answers the search ("rebates") in the first screen, then hands off to the finder. */}
      <section className="bg-navy pb-28 pt-12 text-white sm:pb-36 sm:pt-16">
        <Container className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ember-light">
              Ontario rebates · Checked {REBATES_VERIFIED}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              What Ontario will actually pay toward your heat pump.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/80">
              Many of the rebates you&rsquo;ll find on Google have closed. Here&rsquo;s what&rsquo;s open
              today, what&rsquo;s only been announced, and how to claim it without losing the money to a
              missed step.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-3 text-center">
            {counts.map((c) => (
              <div key={c.label} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <dt className="sr-only">{c.label}</dt>
                <dd className="font-display text-4xl font-extrabold text-ember-light">{c.n}</dd>
                <dd className="text-xs font-bold uppercase tracking-widest text-white/70">
                  {c.label}
                </dd>
              </div>
            ))}
          </dl>
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

      <section className="py-16 sm:py-20">
        <Container>
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            Every program, by what you can use today
          </h2>
          <div className="mt-10">
            <ProgramBoard />
          </div>
        </Container>
      </section>

      <section className="bg-card py-16 sm:py-20">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ember">
              The step that costs people money
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-navy sm:text-4xl">
              Approval comes first. Install comes second.
            </h2>
            <p className="mt-4 text-lg text-muted">
              Ontario&rsquo;s heat pump rebate is only paid if the program approves your project in
              writing before work begins. That&rsquo;s why the call comes before the purchase.
            </p>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-cream p-5">
              <ShieldCheck size={24} className="mt-0.5 shrink-0 text-ember" aria-hidden="true" />
              <p className="text-navy">
                We&rsquo;re a participating contractor, so we prepare and submit both applications
                for you. You don&rsquo;t fill out program forms.
              </p>
            </div>
          </div>
          <PreApprovalTimeline />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            Three ways to get us on your rebate
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-muted">
            Tell us your heating fuel and what you&rsquo;re replacing. We&rsquo;ll tell you honestly
            whether a rebate applies, including when it doesn&rsquo;t.
          </p>
          <div
            data-track-location="rebates_contact"
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <PhoneLink className="group flex flex-col gap-2 rounded-2xl border-2 border-ember bg-ember-light/50 p-5 hover:bg-ember-light">
              <Phone size={26} className="text-ember" aria-hidden="true" />
              <span className="font-display text-xl font-bold text-navy">Call us</span>
              <span className="text-sm text-navy/80">Fastest. Ask about rebate pre-approval.</span>
              <span className="mt-auto font-display text-lg font-extrabold text-ember">
                <PhoneText />
              </span>
            </PhoneLink>
            <Link
              href="/get-quote?system=heat-pump"
              className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 hover:border-ember"
            >
              <ClipboardList size={26} className="text-ember" aria-hidden="true" />
              <span className="font-display text-xl font-bold text-navy">Free quote</span>
              <span className="text-sm text-muted">About 60 seconds. We call you back.</span>
              <span className="mt-auto font-semibold text-ember group-hover:underline">
                Start my quote →
              </span>
            </Link>
            <a
              href={`mailto:${site.email}?subject=Heat%20pump%20rebate%20question`}
              className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 hover:border-ember"
            >
              <Mail size={26} className="text-ember" aria-hidden="true" />
              <span className="font-display text-xl font-bold text-navy">Email us</span>
              <span className="text-sm text-muted">Send your fuel type and city.</span>
              <span className="mt-auto break-all font-semibold text-ember group-hover:underline">
                {site.email}
              </span>
            </a>
          </div>
          <p className="mt-5 text-sm text-muted">
            Buying a furnace or AC and not a heat pump?{" "}
            <Link href="/financing" className="font-semibold text-ember hover:underline">
              See financing
            </Link>
            . We don&rsquo;t pretend a rebate exists when it doesn&rsquo;t.
          </p>
        </Container>
      </section>

      <section className="bg-card py-16 sm:py-20">
        <Container className="max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            Rebate questions, answered
          </h2>
          <div className="mt-8">
            <FAQAccordion items={rebateFaqs} />
          </div>
        </Container>
      </section>

      <CTABand
        heading="Not sure what applies to you? Ask us."
        subheading="Tell us your heating fuel and we'll tell you straight whether a rebate applies, before you spend anything."
      />
    </>
  );
}
