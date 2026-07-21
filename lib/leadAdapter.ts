import type { QuoteNeed, QuoteSystemType, QuoteUrgency } from "@/lib/estimate";

export interface LeadPayload {
  need: QuoteNeed;
  systemType: QuoteSystemType;
  homeSize: string;
  systemAge: string;
  urgency: QuoteUrgency;
  name: string;
  phone: string;
  email: string;
  postalCode: string;
  preferredContact: "phone" | "email" | "text";
  source: string; // e.g. "get-quote" or "emergency-service"
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
