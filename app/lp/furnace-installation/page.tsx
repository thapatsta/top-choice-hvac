import type { Metadata } from "next";
import { Archivo } from "next/font/google";
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
// The headline weight (900) is loaded here only, so the rest of the site
// doesn't download it. Used through the .lp-black class in globals.css.
const archivoBlack = Archivo({
  variable: "--font-lp-black",
  subsets: ["latin"],
  weight: "900",
});

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

// The first two are the featured cards; the rest render as compact rows.
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
    icon: MapPin,
    title: "Local to Brampton & the GTA",
    body: `Serving ${localAreas.slice(0, -1).join(", ")} and ${localAreas.at(-1)} since ${site.founded}.`,
  },
  {
    icon: Clock,
    title: "Here when it matters",
    body: "No heat in January? We're open 24/7. Call and talk to a real person, not a call centre.",
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

// Brand icons on the LP sit in a navy chip with a beige glyph; orange is
// kept for action buttons and step numbers only.
function IconChip({ icon: Icon, size = "md" }: { icon: LucideIcon; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-8 w-8 rounded-lg" : "h-9 w-9 rounded-[10px]";
  return (
    <span className={`flex shrink-0 items-center justify-center bg-navy text-cream ${box}`}>
      <Icon size={size === "sm" ? 16 : 18} aria-hidden="true" />
    </span>
  );
}

function RatingLine() {
  if (site.rating === undefined || site.reviewCount === undefined) return null;
  return (
    <a
      href={site.googleReviewsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-white hover:underline"
    >
      <span className="font-display text-lg font-extrabold">{site.rating.toFixed(1)}</span>
      <span className="flex" role="img" aria-label="5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={18} className="fill-(--lp-star) text-(--lp-star)" aria-hidden="true" />
        ))}
      </span>
      <span className="text-sm text-(--lp-hero-sub)">Based on {site.reviewCount} Google reviews</span>
    </a>
  );
}

const sectionHeading = "lp-black text-2xl leading-tight tracking-[-0.02em] sm:text-4xl";
const orangeButton =
  "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-b-[3px] border-ember-dark bg-ember px-6 font-display text-lg font-extrabold text-white transition-colors duration-150 hover:bg-ember-dark";

