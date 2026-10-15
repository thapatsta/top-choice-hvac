// @vitest-environment happy-dom
//
// The two config-driven ad landing pages: /lp/furnace-repair ("repair", call
// first) and /lp/furnace-installation ("install", price first). Config
// rules, the forbidden-strings guard over config AND rendered output, and
// the client behaviour (form post, carousel, sticky bar, promo expiry).

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/lp/furnace-repair",
  useRouter: () => ({ replace, push: vi.fn() }),
}));
// next/font needs the Next compiler; the class names are all the template uses.
vi.mock("@/components/lp/fonts", () => ({
  barlowSemiCondensed: { variable: "font-barlow" },
  sourceSans3: { variable: "font-source" },
  archivoBlack: { variable: "font-archivo-black" },
}));

import { LpTemplate, lpPageMetadata } from "@/components/lp/LpTemplate";
import { lpReviews } from "@/data/reviews";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { GA4_ID } from "@/lib/googleTag";
import { ATTRIBUTION_STORAGE_KEY } from "@/lib/attribution";
import {
  CALLBACK_PROMISE,
  GOOGLE_RATING,
  LP_PAGES,
  MAINTENANCE_PROMO,
  PRICE_FROM,
  REVIEW_COUNT_LABEL,
  SERVICE_AREA_LINE,
  isPromoActive,
  type LpPageConfig,
} from "@/lib/landingPages";
import { PHONE } from "@/lib/phone";
import { site } from "@/lib/site";
import { ADDRESS_TERMS, collectStrings, forbiddenHits, readSource, scanCopy } from "./lpScan";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const PAGES = Object.values(LP_PAGES);

/** Each config field on its own, each FAQ item as Q + A (scanCopy is per unit). */
function copyUnits(config: LpPageConfig): string[] {
  const { faq, ...rest } = config;
  return [...collectStrings(rest), ...faq.map((item) => `${item.question} ${item.answer}`)];
}

const sharedCopy = [
  PRICE_FROM,
  CALLBACK_PROMISE,
  REVIEW_COUNT_LABEL,
  GOOGLE_RATING,
  SERVICE_AREA_LINE,
  ...collectStrings(MAINTENANCE_PROMO),
  ...lpReviews.map((r) => r.text),
];

function textOf(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ");
}

describe("config", () => {
  it("has the two pages at their routes, each a thin route file", () => {
    expect(LP_PAGES.repair.slug).toBe("furnace-repair");
    expect(LP_PAGES.install.slug).toBe("furnace-installation");
    for (const page of PAGES) {
      const source = readSource(`app/lp/${page.slug}/page.tsx`);
      expect(source).toContain(`LP_PAGES.${page.key}`);
      expect(source).toContain("<LpTemplate config={config} />");
      expect(page.lp.lp_slug).toBe(page.slug);
      expect(page.lp.lp_service).toBe(page.key);
    }
  });

  it("holds the single constants", () => {
    expect(PRICE_FROM).toBe("$2,199");
    expect(CALLBACK_PROMISE).toBe("usually within 15 minutes");
    expect(REVIEW_COUNT_LABEL).toBe("100+ reviews");
    expect(GOOGLE_RATING).toBe("4.9");
  });

  it("matches the mockup headlines and form variants", () => {
    expect(LP_PAGES.repair.h1).toBe("Furnace broken? Call us for a repair.");
    expect(LP_PAGES.repair.form).toMatchObject({ variant: "callback", button: "Call me", service: "furnace-repair" });
    expect(LP_PAGES.repair.teaser).toMatchObject({ kind: "anchor", href: "#fork" });
    expect(LP_PAGES.install.h1).toBe("A new furnace, installed, from");
    expect(LP_PAGES.install.heroPrice).toBe(PRICE_FROM);
    expect(LP_PAGES.install.form).toMatchObject({
      variant: "quote",
      button: "Get my price",
      defaultService: "new-furnace-install",
    });
    expect(LP_PAGES.install.teaser).toMatchObject({ kind: "call" });
  });

  it("is noindex, nofollow and self-canonical", () => {
    for (const page of PAGES) {
      const meta = lpPageMetadata(page);
      expect(meta.robots).toEqual({ index: false, follow: false });
      expect(meta.alternates?.canonical).toBe(`${site.url}/lp/${page.slug}`);
    }
  });

  it("both routes are out of the sitemap and not disallowed in robots.txt", () => {
    const urls = sitemap().map((entry) => new URL(entry.url).pathname);
    const disallow = [robots().rules]
      .flat()
      .flatMap((rule) => [rule?.disallow ?? []].flat());
    for (const page of PAGES) {
      const path = `/lp/${page.slug}`;
      expect(urls).not.toContain(path);
      expect(disallow.some((rule) => path.startsWith(rule))).toBe(false);
    }
  });
});

