import { NextResponse } from "next/server";
import {
  findMissingField,
  normalizeLead,
  resolveLeadSource,
  type RawLeadInput,
} from "@/lib/leadAdapter";
import { sendLeadNotification } from "@/lib/notify";
import { checkLeadRateLimit } from "@/lib/rateLimit";

// Receives the /get-quote wizard, the /emergency-service form and the ad
// landing page form (/lp/*).
export async function POST(request: Request) {
  const limited = await checkLeadRateLimit(request);
  if (limited) return limited;

  let body: RawLeadInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  // Emergency and landing-page leads keep their source; anything else is a
  // quote request (matches the pre-pipeline behaviour of this route).
  const resolved = resolveLeadSource(body.source);
  const source =
    resolved === "emergency-service" || resolved === "landing-page" ? resolved : "get-quote";
  const lead = normalizeLead(source, body);

  const missing = findMissingField(lead);
  if (missing) {
    return NextResponse.json(
      { ok: false, error: `Missing or invalid field: ${missing}` },
      { status: 400 }
    );
  }

  const result = await sendLeadNotification(lead);
  if (!result.delivered) {
    // Never tell the customer "got it" when the lead went nowhere.
    return NextResponse.json({ ok: false, error: "Failed to submit lead" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
