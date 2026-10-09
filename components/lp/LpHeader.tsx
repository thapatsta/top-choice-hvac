import { Flame, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

/** Logo and Call now only: no site navigation on the ad landing pages. */
export function LpHeader() {
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
  );
}
