import Link from "next/link";
import { Phone, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GoogleGIcon } from "@/components/icons/GoogleGIcon";
import { HeroVisual } from "@/components/home/HeroVisual";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />
      <Container className="relative grid grid-cols-1 items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-ember-light">
            <ShieldCheck size={16} aria-hidden="true" />
            Serving the Greater Toronto Area
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Heating & cooling problems, fixed by people who show up on time.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-white/80">
            No-heat and no-AC calls, honest quotes, and straight answers —
            from a local Brampton team, not a call centre.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/get-quote" size="lg">
              Get a Free Quote
            </Button>
            <Button href={site.phone.href} variant="outline-light" size="lg">
              <Phone size={20} aria-hidden="true" />
              Call Now
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
            {typeof site.rating === "number" && typeof site.reviewCount === "number" && (
              <a
                href={site.googleReviewsUrl}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 font-semibold text-white hover:text-ember-light"
              >
                <GoogleGIcon size={18} />
                {site.rating}★ · {site.reviewCount} Google reviews
              </a>
            )}
            <span className="flex items-center gap-2">
              <span className="text-white/30" aria-hidden="true">
                ·
              </span>
              <Link
                href="/emergency-service"
                className="font-semibold text-white hover:text-ember-light"
              >
                {site.hours.emergency}
              </Link>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-white/30" aria-hidden="true">
                ·
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-white/80">
                <ShieldCheck size={16} aria-hidden="true" />
                Licensed &amp; insured
              </span>
            </span>
          </div>
        </div>

        <HeroVisual heroImage={site.heroImage} />
      </Container>
    </section>
  );
}
