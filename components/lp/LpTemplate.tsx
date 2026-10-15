import type { Metadata } from "next";
import Image from "next/image";
import { Phone } from "lucide-react";
import { PhoneLink, PhoneText, TextWithPhone } from "@/components/Phone";
import { LpFaq } from "@/components/lp/LpFaq";
import { LpHeader } from "@/components/lp/LpHeader";
import { LpHero } from "@/components/lp/LpHero";
import { LpReviewsCarousel } from "@/components/lp/LpReviewsCarousel";
import { LpStickyBar } from "@/components/lp/LpStickyBar";
import { PromoBanner } from "@/components/lp/PromoBanner";
import { PromoGate } from "@/components/lp/PromoGate";
import { barlowSemiCondensed, sourceSans3 } from "@/components/lp/fonts";
import {
  lpH2Class,
  lpLeadClass,
  lpLineButtonClass,
  lpButtonClass,
  lpSectionClass,
  lpWrapClass,
  lpXlButtonClass,
} from "@/components/lp/styles";
import { lpReviews } from "@/data/reviews";
import {
  GOOGLE_REVIEWS_URL,
  MAINTENANCE_PROMO,
  SERVICE_AREA_LINE,
  isPromoActive,
  type LpPageConfig,
} from "@/lib/landingPages";
import { pageMetadata } from "@/lib/metadata";
import { PHONE } from "@/lib/phone";
import { site } from "@/lib/site";

// The shared template for /lp/furnace-repair and /lp/furnace-installation.
// Every string comes from the page's entry in lib/landingPages.ts; this file
// only lays it out (tests/lpPages.test.ts scans both, and the rendered HTML).
//
// The site header, footer and sticky bar never render on /lp/* (they live in
// app/(site)/layout.tsx). Pages are noindex (paid traffic only) but NOT
// disallowed in robots.ts, so Google Ads can crawl them, and they are left
// out of the sitemap.

/** noindex/nofollow, self-canonical. */
export function lpPageMetadata(config: LpPageConfig): Metadata {
  return pageMetadata({
    title: config.metaTitle,
    description: config.metaDescription,
    path: `/lp/${config.slug}`,
    noindex: true,
  });
}

function Section({ children, id, narrow }: { children: React.ReactNode; id?: string; narrow?: number }) {
  return (
    <section id={id} className={lpSectionClass}>
      <div className={lpWrapClass} style={narrow ? { maxWidth: narrow } : undefined}>
        {children}
      </div>
    </section>
  );
}

