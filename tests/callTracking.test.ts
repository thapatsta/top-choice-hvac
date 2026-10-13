// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EARLY_TAP_QUEUE_JS, installCallTracking, type CallTrackingDeps } from "@/lib/callTracking";
import { LEAD_SENT_STORAGE_KEY } from "@/lib/callIntent";
import { gasEmergencyContact } from "@/lib/emergency";
import { PHONE } from "@/lib/phone";
import { FORWARDING_EVENT, PHONE_CONVERSION_CALLBACK_JS } from "@/lib/phoneSwap";

const FORWARDING = { formatted: "(647) 555-0199", plain: "+16475550199" };

let deps: {
  track: ReturnType<typeof vi.fn>;
  trackAdsConversion: ReturnType<typeof vi.fn>;
  sendCallIntent: ReturnType<typeof vi.fn>;
  now: ReturnType<typeof vi.fn>;
};
let cleanup: () => void;
let clock: number;
let coarse: boolean;

function setPath(pathname: string, host = "localhost:3000") {
  (window as unknown as { happyDOM: { setURL(u: string): void } }).happyDOM.setURL(`http://${host}${pathname}`);
}

function page(html: string) {
  document.body.innerHTML = html;
}

function click(selector: string) {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`no ${selector}`);
  // Don't let happy-dom try to navigate to tel:.
  el.addEventListener("click", (e) => e.preventDefault(), { once: true });
  (el as HTMLElement).click();
}

/** What Google's snippet does for an ad visitor: run our callback. */
function simulateForwardingNumber() {
  const callback = new Function(`return (${PHONE_CONVERSION_CALLBACK_JS})`)() as (f: string, p: string) => void;
  callback(FORWARDING.formatted, FORWARDING.plain);
}

const clickToCall = () => deps.track.mock.calls.filter(([e]) => e === "click_to_call").map(([, p]) => p);

beforeEach(() => {
  clock = 10_000;
  coarse = true;
  window.matchMedia = ((q: string) => ({ matches: q === "(pointer: coarse)" && coarse })) as never;
  setPath("/");
  sessionStorage.clear();
  localStorage.clear();
  delete window.__tchForwardingNumber;
  // happy-dom reports navigator.webdriver = true; a real visitor's browser doesn't.
  Object.defineProperty(navigator, "webdriver", { value: false, configurable: true });
  deps = {
    track: vi.fn(),
    trackAdsConversion: vi.fn(),
    sendCallIntent: vi.fn(),
    now: vi.fn(() => clock),
  };
  cleanup = installCallTracking(document, deps as unknown as CallTrackingDeps);
});

afterEach(() => cleanup());