export default function FurnaceInstallationLandingPage() {
  const year = new Date().getFullYear();
  const [featured, rows] = [reasons.slice(0, 2), reasons.slice(2)];

  return (
    // .lp scopes the landing-page palette (globals.css). -mb-16 cancels the
    // root layout's phone-only bottom padding on <main> (room for the global
    // sticky bar, hidden here); the footer's own pb-24 keeps it clear of
    // LpStickyBar instead.
    <div className={`lp ${archivoBlack.variable} -mb-16 overflow-x-clip lg:mb-0`}>
      <header className="lp-dark bg-navy" data-track-location="lp_header">
        <Container className="flex h-16 items-center justify-between gap-2 sm:h-20">
          <div className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-white min-[400px]:text-xl sm:text-2xl">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white/12 text-cream min-[400px]:h-9 min-[400px]:w-9">
              <Flame size={20} aria-hidden="true" />
            </span>
            <span className="whitespace-nowrap">
              Top Choice <span className="text-(--lp-hero-sub)">HVAC</span>
            </span>
          </div>
          <a
            href={site.phone.href}
            aria-label={`Call now, ${site.phone.display}`}
            className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full bg-ember px-3.5 font-display text-base font-extrabold text-white transition-colors duration-150 hover:bg-ember-dark min-[400px]:px-4"
          >
            <Phone size={18} aria-hidden="true" />
            Call now
          </a>
        </Container>
      </header>

      {/* Phones: the headline block carries a full-bleed navy band (box-shadow
          + clip-path, so no horizontal scroll) with extra bottom padding, and
          the form card pulls up 34px to overlap it. Desktop: the whole
          section is navy and the form sits in the right column. */}
      <section className="lg:bg-navy lg:py-16">
        <Container className="grid lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="lp-dark flex flex-col gap-4 bg-navy pb-[58px] pt-6 shadow-[0_0_0_100vmax_var(--color-navy)] [clip-path:inset(0_-100vmax)] sm:pt-10 lg:gap-5 lg:pb-0 lg:pt-4">
            <span className="self-start rounded-full bg-white/12 px-3 py-1 text-sm font-bold text-cream">
              Licensed &amp; insured
            </span>
            <h1 className="lp-black text-[33px] leading-[1.02] tracking-[-0.02em] text-white sm:text-5xl lg:text-[56px]">
              Furnace Installation, Done Right. Priced Upfront.
            </h1>
            <p className="text-base text-(--lp-hero-sub) sm:text-lg">
              Get winter-ready with a new furnace from a local Brampton team. Free quote in
              minutes. No hidden fees, no pushy sales.
            </p>
            <div>
              <RatingLine />
            </div>
          </div>

          <div
            id="quote"
            className="relative -mt-[34px] scroll-mt-4 rounded-[18px] bg-cream p-[18px] shadow-[0_14px_36px_rgba(21,41,63,0.22)] sm:p-8 lg:mt-0 lg:shadow-[0_18px_48px_rgba(0,0,0,0.35)]"
          >
            <h2 className="mb-2 font-display text-2xl font-extrabold tracking-[-0.01em] text-navy">
              Get Your Free Quote
            </h2>
            <LpLeadForm location="hero" />
          </div>
        </Container>
      </section>

      <section className="pb-10 pt-6 lg:py-12">
        <Container>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {trustItems.map(({ icon, title, detail }) => (
              <li key={title} className="flex flex-col gap-2 rounded-xl bg-card p-3.5 sm:flex-row sm:items-start sm:gap-3 sm:p-4">
                <IconChip icon={icon} />
                <span>
                  <span className="block text-balance text-sm font-bold leading-snug text-navy">{title}</span>
                  <span className="block text-sm leading-snug text-muted">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="pb-12 sm:pb-20">
        <Container>
          <h2 className={`${sectionHeading} text-navy`}>Why Brampton homeowners choose Top Choice</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5">
            {featured.map(({ icon, title, body }) => (
              <div key={title} className="flex flex-col gap-2 rounded-xl bg-card p-4 sm:p-6">
                <IconChip icon={icon} />
                <h3 className="mt-1 font-display text-base font-extrabold leading-snug text-navy sm:text-lg">
                  {title}
                </h3>
                <p className="text-sm text-muted sm:text-base">{body}</p>
              </div>
            ))}
          </div>
          <ul className="mt-4 divide-y divide-border sm:mt-6 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:divide-y-0">
            {rows.map(({ icon, title, body }) => (
              <li key={title} className="flex items-start gap-3 py-3.5 lg:border-b lg:border-border">
                <IconChip icon={icon} size="sm" />
                <p className="text-sm leading-snug text-muted">
                  <span className="block font-bold text-navy">{title}</span>
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="lp-dark bg-navy py-12 text-white sm:py-20">
        <Container>
          <h2 className={sectionHeading}>How it works</h2>
          <ol className="mt-6 grid gap-6 sm:mt-10 sm:grid-cols-3 sm:gap-8">
            {steps.map((step, i) => (
              <li key={step.title} className="flex items-start gap-4 sm:flex-col">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ember font-display text-xl font-extrabold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg font-extrabold sm:text-xl">{step.title}</h3>
                  <p className="mt-1 text-(--lp-hero-sub)">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-12 sm:py-20">
        <Container className="max-w-3xl">
          <h2 className={`${sectionHeading} text-navy`}>Common questions</h2>
          <div className="lp-faq mt-6">
            <FAQAccordion items={faqs} />
          </div>
        </Container>
      </section>

      <GoogleReviewsCollage />

      <section
        className="lp-dark bg-navy py-12 text-white sm:py-20"
        data-track-location="lp_closing_cta"
      >
        <Container className="flex flex-col items-start sm:items-center sm:text-center">
          <h2 className={sectionHeading}>Ready for a warmer winter?</h2>
          <p className="mt-3 max-w-xl text-lg text-(--lp-hero-sub)">
            Get your free quote, or call us any time, {site.hours.emergency}.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a href="#quote" className={orangeButton}>
              Get My Free Quote
            </a>
            <a
              href={site.phone.href}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-white/80 px-6 font-display text-lg font-extrabold text-white transition-colors duration-150 hover:bg-white hover:text-navy"
            >
              <Phone size={20} aria-hidden="true" />
              Call {site.phone.display}
            </a>
          </div>
        </Container>
      </section>

      <footer
        data-track-location="lp_footer"
        className="lp-dark border-t border-white/10 bg-navy pb-24 pt-6 text-sm text-(--lp-hero-sub) lg:pb-6"
      >
        <Container className="flex flex-col gap-1 text-center">
          <p className="font-semibold text-white">{site.legalName}</p>
          <p>
            {site.address.street}, {site.address.city}, {site.address.region}{" "}
            {site.address.postalCode}
          </p>
          <p>
            <a href={site.phone.href} className="hover:text-white hover:underline">
              {site.phone.display}
            </a>{" "}
            · {site.insurance}
          </p>
          <p className="mt-2 text-xs text-white/60">
            &copy; {year} {site.legalName} All rights reserved.
          </p>
        </Container>
      </footer>

      <LpStickyBar />
    </div>
  );
}
