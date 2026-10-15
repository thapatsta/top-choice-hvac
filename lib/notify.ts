import { hasClickId, type AttributionKey, type LeadAttribution } from "@/lib/attribution";
import { issueOptions } from "@/lib/emergency";
import type { CallIntentPayload } from "@/lib/callIntent";
import { leadKey, randomLeadId, SOURCE_LABELS, type Lead } from "@/lib/leadAdapter";

/**
 * Lead delivery pipeline. `sendLeadNotification()` is the single entrypoint
 * the form handlers call; it composes three independent channels:
 *
 *   - logLeadToKV — always runs; durable JSON record in the LEADS_KV namespace
 *   - emailLead   — always runs; full form dump via Resend
 *   - smsLead     — emergency-service only; terse "call back now" via Twilio
 *
 * Each channel is independently callable (the voice receptionist will reuse
 * them) and fails independently: one channel throwing never stops the others.
 * Keep these signatures backward-compatible where reasonable.
 */

/** Minimal slice of the Workers KV API this module needs. */
export interface LeadsKV {
  put(
    key: string,
    value: string,
    options?: { metadata?: unknown; expirationTtl?: number }
  ): Promise<void>;
  /** Only the call-intent caps read KV; lead logging never does. */
  get?(key: string): Promise<string | null>;
}

export interface NotifyEnv {
  LEADS_KV?: LeadsKV;
  // TODO: real value required — see README Lead Delivery Pipeline section
  RESEND_API_KEY?: string;
  // TODO: real value required — see README Lead Delivery Pipeline section
  LEAD_NOTIFY_EMAIL?: string;
  /** Sender address — a plain var in wrangler.jsonc, not a secret. */
  LEAD_FROM_EMAIL?: string;
  // TODO: real value required — see README Lead Delivery Pipeline section
  TWILIO_ACCOUNT_SID?: string;
  // TODO: real value required — see README Lead Delivery Pipeline section
  TWILIO_AUTH_TOKEN?: string;
  // TODO: real value required — see README Lead Delivery Pipeline section
  TWILIO_FROM_NUMBER?: string;
  LEAD_NOTIFY_PHONE?: string;
  /**
   * Call-tap email switch, a plain var in wrangler.jsonc: "email" (default,
   * also when unset) or "off" (kill switch: KV log only). Never SMS.
   */
  CALL_INTENT_NOTIFY?: string;
}

export interface NotifyDeps {
  /** Defaults to the Cloudflare request env (bindings + secrets). */
  env?: NotifyEnv;
  /** Defaults to global fetch. Injected in tests to mock Resend/Twilio. */
  fetch?: typeof fetch;
}

export type ChannelStatus = "sent" | "failed" | "skipped";

export interface LeadNotificationResult {
  key: string;
  kv: ChannelStatus;
  email: ChannelStatus;
  sms: ChannelStatus;
  /** True if at least one channel got the lead somewhere a human can find it. */
  delivered: boolean;
}

/**
 * Resend's shared sender. It needs no domain verification but only delivers
 * to the email address that owns the Resend account. Set LEAD_FROM_EMAIL to
 * an address on a verified domain to send anywhere else.
 */
export const DEFAULT_FROM_EMAIL = "Top Choice HVAC Leads <onboarding@resend.dev>";

const PLACEHOLDER_PREFIX = "REPLACE_ME";

export class MissingConfigError extends Error {
  constructor(name: string, reason: "missing" | "placeholder") {
    super(
      reason === "missing"
        ? `${name} is not set — see README "Lead Delivery Pipeline"`
        : `${name} is still a REPLACE_ME placeholder — set the real value with \`wrangler secret put ${name}\` (see README "Lead Delivery Pipeline")`
    );
    this.name = "MissingConfigError";
  }
}

function requireConfig(env: NotifyEnv, name: keyof NotifyEnv): string {
  const value = env[name];
  if (typeof value !== "string" || value.trim() === "") {
    throw new MissingConfigError(name, "missing");
  }
  if (value.startsWith(PLACEHOLDER_PREFIX)) {
    throw new MissingConfigError(name, "placeholder");
  }
  return value.trim();
}