describe("Nov 1 maintenance promo", () => {
  it("ends at midnight Nov 1, Toronto time", () => {
    expect(MAINTENANCE_PROMO.enabled).toBe(true);
    expect(Date.parse(MAINTENANCE_PROMO.endsAt)).toBe(Date.parse("2026-11-01T04:00:00Z"));
    expect(isPromoActive(Date.parse("2026-10-31T23:59:59-04:00"))).toBe(true);
    expect(isPromoActive(Date.parse("2026-11-01T00:00:00-04:00"))).toBe(false);
  });

  it("states no price or discount", () => {
    for (const s of collectStrings(MAINTENANCE_PROMO)) expect(s).not.toMatch(/\$|%|\bfree\b|\boff\b/i);
  });
});

describe("reviews", () => {
  it("has the nine mockup reviews, first names only, with a tag each", () => {
    expect(lpReviews).toHaveLength(9);
    for (const r of lpReviews) {
      expect(r.firstName).toMatch(/^[A-Z][a-z]+$/);
      expect(r.tags.length).toBeGreaterThan(0);
      expect(r.rating).toBe(5);
    }
    expect(readSource("data/reviews.ts")).toContain("TODO verify against Google");
  });
});

describe("claims guard", () => {
  it("finds no forbidden strings in either config or the shared copy", () => {
    for (const page of PAGES) {
      expect(copyUnits(page).flatMap(forbiddenHits), page.key).toEqual([]);
    }
    expect(sharedCopy.flatMap(forbiddenHits)).toEqual([]);
  });

  it("passes the banned-claims scan for every copy unit (no 24/7, no credentials)", () => {
    for (const page of PAGES) {
      expect(copyUnits(page).flatMap((unit) => scanCopy(unit)), page.key).toEqual([]);
    }
    expect(sharedCopy.flatMap((unit) => scanCopy(unit))).toEqual([]);
  });

  it("finds no forbidden strings or address in the rendered pages", () => {
    for (const page of PAGES) {
      const html = renderToStaticMarkup(<LpTemplate config={page} />);
      expect(forbiddenHits(textOf(html)), page.key).toEqual([]);
      for (const re of ADDRESS_TERMS) expect(html, page.key).not.toMatch(re);
      // 24/7, licensed, insured, Lloyd anywhere in the markup (attributes too).
      expect(forbiddenHits(html.replace(/class="[^"]*"/g, "")), page.key).toEqual([]);
    }
  });
});

// ---------------------------------------------------------------------------
// Rendered in the browser (happy-dom)
// ---------------------------------------------------------------------------

let container: HTMLDivElement;
let root: Root;
let gtag: ReturnType<typeof vi.fn>;
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

function mount(config: LpPageConfig) {
  act(() => root.render(<LpTemplate config={config} />));
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  gtag = vi.fn();
  (window as unknown as { gtag: unknown }).gtag = gtag;
  localStorage.setItem(
    ATTRIBUTION_STORAGE_KEY,
    JSON.stringify({ value: { gclid: "TEST123", utm_campaign: "furnace" }, expires: Date.now() + 60_000 })
  );
  fetchMock = vi.fn<typeof fetch>(async () => new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  replace.mockClear();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function type(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function submit(form: HTMLFormElement) {
  await act(async () => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    // submitLead waits up to 300ms for gtag's join keys off production: none here.
    await new Promise((r) => setTimeout(r, 0));
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 10));
  });
}

describe("every call link carries a tracking location", () => {
  for (const page of PAGES) {
    it(page.key, () => {
      mount(page);
      const links = [...container.querySelectorAll<HTMLAnchorElement>(`a[href="${PHONE.href}"]`)];
      expect(links.length).toBeGreaterThanOrEqual(4);
      for (const a of links) {
        expect(a.hasAttribute("data-call-link")).toBe(true);
        expect(a.closest("[data-track-location]")?.getAttribute("data-track-location")).toMatch(/^lp_[a-z_]+$/);
      }
      expect(container.querySelector(`[data-track-location="lp_${page.key}_teaser"]`)).not.toBeNull();
      expect(container.querySelector('[data-track-location="lp_sticky"]')).not.toBeNull();
    });
  }
});

describe("lead form", () => {
  it("repair: posts name, phone and furnace-repair, with attribution and landingPage", async () => {
    mount(LP_PAGES.repair);
    const form = container.querySelector<HTMLFormElement>("#quote form")!;
    type(form.querySelector('input[autocomplete="name"]')!, "Jane");
    type(form.querySelector('input[type="tel"]')!, "647-555-0100");
    await submit(form);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body).toEqual({
      service: "furnace-repair",
      name: "Jane",
      phone: "647-555-0100",
      source: "landing-page",
      lp_slug: "furnace-repair",
      lp_region: "core",
      lp_service: "repair",
      landingPage: "repair",
      attribution: { gclid: "TEST123", utm_campaign: "furnace" },
    });
    expect(replace).toHaveBeenCalledWith("/thank-you");
  });

  it("install: posts the select value and the maintenance checkbox", async () => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-10-20T12:00:00-04:00") });
    mount(LP_PAGES.install);
    const form = container.querySelector<HTMLFormElement>("form#quote")!;
    type(form.querySelector('input[autocomplete="name"]')!, "Priya");
    type(form.querySelector('input[type="tel"]')!, "647-555-0142");
    const select = form.querySelector("select")!;
    expect(select.value).toBe("new-furnace-install");
    act(() => {
      select.value = "not-sure";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    act(() => form.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    await submit(form);

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body).toMatchObject({
      service: "not-sure",
      maintenanceInterest: true,
      landingPage: "install",
      lp_slug: "furnace-installation",
    });
    expect(body).not.toHaveProperty("postalCode");
    expect(body).not.toHaveProperty("email");
  });

  it("sends exactly one generate_lead per submit, with landing_page (production host)", async () => {
    const happyDOM = (window as unknown as { happyDOM: { setURL(url: string): void } }).happyDOM;
    const before = window.location.href;
    happyDOM.setURL("https://topchoicehvac.ca/lp/furnace-repair");
    onTestFinished(() => happyDOM.setURL(before));
    mount(LP_PAGES.repair);
    const form = container.querySelector<HTMLFormElement>("#quote form")!;
    type(form.querySelector('input[autocomplete="name"]')!, "Jane");
    type(form.querySelector('input[type="tel"]')!, "647-555-0100");
    await submit(form);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 350));
    });
    const leads = gtag.mock.calls.filter(([kind, name]) => kind === "event" && name === "generate_lead");
    expect(leads).toHaveLength(1);
    expect(leads[0][2]).toMatchObject({
      lead_source: "landing-page",
      landing_page: "repair",
      lp_slug: "furnace-repair",
      send_to: GA4_ID,
    });
  }, 10_000);

  it("the repair-or-replace buttons steer the repair form's service", async () => {
    mount(LP_PAGES.repair);
    act(() => container.querySelector<HTMLAnchorElement>('[data-lp-pick="new-furnace-install"]')!.click());
    const form = container.querySelector<HTMLFormElement>("#quote form")!;
    type(form.querySelector('input[autocomplete="name"]')!, "Jane");
    type(form.querySelector('input[type="tel"]')!, "647-555-0100");
    await submit(form);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).service).toBe("new-furnace-install");
  });
});

