import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeLead, type Lead, type LeadSource } from "@/lib/leadAdapter";
import {
  emailBody,
  emailLead,
  logLeadToKV,
  sendLeadNotification,
  smsBody,
  smsLead,
  type NotifyEnv,
} from "@/lib/notify";

const REAL_LOOKING_ENV = {
  RESEND_API_KEY: "re_test_key",
  LEAD_NOTIFY_EMAIL: "owner@example.com",
  TWILIO_ACCOUNT_SID: "AC_test_sid",
  TWILIO_AUTH_TOKEN: "test_token",
  TWILIO_FROM_NUMBER: "+15005550006",
  LEAD_NOTIFY_PHONE: "+15555550123",
};

function makeLead(source: LeadSource): Lead {
  return normalizeLead(
    source,
    {
      name: "Jane Doe",
      phone: "647-555-0100",
      email: "jane@example.com",
      message: "Hello",
      note: "No heat since last night",
      issue: "no-heat",
      need: "repair",
      systemType: "furnace",
      urgency: "emergency",
      service: "heat-pump",
    },
    { now: new Date("2026-09-23T14:05:00.000Z"), id: "abc123" }
  );
}

function setup(overrides: Partial<NotifyEnv> = {}) {
  const kvPut = vi.fn(async () => {});
  const fetchMock = vi.fn<typeof fetch>(async () => new Response("{}", { status: 200 }));
  const env: NotifyEnv = { LEADS_KV: { put: kvPut }, ...REAL_LOOKING_ENV, ...overrides };
  const deps = { env, fetch: fetchMock as unknown as typeof fetch };
  const resendCalls = () =>
    fetchMock.mock.calls.filter(([url]) => String(url).startsWith("https://api.resend.com/"));
  const twilioCalls = () =>
    fetchMock.mock.calls.filter(([url]) => String(url).startsWith("https://api.twilio.com/"));
  return { kvPut, fetchMock, env, deps, resendCalls, twilioCalls };
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("logLeadToKV", () => {
  it.each(["get-quote", "contact", "emergency-service", "landing-page"] as const)(
    "writes a %s lead as JSON under leads:<ISO timestamp>:<suffix>",
    async (source) => {
      const { kvPut, deps } = setup();
      const lead = makeLead(source);
      const key = await logLeadToKV(lead, deps);
      expect(key).toBe("leads:2026-09-23T14:05:00.000Z:abc123");
      expect(key).toMatch(/^leads:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z:[a-z0-9]+$/);
      expect(kvPut).toHaveBeenCalledTimes(1);
      const [putKey, value] = kvPut.mock.calls[0] as unknown as [string, string];
      expect(putKey).toBe(key);
      expect(JSON.parse(value)).toEqual(lead);
    }
  );

  it("throws loudly when the LEADS_KV binding is missing", async () => {
    const { deps } = setup({ LEADS_KV: undefined });
    await expect(logLeadToKV(makeLead("contact"), deps)).rejects.toThrow(/LEADS_KV/);
  });
});

describe("emailLead", () => {
  it.each([
    ["emergency-service", /^🚨 Emergency Service Lead/],
    ["get-quote", /^New Quote Request/],
    ["contact", /^New Contact Form/],
    ["landing-page", /^New Ad Landing Page Lead/],
  ] as const)("sends a %s lead to LEAD_NOTIFY_EMAIL with the source in the subject", async (source, subject) => {
    const { deps, resendCalls } = setup();
    await emailLead(makeLead(source), deps);
    expect(resendCalls()).toHaveLength(1);
    const [, init] = resendCalls()[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test_key");
    const body = JSON.parse(String(init.body));
    expect(body.to).toEqual(["owner@example.com"]);
    expect(body.subject).toMatch(subject);
    expect(body.subject).toContain("Jane Doe");
    expect(body.text).toContain("647-555-0100");
    expect(body.text).toContain("leads:2026-09-23T14:05:00.000Z:abc123");
  });

  it("refuses to call Resend with a REPLACE_ME placeholder key", async () => {
    const { deps, fetchMock } = setup({ RESEND_API_KEY: "REPLACE_ME_RESEND_API_KEY_NOT_SET" });
    await expect(emailLead(makeLead("contact"), deps)).rejects.toThrow(/RESEND_API_KEY.*placeholder/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws on a non-2xx Resend response", async () => {
    const { deps, fetchMock } = setup();
    fetchMock.mockResolvedValueOnce(new Response("bad", { status: 422 }));
    await expect(emailLead(makeLead("contact"), deps)).rejects.toThrow(/Resend responded 422/);
  });
});

describe("smsLead", () => {
  it("sends a terse SMS to LEAD_NOTIFY_PHONE for emergency-service", async () => {
    const { deps, twilioCalls } = setup();
    expect(await smsLead(makeLead("emergency-service"), deps)).toBe(true);
    expect(twilioCalls()).toHaveLength(1);
    const [url, init] = twilioCalls()[0] as unknown as [string, RequestInit];
    expect(url).toContain("/Accounts/AC_test_sid/Messages.json");
    const params = new URLSearchParams(String(init.body));
    expect(params.get("To")).toBe("+15555550123");
    expect(params.get("From")).toBe("+15005550006");
    expect(params.get("Body")).toContain("Jane Doe");
    expect(params.get("Body")).toContain("647-555-0100");
    expect(params.get("Body")).toContain("No heat");
    expect(params.get("Body")!.length).toBeLessThan(200);
  });

  it.each(["get-quote", "contact", "landing-page"] as const)("does NOT send for %s", async (source) => {
    const { deps, fetchMock } = setup();
    expect(await smsLead(makeLead(source), deps)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("sendLeadNotification", () => {
  it("emergency-service: KV + email + SMS all fire", async () => {
    const { deps, kvPut, resendCalls, twilioCalls } = setup();
    const result = await sendLeadNotification(makeLead("emergency-service"), deps);
    expect(result).toMatchObject({ kv: "sent", email: "sent", sms: "sent", delivered: true });
    expect(kvPut).toHaveBeenCalledTimes(1);
    expect(resendCalls()).toHaveLength(1);
    expect(twilioCalls()).toHaveLength(1);
  });

  it.each(["get-quote", "contact", "landing-page"] as const)("%s: KV + email fire, SMS is NOT called", async (source) => {
    const { deps, kvPut, resendCalls, twilioCalls } = setup();
    const result = await sendLeadNotification(makeLead(source), deps);
    expect(result).toMatchObject({ kv: "sent", email: "sent", sms: "skipped", delivered: true });
    expect(kvPut).toHaveBeenCalledTimes(1);
    expect(resendCalls()).toHaveLength(1);
    expect(twilioCalls()).toHaveLength(0);
  });

  describe("independent failure (regression)", () => {
    it("Twilio throwing does not stop the KV write or the email", async () => {
      const { deps, fetchMock, kvPut, resendCalls } = setup();
      fetchMock.mockImplementation(async (url: unknown) => {
        if (String(url).includes("twilio")) throw new Error("Twilio is down");
        return new Response("{}", { status: 200 });
      });
      const result = await sendLeadNotification(makeLead("emergency-service"), deps);
      expect(result).toMatchObject({ kv: "sent", email: "sent", sms: "failed", delivered: true });
      expect(kvPut).toHaveBeenCalledTimes(1);
      expect(resendCalls()).toHaveLength(1);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[lead:sms:FAILED] key=leads:2026-09-23T14:05:00.000Z:abc123"),
        "Twilio is down"
      );
    });

    it("Resend throwing does not stop the KV write or the SMS", async () => {
      const { deps, fetchMock, kvPut, twilioCalls } = setup();
      fetchMock.mockImplementation(async (url: unknown) => {
        if (String(url).includes("resend")) throw new Error("Resend is down");
        return new Response("{}", { status: 200 });
      });
      const result = await sendLeadNotification(makeLead("emergency-service"), deps);
      expect(result).toMatchObject({ kv: "sent", email: "failed", sms: "sent", delivered: true });
      expect(kvPut).toHaveBeenCalledTimes(1);
      expect(twilioCalls()).toHaveLength(1);
    });

    it("KV throwing does not stop the email or the SMS", async () => {
      const { deps, kvPut, resendCalls, twilioCalls } = setup();
      kvPut.mockRejectedValue(new Error("KV unavailable"));
      const result = await sendLeadNotification(makeLead("emergency-service"), deps);
      expect(result).toMatchObject({ kv: "failed", email: "sent", sms: "sent", delivered: true });
      expect(resendCalls()).toHaveLength(1);
      expect(twilioCalls()).toHaveLength(1);
    });

    it("with placeholder secrets, KV still writes and failures are logged, not thrown", async () => {
      const { deps, kvPut, fetchMock } = setup({
        RESEND_API_KEY: "REPLACE_ME_RESEND_API_KEY_NOT_SET",
        LEAD_NOTIFY_EMAIL: "REPLACE_ME_DESTINATION_EMAIL_NOT_SET",
        TWILIO_ACCOUNT_SID: "REPLACE_ME_TWILIO_SID_NOT_SET",
      });
      const result = await sendLeadNotification(makeLead("emergency-service"), deps);
      expect(result).toMatchObject({ kv: "sent", email: "failed", sms: "failed", delivered: true });
      expect(kvPut).toHaveBeenCalledTimes(1);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("reports delivered=false when every channel fails", async () => {
      const { deps, kvPut, fetchMock } = setup();
      kvPut.mockRejectedValue(new Error("KV unavailable"));
      fetchMock.mockRejectedValue(new Error("network down"));
      const result = await sendLeadNotification(makeLead("emergency-service"), deps);
      expect(result.delivered).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          "[lead:UNDELIVERED] key=leads:2026-09-23T14:05:00.000Z:abc123 source=emergency-service"
        )
      );
    });
  });

  describe("logs carry no customer PII", () => {
    // Workers Logs are retained, so failure logs identify a lead by key only.
    const PII = ["Jane Doe", "647-555-0100", "jane@example.com", "No heat since last night"];

    function loggedText(): string {
      const calls = [
        ...vi.mocked(console.error).mock.calls,
        ...vi.mocked(console.log).mock.calls,
      ];
      return calls
        .flat()
        .map((a) => (a instanceof Error ? a.message : typeof a === "string" ? a : JSON.stringify(a)))
        .join("\n");
    }

    it.each(["get-quote", "contact", "emergency-service", "landing-page"] as const)(
      "%s: every channel failing logs the key but not name/phone/email/message",
      async (source) => {
        const { deps, kvPut, fetchMock } = setup();
        kvPut.mockRejectedValue(new Error("KV unavailable"));
        fetchMock.mockRejectedValue(new Error("network down"));
        await sendLeadNotification(makeLead(source), deps);
        const text = loggedText();
        expect(text).toContain("key=leads:2026-09-23T14:05:00.000Z:abc123");
        expect(text).toContain("[lead:UNDELIVERED]");
        for (const value of PII) expect(text).not.toContain(value);
      }
    );
  });
});

describe("attribution in notifications", () => {
  function withAttribution(source: LeadSource, attribution: Lead["attribution"]): Lead {
    return { ...makeLead(source), attribution };
  }

  it("KV stores the attribution in the lead JSON; metadata is unchanged", async () => {
    const { kvPut, deps } = setup();
    const lead = withAttribution("contact", { gclid: "abc", landing_path: "/" });
    await logLeadToKV(lead, deps);
    const [, value, options] = kvPut.mock.calls[0] as unknown as [string, string, { metadata: unknown }];
    expect(JSON.parse(value).attribution).toEqual({ gclid: "abc", landing_path: "/" });
    expect(options.metadata).toEqual({ source: "contact", name: "Jane Doe", phone: "647-555-0100" });
  });

  it("email has no Attribution block without attribution", () => {
    const { text, html } = emailBody(makeLead("contact"));
    expect(text).not.toContain("Attribution");
    expect(html).not.toContain("Attribution");
  });

  it.each([
    [{ gclid: "abc", utm_source: "google", utm_medium: "cpc" }, "Google Ads click"],
    [{ wbraid: "w" }, "Google Ads click"],
    [{ utm_source: "facebook", utm_medium: "social" }, "facebook / social"],
    [{ referrer_host: "www.bing.com" }, "Referral from www.bing.com"],
    [{ landing_path: "/", first_seen: "2026-09-23T14:05:00.000Z" }, "Direct or unknown"],
  ])("summarizes %o as %s", (attribution, summary) => {
    const { text, html } = emailBody(withAttribution("get-quote", attribution));
    expect(text).toContain(`\n\nAttribution\nCame from: ${summary}\n`);
    expect(html).toContain("<h3");
    expect(html).toContain(summary);
  });

  it("lists each attribution field with a readable label, after the lead rows", () => {
    const { text } = emailBody(
      withAttribution("get-quote", {
        gclid: "abc",
        utm_campaign: "furnace-fall",
        landing_path: "/get-quote",
      })
    );
    expect(text.indexOf("Lead key:")).toBeLessThan(text.indexOf("Attribution"));
    expect(text).toContain("Click ID (gclid): abc");
    expect(text).toContain("Campaign: furnace-fall");
    expect(text).toContain("Landing page: /get-quote");
    expect(text).not.toContain("[object Object]");
  });

  it("HTML-escapes attribution values", () => {
    const { html } = emailBody(
      withAttribution("contact", { utm_source: "<script>alert(1)</script>", utm_campaign: '"x"&' })
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("&quot;x&quot;&amp;");
  });

  it("SMS: no suffix without attribution or without a source", () => {
    const plain = smsBody(makeLead("emergency-service"));
    expect(plain).not.toMatch(/\[.*\]$/);
    expect(smsBody(withAttribution("emergency-service", { landing_path: "/" }))).toBe(plain);
    expect(smsBody(withAttribution("emergency-service", { referrer_host: "bing.com" }))).toBe(plain);
  });

  it("SMS: [Google Ads] when a click ID is present", () => {
    const sms = smsBody(withAttribution("emergency-service", { gbraid: "g", utm_source: "google" }));
    expect(sms).toBe(`${smsBody(makeLead("emergency-service"))} [Google Ads]`);
  });

  it("SMS: [<utm_source>] cut to 20 characters, and nothing else from attribution", () => {
    const sms = smsBody(
      withAttribution("emergency-service", {
        utm_source: "a-very-long-newsletter-source",
        utm_campaign: "secret-campaign",
      })
    );
    expect(sms).toBe(`${smsBody(makeLead("emergency-service"))} [a-very-long-newslett]`);
    expect(sms).not.toContain("secret-campaign");
  });
});