/** Resolves bindings + secrets from the Cloudflare request context. */
export async function getNotifyEnv(): Promise<NotifyEnv> {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = await getCloudflareContext({ async: true });
  return env as unknown as NotifyEnv;
}

async function resolveEnv(deps: NotifyDeps): Promise<NotifyEnv> {
  return deps.env ?? (await getNotifyEnv());
}

// ---------------------------------------------------------------------------
// Channel a: KV log (always)
// ---------------------------------------------------------------------------

export async function logLeadToKV(lead: Lead, deps: NotifyDeps = {}): Promise<string> {
  const env = await resolveEnv(deps);
  const kv = env.LEADS_KV;
  if (!kv || typeof kv.put !== "function") {
    throw new Error("LEADS_KV binding is not configured — check kv_namespaces in wrangler.jsonc");
  }
  const key = leadKey(lead);
  await kv.put(key, JSON.stringify(lead), {
    metadata: { source: lead.source, name: lead.name, phone: lead.phone },
  });
  return key;
}

// ---------------------------------------------------------------------------
// Channel b: email via Resend (always)
// ---------------------------------------------------------------------------

export function emailSubject(lead: Lead): string {
  const who = [lead.name || "Unknown name", lead.phone].filter(Boolean).join(" · ");
  switch (lead.source) {
    case "emergency-service":
      return `🚨 Emergency Service Lead — ${who}`;
    case "get-quote":
      return `New Quote Request — ${who}`;
    case "contact":
      return `New Contact Form — ${who}`;
    case "landing-page":
      return `New Ad Landing Page Lead — ${who}`;
  }
}

