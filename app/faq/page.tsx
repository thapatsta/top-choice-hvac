import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CTABand } from "@/components/CTABand";
import { generalFaqs } from "@/data/faqs";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about Top Choice HVAC's licensing, service area, pricing, emergency response, and warranty.",
  path: "/faq",
});

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: generalFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Frequently Asked Questions
          </h1>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          <FAQAccordion items={generalFaqs} />
          <p className="mt-8 text-center text-sm text-muted">
            Looking for questions about a specific service? Check the FAQ
            section on that service’s page.
          </p>
        </Container>
      </section>

      <CTABand />
    </>
  );
}
