import { MAINTENANCE_PROMO } from "@/lib/landingPages";
import { PromoGate } from "@/components/lp/PromoGate";

/** The slim "Before Nov 1 | Preferred maintenance pricing" strip under the header. */
export function PromoBanner({ serverActive }: { serverActive: boolean }) {
  return (
    <PromoGate serverActive={serverActive}>
      <p className="flex items-center justify-center gap-2.5 bg-lp-promo px-4 py-[9px] text-center text-[15px] font-semibold leading-snug text-lp-promo-ink">
        <span className="whitespace-nowrap rounded-full bg-lp-promo-ink px-2.5 py-[3px] text-[11.5px] font-bold uppercase tracking-[0.06em] text-lp-promo">
          {MAINTENANCE_PROMO.pill}
        </span>
        <span>{MAINTENANCE_PROMO.text}</span>
      </p>
    </PromoGate>
  );
}