function Checks({ items }: { items: string[] }) {
  return (
    <ul className="my-3 grid gap-1.5">
      {items.map((item) => (
        <li key={item} className="relative pl-6">
          <span aria-hidden="true" className="absolute left-0 font-bold text-lp-cta-dark">
            &#10003;
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function LpTemplate({ config }: { config: LpPageConfig }) {
  // Build-time value; PromoGate re-checks the clock in the browser.
  const promoActive = isPromoActive();
  const { lp } = config;

  return (
    // .lpt + data-theme scope the page tokens (globals.css). data-lp-* feed
    // click_to_call (AnalyticsListeners). pb: room for the phone sticky bar.
    <div
      className={`lpt ${barlowSemiCondensed.variable} ${sourceSans3.variable} overflow-x-clip pb-[72px] min-[900px]:pb-0`}
      data-theme={config.theme}
      data-lp-slug={lp.lp_slug}
      data-lp-region={lp.lp_region}
      data-lp-service={lp.lp_service}
      data-landing-page={config.key}
    >
      <LpHeader variant="themed" />
      <PromoBanner serverActive={promoActive} />

      <LpHero config={config} promoActive={promoActive} />

      {config.fork && (
        <Section id="fork">
          <h2 className={lpH2Class}>{config.fork.heading}</h2>
          <div className="mt-[22px] grid gap-[30px] min-[760px]:grid-cols-2 min-[760px]:gap-14">
            {config.fork.cards.map((card) => (
              <div key={card.title} className="border-t-[3px] border-lp-cta pt-3.5">
                <h3 className="mb-1.5 text-[26px]">{card.title}</h3>
                <p className="mb-1.5 text-lp-muted">{card.body}</p>
                <div className="mb-[18px] mt-3">
                  <Checks items={card.points} />
                </div>
                <a href="#quote" data-lp-pick={card.pick} data-sticky-avoid="" className={lpLineButtonClass}>
                  {card.button}
                </a>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <h2 className={lpH2Class}>{config.reviews.heading}</h2>
        {config.reviews.lead && <p className={lpLeadClass}>{config.reviews.lead}</p>}
        <LpReviewsCarousel
          reviews={lpReviews}
          googleUrl={GOOGLE_REVIEWS_URL}
          googleLinkLabel={config.reviews.googleLink}
        />
      </Section>

      {config.steps && (
        <Section>
          <h2 className={lpH2Class}>{config.steps.heading}</h2>
          <ul className="grid max-w-[40em] gap-3.5">
            {config.steps.items.map((step) => (
              <li key={step.lead} className="relative pl-[22px]">
                <span aria-hidden="true" className="absolute left-0 top-[0.7em] h-2 w-2 rounded-full bg-lp-cta" />
                <b>{step.lead}</b> {step.rest}
              </li>
            ))}
          </ul>
          <p className="mt-[18px] text-lp-muted">{config.steps.note}</p>
        </Section>
      )}

      {config.photoSection && (
        <Section>
          <h2 className={lpH2Class}>{config.photoSection.heading}</h2>
          <figure>
            <Image
              src={config.photoSection.photo.src}
              width={config.photoSection.photo.width}
              height={config.photoSection.photo.height}
              alt={config.photoSection.photo.alt}
              sizes="(min-width: 900px) 760px, calc(100vw - 40px)"
              className="aspect-[16/10] w-full rounded-lg object-cover object-[center_50%] min-[900px]:aspect-[16/9] min-[900px]:max-w-[760px] min-[900px]:object-[center_45%]"
            />
            {config.photoSection.photo.caption && (
              <figcaption className="mt-1.5 text-[14px] text-lp-muted">{config.photoSection.photo.caption}</figcaption>
            )}
          </figure>
        </Section>
      )}

      <PromoGate serverActive={promoActive}>
        <Section narrow={720}>
          <h2 className={lpH2Class}>{MAINTENANCE_PROMO.section.heading}</h2>
          <p className={lpLeadClass}>{MAINTENANCE_PROMO.section.body}</p>
          <p className="mt-4">
            <a href="#quote" data-lp-maintenance="" data-sticky-avoid="" className={lpButtonClass}>
              {MAINTENANCE_PROMO.section.cta}
            </a>
          </p>
        </Section>
      </PromoGate>

      <Section>
        <h2 className={lpH2Class}>{config.faqHeading}</h2>
        <LpFaq items={config.faq} variant="themed" />
      </Section>

      <Section narrow={560}>
        <h2 className={lpH2Class}>{config.closing.heading}</h2>
        <div data-sticky-avoid="">
          {config.closing.cta.kind === "call" ? (
            <PhoneLink trackLocation={config.closing.cta.trackId} className={`${lpXlButtonClass} flex w-full`}>
              <Phone size={26} aria-hidden="true" />
              <span>
                <TextWithPhone text={config.closing.cta.label} />
              </span>
            </PhoneLink>
          ) : (
            <a href={config.closing.cta.href} className={`${lpXlButtonClass} flex w-full`}>
              {config.closing.cta.label}
            </a>
          )}
        </div>
        {config.closing.fine && (
          <p className="mt-2.5 text-[17px] text-lp-muted">
            {config.closing.fine.split(PHONE.display)[0]}
            <PhoneLink trackLocation={config.closing.cta.trackId} className="font-bold text-lp-ink underline underline-offset-2 hover:decoration-2">
              <PhoneText />
            </PhoneLink>
          </p>
        )}
      </Section>

      <footer className="border-t border-lp-line pb-9 pt-7 text-[15px] text-lp-muted" data-track-location="lp_footer">
        <div className={lpWrapClass}>
          {SERVICE_AREA_LINE}
          <br />
          {site.legalName}{" "}
          <PhoneLink className="underline-offset-2 hover:underline">
            <PhoneText />
          </PhoneLink>
        </div>
      </footer>

      <LpStickyBar variant="themed" callLabel={config.sticky.call} alt={config.sticky.alt} />
    </div>
  );
}
