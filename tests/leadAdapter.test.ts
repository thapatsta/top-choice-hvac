import { describe, expect, it } from "vitest";
import {
  findMissingField,
  leadKey,
  normalizeContactLead,
  normalizeEmergencyLead,
  normalizeLead,
  normalizeQuoteLead,
  resolveLeadSource,
} from "@/lib/leadAdapter";

const now = new Date("2026-09-23T14:05:00.000Z");
const opts = { now, id: "abc123" };

describe("normalizeQuoteLead", () => {
  it("maps the /get-quote wizard payload into a Lead", () => {
    const lead = normalizeQuoteLead(
      {
        need: "replacement",
        systemType: "furnace",
        homeSize: "1500-2500",
        systemAge: "15+",
        urgency: "this-week",
        name: "  Jane Doe ",
        phone: "647-555-0100",
        email: "jane@example.com",
        postalCode: "L6Y 1A1",
        preferredContact: "text",
        source: "get-quote",
      },
      opts
    );
    expect(lead).toEqual({
      source: "get-quote",
      name: "Jane Doe",
      phone: "647-555-0100",
      email: "jane@example.com",
      message: "replacement / furnace / this-week",
      timestamp: "2026-09-23T14:05:00.000Z",
      id: "abc123",
      need: "replacement",
      systemType: "furnace",
      homeSize: "1500-2500",
      systemAge: "15+",
      urgency: "this-week",
      postalCode: "L6Y 1A1",
      preferredContact: "text",
    });
    expect(findMissingField(lead)).toBeNull();
  });
});

describe("normalizeEmergencyLead", () => {
  it("maps the /emergency-service payload, using `note` as the message", () => {
    const lead = normalizeEmergencyLead(
      {
        issue: "no-heat",
        name: "Sam",
        phone: "905-555-0199",
        email: "",
        note: "Furnace died, kids at home",
        source: "emergency-service",
      },
      opts
    );
    expect(lead).toMatchObject({
      source: "emergency-service",
      name: "Sam",
      phone: "905-555-0199",
      email: "",
      message: "Furnace died, kids at home",
      issue: "no-heat",
      timestamp: "2026-09-23T14:05:00.000Z",
    });
    expect(findMissingField(lead)).toBeNull();
  });
});

describe("normalizeContactLead", () => {
  it("maps the /contact payload into a Lead", () => {
    const lead = normalizeContactLead(
      { name: "Alex", email: "alex@example.com", phone: "416-555-0123", message: "Do you service Mississauga?" },
      opts
    );
    expect(lead).toEqual({
      source: "contact",
      name: "Alex",
      phone: "416-555-0123",
      email: "alex@example.com",
      message: "Do you service Mississauga?",
      timestamp: "2026-09-23T14:05:00.000Z",
      id: "abc123",
    });
    expect(findMissingField(lead)).toBeNull();
  });
});

describe("malformed / missing-field input", () => {
  it.each(["get-quote", "contact", "emergency-service"] as const)(
    "does not crash for %s with an empty, null, or wrongly-typed body",
    (source) => {
      for (const raw of [{}, null, undefined, { name: 42, phone: null, email: ["x"], note: {} }]) {
        const lead = normalizeLead(source, raw as never, opts);
        expect(lead.source).toBe(source);
        expect(lead.name).toBe("");
        expect(lead.phone).toBe("");
        expect(lead.email).toBe("");
        expect(typeof lead.message).toBe("string");
        expect(findMissingField(lead)).toBe("name");
      }
    }
  );

  it("reports the specific missing field so handlers can 400", () => {
    const lead = normalizeEmergencyLead({ name: "Sam", phone: "905" }, opts);
    expect(findMissingField(lead)).toBe("issue");
  });
});

describe("resolveLeadSource / leadKey", () => {
  it("maps the legacy `emergency` source to `emergency-service`", () => {
    expect(resolveLeadSource("emergency")).toBe("emergency-service");
    expect(resolveLeadSource("emergency-service")).toBe("emergency-service");
    expect(resolveLeadSource("get-quote")).toBe("get-quote");
    expect(resolveLeadSource("nonsense")).toBeNull();
    expect(resolveLeadSource(undefined)).toBeNull();
  });

  it("builds chronologically sortable keys", () => {
    const lead = normalizeContactLead({}, opts);
    expect(leadKey(lead)).toBe("leads:2026-09-23T14:05:00.000Z:abc123");
  });

  it("generates a random id when none is given", () => {
    const a = normalizeContactLead({});
    const b = normalizeContactLead({});
    expect(a.id).toMatch(/^[0-9a-f]{12}$/);
    expect(a.id).not.toBe(b.id);
  });
});
