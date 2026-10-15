import { Flame, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PhoneLink, PhoneText } from "@/components/Phone";

/**
 * Logo (not a link) and tap-to-call only: no site navigation on the ad
 * landing pages. `legacy` is the navy header of the four legacy pages;
 * `themed` follows the repair / install tokens (navy or white), with the
 * number in the header from 760px up, as in the mockups (phones get the
 * sticky bar).
 */
export function LpHeader({ variant }: { variant: "legacy" | "themed" }) {
  if (variant === "themed") {
    return (
      <header className="border-b border-lp-line bg-lp-head text-lp-head-ink" data-track-location="lp_header">
        <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between gap-3 px-5">
          <span className="lpt-display text-[23px] tracking-[0.01em]">
            Top Choice <span className="text-lp-accent">HVAC</span>
          </span>
          <PhoneLink
            ariaLabelPrefix="Call "
            className="hidden min-h-[44px] items-center gap-2 whitespace-nowrap text-[22px] font-bold no-underline hover:underline min-[760px]:inline-flex"
          >
            <Phone size={20} aria-hidden="true" />
            <PhoneText />
          </PhoneLink>
        </div>
      </header>
    );
  }

  return (
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
        <PhoneLink
          ariaLabelPrefix="Call now, "
          className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full bg-ember px-3.5 font-display text-base font-extrabold text-white transition-colors duration-150 hover:bg-ember-dark min-[400px]:px-4"
        >
          <Phone size={18} aria-hidden="true" />
          Call now
        </PhoneLink>
      </Container>
    </header>
  );
}
