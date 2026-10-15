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
  const pathname = win.location.pathname;
  // Every tap on the emergency page counts as emergency (header and sticky
  // bar included), plus links inside a data-call-intent="emergency" block
  // (the emergency thank-you button).
  const intent =
    pathname === "/emergency-service" ||
    link.closest("[data-call-intent]")?.getAttribute("data-call-intent") === "emergency"
      ? "emergency"
      : "general";
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
declare global {
  interface Window {
    /**
     * Taps on tel: links before React hydrated, queued by the inline head
     * script in app/layout.tsx (EARLY_TAP_QUEUE_JS) and drained here.
     */
    __tchEarlyTaps?: { el: Element; t: number }[];
    __tchCallTrackingReady?: boolean;
  }
}

/**
 * Inline (head) script: queues tel: link clicks that happen before this
 * module's listener is installed (slow phones tapping before hydration).
 * Kept tiny and dependency-free; installCallTracking() drains the queue.
 */
export const EARLY_TAP_QUEUE_JS =
  "window.__tchEarlyTaps=[];document.addEventListener('click',function(e){try{if(window.__tchCallTrackingReady)return;var a=e.target&&e.target.closest&&e.target.closest('a[href^=\"tel:\"]');if(a&&window.__tchEarlyTaps.length<20)window.__tchEarlyTaps.push({el:a,t:Date.now()});}catch(_){}},true);";

export function installCallTracking(doc: Document, deps: Partial<CallTrackingDeps> = {}): () => void {
  const d = { ...defaultDeps, ...deps };
  const win = doc.defaultView;
  const shouldCount = createTapDeduper();

  function handleCallLink(link: Element, at: number) {
    if (!win || !isOurCallLink(link)) return;
    const tap = describeCallTap(link, win);
    if (!shouldCount(tap.link_location, at)) return;

    d.track("click_to_call", tap);

    const automated = isAutomatedBrowser(win.navigator);
    if (tap.device_class === "touch" && !tap.post_lead && !automated) {
      d.trackAdsConversion("callTap");
    }
    if (!automated && shouldLogServerSide(win.location.hostname)) {
      const attribution = readAttribution();
      d.sendCallIntent(attribution ? { ...tap, attribution } : tap);
    }
  }

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
    if (href.startsWith("tel:")) handleCallLink(link, d.now());
  }

  doc.addEventListener("click", onClick, { capture: true });

  // Hand over from the inline early-tap queue, then replay what it caught.
  if (win) {
    win.__tchCallTrackingReady = true;
    const early = win.__tchEarlyTaps ?? [];
    win.__tchEarlyTaps = [];
    for (const { el, t } of early) {
      if (el instanceof win.Element) handleCallLink(el, typeof t === "number" ? t : d.now());
    }
  }

  return () => {
    doc.removeEventListener("click", onClick, { capture: true });
    if (win) win.__tchCallTrackingReady = false;
  };
}
