import { NextResponse } from "next/server";
import {
  findMissingField,
  normalizeLead,
  resolveLeadSource,
  type RawLeadInput,
} from "@/lib/leadAdapter";
import { sendLeadNotification } from "@/lib/notify";
import { checkLeadRateLimit } from "@/lib/rateLimit";

// Receives both the /get-quote wizard and the /emergency-service form.
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

  // Anything that isn't an emergency is a quote request (matches the
  // pre-pipeline behaviour of this route).
  const source =
    resolveLeadSource(body.source) === "emergency-service" ? "emergency-service" : "get-quote";
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
