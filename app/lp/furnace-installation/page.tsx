import type { Metadata } from "next";
import {
  BadgeCheck,
  Clock,
  Flame,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Tag,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FAQAccordion } from "@/components/FAQAccordion";
import { LpLeadForm } from "@/components/lp/LpLeadForm";
import { LpStickyBar } from "@/components/lp/LpStickyBar";
import { GoogleReviewsCollage } from "@/components/lp/GoogleReviewsCollage";
import type { FAQ } from "@/data/faqs";
import { CALLBACK_PROMISE } from "@/lib/landingPage";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

// Google Ads landing page. The global header, footer and sticky bar are
// hidden on /lp/* by SiteChrome; this page brings its own minimal versions.
// noindex (paid traffic only) but NOT disallowed in robots.ts, so Google Ads
// can still crawl it, and left out of the sitemap.
//
// Every claim here is a confirmed one: rating and count come from
// data/reviews.ts via site, and there is deliberately no price.
export const metadata: Metadata = pageMetadata({
  title: "Furnace Installation in Brampton & the GTA | Free Quote",
  description:
    "New furnace installation from a local Brampton team. 10-year labour warranty, satisfaction guarantee, licensed and insured. Get your free quote in minutes.",
  path: "/lp/furnace-installation",
  noindex: true,
});

const trustItems: { icon: LucideIcon; title: string; detail: string }[] = [
  { icon: ShieldCheck, title: "10-Year Labour Warranty", detail: "on every installation" },
  { icon: ThumbsUp, title: "Satisfaction Guarantee", detail: "we make it right" },
  { icon: BadgeCheck, title: "Licensed & Insured", detail: "fully covered" },
  { icon: Clock, title: "24/7 Service", detail: "call any time" },
];

const localAreas = site.serviceAreas.slice(0, 4);

const reasons: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Tag,
    title: "Priced upfront",
    body: "You get a clear written quote before any work begins. No hidden fees, no surprise charges.",
  },
  {
    icon: ShieldCheck,
    title: "10-year labour warranty",
    body: "Every installation is backed by a 10-year labour warranty, on top of the manufacturer's equipment warranty.",
  },
  {
    icon: ThumbsUp,
    title: "Satisfaction guarantee",
    body: "If something isn't right, tell us and we'll make it right.",
  },
  {
    icon: BadgeCheck,
    title: "Licensed & insured",
    body: `${site.insurance}, so you can hire us with confidence.`,
  },
  {
    icon: MapPin,
    title: "Local to Brampton & the GTA",
    body: `Serving ${localAreas.slice(0, -1).join(", ")} and ${localAreas.at(-1)} since ${site.founded}.`,
  },
  {
    icon: Clock,
    title: "Here when it matters",
    body: "No heat in January? We're open 24/7. Call and talk to a real person, not a call centre.",
  },
];

const steps: { title: string; body: string }[] = [
  {
    title: "Tell us what you need",
    body: "Fill in the short form. It takes about a minute.",
  },
  {
    title: "We call you back",
    body: `A Top Choice expert calls you back, ${CALLBACK_PROMISE}.`,
  },
  {
    title: "Free in-home assessment",
    body: "We confirm the exact price, then book your install.",
  },
];

const faqs: FAQ[] = [
  {
    question: "How fast will you call me back?",
    answer: `A Top Choice expert calls you back, ${CALLBACK_PROMISE}. If you'd rather talk now, call ${site.phone.display}. We offer ${site.hours.emergency}.`,
  },
  {
    question: "Is the quote really free?",
    answer:
      "Yes. Your quote and in-home assessment are free, with no obligation. You get the price in writing before any work begins.",
  },
  {
    question: "What does the 10-year labour warranty cover?",
    answer:
      "Every furnace we install is backed by a 10-year labour warranty, in addition to the manufacturer's equipment warranty. We go over the details with you at your in-home assessment.",
  },
  {
    question: "What if I'm not happy with the work?",
    answer: "Tell us. Our satisfaction guarantee means we'll work with you to make it right.",
  },
  {
    question: "Which areas do you serve?",
    answer: `We're based in Brampton and serve the GTA, including ${site.serviceAreas.join(", ")}.`,
  },
];

