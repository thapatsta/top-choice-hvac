import Link from "next/link";
import { Phone, Mail, MapPin, Flame } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { services } from "@/data/services";
import { site } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-navy pb-24 pt-14 text-white/80 lg:pb-14">
      <Container className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ember text-white">
              <Flame size={16} aria-hidden="true" />
            </span>
            Top Choice <span className="text-ember">HVAC</span>
          </div>
          <p className="mt-4 text-sm">
            Residential & light-commercial heating and cooling, based in
            Brampton and serving the greater GTA.
          </p>
          <p className="mt-4 text-sm">{site.insurance}</p>
          <p className="mt-1 text-sm">License: {site.license}</p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Services
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/services" className="hover:text-ember">
                All Services
              </Link>
            </li>
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:text-ember">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Company
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-ember">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/service-area" className="hover:text-ember">
                Service Area
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-ember">
                Gallery
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="hover:text-ember">
                Reviews
              </Link>
            </li>
            <li>
              <Link href="/rebates" className="hover:text-ember">
                Rebates
              </Link>
            </li>
            <li>
              <Link href="/promotions" className="hover:text-ember">
                Promotions
              </Link>
            </li>
            <li>
              <Link href="/financing" className="hover:text-ember">
                Financing
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-ember">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-ember">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/emergency-service" className="font-semibold text-ember hover:underline">
                Emergency Service
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={site.phone.href} className="flex items-center gap-2 hover:text-ember">
                <Phone size={16} aria-hidden="true" />
                {site.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-ember">
                <Mail size={16} aria-hidden="true" />
                {site.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                {site.address.street}, {site.address.city}, {site.address.region}{" "}
                {site.address.postalCode}
              </span>
            </li>
          </ul>
          <div className="mt-4 text-sm">
            <p>Mon–Fri: {site.hours.weekday}</p>
            <p>Sat: {site.hours.saturday}</p>
            <p>Sun: {site.hours.sunday}</p>
            <p className="mt-1 font-semibold text-ember">{site.hours.emergency}</p>
          </div>
        </div>
      </Container>

      <Container className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
        <p>
          &copy; {year} {site.legalName}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
