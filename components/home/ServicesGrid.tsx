import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ServiceCard } from "@/components/ServiceCard";
import { services } from "@/data/services";

export function ServicesGrid() {
  return (
    <section className="bg-card py-16 sm:py-20">
      <Container>
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            Everything Your Home’s HVAC System Needs
          </h2>
          <p className="max-w-xl text-muted">
            Repair, replacement, or a whole new system — pick a service to
            learn more, or just get a free quote.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 9).map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/services" className="font-semibold text-ember hover:underline">
            View all services →
          </Link>
        </div>
      </Container>
    </section>
  );
}
