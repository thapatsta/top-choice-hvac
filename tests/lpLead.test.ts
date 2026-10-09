import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ATTRIBUTION_STORAGE_KEY } from "@/lib/attribution";
import { LANDING_PAGES, lpContext } from "@/lib/landing-pages";
import { buildLandingLeadBody, parseLpContext } from "@/lib/landingPage";
import { findMissingField, normalizeLead } from "@/lib/leadAdapter";
import { emailBody, logLeadToKV } from "@/lib/notify";
import { submitLead } from "@/lib/submitLead";

const form = {
  service: "furnace-repair",
  name: "Jane Doe",
  phone: "647-555-0100",
  email: "",
  postalCode: "L6Y 1A1",
} as const;

const repairLp = lpContext(LANDING_PAGES.find((p) => p.slug === "outskirts/furnace-repair")!);

describe("landing page lead payload", () => {
  it("includes lp_slug, lp_region and lp_service for every page", () => {
    for (const page of LANDING_PAGES) {
      const body = buildLandingLeadBody(form, lpContext(page));
      expect(body).toMatchObject({
        source: "landing-page",
        lp_slug: page.slug,
        lp_region: page.region,
        lp_service: page.service,
      });
    }
  });

  it("keeps them through leadAdapter normalization", () => {
    const lead = normalizeLead("landing-page", {
      ...buildLandingLeadBody(form, repairLp),
      attribution: { gclid: "TEST123", landing_path: "/lp/outskirts/furnace-repair" },
    });
    expect(lead).toMatchObject({
      lp_slug: "outskirts/furnace-repair",
      lp_region: "outskirts",
      lp_service: "repair",
      attribution: { gclid: "TEST123", landing_path: "/lp/outskirts/furnace-repair" },
    });
    expect(findMissingField(lead)).toBeNull();
  });

  it("drops unknown lp values instead of trusting them", () => {
    expect(parseLpContext({ lp_slug: "../admin", lp_region: "mars", lp_service: 3 })).toEqual({});
    const lead = normalizeLead("landing-page", { ...form, source: "landing-page" });
    expect(lead.lp_slug).toBeUndefined();
    expect(findMissingField(lead)).toBeNull();
  });

  it("shows them in the notification email and the KV record", async () => {
    const lead = normalizeLead("landing-page", buildLandingLeadBody(form, repairLp), {
      id: "abc123",
      now: new Date("2026-10-09T12:00:00Z"),
    });
    const { text } = emailBody(lead);
    expect(text).toContain("LP page: outskirts/furnace-repair");
    expect(text).toContain("LP region: outskirts");
    expect(text).toContain("LP service: repair");

    const put = vi.fn(async () => {});
    await logLeadToKV(lead, { env: { LEADS_KV: { put } } });
    const stored = JSON.parse((put.mock.calls[0] as unknown as [string, string])[1]);
    expect(stored).toMatchObject({ lp_slug: "outskirts/furnace-repair", lp_region: "outskirts", lp_service: "repair" });
  });
});

describe("landing page submit", () => {
  let gtag: ReturnType<typeof vi.fn>;
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(() => {
    gtag = vi.fn();
    const store = new Map([
      [
        ATTRIBUTION_STORAGE_KEY,
        JSON.stringify({ value: { gclid: "TEST123" }, expires: Date.now() + 60_000 }),
      ],
    ]);
    fetchMock = vi.fn<typeof fetch>(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("window", {
      location: { hostname: "topchoicehvac.ca", pathname: "/lp/outskirts/furnace-repair" },
      gtag,
      localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: () => {} },
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("posts the lp fields with the attribution and tags generate_lead with them", async () => {
    await submitLead({
      endpoint: "/api/leads",
      body: buildLandingLeadBody(form, repairLp),
      leadSource: "landing-page",
      leadParams: repairLp,
    });
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body).toMatchObject({ ...repairLp, attribution: { gclid: "TEST123" } });
    const leadEvents = gtag.mock.calls.filter(([, name]) => name === "generate_lead");
    expect(leadEvents).toEqual([
      [
        "event",
        "generate_lead",
        { lead_source: "landing-page", ...repairLp, page_path: "/lp/outskirts/furnace-repair" },
      ],
    ]);
  });
});
