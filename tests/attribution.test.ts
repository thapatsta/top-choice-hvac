import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ATTRIBUTION_STORAGE_KEY,
  ATTRIBUTION_TTL_MS,
  captureAttribution,
  parseAttribution,
  readAttribution,
} from "@/lib/attribution";

const now = new Date("2026-09-23T14:05:00.000Z");

/** In-memory localStorage, or one whose every call throws. */
function memoryStorage(throws = false) {
  const data = new Map<string, string>();
  const guard = () => {
    if (throws) throw new DOMException("blocked", "SecurityError");
  };
  return {
    data,
    getItem: (k: string) => (guard(), data.get(k) ?? null),
    setItem: (k: string, v: string) => (guard(), void data.set(k, v)),
    removeItem: (k: string) => (guard(), void data.delete(k)),
  };
}

function stubBrowser(href: string, referrer = "", storage = memoryStorage()) {
  vi.stubGlobal("window", { location: new URL(href), localStorage: storage });
  vi.stubGlobal("document", { referrer });
  return storage;
}

function stored(storage: ReturnType<typeof memoryStorage>) {
  return JSON.parse(storage.data.get(ATTRIBUTION_STORAGE_KEY) ?? "null");
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("parseAttribution", () => {
  it("reads click IDs and UTMs; landing_path has no query string", () => {
    const a = parseAttribution(
      "https://topchoicehvac.ca/get-quote?gclid=abc&gbraid=gb&wbraid=wb&utm_source=google" +
        "&utm_medium=cpc&utm_campaign=furnace&utm_term=furnace+repair&utm_content=ad1&other=x",
      "https://www.google.com/search?q=hvac",
      now
    );
    expect(a).toEqual({
      gclid: "abc",
      gbraid: "gb",
      wbraid: "wb",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "furnace",
      utm_term: "furnace repair",
      utm_content: "ad1",
      landing_path: "/get-quote",
      referrer_host: "www.google.com",
      first_seen: "2026-09-23T14:05:00.000Z",
    });
  });

  it.each([
    "https://topchoicehvac.ca/services",
    "https://www.topchoicehvac.ca/",
    "http://localhost:3000/contact",
  ])("drops the internal referrer %s", (referrer) => {
    const a = parseAttribution("https://topchoicehvac.ca/", referrer, now);
    expect(a.referrer_host).toBeUndefined();
  });

  it("drops empty and unparseable referrers", () => {
    expect(parseAttribution("https://topchoicehvac.ca/", "", now).referrer_host).toBeUndefined();
    expect(parseAttribution("https://topchoicehvac.ca/", "not a url", now).referrer_host).toBeUndefined();
  });

  it("trims values and cuts them to 200 characters", () => {
    const long = "x".repeat(500);
    const a = parseAttribution(
      `https://topchoicehvac.ca/?gclid=${long}&utm_source=%20%20google%20`,
      "",
      now
    );
    expect(a.gclid).toHaveLength(200);
    expect(a.utm_source).toBe("google");
  });
});

describe("captureAttribution / readAttribution", () => {
  it("stores the first visit with a 90-day expiry", () => {
    vi.useFakeTimers({ now });
    const storage = stubBrowser("https://topchoicehvac.ca/?gclid=TEST123&utm_source=google");
    captureAttribution();
    expect(stored(storage).expires).toBe(now.getTime() + ATTRIBUTION_TTL_MS);
    expect(readAttribution()).toEqual({
      gclid: "TEST123",
      utm_source: "google",
      landing_path: "/",
      first_seen: now.toISOString(),
    });
  });

  it("keeps the first touch on a later organic visit", () => {
    vi.useFakeTimers({ now });
    const storage = stubBrowser("https://topchoicehvac.ca/?utm_source=facebook&utm_medium=social");
    captureAttribution();
    vi.setSystemTime(new Date(now.getTime() + 86_400_000));
    stubBrowser("https://topchoicehvac.ca/contact?utm_source=newsletter", "https://bing.com/", storage);
    captureAttribution();
    expect(readAttribution()).toMatchObject({
      utm_source: "facebook",
      utm_medium: "social",
      landing_path: "/",
      first_seen: now.toISOString(),
    });
    expect(readAttribution()?.referrer_host).toBeUndefined();
  });

  it("a new click ID overwrites the stored value", () => {
    vi.useFakeTimers({ now });
    const storage = stubBrowser("https://topchoicehvac.ca/?gclid=OLD");
    captureAttribution();
    stubBrowser("https://topchoicehvac.ca/get-quote?wbraid=NEW", "", storage);
    captureAttribution();
    const a = readAttribution();
    expect(a?.wbraid).toBe("NEW");
    expect(a?.gclid).toBeUndefined();
    expect(a?.landing_path).toBe("/get-quote");
  });

  it("replaces an expired value", () => {
    vi.useFakeTimers({ now });
    const storage = stubBrowser("https://topchoicehvac.ca/?utm_source=old");
    captureAttribution();
    vi.setSystemTime(new Date(now.getTime() + ATTRIBUTION_TTL_MS + 1));
    expect(readAttribution()).toBeUndefined();
    stubBrowser("https://topchoicehvac.ca/services", "", storage);
    captureAttribution();
    expect(readAttribution()).toMatchObject({ landing_path: "/services" });
    expect(readAttribution()?.utm_source).toBeUndefined();
  });

  it("returns undefined and never throws when storage throws", () => {
    stubBrowser("https://topchoicehvac.ca/?gclid=x", "", memoryStorage(true));
    expect(() => captureAttribution()).not.toThrow();
    expect(readAttribution()).toBeUndefined();
  });

  it("returns undefined for malformed stored JSON, and capture replaces it", () => {
    const storage = stubBrowser("https://topchoicehvac.ca/");
    storage.data.set(ATTRIBUTION_STORAGE_KEY, "{not json");
    expect(readAttribution()).toBeUndefined();
    storage.data.set(ATTRIBUTION_STORAGE_KEY, JSON.stringify({ value: "nope", expires: "soon" }));
    expect(readAttribution()).toBeUndefined();
    captureAttribution();
    expect(readAttribution()).toMatchObject({ landing_path: "/" });
  });

  it("is a no-op on the server", () => {
    expect(() => captureAttribution()).not.toThrow();
    expect(readAttribution()).toBeUndefined();
  });
});
