import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/CTABand";
import { cityPath, publishedCities } from "@/content/cities";
import { cityAnchor } from "@/lib/cityPages";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "HVAC Service Area — Brampton & the GTA",
  description:
    "Top Choice HVAC serves Brampton and surrounding GTA cities including Mississauga, Vaughan, Caledon, and more.",
  path: "/service-area",
});

export default function ServiceAreaPage() {
  const cities = publishedCities();
  return (
    <>
      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Our Service Area</h1>
          <p className="mt-4 text-lg text-white/80">
            Based in Brampton, proudly serving homeowners across the greater
            GTA.
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          {/* City pages: ready cities only (content/cities). Renders nothing until one is ready. */}
          {cities.length > 0 && (
            <div className="mb-12">
              <h2 className="font-display text-2xl font-bold text-navy">City pages</h2>
              <p className="mt-2 text-navy">
                Local details on furnace repair, furnace installation and AC installation in these cities.
              </p>
              <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {cities.map((city, i) => (
                  <li key={city.slug}>
                    <Link
                      href={cityPath(city)}
                      className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-5 hover:shadow-md"
                    >
                      <span className="font-display text-lg font-bold text-navy">{cityAnchor(city, i)}</span>
                      <span className="text-sm text-muted">{city.hubLine}</span>
                      <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-ember">
                        See {city.name} <ArrowRight size={16} aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <h2 className="mt-12 font-display text-2xl font-bold text-navy">All areas we serve</h2>
            </div>
          )}
          {/* TODO: confirm the complete, accurate list of cities/regions actually served before launch — the list below is a plausible starting point */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {site.serviceAreas.map((city) => (
              <div
                key={city}
                className="flex items-center gap-2 rounded-xl border border-border bg-card p-4"
              >
                <MapPin size={18} className="shrink-0 text-ember" aria-hidden="true" />
                <span className="font-semibold text-navy">{city}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-muted">
            Don’t see your city listed? Give us a call — we may still be able
            to help, or point you to a trusted resource.
          </p>
        </Container>
      </section>

      <CTABand />
    </>
  );
}
