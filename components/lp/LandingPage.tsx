import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Tag,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { GoogleReviewsCollage } from "@/components/lp/GoogleReviewsCollage";
import { LpCrosslink } from "@/components/lp/LpCrosslink";
import { LpFaq } from "@/components/lp/LpFaq";
import { LpFooter } from "@/components/lp/LpFooter";
import { LpHeader } from "@/components/lp/LpHeader";
import { LpLeadForm } from "@/components/lp/LpLeadForm";
import { LpStickyBar } from "@/components/lp/LpStickyBar";
import { archivoBlack } from "@/components/lp/fonts";
import {
  HOW_IT_WORKS,
  TRUST_ITEMS,
  lpContext,
  type LandingPageConfig,
  type LpCrossSell,
} from "@/lib/landing-pages";
import type { LpContext } from "@/lib/landingPage";
import { GOOGLE_REVIEWS, site } from "@/lib/site";

// The shared template for every Google Ads landing page under /lp/*. All
// copy comes from the page's entry in lib/landing-pages.ts; the strings in
// this file are layout labels only (tests/lp-content.test.ts scans both).
//
// The global header, footer and sticky bar are hidden on /lp/* by
// SiteChrome; this template brings its own minimal versions. Pages are
// noindex (paid traffic only) but NOT disallowed in robots.ts, so Google Ads
// can still crawl them, and they are left out of the sitemap.

const TRUST_ICONS: LucideIcon[] = [Tag, Clock, ShieldCheck, ThumbsUp];

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
  return (
    <a
      href={site.googleReviewsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[44px] flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-white hover:underline"
    >
      <span className="font-display text-lg font-extrabold">{GOOGLE_REVIEWS.rating.toFixed(1)}</span>
      <span className="flex" role="img" aria-label="5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={18} className="fill-(--lp-star) text-(--lp-star)" aria-hidden="true" />
        ))}
      </span>
      <span className="text-sm text-(--lp-hero-sub)">from {GOOGLE_REVIEWS.count} Google reviews</span>
    </a>
  );
}

const sectionHeading = "lp-black text-2xl leading-tight tracking-[-0.02em] sm:text-4xl";
const orangeButton =
  "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-b-[3px] border-ember-dark bg-ember px-6 font-display text-lg font-extrabold text-white transition-colors duration-150 hover:bg-ember-dark";
const crosslinkClass =
  "inline-flex min-h-[44px] items-center font-semibold text-navy underline underline-offset-4 hover:no-underline";

