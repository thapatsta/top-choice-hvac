import { NextResponse } from "next/server";
import { submitLead, type LeadPayload } from "@/lib/leadAdapter";

const COMMON_REQUIRED_FIELDS: (keyof LeadPayload)[] = ["name", "phone", "source"];
const QUOTE_REQUIRED_FIELDS: (keyof LeadPayload)[] = [
  "need",
  "systemType",
  "homeSize",
  "systemAge",
  "urgency",
  "postalCode",
  "preferredContact",
];
const EMERGENCY_REQUIRED_FIELDS: (keyof LeadPayload)[] = ["issue"];

export async function POST(request: Request) {
  let body: Partial<LeadPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const requiredFields =
    body.source === "emergency"
      ? [...COMMON_REQUIRED_FIELDS, ...EMERGENCY_REQUIRED_FIELDS]
      : [...COMMON_REQUIRED_FIELDS, ...QUOTE_REQUIRED_FIELDS];

  for (const field of requiredFields) {
    if (!body[field] || typeof body[field] !== "string") {
      return NextResponse.json(
        { ok: false, error: `Missing or invalid field: ${field}` },
        { status: 400 }
      );
    }
  }

  const lead: LeadPayload = {
    name: body.name!,
    phone: body.phone!,
    email: body.email ?? "",
    source: body.source!,
    submittedAt: new Date().toISOString(),
    need: body.need,
    systemType: body.systemType,
    homeSize: body.homeSize,
    systemAge: body.systemAge,
    urgency: body.urgency,
    postalCode: body.postalCode,
    preferredContact: body.preferredContact,
    issue: body.issue,
    note: body.note,
  };

  try {
    await submitLead(lead);
  } catch (err) {
    console.error("[lead:error]", err);
    return NextResponse.json({ ok: false, error: "Failed to submit lead" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
