import type { QuoteNeed, QuoteSystemType, QuoteUrgency } from "@/lib/estimate";
import type { EmergencyIssue } from "@/lib/emergency";

/**
 * Shared lead shape for every inbound lead source. Every form handler (and,
 * later, the voice receptionist) normalizes its raw payload into a `Lead`
 * before handing it to `sendLeadNotification()` in `lib/notify.ts`.
 */
export type LeadSource = "get-quote" | "contact" | "emergency-service";

export interface Lead {
  source: LeadSource;
  name: string;
  phone: string;
  email: string;
  message: string;
  /** ISO 8601 timestamp of when the server received the lead. */
  timestamp: string;
  /**
   * Random suffix, generated once per lead. Together with `timestamp` it forms
   * the KV key (`leads:<timestamp>:<id>`) and is used to trace a lead across
   * the KV / email / SMS channels in logs.
   */
  id: string;

  // Quote-flow fields (source: "get-quote").
  need?: QuoteNeed;
  systemType?: QuoteSystemType;
  homeSize?: string;
  systemAge?: string;
  urgency?: QuoteUrgency;
  postalCode?: string;
  preferredContact?: "phone" | "email" | "text";

  // Emergency-flow fields (source: "emergency-service").
  issue?: EmergencyIssue;
}

/** Raw JSON body as posted by the browser. Nothing in it is trusted. */
export type RawLeadInput = Record<string, unknown>;

/**
 * The `source` values the browser forms send. "emergency" is what
 * EmergencyForm posted before this pipeline existed — still accepted so a
 * stale cached page can't send a lead into the wrong bucket.
 */
const SOURCE_ALIASES: Record<string, LeadSource> = {
  "get-quote": "get-quote",
  contact: "contact",
  "emergency-service": "emergency-service",
  emergency: "emergency-service",
};

export function resolveLeadSource(raw: unknown): LeadSource | null {
  if (typeof raw !== "string") return null;
  return SOURCE_ALIASES[raw] ?? null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optStr<T extends string = string>(value: unknown): T | undefined {
  const s = str(value);
  return s ? (s as T) : undefined;
}

export function randomLeadId(): string {
  // crypto.randomUUID is available in Workers, Node 20+, and browsers.
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

interface NormalizeOptions {
  /** Override for tests; defaults to now. */
  now?: Date;
  /** Override for tests; defaults to a random suffix. */
  id?: string;
}

function base(source: LeadSource, raw: RawLeadInput, opts: NormalizeOptions) {
  return {
    source,
    name: str(raw.name),
    phone: str(raw.phone),
    email: str(raw.email),
    timestamp: (opts.now ?? new Date()).toISOString(),
    id: opts.id ?? randomLeadId(),
  };
}

export function normalizeQuoteLead(raw: RawLeadInput, opts: NormalizeOptions = {}): Lead {
  return {
    ...base("get-quote", raw, opts),
    // The quote wizard has no free-text field; keep `message` a readable
    // one-liner so every Lead has something useful there.
    message: [optStr(raw.need), optStr(raw.systemType), optStr(raw.urgency)]
      .filter(Boolean)
      .join(" / "),
    need: optStr<QuoteNeed>(raw.need),
    systemType: optStr<QuoteSystemType>(raw.systemType),
    homeSize: optStr(raw.homeSize),
    systemAge: optStr(raw.systemAge),
    urgency: optStr<QuoteUrgency>(raw.urgency),
    postalCode: optStr(raw.postalCode),
    preferredContact: optStr<"phone" | "email" | "text">(raw.preferredContact),
  };
}

export function normalizeEmergencyLead(raw: RawLeadInput, opts: NormalizeOptions = {}): Lead {
  return {
    ...base("emergency-service", raw, opts),
    // EmergencyForm calls its free-text field "note".
    message: str(raw.note ?? raw.message),
    issue: optStr<EmergencyIssue>(raw.issue),
  };
}

export function normalizeContactLead(raw: RawLeadInput, opts: NormalizeOptions = {}): Lead {
  return {
    ...base("contact", raw, opts),
    message: str(raw.message),
  };
}

/** Dispatches to the right normalizer. Never throws on missing fields. */
export function normalizeLead(
  source: LeadSource,
  raw: RawLeadInput | null | undefined,
  opts: NormalizeOptions = {}
): Lead {
  const input = raw && typeof raw === "object" ? raw : {};
  switch (source) {
    case "get-quote":
      return normalizeQuoteLead(input, opts);
    case "emergency-service":
      return normalizeEmergencyLead(input, opts);
    case "contact":
      return normalizeContactLead(input, opts);
  }
}

/** Fields each source must have before a handler accepts the submission. */
export const REQUIRED_FIELDS: Record<LeadSource, (keyof Lead)[]> = {
  "get-quote": [
    "name",
    "phone",
    "need",
    "systemType",
    "homeSize",
    "systemAge",
    "urgency",
    "postalCode",
    "preferredContact",
  ],
  "emergency-service": ["name", "phone", "issue"],
  contact: ["name", "phone", "message"],
};

/** Returns the first missing required field, or null if the lead is complete. */
export function findMissingField(lead: Lead): keyof Lead | null {
  for (const field of REQUIRED_FIELDS[lead.source]) {
    if (!lead[field]) return field;
  }
  return null;
}

/** KV key: sorts chronologically because it starts with the ISO timestamp. */
export function leadKey(lead: Lead): string {
  return `leads:${lead.timestamp}:${lead.id}`;
}

export const SOURCE_LABELS: Record<LeadSource, string> = {
  "get-quote": "Quote Request",
  contact: "Contact Form",
  "emergency-service": "Emergency Service",
};