function TrustGrid({ className }: { className: string }) {
  return (
    <ul className={`grid-cols-2 gap-3 ${className}`}>
      {trustItems.map(({ icon: Icon, title, detail }) => (
        <li key={title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <Icon size={24} className="mt-0.5 shrink-0 text-ember" aria-hidden="true" />
          <span>
            <span className="block text-sm font-bold text-navy">{title}</span>
            <span className="block text-sm text-muted">{detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function RatingLine() {
  if (site.rating === undefined || site.reviewCount === undefined) return null;
  return (
    <a
      href={site.googleReviewsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-navy hover:text-ember"
    >
      <span className="font-display text-lg font-bold">{site.rating.toFixed(1)}</span>
      <span className="flex" role="img" aria-label="5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={18} className="fill-ember text-ember" aria-hidden="true" />
        ))}
      </span>
      <span className="text-sm text-muted">Based on {site.reviewCount} Google reviews</span>
    </a>
  );
}

export default function FurnaceInstallationLandingPage() {
  const year = new Date().getFullYear();

  return (
    // -mb-16 cancels the root layout's phone-only bottom padding on <main>
    // (room for the global sticky bar, hidden here); the footer's own pb-24
    // keeps it clear of LpStickyBar instead.
    <div className="-mb-16 lg:mb-0">
      <header className="border-b border-border bg-cream" data-track-location="lp_header">
        <Container className="flex h-16 items-center justify-between gap-3 sm:h-20">
          <div className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-navy sm:text-2xl">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy text-ember">
              <Flame size={20} aria-hidden="true" />
            </span>
            <span className="whitespace-nowrap">
              Top Choice <span className="text-ember">HVAC</span>
            </span>
          </div>
          <Button href={site.phone.href} size="md" className="whitespace-nowrap">
            <Phone size={18} aria-hidden="true" />
            <span className="sm:hidden">Call Now</span>
            <span className="hidden sm:inline">{site.phone.display}</span>
          </Button>
        </Container>
      </header>

      <section className="py-6 sm:py-12 lg:py-16">
        <Container className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="flex flex-col gap-4 lg:gap-5">
            <span className="self-start rounded-full bg-ember-light px-3 py-1 text-sm font-bold text-ember-dark">
              Brampton &amp; GTA · Licensed &amp; Insured
            </span>
            <h1 className="font-display text-3xl font-bold leading-tight text-navy sm:text-5xl">
              Furnace Installation, Done Right. Priced Upfront.
            </h1>
            <p className="text-base text-muted sm:text-lg">
              Get winter-ready with a new furnace from a local Brampton team. Free quote in
              minutes. No hidden fees, no pushy sales.
            </p>
            <div>
              <RatingLine />
            </div>
            <TrustGrid className="mt-2 hidden lg:grid" />
          </div>

          <div
            id="quote"
            className="scroll-mt-4 rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-8"
          >
            <h2 className="mb-3 font-display text-2xl font-bold text-navy">Get Your Free Quote</h2>
            <LpLeadForm location="hero" />
          </div>

          <TrustGrid className="grid lg:hidden" />
        </Container>
      </section>

      <section className="bg-card py-14 sm:py-20">
        <Container>
          <h2 className="text-center font-display text-3xl font-bold text-navy sm:text-4xl">
            Why Brampton homeowners choose Top Choice
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-cream p-6">
                <Icon size={28} className="text-ember" aria-hidden="true" />
                <h3 className="mt-3 font-display text-lg font-bold text-navy">{title}</h3>
                <p className="mt-2 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy py-14 text-white sm:py-20">
        <Container>
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">How it works</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="flex flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ember font-display text-xl font-bold">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-white/80">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          <h2 className="text-center font-display text-3xl font-bold text-navy sm:text-4xl">
            Common questions
          </h2>
          <div className="mt-8">
            <FAQAccordion items={faqs} />
          </div>
        </Container>
      </section>

      <GoogleReviewsCollage />

      <section className="bg-navy py-14 text-white sm:py-20" data-track-location="lp_closing_cta">
        <Container className="flex flex-col items-center text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready for a warmer winter?</h2>
          <p className="mt-3 max-w-xl text-lg text-white/80">
            Get your free quote, or call us any time, {site.hours.emergency}.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button href="#quote" size="lg">
              Get My Free Quote
            </Button>
            <Button href={site.phone.href} size="lg" variant="outline-light">
              <Phone size={20} aria-hidden="true" />
              Call {site.phone.display}
            </Button>
          </div>
        </Container>
      </section>

      <footer
        data-track-location="lp_footer"
        className="border-t border-white/10 bg-navy pb-24 pt-6 text-sm text-white/70 lg:pb-6"
      >
        <Container className="flex flex-col gap-1 text-center">
          <p className="font-semibold text-white">{site.legalName}</p>
          <p>
            {site.address.street}, {site.address.city}, {site.address.region}{" "}
            {site.address.postalCode}
          </p>
          <p>
            <a href={site.phone.href} className="hover:text-ember">
              {site.phone.display}
            </a>{" "}
            · {site.insurance}
          </p>
          <p className="mt-2 text-xs text-white/50">
            &copy; {year} {site.legalName} All rights reserved.
          </p>
        </Container>
      </footer>

      <LpStickyBar />
    </div>
  );
}