function CrossSell({
  crossSell,
  lp,
  priceNote,
}: {
  crossSell: LpCrossSell;
  lp: LpContext;
  priceNote?: string;
}) {
  if (crossSell.kind === "repair-or-replace") {
    return (
      <section className="pb-12 sm:pb-20" data-track-location="lp_repair_or_replace">
        <Container>
          <div className="rounded-2xl border-2 border-navy bg-card p-5 sm:p-8">
            <p className="font-display text-lg font-extrabold text-navy sm:text-xl">{crossSell.text}</p>
            {priceNote && <p className="mt-2 text-sm text-muted">{priceNote}</p>}
            <p className="mt-3">
              <LpCrosslink
                to={crossSell.link.slug}
                from={lp}
                location="lp_repair_or_replace"
                className={crosslinkClass}
              >
                {crossSell.link.label} →
              </LpCrosslink>
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="pb-12 sm:pb-20" data-track-location="lp_choices">
      <Container>
        <h2 className={`${sectionHeading} text-navy`}>{crossSell.heading}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-5">
          {crossSell.cards.map((card) => (
            <li key={card.title} className="flex flex-col gap-2 rounded-xl bg-card p-4 sm:p-6">
              <h3 className="font-display text-lg font-extrabold text-navy">{card.title}</h3>
              <p className="text-sm text-muted sm:text-base">{card.body}</p>
              {card.link && (
                <LpCrosslink
                  to={card.link.slug}
                  from={lp}
                  location="lp_choices"
                  className={crosslinkClass}
                >
                  {card.link.label} →
                </LpCrosslink>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function LandingPage({ config }: { config: LandingPageConfig }) {
  const lp = lpContext(config);
  // On the repair pages the price only appears in the repair-or-replace
  // panel, so its note sits there; elsewhere it sits under the headline.
  const heroPriceNote = config.service === "repair" ? undefined : config.priceNote;
  const credentials = config.credentialClaims;

  return (
    // .lp scopes the landing-page palette (globals.css). -mb-16 cancels the
    // root layout's phone-only bottom padding on <main> (room for the global
    // sticky bar, hidden here); the footer's own pb-24 keeps it clear of
    // LpStickyBar instead. data-lp-* feed click_to_call (AnalyticsListeners).
    <div
      className={`lp ${archivoBlack.variable} -mb-16 overflow-x-clip lg:mb-0`}
      data-lp-slug={lp.lp_slug}
      data-lp-region={lp.lp_region}
      data-lp-service={lp.lp_service}
    >
      <LpHeader />

      {/* Phones: the headline block carries a full-bleed navy band (box-shadow
          + clip-path, so no horizontal scroll) with extra bottom padding, and
          the form card pulls up 34px to overlap it. Desktop: the whole
          section is navy and the form sits in the right column. */}
      <section className="lg:bg-navy lg:py-16">
        <Container className="grid lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="lp-dark flex flex-col gap-3 bg-navy pb-[50px] pt-5 shadow-[0_0_0_100vmax_var(--color-navy)] [clip-path:inset(0_-100vmax)] sm:gap-4 sm:pt-10 lg:gap-5 lg:pb-0 lg:pt-4">
            <p className="self-start rounded-full bg-white/12 px-3 py-1 text-sm font-bold text-cream">
              {config.eyebrow}
            </p>
            {credentials.enabled && (
              <p className="self-start rounded-full bg-white/12 px-3 py-1 text-sm font-bold text-cream">
                {credentials.badge}
              </p>
            )}
            <h1 className="lp-black text-[33px] leading-[1.02] tracking-[-0.02em] text-white sm:text-5xl lg:text-[56px]">
              {config.h1}
            </h1>
            <p className="text-base text-(--lp-hero-sub) sm:text-lg">{config.subhead}</p>
            {heroPriceNote && (
              <p className="border-l-2 border-ember pl-3 text-sm text-white/85">{heroPriceNote}</p>
            )}
            <div>
              <RatingLine />
            </div>
          </div>

          <div
            id="quote"
            className="relative -mt-[34px] scroll-mt-4 rounded-[18px] bg-cream p-[18px] shadow-[0_14px_36px_rgba(21,41,63,0.22)] sm:p-8 lg:mt-0 lg:shadow-[0_18px_48px_rgba(0,0,0,0.35)]"
          >
            <h2 className="mb-2 font-display text-2xl font-extrabold tracking-[-0.01em] text-navy">
              {config.formHeading}
            </h2>
            <LpLeadForm
              location="hero"
              lp={lp}
              defaultService={config.defaultService}
              buttonLabel={config.formButton}
            />
          </div>
        </Container>
      </section>

      <section className="pb-10 pt-6 lg:py-12">
        <Container>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {TRUST_ITEMS.map(({ title, detail }, i) => (
              <li
                key={title}
                className="flex flex-col gap-2 rounded-xl bg-card p-3.5 sm:flex-row sm:items-start sm:gap-3 sm:p-4"
              >
                <IconChip icon={TRUST_ICONS[i % TRUST_ICONS.length]} />
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
          <h2 className={`${sectionHeading} text-navy`}>Why homeowners choose Top Choice</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
            {config.benefits.map(({ title }) => (
              <li key={title} className="flex items-start gap-3 rounded-xl bg-card p-4">
                <IconChip icon={CheckCircle2} size="sm" />
                <span className="pt-1 font-bold leading-snug text-navy">{title}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 flex items-start gap-2 text-sm text-muted">
            <MapPin size={18} className="mt-0.5 shrink-0 text-navy" aria-hidden="true" />
            {config.serviceAreaLine}
          </p>
        </Container>
      </section>

      {config.crossSell && (
        <CrossSell crossSell={config.crossSell} lp={lp} priceNote={config.priceNote} />
      )}

      <section className="lp-dark bg-navy py-12 text-white sm:py-20">
        <Container>
          <h2 className={sectionHeading}>How it works</h2>
          <ol className="mt-6 grid gap-6 sm:mt-10 sm:grid-cols-3 sm:gap-8">
            {HOW_IT_WORKS.map((step, i) => (
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
            <LpFaq items={config.faq} />
          </div>
        </Container>
      </section>

      <GoogleReviewsCollage />

      <section className="lp-dark bg-navy py-12 text-white sm:py-20" data-track-location="lp_closing_cta">
        <Container className="flex flex-col items-start sm:items-center sm:text-center">
          <h2 className={sectionHeading}>{config.bottomCta}</h2>
          <p className="mt-3 max-w-xl text-lg text-(--lp-hero-sub)">{config.bottomCtaText}</p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a href="#quote" className={orangeButton}>
              {config.formButton}
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

      <LpFooter />

      <LpStickyBar />
    </div>
  );
}