const FIELD_LABELS: [keyof Lead, string][] = [
  ["name", "Name"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["preferredContact", "Preferred contact"],
  ["issue", "Issue"],
  ["service", "Service wanted"],
  ["lp_slug", "LP page"],
  ["lp_region", "LP region"],
  ["lp_service", "LP service"],
  ["message", "Message"],
  ["need", "Need"],
  ["systemType", "System type"],
  ["homeSize", "Home size"],
  ["systemAge", "System age"],
  ["urgency", "Urgency"],
  ["postalCode", "Postal code"],
  ["source", "Source"],
  ["timestamp", "Received"],
];

function leadRows(lead: Lead): [string, string][] {
  const rows: [string, string][] = [];
  for (const [field, label] of FIELD_LABELS) {
    const value = lead[field];
    if (value) rows.push([label, String(value)]);
  }
  rows.push(["Lead key", leadKey(lead)]);
  return rows;
}

// Not in FIELD_LABELS: `attribution` is an object, so it gets its own block.
const ATTRIBUTION_LABELS: [AttributionKey, string][] = [
  ["gclid", "Click ID (gclid)"],
  ["gbraid", "Click ID (gbraid)"],
  ["wbraid", "Click ID (wbraid)"],
  ["utm_source", "UTM source"],
  ["utm_medium", "UTM medium"],
  ["utm_campaign", "Campaign"],
  ["utm_term", "Search term"],
  ["utm_content", "Ad content"],
  ["landing_path", "Landing page"],
  ["referrer_host", "Referrer"],
  ["first_seen", "First visit"],
  ["ga_client_id", "GA4 client ID"],
  ["ga_session_id", "GA4 session ID"],
];

/** One plain-language line on where the lead came from. */
export function attributionSummary(a: LeadAttribution): string {
  if (hasClickId(a)) return "Google Ads click";
  if (a.utm_source) return a.utm_medium ? `${a.utm_source} / ${a.utm_medium}` : a.utm_source;
  if (a.referrer_host) return `Referral from ${a.referrer_host}`;
  return "Direct or unknown";
}

function attributionRows(a: LeadAttribution): [string, string][] {
  const rows: [string, string][] = [["Came from", attributionSummary(a)]];
  for (const [field, label] of ATTRIBUTION_LABELS) {
    const value = a[field];
    if (value) rows.push([label, value]);
  }
  return rows;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlTable(rows: [string, string][]): string {
  return (
    `<table style="font-family:sans-serif;border-collapse:collapse">` +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top">${escapeHtml(k)}</td>` +
          `<td style="padding:4px 0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`
      )
      .join("") +
    `</table>`
  );
}

export function emailBody(lead: Lead): { text: string; html: string } {
  const heading = `${SOURCE_LABELS[lead.source]} — submitted via the website`;
  const rows = leadRows(lead);
  const attribution = lead.attribution ? attributionRows(lead.attribution) : null;
  const textLines = [heading, "", ...rows.map(([k, v]) => `${k}: ${v}`)];
  if (attribution) {
    textLines.push("", "Attribution", ...attribution.map(([k, v]) => `${k}: ${v}`));
  }
  const text = textLines.join("\n");
  const html =
    `<h2 style="font-family:sans-serif">${escapeHtml(heading)}</h2>` +
    htmlTable(rows) +
    (attribution
      ? `<h3 style="font-family:sans-serif">Attribution</h3>` + htmlTable(attribution)
      : "");
  return { text, html };
}

export async function emailLead(lead: Lead, deps: NotifyDeps = {}): Promise<void> {
  const env = await resolveEnv(deps);
  // TODO: real value required — see README Lead Delivery Pipeline section
  const apiKey = requireConfig(env, "RESEND_API_KEY");
  // TODO: real value required — see README Lead Delivery Pipeline section
  const to = requireConfig(env, "LEAD_NOTIFY_EMAIL");
  const from = env.LEAD_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL;
  const { text, html } = emailBody(lead);

  const res = await (deps.fetch ?? fetch)("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: emailSubject(lead),
      text,
      html,
      ...(lead.email ? { reply_to: lead.email } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}: ${await res.text().catch(() => "")}`);
  }
}

// ---------------------------------------------------------------------------
// Channel c: SMS via Twilio (emergency-service only)
// ---------------------------------------------------------------------------

export function shouldSendSms(lead: Lead): boolean {
  return lead.source === "emergency-service";
}

export function smsBody(lead: Lead): string {
  const issue = issueOptions.find((o) => o.value === lead.issue)?.label ?? lead.issue ?? "Emergency";
  const note = lead.message ? ` — ${lead.message.replace(/\s+/g, " ").slice(0, 80)}` : "";
  return `🚨 HVAC EMERGENCY — call back now: ${lead.name || "(no name)"} ${lead.phone || "(no phone)"}. ${issue}${note}${smsAttributionSuffix(lead.attribution)}`;
}

/** " [Google Ads]", " [<utm_source>]" or "": the only attribution in the SMS. */
function smsAttributionSuffix(a: LeadAttribution | undefined): string {
  if (!a) return "";
  if (hasClickId(a)) return " [Google Ads]";
  if (a.utm_source) return ` [${a.utm_source.slice(0, 20)}]`;
  return "";
}

/** Sends the SMS if (and only if) the lead is an emergency. Returns whether it sent. */
export async function smsLead(lead: Lead, deps: NotifyDeps = {}): Promise<boolean> {
  if (!shouldSendSms(lead)) return false;
  const env = await resolveEnv(deps);
  // TODO: real value required — see README Lead Delivery Pipeline section
  const sid = requireConfig(env, "TWILIO_ACCOUNT_SID");
  // TODO: real value required — see README Lead Delivery Pipeline section
  const token = requireConfig(env, "TWILIO_AUTH_TOKEN");
  // TODO: real value required — see README Lead Delivery Pipeline section
  const from = requireConfig(env, "TWILIO_FROM_NUMBER");
  const to = requireConfig(env, "LEAD_NOTIFY_PHONE");

  const res = await (deps.fetch ?? fetch)(
    `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: smsBody(lead) }).toString(),
    }
  );
  if (!res.ok) {
    throw new Error(`Twilio responded ${res.status}: ${await res.text().catch(() => "")}`);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Entrypoint
// ---------------------------------------------------------------------------

async function runChannel(
  channel: "kv" | "email" | "sms",
  key: string,
  lead: Lead,
  fn: () => Promise<unknown>
): Promise<ChannelStatus> {
  try {
    const result = await fn();
    return result === false ? "skipped" : "sent";
  } catch (err) {
    // Loud and traceable: which channel, which lead. Deliberately no lead
    // body (name/phone/email/message): Workers Logs are retained, and the
    // key is enough to find the record in LEADS_KV or the email.
    console.error(
      `[lead:${channel}:FAILED] key=${key} source=${lead.source}`,
      err instanceof Error ? err.message : err
    );
    return "failed";
  }
}

export async function sendLeadNotification(
  lead: Lead,
  deps: NotifyDeps = {}
): Promise<LeadNotificationResult> {
  const key = leadKey(lead);
  // Resolve env once so every channel sees the same config. If this throws
  // (no Cloudflare context at all), each channel still reports its own failure.
  let env: NotifyEnv | undefined = deps.env;
  if (!env) {
    try {
      env = await getNotifyEnv();
    } catch (err) {
      console.error(`[lead:env:FAILED] key=${key}`, err);
      env = {};
    }
  }
  const channelDeps: NotifyDeps = { ...deps, env };

  const [kv, email, sms] = await Promise.all([
    runChannel("kv", key, lead, () => logLeadToKV(lead, channelDeps)),
    runChannel("email", key, lead, () => emailLead(lead, channelDeps)),
    shouldSendSms(lead)
      ? runChannel("sms", key, lead, () => smsLead(lead, channelDeps))
      : Promise.resolve<ChannelStatus>("skipped"),
  ]);

  const delivered = kv === "sent" || email === "sent" || sms === "sent";
  const result: LeadNotificationResult = { key, kv, email, sms, delivered };
  console.log(`[lead:notify] key=${key} source=${lead.source} kv=${kv} email=${email} sms=${sms}`);
  if (!delivered) {
    // No lead body here either. The handler returns 500, so the customer
    // sees the "please call us" error rather than a false confirmation.
    console.error(
      `[lead:UNDELIVERED] key=${key} source=${lead.source} — every channel failed`
    );
  }
  return result;
}

// ---------------------------------------------------------------------------
// Call intent (tap on a "Call" link): KV log + capped email. Never SMS.
// ---------------------------------------------------------------------------
//
// Deliberately separate from sendLeadNotification(): it shares only the
// read-only formatting helpers above (escapeHtml, htmlTable, attributionRows),
// so nothing here can change how form leads are delivered. It does share the
// Resend account and the LEADS_KV namespace, which is why it is capped: on
// the free plans Resend allows 100 emails/day and KV 1,000 writes/day, and
// form leads must always have room.

export const CALL_INTENT_TTL_SECONDS = 90 * 24 * 60 * 60;

export const CALL_INTENT_CAPS = {
  /** Call-tap records written to KV per UTC day; beyond it, Worker log only. */
  recordsPerDay: 300,
  emailsPerHour: 20,
  /** Leaves at least 60 of Resend's 100/day for form leads. */
  emailsPerDay: 40,
  /**
   * Second guard, per Worker isolate and UTC hour, against the KV counter
   * being stale (KV is eventually consistent across locations). Not global:
   * a true hard cap needs a Durable Object, i.e. a custom worker entry (see
   * README "Call tracking").
   */
  isolateEmailsPerHour: 20,
  isolateRecordsPerHour: 60,
} as const;

/** Per-isolate counters for the current UTC hour. */
const isolateCounts = { hour: "", emails: 0, records: 0 };

function isolateBucket(timestamp: string) {
  const hour = timestamp.slice(0, 13);
  if (isolateCounts.hour !== hour) {
    isolateCounts.hour = hour;
    isolateCounts.emails = 0;
    isolateCounts.records = 0;
  }
  return isolateCounts;
}

/** Test hook. */
export function resetCallIntentIsolateCounts(): void {
  isolateCounts.hour = "";
}

export interface CallIntentRecord extends CallIntentPayload {
  timestamp: string;
  id: string;
}

export interface CallIntentResult {
  key: string;
  kv: ChannelStatus;
  email: ChannelStatus;
}

interface CallCapState {
  records: number;
  emails: number;
  /** Emails per UTC hour, "00".."23". */
  hours: Record<string, number>;
}

/** KV key: sorts chronologically, same scheme as leads:. */
export function callIntentKey(record: Pick<CallIntentRecord, "timestamp" | "id">): string {
  return `calls:${record.timestamp}:${record.id}`;
}

/** Cap counters live outside the calls: prefix so the report never lists them. */
export function callCapKey(timestamp: string): string {
  return `callcap:${timestamp.slice(0, 10)}`;
}

/** "Google Ads", the utm_source, or "organic" (direct, referral or search). */
export function callSourceLabel(a: LeadAttribution | undefined): string {
  if (!a) return "organic";
  if (hasClickId(a)) return "Google Ads";
  if (a.utm_source) return a.utm_source.slice(0, 40);
  return "organic";
}

export function callIntentSubject(r: CallIntentPayload): string {
  const where = r.lp_slug ?? r.link_location;
  const device = r.device_class === "touch" ? "mobile" : "desktop";
  const prefix = r.intent === "emergency" ? "🚨 " : "";
  const after = r.post_lead ? " (after a form lead)" : "";
  return `${prefix}Call tap: ${where} (${device}) [${callSourceLabel(r.attribution)}]${after}`;
}

const TORONTO_TIME = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
  dateStyle: "medium",
  timeStyle: "short",
});

