import { NextResponse } from "next/server";
import { findMissingField, normalizeLead, type RawLeadInput } from "@/lib/leadAdapter";
import { sendLeadNotification } from "@/lib/notify";

export async function POST(request: Request) {
  let body: RawLeadInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const lead = normalizeLead("contact", body);

  if (findMissingField(lead)) {
    return NextResponse.json(
      { ok: false, error: "Missing required field(s)" },
      { status: 400 }
    );
  }

  const result = await sendLeadNotification(lead);
  if (!result.delivered) {
    // Never tell the customer "message sent" when it went nowhere.
    return NextResponse.json({ ok: false, error: "Failed to send message" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
