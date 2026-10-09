import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ServiceCard } from "@/components/ServiceCard";
import { CTABand } from "@/components/CTABand";
import { services } from "@/data/services";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "HVAC Services in Brampton & the GTA",
  description:
    "Furnace repair & installation, AC repair & installation, heat pumps, ductless systems, water heaters, indoor air quality, maintenance plans, and commercial HVAC.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Our Services</h1>
          <p className="mt-4 text-lg text-white/80">
            From a broken furnace on the coldest night of the year to planning
            a full system replacement — here’s everything we handle.
          </p>
        </Container>
      </section>
      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </Container>
      </section>
      <CTABand />
    </>
  );
}
