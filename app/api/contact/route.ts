import { NextResponse } from "next/server";
import { submitContactMessage, type ContactMessage } from "@/lib/leadAdapter";

export async function POST(request: Request) {
  let body: Partial<ContactMessage>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.name || !body.phone || !body.message) {
    return NextResponse.json(
      { ok: false, error: "Missing required field(s)" },
      { status: 400 }
    );
  }

  const message: ContactMessage = {
    name: body.name,
    email: body.email ?? "",
    phone: body.phone,
    message: body.message,
    submittedAt: new Date().toISOString(),
  };

  try {
    await submitContactMessage(message);
  } catch (err) {
    console.error("[contact:error]", err);
    return NextResponse.json({ ok: false, error: "Failed to send message" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