export function callIntentEmailBody(r: CallIntentRecord): { text: string; html: string } {
  const heading = "Someone tapped a Call button on the website";
  const note =
    "This is a tap, not a confirmed call: they may have cancelled the dialer. " +
    "Google Ads counts connected calls separately.";
  const rows: [string, string][] = [
    ["When", `${TORONTO_TIME.format(new Date(r.timestamp))} (Toronto)`],
    ["Button", r.link_location],
    ["Page", r.page_path],
  ];
  if (r.lp_slug) rows.push(["Ad landing page", r.lp_slug]);
  rows.push(
    ["Device", r.device_class === "touch" ? "Mobile / touch" : "Desktop (mouse)"],
    ["Intent", r.intent === "emergency" ? "Emergency" : "General"],
    ["After a form lead", r.post_lead ? "Yes" : "No"],
    ["Showed Google forwarding number", r.swapped ? "Yes" : "No"],
    ["Record key", callIntentKey(r)]
  );
  const attribution = r.attribution ? attributionRows(r.attribution) : null;
  const textLines = [heading, note, "", ...rows.map(([k, v]) => `${k}: ${v}`)];
  if (attribution) textLines.push("", "Attribution", ...attribution.map(([k, v]) => `${k}: ${v}`));
  const html =
    `<h2 style="font-family:sans-serif">${escapeHtml(heading)}</h2>` +
    `<p style="font-family:sans-serif">${escapeHtml(note)}</p>` +
    htmlTable(rows) +
    (attribution ? `<h3 style="font-family:sans-serif">Attribution</h3>` + htmlTable(attribution) : "");
  return { text: textLines.join("\n"), html };
}

