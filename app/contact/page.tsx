import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { MapPlaceholder } from "@/components/contact/MapPlaceholder";
import { site, NAP_JSON_LD } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Contact Top Choice HVAC — call, email, or send a message. Serving Brampton and the greater GTA.",
  path: "/contact",
});

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    ...NAP_JSON_LD,
    url: site.url,
    openingHours: [`Mo-Fr ${site.hours.weekday}`, `Sa ${site.hours.saturday}`],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Contact Us</h1>
          <p className="mt-4 text-lg text-white/80">
            Call for the fastest response, or send us a message below.
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <ul className="flex flex-col gap-4">
                <li className="flex items-center gap-3">
                  <Phone size={20} className="text-ember" aria-hidden="true" />
                  <a href={site.phone.href} className="font-semibold text-navy hover:text-ember">
                    {site.phone.display}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={20} className="text-ember" aria-hidden="true" />
                  <a href={`mailto:${site.email}`} className="font-semibold text-navy hover:text-ember">
                    {site.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-ember" aria-hidden="true" />
                  <span className="text-navy">
                    {site.address.street}, {site.address.city}, {site.address.region}{" "}
                    {site.address.postalCode}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={20} className="mt-0.5 shrink-0 text-ember" aria-hidden="true" />
                  <span className="text-navy">
                    Mon–Fri: {site.hours.weekday}
                    <br />
                    Sat: {site.hours.saturday}
                    <br />
                    Sun: {site.hours.sunday}
                  </span>
                </li>
              </ul>
            </div>
            <MapPlaceholder />
          </div>
          <ContactForm />
        </Container>
      </section>
    </>
  );
}
