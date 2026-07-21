import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, DollarSign, Gift } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CTABand } from "@/components/CTABand";
import { services, getServiceBySlug } from "@/data/services";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  const title = `${service.name} in Brampton, ON`;
  return {
    title,
    description: service.metaDescription,
    alternates: { canonical: `${site.url}/services/${service.slug}` },
    openGraph: { title, description: service.metaDescription },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.name,
    provider: { "@type": "HVACBusiness", name: site.name },
    areaServed: site.serviceAreas.map((city) => ({ "@type": "City", name: city })),
    description: service.metaDescription,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((f) => ({
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[auto_1fr]">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ember-light text-ember">
            <ServiceIcon icon={service.icon} size={32} aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
              {service.name} in Brampton & the GTA
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-white/80">{service.heroTagline}</p>
            <div className="mt-6">
              <Button href="/get-quote" size="lg">
                Get a Free Quote
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          <p className="text-lg text-navy">{service.intro}</p>

          <h2 className="mt-12 font-display text-2xl font-bold text-navy sm:text-3xl">
            Signs You Need {service.name}
          </h2>
          <ul className="mt-6 flex flex-col gap-3">
            {service.signsYouNeedIt.map((sign) => (
              <li key={sign} className="flex items-start gap-3">
                <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-ember" aria-hidden="true" />
                <span className="text-navy">{sign}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-12 font-display text-2xl font-bold text-navy sm:text-3xl">
            The Top Choice Process
          </h2>
          <ol className="mt-6 flex flex-col gap-5">
            {service.process.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-display font-bold text-ember">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display font-bold text-navy">{step.title}</p>
                  <p className="mt-1 text-muted">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <DollarSign size={24} className="text-ember" aria-hidden="true" />
              <h3 className="mt-2 font-display font-bold text-navy">Financing</h3>
              <p className="mt-1 text-sm text-muted">{service.financingNote}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <Gift size={24} className="text-ember" aria-hidden="true" />
              <h3 className="mt-2 font-display font-bold text-navy">Rebates</h3>
              <p className="mt-1 text-sm text-muted">{service.rebateNote}</p>
            </div>
          </div>

          <h2 className="mt-12 font-display text-2xl font-bold text-navy sm:text-3xl">
            {service.name} FAQ
          </h2>
          <div className="mt-6">
            <FAQAccordion items={service.faqs} />
          </div>

          <p className="mt-10 text-sm text-muted">
            Looking for something else?{" "}
            <Link href="/services" className="font-semibold text-ember hover:underline">
              View all services
            </Link>
            .
          </p>
        </Container>
      </section>

      <CTABand
        heading={`Ready to book ${service.name.toLowerCase()}?`}
        subheading="Get a free quote in minutes, or call now to talk to our team."
      />
    </>
  );
}
