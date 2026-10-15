import Image from "next/image";
import { Phone, Star } from "lucide-react";
import { GoogleGIcon } from "@/components/icons/GoogleGIcon";
import { PhoneLink, TextWithPhone } from "@/components/Phone";
import { LpForm } from "@/components/lp/LpForm";
import { LpTeaser } from "@/components/lp/LpTeaser";
import { lpXlButtonClass } from "@/components/lp/styles";
import { GOOGLE_RATING, REVIEW_COUNT_LABEL, type LpPageConfig } from "@/lib/landingPages";

/** Google, the rating, five stars and the review count label. */
export function GoogleRow() {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[16px]">
      <GoogleGIcon size={18} />
      <b>Google</b>
      <span className="text-[20px] font-bold">{GOOGLE_RATING}</span>
      <span className="inline-flex gap-px" role="img" aria-label={`Rated ${GOOGLE_RATING} out of 5 on Google`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={16} className="fill-lp-star text-lp-star" aria-hidden="true" />
        ))}
      </span>
      <span className="text-lp-muted">{REVIEW_COUNT_LABEL}</span>
    </div>
  );
}

export function LpHero({ config, promoActive }: { config: LpPageConfig; promoActive: boolean }) {
  const form = (
    <LpForm config={config.form} lp={config.lp} pageKey={config.key} promoServerActive={promoActive} />
  );

  return (
    <section className="py-[34px] pb-11 min-[900px]:pb-16 min-[900px]:pt-14">
      <div className="mx-auto grid max-w-[1080px] gap-[26px] px-5 min-[900px]:grid-cols-[1.1fr_0.9fr] min-[900px]:items-start min-[900px]:gap-[52px]">
        <div className="flex flex-col">
          <h1 className="text-[clamp(36px,6vw,58px)]">
            {config.h1}
            {config.heroPrice && (
              <span className="mb-1.5 mt-4 block text-[clamp(64px,11vw,96px)] leading-[0.95] text-lp-cta">
                {config.heroPrice}
              </span>
            )}
          </h1>

          <p
            className={
              config.heroPrice
                ? "mb-[18px] mt-2 max-w-[30em] text-lp-muted"
                : "mt-3.5 max-w-[34em] text-[clamp(18px,2.2vw,21px)] text-lp-muted"
            }
          >
            {config.subhead}
          </p>

          {config.checklist && (
            <ul className="grid gap-1.5">
              {config.checklist.map((item, i) => (
                <li key={item} className="relative pl-6">
                  <span
                    aria-hidden="true"
                    className="lpt-check absolute left-0 inline-block font-bold text-lp-cta"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    &#10003;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          {config.heroCall && (
            <div className="mb-2 mt-6 max-w-[480px]" data-sticky-avoid="">
              <PhoneLink trackLocation={config.heroCall.trackId} className={`${lpXlButtonClass} flex w-full`}>
                <Phone size={26} aria-hidden="true" />
                <span>
                  <TextWithPhone text={config.heroCall.label} />
                </span>
              </PhoneLink>
            </div>
          )}

          {/* Phones: the Google row sits right under the call button so it
              is in the first screen; from 900px it closes the column. */}
          {config.heroCall && (
            <div className="mt-3 min-[900px]:hidden">
              <GoogleRow />
            </div>
          )}

          {config.form.variant === "callback" && form}

          <LpTeaser teaser={config.teaser} />

          <div className={`mt-[22px] ${config.heroCall ? "hidden min-[900px]:block" : ""}`}>
            <GoogleRow />
          </div>
        </div>

        {config.form.variant === "quote" ? (
          form
        ) : (
          config.heroPhoto && (
            <Image
              src={config.heroPhoto.src}
              width={config.heroPhoto.width}
              height={config.heroPhoto.height}
              alt={config.heroPhoto.alt}
              preload
              sizes="(min-width: 1080px) 455px, (min-width: 900px) 42vw, calc(100vw - 40px)"
              className="aspect-[16/10] w-full rounded-lg object-cover object-[center_58%] min-[900px]:aspect-[4/5] min-[900px]:object-[center_40%]"
            />
          )
        )}
      </div>
    </section>
  );
}