describe("call taps on our links", () => {
  it("tracks a marked link with location, device, intent, post_lead and swapped", () => {
    page(`<header data-track-location="header"><a id="c" data-call-link href="${PHONE.href}">Call now</a></header>`);
    click("#c");
    expect(clickToCall()).toEqual([
      {
        link_location: "header",
        device_class: "touch",
        intent: "general",
        post_lead: false,
        page_path: "/",
        swapped: false,
      },
    ]);
    expect(deps.trackAdsConversion).toHaveBeenCalledExactlyOnceWith("callTap");
    expect(deps.sendCallIntent).toHaveBeenCalledOnce();
  });

  it("carries LP context and emergency intent", () => {
    setPath("/lp/furnace-repair");
    page(`<div data-lp-slug="furnace-repair" data-lp-region="core" data-lp-service="repair">
      <div data-track-location="lp_closing_cta" data-call-intent="emergency"><a id="c" data-call-link href="${PHONE.href}">x</a></div></div>`);
    click("#c");
    expect(clickToCall()[0]).toMatchObject({
      link_location: "lp_closing_cta",
      lp_slug: "furnace-repair",
      lp_region: "core",
      lp_service: "repair",
      intent: "emergency",
      page_path: "/lp/furnace-repair",
    });
  });

  it("still counts after the forwarding-number swap (marker, not digits)", () => {
    page(`<div data-track-location="lp_sticky_bar"><a id="c" data-call-link href="${PHONE.href}">Call</a></div>`);
    simulateForwardingNumber();
    // React re-renders <PhoneLink> with the forwarding href.
    document.querySelector("#c")!.setAttribute("href", "tel:+16475550199");
    click("#c");
    expect(clickToCall()).toHaveLength(1);
    expect(clickToCall()[0]).toMatchObject({ link_location: "lp_sticky_bar", swapped: true });
    expect(deps.trackAdsConversion).toHaveBeenCalledWith("callTap");
    expect(deps.sendCallIntent.mock.calls[0][0]).toMatchObject({ swapped: true });
  });

  it("the callback dispatches the store event", () => {
    const seen = vi.fn();
    window.addEventListener(FORWARDING_EVENT, seen);
    simulateForwardingNumber();
    expect(seen).toHaveBeenCalledOnce();
    expect(window.__tchForwardingNumber).toEqual(FORWARDING);
  });

  it("falls back to digits: an unmarked link to our number or the forwarding number counts", () => {
    page(`<a id="real" href="tel:+1 (647) 763-2970">x</a><a id="fwd" href="tel:6475550199">y</a>`);
    click("#real");
    simulateForwardingNumber();
    clock += 10_000;
    click("#fwd");
    expect(clickToCall()).toHaveLength(2);
    expect(clickToCall()[1]).toMatchObject({ swapped: true });
  });

  it("never counts third-party numbers (gas utility, 911)", () => {
    page(`<a id="gas" href="${gasEmergencyContact.href}">gas</a><a id="nine" href="tel:911">911</a>`);
    click("#gas");
    click("#nine");
    expect(deps.track).not.toHaveBeenCalled();
    expect(deps.trackAdsConversion).not.toHaveBeenCalled();
    expect(deps.sendCallIntent).not.toHaveBeenCalled();
  });
});

describe("Ads callTap rules", () => {
  beforeEach(() => {
    page(`<div data-track-location="hero"><a id="c" data-call-link href="${PHONE.href}">Call</a></div>`);
  });

  it("desktop (fine pointer): GA4 event with device_class pointer, no Ads conversion", () => {
    coarse = false;
    click("#c");
    expect(clickToCall()[0]).toMatchObject({ device_class: "pointer" });
    expect(deps.trackAdsConversion).not.toHaveBeenCalled();
    expect(deps.sendCallIntent).toHaveBeenCalledOnce();
  });

  it("on /thank-you: logged with post_lead true, no Ads conversion", () => {
    setPath("/thank-you");
    click("#c");
    expect(clickToCall()[0]).toMatchObject({ post_lead: true });
    expect(deps.trackAdsConversion).not.toHaveBeenCalled();
    expect(deps.sendCallIntent.mock.calls[0][0]).toMatchObject({ post_lead: true });
  });

  it("after a lead in this tab: post_lead true, no Ads conversion", () => {
    sessionStorage.setItem(LEAD_SENT_STORAGE_KEY, "1");
    click("#c");
    expect(clickToCall()[0]).toMatchObject({ post_lead: true });
    expect(deps.trackAdsConversion).not.toHaveBeenCalled();
  });

  it("de-dupes a double tap within 5 s: one event, one conversion, one beacon", () => {
    click("#c");
    clock += 300;
    click("#c");
    clock += 4000;
    click("#c");
    expect(clickToCall()).toHaveLength(1);
    expect(deps.trackAdsConversion).toHaveBeenCalledOnce();
    expect(deps.sendCallIntent).toHaveBeenCalledOnce();
    clock += 5000;
    click("#c");
    expect(clickToCall()).toHaveLength(2);
  });

  it("automation (navigator.webdriver): GA4 only, no Ads conversion, no server log", () => {
    Object.defineProperty(navigator, "webdriver", { value: true, configurable: true });
    try {
      click("#c");
      expect(clickToCall()).toHaveLength(1);
      expect(deps.trackAdsConversion).not.toHaveBeenCalled();
      expect(deps.sendCallIntent).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(navigator, "webdriver", { value: false, configurable: true });
    }
  });

  it("preview hosts: no server log (production and local dev only)", () => {
    setPath("/", "top-choice-hvac.example.workers.dev");
    click("#c");
    expect(clickToCall()).toHaveLength(1);
    expect(deps.sendCallIntent).not.toHaveBeenCalled();
  });
});

