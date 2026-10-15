import { PhoneLink, TextWithPhone } from "@/components/Phone";
import type { LpLink } from "@/lib/landingPages";

/**
 * The one-line cross-sell under the hero form (repair → the repair-or-replace
 * section) or checklist (install → tap to call for a repair).
 */
export function LpTeaser({ teaser }: { teaser: LpLink }) {
  const className =
    "font-bold text-lp-cta-dark underline decoration-1 underline-offset-[3px] hover:decoration-2";
  return (
    <p className="mt-3.5 text-[15px] leading-snug" data-track-location={teaser.trackId}>
      {teaser.kind === "call" ? (
        <PhoneLink className={className} trackLocation={teaser.trackId}>
          <TextWithPhone text={teaser.label} /> &rarr;
        </PhoneLink>
      ) : (
        <a href={teaser.href} className={className}>
          {teaser.label} &rarr;
        </a>
      )}
    </p>
  );
}