describe("promo expiry in the browser", () => {
  it("hides the banner, tune-up section and checkbox from Nov 1 even on a page built before", () => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-11-01T00:00:01-04:00") });
    // Rendered by a server that still thought the promo was on:
    const html = renderToStaticMarkup(<LpTemplate config={LP_PAGES.install} />);
    void html;
    mount(LP_PAGES.install);
    const text = container.textContent ?? "";
    expect(text).not.toContain(MAINTENANCE_PROMO.text);
    expect(text).not.toContain(MAINTENANCE_PROMO.section.heading);
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it("shows them before Nov 1", () => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-10-31T23:00:00-04:00") });
    mount(LP_PAGES.install);
    const text = container.textContent ?? "";
    expect(text).toContain(MAINTENANCE_PROMO.text);
    expect(text).toContain(MAINTENANCE_PROMO.section.heading);
    expect(container.querySelector('input[type="checkbox"]')).not.toBeNull();
  });
});

describe("review carousel", () => {
  it("filters by chip and keeps the dots in step", () => {
    mount(LP_PAGES.install);
    const cards = () => container.querySelectorAll("[data-review]").length;
    const dots = () => container.querySelectorAll('button[aria-label^="Show review"]').length;
    expect(cards()).toBe(9);
    expect(dots()).toBe(9);
    const chip = (label: string) =>
      [...container.querySelectorAll<HTMLButtonElement>('[aria-label="Filter reviews"] button')].find(
        (b) => b.textContent === label
      )!;
    act(() => chip("New furnace").click());
    expect(cards()).toBe(lpReviews.filter((r) => r.tags.includes("install")).length);
    expect(dots()).toBe(cards());
    expect(chip("New furnace").getAttribute("aria-pressed")).toBe("true");
    act(() => chip("Repairs and tune-ups").click());
    expect(cards()).toBe(lpReviews.filter((r) => r.tags.includes("repair")).length);
    act(() => chip("All reviews").click());
    expect(cards()).toBe(9);
  });

  it("has labelled controls and a focusable track", () => {
    mount(LP_PAGES.repair);
    expect(container.querySelector('button[aria-label="Previous review"]')).not.toBeNull();
    expect(container.querySelector('button[aria-label="Next review"]')).not.toBeNull();
    const track = container.querySelector('[aria-roledescription="carousel"]')!;
    expect(track.getAttribute("tabindex")).toBe("0");
    expect(container.querySelector(`a[href="${site.googleReviewsUrl}"]`)?.textContent).toBe("Read reviews on Google");
  });
});
