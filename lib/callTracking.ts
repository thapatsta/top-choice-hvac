// The delegated click listener behind components/AnalyticsListeners.tsx,
// kept React-free so tests can drive it against a DOM.
//
// A call tap is identified by the data-call-link marker that <PhoneLink>
// puts on every link to our number, so it keeps working after the Google
// forwarding-number swap changes the href. Fallback: an unmarked tel: link
// whose digits are our real number or the current forwarding number.
// Third-party lines (gas utility, 911) are neither, so they never count.

import { track, trackAdsConversion } from "@/lib/analytics";
import { readAttribution } from "@/lib/attribution";
import {
  createTapDeduper,
  deviceClass,
  isAutomatedBrowser,
  isPostLead,
  sendCallIntent,
  type CallIntentPayload,
} from "@/lib/callIntent";
import { parseLpContext } from "@/lib/landingPage";
import { PHONE, phoneDigits } from "@/lib/phone";
import { getForwardingNumber } from "@/lib/phoneSwap";
import { isProductionHost } from "@/lib/analytics";

export interface CallTrackingDeps {
  track: typeof track;
  trackAdsConversion: typeof trackAdsConversion;
  sendCallIntent: typeof sendCallIntent;
  now: () => number;
}

const defaultDeps: CallTrackingDeps = {
  track,
  trackAdsConversion,
  sendCallIntent,
  now: () => Date.now(),
};

/** Our server log only takes taps from the real site (and local dev), never preview hosts. */
function shouldLogServerSide(hostname: string): boolean {
  return isProductionHost(hostname) || hostname === "localhost" || hostname === "127.0.0.1";
}

export function isOurCallLink(link: Element): boolean {
  if (link.hasAttribute("data-call-link")) return true;
  const href = link.getAttribute("href") ?? "";
  if (!href.startsWith("tel:")) return false;
  const digits = phoneDigits(href);
  return digits === phoneDigits(PHONE.href) || digits === getForwardingNumber()?.digits;
}

/** Builds the call-tap params for a click on one of our links. */
export function describeCallTap(link: Element, win: Window): CallIntentPayload {
  const linkLocation =
    link.closest("[data-track-location]")?.getAttribute("data-track-location") || "body";
  const lpRoot = link.closest<HTMLElement>("[data-lp-slug]");
  const lp = lpRoot
    ? parseLpContext({
        lp_slug: lpRoot.dataset.lpSlug,
        lp_region: lpRoot.dataset.lpRegion,
        lp_service: lpRoot.dataset.lpService,
      })
    : {};
  const intent =
    link.closest("[data-call-intent]")?.getAttribute("data-call-intent") === "emergency"
      ? "emergency"
      : "general";
  const pathname = win.location.pathname;
  const forwarding = getForwardingNumber();
  const swapped = Boolean(forwarding) && phoneDigits(link.getAttribute("href") ?? "") === forwarding?.digits;
  return {
    link_location: linkLocation,
    ...lp,
    device_class: deviceClass(win),
    intent,
    post_lead: isPostLead(pathname),
    page_path: pathname,
    swapped,
  };
}

/**
 * Installs the capture-phase click listener on `doc`. Returns the cleanup.
 *
 * Per counted tap: GA4 click_to_call (always), the Google Ads callTap
 * conversion (touch devices only, never post_lead, never automation), and a
 * server-side log via sendBeacon (never automation, never preview hosts).
 * A repeat tap on the same location within 5 s does nothing at all.
 */
export function installCallTracking(doc: Document, deps: Partial<CallTrackingDeps> = {}): () => void {
  const d = { ...defaultDeps, ...deps };
  const win = doc.defaultView;
  const shouldCount = createTapDeduper();

  function onClick(e: Event) {
    if (!win || !(e.target instanceof win.Element)) return;
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") ?? "";

    if (href.startsWith("mailto:")) {
      const linkLocation =
        link.closest("[data-track-location]")?.getAttribute("data-track-location") || "body";
      d.track("click_email", { link_location: linkLocation });
      return;
    }
    if (!isOurCallLink(link)) return;

    const tap = describeCallTap(link, win);
    if (!shouldCount(tap.link_location, d.now())) return;

    const { attribution: _none, ...gaParams } = tap;
    void _none;
    d.track("click_to_call", gaParams);

    const automated = isAutomatedBrowser(win.navigator);
    if (tap.device_class === "touch" && !tap.post_lead && !automated) {
      d.trackAdsConversion("callTap");
    }
    if (!automated && shouldLogServerSide(win.location.hostname)) {
      const attribution = readAttribution();
      d.sendCallIntent(attribution ? { ...tap, attribution } : tap);
    }
  }

  doc.addEventListener("click", onClick, { capture: true });
  return () => doc.removeEventListener("click", onClick, { capture: true });
}
