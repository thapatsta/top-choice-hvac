import { ClipboardList, Phone } from "lucide-react";
import { site } from "@/lib/site";

/**
 * Phone-only bottom bar for the ad landing pages. Unlike the site-wide
 * StickyCallBar it is always visible: an ad visitor should never be more
 * than one tap from calling or from the form.
 */
export function LpStickyBar() {
  return (
    <div
      data-track-location="lp_sticky_bar"
      className="lp-dark fixed inset-x-0 bottom-0 z-50 flex bg-navy shadow-[0_-4px_16px_rgba(21,41,63,0.25)] lg:hidden"
    >
      <a
        href={site.phone.href}
        className="flex min-h-[56px] flex-1 items-center justify-center gap-2 py-4 font-display text-base font-extrabold text-white active:bg-navy-light"
      >
        <Phone size={18} aria-hidden="true" />
        Call Now
      </a>
      <a
        href="#quote"
        className="flex min-h-[56px] flex-1 items-center justify-center gap-2 bg-ember py-4 font-display text-base font-extrabold text-white active:bg-ember-dark"
      >
        <ClipboardList size={18} aria-hidden="true" />
        Free Quote
      </a>
    </div>
  );
}
