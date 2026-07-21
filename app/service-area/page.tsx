import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/CTABand";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "HVAC Service Area — Brampton & the GTA",
  description:
    "Top Choice HVAC serves Brampton and surrounding GTA cities including Mississauga, Vaughan, Caledon, and more.",
  path: "/service-area",
});

export default function ServiceAreaPage() {
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
