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

// TODO: real headshot for Robin still needed — see CONTENT-NEEDED.md.
const team = [{ name: "Robin", role: "Owner & Lead Technician" }];

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
            Robin has been tinkering with mechanical things for as long as he
            can remember — taking apart anything he could get his hands on to
            figure out how it worked, and putting it back together.
          </p>
          <p className="mt-4 text-navy">
            What turned that curiosity into a career was watching his dad get
            taken advantage of by a water heater company. It was a hard
            lesson in how easy it is for homeowners to get pushed into bad
            deals when nobody takes the time to explain what they’re
            actually paying for.
          </p>
          <p className="mt-4 text-navy">
            Robin started Top Choice HVAC in {site.founded} to make sure
            other families don’t go through the same thing: clear pricing
            before any work begins, straight answers about what your system
            really needs, and no pressure to buy what you don’t.
          </p>

          <h2 className="mt-12 font-display text-2xl font-bold text-navy sm:text-3xl">Our Team</h2>
          <p className="mt-4 text-navy">
            A small, local business — Robin shows up, does the work right,
            and treats your home like it’s his own.
          </p>
          <div className="mt-6 flex justify-center">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center sm:flex-row sm:text-left"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ember-light text-ember">
                  <Users size={28} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-navy">{member.name}</p>
                  <p className="text-sm text-muted">{member.role}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-12 font-display text-2xl font-bold text-navy sm:text-3xl">
            Licensed, Insured, Local
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
              <ShieldCheck size={22} className="text-ember" aria-hidden="true" />
              <span className="text-sm font-semibold text-navy">{site.insurance}</span>
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
