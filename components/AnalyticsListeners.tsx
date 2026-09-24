"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { site } from "@/lib/site";

function phoneDigits(href: string): string {
  const digits = href.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

const OUR_PHONE = phoneDigits(site.phone.href);

/**
 * One delegated click listener for every tel:/mailto: link on the site, so
 * individual links don't need onClick handlers. `link_location` comes from
 * the nearest ancestor `data-track-location` attribute.
 *
 * click_to_call only counts our own number: third-party lines like the gas
 * utility's emergency number on the smell-gas screen are not leads.
 */
export function AnalyticsListeners() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!(e.target instanceof Element)) return;
      const link = e.target.closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      const linkLocation =
        link.closest("[data-track-location]")?.getAttribute("data-track-location") || "body";

      if (href.startsWith("tel:")) {
        if (phoneDigits(href) === OUR_PHONE) {
          track("click_to_call", { link_location: linkLocation });
        }
      } else if (href.startsWith("mailto:")) {
        track("click_email", { link_location: linkLocation });
      }
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
