import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceTile } from "@/components/ServiceTile";
import { services } from "@/data/services";

export function ServicesGrid() {
  const gridServices = services.slice(0, 9);
  const tileServices = services.slice(0, 8);

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

        {/* Below md: compact icon + title tiles, capped at 8 */}
        <div className="mt-10 grid grid-cols-2 gap-3 md:hidden">
          {tileServices.map((service) => (
            <ServiceTile key={service.slug} service={service} />
          ))}
          <Link
            href="/services"
            className="col-span-2 flex min-h-[44px] items-center justify-center rounded-xl border border-border bg-cream font-semibold text-ember hover:underline"
          >
            All services →
          </Link>
        </div>

        {/* md and up: full cards, unchanged */}
        <div className="mt-12 hidden md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {gridServices.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
        <div className="mt-8 hidden text-center md:block">
          <Link href="/services" className="font-semibold text-ember hover:underline">
            View all services →
          </Link>
        </div>
      </Container>
    </section>
  );
}
