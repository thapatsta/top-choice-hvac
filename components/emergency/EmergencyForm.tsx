"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ChoiceCard } from "@/components/ui/ChoiceCard";
import { StepShell } from "@/components/ui/StepShell";
import { site } from "@/lib/site";
import { BASE_PATH } from "@/lib/basePath";
import { gasEmergencyContact, issueOptions, type EmergencyIssue } from "@/lib/emergency";

interface FormState {
  issue: EmergencyIssue | null;
  name: string;
  phone: string;
  email: string;
  note: string;
}

const emptyState: FormState = {
  issue: null,
  name: "",
  phone: "",
  email: "",
  note: "",
};

const TOTAL_STEPS = 2;

export function EmergencyForm({ source = "emergency" }: { source?: string }) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!form.issue || !form.name || !form.phone) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${BASE_PATH}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue: form.issue,
          name: form.name,
          phone: form.phone,
          email: form.email,
          note: form.note,
          source,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch {
      setSubmitError(
        "Something went wrong submitting your request. Please call us directly and we'll help right away."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (form.issue === "smell-gas") {
    return (
      <div className="w-full rounded-2xl border-2 border-ember bg-ember-light p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle size={40} className="text-ember-dark" aria-hidden="true" />
          <h2 className="mt-4 font-display text-2xl font-bold text-ember-dark sm:text-3xl">
            Leave your home now.
          </h2>
          <p className="mt-3 max-w-md text-lg font-semibold text-ember-dark">
            Don&apos;t use switches or phones inside. Once outside, call your gas
            utility&apos;s emergency line or 911.
          </p>
          <div className="mt-6 flex w-full flex-col gap-3">
            {/* Deliberately not a tel: link — 911 is too consequential to
                dial from an accidental tap, so this asks for confirmation
                first. */}
            <Button
              type="button"
              size="lg"
              className="w-full text-xl"
              onClick={() => {
                if (window.confirm("Call 911 now?")) {
                  window.location.href = "tel:911";
                }
              }}
            >
              <Phone size={24} aria-hidden="true" />
              Call 911
            </Button>
            <Button href={gasEmergencyContact.href} size="lg" variant="secondary" className="w-full text-xl">
              <Phone size={24} aria-hidden="true" />
              Call {gasEmergencyContact.name}: {gasEmergencyContact.display}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, issue: null }))}
            className="mt-4 text-sm font-semibold text-ember-dark hover:underline"
          >
            ← This isn&apos;t a gas smell, go back
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <CheckCircle2 size={48} className="mx-auto text-success" aria-hidden="true" />
        <h2 className="mt-4 font-display text-2xl font-bold text-navy">
          Got it, {form.name.split(" ")[0] || "thanks"}!
        </h2>
        <p className="mt-3 text-navy">
          We&apos;ll call you back shortly. For the fastest response, call{" "}
          {site.phone.display} now.
        </p>
        <div className="mt-6">
          <Button href={site.phone.href} size="lg" className="w-full text-xl">
            <Phone size={24} aria-hidden="true" />
            Call {site.phone.display}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      {stepIndex === 0 && (
        <StepShell stepNumber={1} totalSteps={TOTAL_STEPS} title="What's happening?">
          {issueOptions.map((opt) => (
            <ChoiceCard
              key={opt.value}
              name="issue"
              value={opt.value}
              label={opt.label}
              checked={form.issue === opt.value}
              onSelect={() => {
                setForm((f) => ({ ...f, issue: opt.value }));
                if (opt.value !== "smell-gas") setStepIndex(1);
              }}
            />
          ))}
        </StepShell>
      )}

      {stepIndex === 1 && (
        <StepShell
          stepNumber={2}
          totalSteps={TOTAL_STEPS}
          title="How can we reach you?"
          onBack={() => setStepIndex(0)}
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-bold text-navy">
                Full name
              </label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full min-h-[48px] rounded-lg border border-border bg-card px-4 py-2 text-navy"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-bold text-navy">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full min-h-[48px] rounded-lg border border-border bg-card px-4 py-2 text-navy"
                autoComplete="tel"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-bold text-navy">
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full min-h-[48px] rounded-lg border border-border bg-card px-4 py-2 text-navy"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="note" className="mb-1 block text-sm font-bold text-navy">
                Anything else? (optional)
              </label>
              <input
                id="note"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="w-full min-h-[48px] rounded-lg border border-border bg-card px-4 py-2 text-navy"
              />
            </div>

            {submitError && <p className="text-sm font-semibold text-ember-dark">{submitError}</p>}

            <Button size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                  Submitting…
                </>
              ) : (
                "Submit Emergency Request"
              )}
            </Button>
          </form>
        </StepShell>
      )}
    </div>
  );
}
