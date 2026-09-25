"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BASE_PATH } from "@/lib/basePath";
import { track } from "@/lib/analytics";
import type { LeadSource } from "@/lib/leadAdapter";
import { useFormStart } from "@/lib/useFormStart";

// /api/contact always files these leads under this source.
const LEAD_SOURCE: LeadSource = "contact";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markFormStarted = useFormStart(LEAD_SOURCE);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-success" aria-hidden="true" />
        <h2 className="mt-3 font-display text-xl font-bold text-navy">Message sent</h2>
        <p className="mt-2 text-muted">
          Thanks — we’ll get back to you soon. For anything urgent, please call us directly.
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:p-8"
      onFocus={markFormStarted}
      onChange={markFormStarted}
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
          const res = await fetch(`${BASE_PATH}/api/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
          if (!res.ok) throw new Error("failed");
          // Fired here rather than in an effect on `submitted` so it can
          // only happen once per delivered lead.
          track("generate_lead", { lead_source: LEAD_SOURCE });
          setSubmitted(true);
        } catch {
          track("form_submit_error", { lead_source: LEAD_SOURCE });
          setError("Something went wrong sending your message. Please call us instead.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <h2 className="font-display text-2xl font-bold text-navy">Send Us a Message</h2>
      <div>
        <label htmlFor="contact-name" className="mb-1 block text-sm font-bold text-navy">
          Name
        </label>
        <input
          id="contact-name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full min-h-[48px] rounded-lg border border-border bg-card px-4 py-2 text-navy"
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="contact-phone" className="mb-1 block text-sm font-bold text-navy">
          Phone
        </label>
        <input
          id="contact-phone"
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full min-h-[48px] rounded-lg border border-border bg-card px-4 py-2 text-navy"
          autoComplete="tel"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1 block text-sm font-bold text-navy">
          Email (optional)
        </label>
        <input
          id="contact-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full min-h-[48px] rounded-lg border border-border bg-card px-4 py-2 text-navy"
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1 block text-sm font-bold text-navy">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="w-full rounded-lg border border-border bg-card px-4 py-2 text-navy"
        />
      </div>
      {error && <p className="text-sm font-semibold text-ember-dark">{error}</p>}
      <Button size="lg" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 size={20} className="animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
}
