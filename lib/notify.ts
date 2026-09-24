import { issueOptions } from "@/lib/emergency";
import { leadKey, SOURCE_LABELS, type Lead } from "@/lib/leadAdapter";

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
  put(key: string, value: string, options?: { metadata?: unknown }): Promise<void>;
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
  }
}

const FIELD_LABELS: [keyof Lead, string][] = [
  ["name", "Name"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["preferredContact", "Preferred contact"],
  ["issue", "Issue"],
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailBody(lead: Lead): { text: string; html: string } {
  const heading = `${SOURCE_LABELS[lead.source]} — submitted via the website`;
  const rows = leadRows(lead);
  const text = [heading, "", ...rows.map(([k, v]) => `${k}: ${v}`)].join("\n");
  const html =
    `<h2 style="font-family:sans-serif">${escapeHtml(heading)}</h2>` +
    `<table style="font-family:sans-serif;border-collapse:collapse">` +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top">${escapeHtml(k)}</td>` +
          `<td style="padding:4px 0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`
      )
      .join("") +
    `</table>`;
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
  return `🚨 HVAC EMERGENCY — call back now: ${lead.name || "(no name)"} ${lead.phone || "(no phone)"}. ${issue}${note}`;
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
