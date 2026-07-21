import type { Metadata } from "next";
import { ShieldCheck, Users, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/CTABand";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "Top Choice HVAC is a Brampton-based heating and cooling contractor serving the greater GTA with upfront pricing and honest service.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">About Top Choice HVAC</h1>
          <p className="mt-4 text-lg text-white/80">
            A Brampton-based heating and cooling team, built around showing
            up, telling the truth, and doing the job right the first time.
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">Our Story</h2>
          <p className="mt-4 text-navy">
            [PLACEHOLDER: real founding story — when Top Choice HVAC started,
            why, and what problem in the local market it set out to solve.
            Replace this paragraph with the client’s actual story before
            launch.]
          </p>

          <h2 className="mt-12 font-display text-2xl font-bold text-navy sm:text-3xl">Our Team</h2>
          <p className="mt-4 text-navy">
            [PLACEHOLDER: team bios and photos. For Phase 1 launch, at minimum
            include the owner/lead technician’s name, background, and a real
            photo — this matters for local trust signals.]
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-6 text-center"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ember-light text-ember">
                  <Users size={28} aria-hidden="true" />
                </span>
                <p className="text-sm text-muted">[PLACEHOLDER: team member name, role, photo]</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 font-display text-2xl font-bold text-navy sm:text-3xl">
            Licensed, Insured, Local
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
              <ShieldCheck size={22} className="text-ember" aria-hidden="true" />
              <span className="text-sm font-semibold text-navy">{site.insurance}</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
              <ShieldCheck size={22} className="text-ember" aria-hidden="true" />
              <span className="text-sm font-semibold text-navy">License: {site.license}</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
              <MapPin size={22} className="text-ember" aria-hidden="true" />
              <span className="text-sm font-semibold text-navy">
                Based in {site.address.city}, {site.address.region}
              </span>
            </div>
          </div>
        </Container>
      </section>

      <CTABand />
    </>
  );
}
