"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Phone } from "lucide-react";
import { PhoneLink, PhoneText } from "@/components/Phone";
import { PHONE } from "@/lib/phone";

/**
 * Phone-only bottom bar for the ad landing pages: an ad visitor is never
 * more than one tap from calling or from the form.
 *
 * - `legacy`: the navy bar of the four legacy pages, always visible.
 * - `themed`: the repair / install bar (Call + a jump to the form). It slides
 *   away while a form field, a form button or a button marked
 *   data-sticky-avoid is in the strip it covers, or while a field has focus
 *   (the on-screen keyboard is up), so it never sits on top of something to
 *   tap.
 */
export function LpStickyBar(
  props:
    | { variant: "legacy" }
    | { variant: "themed"; callLabel: string; alt: { label: string; href: string } }
) {
  const covered = useCoversControls(props.variant === "themed");

  if (props.variant === "legacy") {
    return (
      <div
        data-track-location="lp_sticky_bar"
        className="lp-dark fixed inset-x-0 bottom-0 z-50 flex bg-navy shadow-[0_-4px_16px_rgba(21,41,63,0.25)] lg:hidden"
      >
        <PhoneLink className="flex min-h-[56px] flex-1 items-center justify-center gap-2 py-4 font-display text-base font-extrabold text-white active:bg-navy-light">
          <Phone size={18} aria-hidden="true" />
          Call Now
        </PhoneLink>
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

  const [before, after] = props.callLabel.split(PHONE.display);
  return (
    <div
      data-track-location="lp_sticky"
      data-covered={covered ? "true" : "false"}
      className={`fixed inset-x-0 bottom-0 z-50 flex gap-2 border-t border-lp-line bg-lp-bg px-2.5 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 transition-transform duration-200 motion-reduce:transition-none min-[900px]:hidden ${
        covered ? "pointer-events-none translate-y-full" : ""
      }`}
      aria-hidden={covered ? "true" : undefined}
    >
      <PhoneLink
        tabIndex={covered ? -1 : undefined}
        className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-lp-cta px-2 text-[19px] font-bold text-white no-underline hover:bg-lp-cta-dark"
      >
        <Phone size={19} aria-hidden="true" />
        <span>
          {before}
          {after !== undefined && <PhoneText />}
          {after}
        </span>
      </PhoneLink>
      <a
        href={props.alt.href}
        tabIndex={covered ? -1 : undefined}
        className="inline-flex min-h-[52px] flex-[0.7] items-center justify-center whitespace-nowrap rounded-md bg-lp-ink px-2 text-[17px] font-bold text-white no-underline"
      >
        {props.alt.label}
      </a>
    </div>
  );
}


function useCoversControls(enabled: boolean): boolean {
  const [overlap, setOverlap] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!enabled || !("IntersectionObserver" in window)) return;
    const hits = new Set<Element>();
    const bar = 88;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) hits.add(entry.target);
          else hits.delete(entry.target);
        }
        setOverlap(hits.size > 0);
      },
      // Shrink the root to the bottom `bar` pixels of the viewport.
      { rootMargin: `${bar - window.innerHeight}px 0px 0px 0px`, threshold: 0 }
    );
    document
      .querySelectorAll("[data-sticky-avoid], .lpt form input, .lpt form select, .lpt form button")
      .forEach((el) => observer.observe(el));

    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && t.matches("input, select, textarea");
    const onFocusIn = (e: FocusEvent) => setTyping(isField(e.target));
    const onFocusOut = () => setTyping(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [enabled]);

  return enabled && (overlap || typing);
}

