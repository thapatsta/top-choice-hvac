import type { QuoteNeed, QuoteSystemType, QuoteUrgency } from "@/lib/estimate";
import type { EmergencyIssue } from "@/lib/emergency";

export interface LeadPayload {
  // Quote-flow fields (source: "get-quote"). Optional here so other lead
  // sources, like the emergency form below, can go through this same
  // pipeline without carrying fields that don't apply to them.
  need?: QuoteNeed;
  systemType?: QuoteSystemType;
  homeSize?: string;
  systemAge?: string;
  urgency?: QuoteUrgency;
  postalCode?: string;
  preferredContact?: "phone" | "email" | "text";
  // Emergency-flow fields (source: "emergency").
  issue?: EmergencyIssue;
  note?: string;
  name: string;
  phone: string;
  email: string;
  source: string; // e.g. "get-quote" or "emergency"
  submittedAt: string;
}

/**
 * Single integration point for lead delivery. Phase 1 just logs the lead
 * server-side. Swap the body of this function to wire up a real backend —
 * do not hard-code a vendor into the route handler itself.
 *
 * Examples for later phases:
 *   - Email (Resend): await resend.emails.send({ ... })
 *   - Email (SendGrid): await sgMail.send({ ... })
 *   - CRM webhook: await fetch(process.env.CRM_WEBHOOK_URL, { method: "POST", body: ... })
 *   - Spreadsheet (Google Sheets API / Zapier webhook): await fetch(process.env.SHEETS_WEBHOOK_URL, ...)
 */
export async function submitLead(lead: LeadPayload): Promise<void> {
  console.log("[lead:new]", JSON.stringify(lead));
}

export interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
}

/** Same pluggable-integration pattern as submitLead, for the general /contact form. */
export async function submitContactMessage(message: ContactMessage): Promise<void> {
  console.log("[contact:new]", JSON.stringify(message));
}
