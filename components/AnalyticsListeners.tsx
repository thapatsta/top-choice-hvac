"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";
import { installCallTracking } from "@/lib/callTracking";

/**
 * One delegated click listener for every tel:/mailto: link on the site, so
 * individual links don't need onClick handlers (logic: lib/callTracking.ts).
 * `link_location` comes from the nearest ancestor `data-track-location`
 * attribute; on the /lp/* ad landing pages click_to_call also carries
 * lp_slug, lp_region and lp_service from the page's data-lp-* attributes.
 *
 * Our call links are found by their data-call-link marker (<PhoneLink>), so a
 * tap still counts after the Google forwarding-number swap. Third-party lines
 * like the gas utility's emergency number are not leads and never count.
 *
 * Also records first-visit lead attribution once per page load, on every
 * host (it stays in localStorage and never goes to GA).
 */
export function AnalyticsListeners() {
  useEffect(() => {
    captureAttribution();
    return installCallTracking(document);
  }, []);

  return null;
}