async function readCaps(kv: LeadsKV, key: string): Promise<CallCapState> {
  const empty: CallCapState = { records: 0, emails: 0, hours: {} };
  if (typeof kv.get !== "function") return empty;
  const raw = await kv.get(key);
  if (!raw) return empty;
  const parsed = JSON.parse(raw) as Partial<CallCapState>;
  return {
    records: Number(parsed.records) || 0,
    emails: Number(parsed.emails) || 0,
    hours: parsed.hours && typeof parsed.hours === "object" ? parsed.hours : {},
  };
}

async function emailCallIntent(r: CallIntentRecord, env: NotifyEnv, fetchFn: typeof fetch): Promise<void> {
  const apiKey = requireConfig(env, "RESEND_API_KEY");
  const to = requireConfig(env, "LEAD_NOTIFY_EMAIL");
  const from = env.LEAD_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL;
  const { text, html } = callIntentEmailBody(r);
  const res = await fetchFn("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: callIntentSubject(r), text, html }),
  });
  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}: ${await res.text().catch(() => "")}`);
  }
}

/**
 * Logs one validated call tap: a KV record (90-day TTL) and, unless switched
 * off or over the caps, an email to LEAD_NOTIFY_EMAIL. Never throws, never
 * SMS. Caps are counted in one KV doc per UTC day (best effort: KV is
 * eventually consistent, so a burst can overshoot slightly). If the counter
 * can't be read or written, no email is sent (fail closed).
 */
export async function logCallIntent(
  payload: CallIntentPayload,
  deps: NotifyDeps & { now?: Date; id?: string } = {}
): Promise<CallIntentResult> {
  const now = deps.now ?? new Date();
  const record: CallIntentRecord = {
    ...payload,
    timestamp: now.toISOString(),
    id: deps.id ?? randomLeadId(),
  };
  const key = callIntentKey(record);
  const result: CallIntentResult = { key, kv: "skipped", email: "skipped" };

  let env: NotifyEnv;
  try {
    env = await resolveEnv(deps);
  } catch (err) {
    console.error(`[call:env:FAILED] key=${key}`, err instanceof Error ? err.message : err);
    return { ...result, kv: "failed", email: "failed" };
  }
  const kv = env.LEADS_KV;
  if (!kv || typeof kv.put !== "function") {
    console.error(`[call:kv:FAILED] key=${key} LEADS_KV binding is not configured`);
    return { ...result, kv: "failed" };
  }

  // Fails closed: only "email" (or unset) sends; "off", or a typo, doesn't.
  const mode = (env.CALL_INTENT_NOTIFY ?? "email").trim().toLowerCase();
  const emailOn = mode === "email" || mode === "";
  if (!emailOn && mode !== "off") {
    console.warn(`[call:notify:CONFIG] CALL_INTENT_NOTIFY="${mode.slice(0, 20)}" is not "email" or "off"; not emailing`);
  }
  const capKey = callCapKey(record.timestamp);
  const hour = record.timestamp.slice(11, 13);
  const isolate = isolateBucket(record.timestamp);
  if (isolate.records >= CALL_INTENT_CAPS.isolateRecordsPerHour) {
    console.warn(`[call:CAPPED] key=${key} isolate hourly record cap reached; not stored`);
    return result;
  }
  let emailAllowed = false;
  try {
    const caps = await readCaps(kv, capKey);
    if (caps.records >= CALL_INTENT_CAPS.recordsPerDay) {
      console.warn(`[call:CAPPED] key=${key} daily record cap reached; not stored`);
      return result;
    }
    emailAllowed =
      emailOn &&
      typeof kv.get === "function" &&
      isolate.emails < CALL_INTENT_CAPS.isolateEmailsPerHour &&
      caps.emails < CALL_INTENT_CAPS.emailsPerDay &&
      (caps.hours[hour] ?? 0) < CALL_INTENT_CAPS.emailsPerHour;
    const next: CallCapState = {
      records: caps.records + 1,
      emails: caps.emails + (emailAllowed ? 1 : 0),
      hours: emailAllowed ? { ...caps.hours, [hour]: (caps.hours[hour] ?? 0) + 1 } : caps.hours,
    };
    await kv.put(capKey, JSON.stringify(next), { expirationTtl: 3 * 24 * 60 * 60 });
  } catch (err) {
    // Fail closed on both: an uncounted write could otherwise slip past the
    // daily record cap (e.g. a burst hitting KV's 1 write/s per key limit)
    // and eat into the 1,000 writes/day that form leads also need.
    console.error(`[call:cap:FAILED] key=${key} — not stored, no email`, err instanceof Error ? err.message : err);
    return result;
  }
  isolate.records += 1;
  if (emailAllowed) isolate.emails += 1;

  try {
    await kv.put(key, JSON.stringify(record), {
      expirationTtl: CALL_INTENT_TTL_SECONDS,
      // Everything the end-of-day report needs, so it can run on `kv key list` alone.
      metadata: {
        loc: record.link_location,
        lp: record.lp_slug ?? null,
        dev: record.device_class,
        intent: record.intent,
        post: record.post_lead,
        swap: record.swapped,
        src: callSourceLabel(record.attribution),
      },
    });
    result.kv = "sent";
  } catch (err) {
    result.kv = "failed";
    console.error(`[call:kv:FAILED] key=${key}`, err instanceof Error ? err.message : err);
  }

  if (emailAllowed) {
    try {
      await emailCallIntent(record, env, deps.fetch ?? fetch);
      result.email = "sent";
    } catch (err) {
      result.email = "failed";
      console.error(`[call:email:FAILED] key=${key}`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`[call:notify] key=${key} kv=${result.kv} email=${result.email}`);
  return result;
}