describe("server payload", () => {
  it("adds the stored attribution and nothing personal", () => {
    localStorage.setItem(
      "tch_attribution",
      JSON.stringify({ value: { gclid: "TEST123", landing_path: "/lp/furnace-repair" }, expires: Date.now() + 60_000 })
    );
    page(`<div data-track-location="lp_header"><a id="c" data-call-link href="${PHONE.href}" aria-label="Call now, ${PHONE.display}">Call</a></div>`);
    click("#c");
    const payload = deps.sendCallIntent.mock.calls[0][0];
    expect(payload.attribution).toEqual({ gclid: "TEST123", landing_path: "/lp/furnace-repair" });
    expect(JSON.stringify(payload)).not.toMatch(/763|2970|@/);
    // Attribution never goes to GA.
    expect(JSON.stringify(deps.track.mock.calls)).not.toMatch(/TEST123|gclid|attribution/);
  });
});

describe("mailto", () => {
  it("still tracks click_email", () => {
    page(`<footer data-track-location="footer"><a id="m" href="mailto:info@topchoicehvac.ca">mail</a></footer>`);
    click("#m");
    expect(deps.track).toHaveBeenCalledWith("click_email", { link_location: "footer" });
  });
});

describe("emergency intent", () => {
  it("every tap on /emergency-service is emergency (header and sticky bar too)", () => {
    setPath("/emergency-service");
    page(`<header data-track-location="header"><a id="h" data-call-link href="${PHONE.href}">x</a></header>
      <div data-track-location="sticky_call_bar"><a id="s" data-call-link href="${PHONE.href}">y</a></div>`);
    click("#h");
    click("#s");
    expect(clickToCall().map((p) => p.intent)).toEqual(["emergency", "emergency"]);
  });

  it("is general elsewhere", () => {
    page(`<header data-track-location="header"><a id="h" data-call-link href="${PHONE.href}">x</a></header>`);
    click("#h");
    expect(clickToCall()[0].intent).toBe("general");
  });
});

describe("taps before hydration (early queue)", () => {
  it("a tap queued by the inline head script is replayed once when tracking installs", () => {
    // The queue stamps Date.now(); keep the injected clock on the same scale.
    clock = Date.now();
    cleanup();
    window.__tchCallTrackingReady = false;
    new Function(EARLY_TAP_QUEUE_JS)();
    page(`<div data-lp-slug="furnace-repair" data-lp-region="core" data-lp-service="repair">
      <header data-track-location="lp_header"><a id="c" data-call-link href="${PHONE.href}">Call</a></header></div>`);
    setPath("/lp/furnace-repair");
    click("#c");
    expect(window.__tchEarlyTaps).toHaveLength(1);
    expect(deps.track).not.toHaveBeenCalled();

    cleanup = installCallTracking(document, deps as unknown as CallTrackingDeps);
    expect(clickToCall()).toHaveLength(1);
    expect(clickToCall()[0]).toMatchObject({ link_location: "lp_header", lp_slug: "furnace-repair" });
    expect(deps.trackAdsConversion).toHaveBeenCalledWith("callTap");
    expect(deps.sendCallIntent).toHaveBeenCalledOnce();
    expect(window.__tchEarlyTaps).toEqual([]);

    // Once installed, the early queue stops collecting: no double count.
    clock += 10_000;
    click("#c");
    expect(window.__tchEarlyTaps).toEqual([]);
    expect(clickToCall()).toHaveLength(2);
  });

  it("ignores third-party numbers in the queue", () => {
    cleanup();
    window.__tchCallTrackingReady = false;
    new Function(EARLY_TAP_QUEUE_JS)();
    page(`<a id="gas" href="${gasEmergencyContact.href}">gas</a>`);
    click("#gas");
    cleanup = installCallTracking(document, deps as unknown as CallTrackingDeps);
    expect(deps.track).not.toHaveBeenCalled();
  });
});
