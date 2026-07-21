import { NextResponse } from "next/server";
import { submitLead, type LeadPayload } from "@/lib/leadAdapter";

const REQUIRED_STRING_FIELDS: (keyof LeadPayload)[] = [
  "need",
  "systemType",
  "homeSize",
  "systemAge",
  "urgency",
  "name",
  "phone",
  "postalCode",
  "preferredContact",
  "source",
];

export async function POST(request: Request) {
  let body: Partial<LeadPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (!body[field] || typeof body[field] !== "string") {
      return NextResponse.json(
        { ok: false, error: `Missing or invalid field: ${field}` },
        { status: 400 }
      );
    }
  }

  const lead: LeadPayload = {
    need: body.need!,
    systemType: body.systemType!,
    homeSize: body.homeSize!,
    systemAge: body.systemAge!,
    urgency: body.urgency!,
    name: body.name!,
    phone: body.phone!,
    email: body.email ?? "",
    postalCode: body.postalCode!,
    preferredContact: body.preferredContact!,
    source: body.source!,
    submittedAt: new Date().toISOString(),
  };

  try {
    await submitLead(lead);
  } catch (err) {
    console.error("[lead:error]", err);
    return NextResponse.json({ ok: false, error: "Failed to submit lead" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
