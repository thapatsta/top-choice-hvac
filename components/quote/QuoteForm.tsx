"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ChoiceCard } from "@/components/ui/ChoiceCard";
import { StepShell } from "@/components/ui/StepShell";
import { site } from "@/lib/site";
import { resolveLeadSource } from "@/lib/leadAdapter";
import { submitLead } from "@/lib/submitLead";
import { thankYouHref } from "@/lib/thankYou";
import { useFormStart } from "@/lib/useFormStart";
import {
  needOptions,
  systemTypeOptions,
  homeSizeOptions,
  systemAgeOptions,
  urgencyOptions,
  type QuoteNeed,
  type QuoteSystemType,
  type QuoteUrgency,
} from "@/lib/estimate";

interface FormState {
  need: QuoteNeed | null;
  systemType: QuoteSystemType | null;
  homeSize: string;
  systemAge: string;
  urgency: QuoteUrgency | null;
  name: string;
  phone: string;
  email: string;
  postalCode: string;
  preferredContact: "phone" | "email" | "text";
}

const emptyState: FormState = {
  need: null,
  systemType: null,
  homeSize: "",
  systemAge: "",
  urgency: null,
  name: "",
  phone: "",
  email: "",
  postalCode: "",
  preferredContact: "phone",
};

export function QuoteForm({
  initialUrgency,
  source = "get-quote",
}: {
  initialUrgency?: QuoteUrgency;
  source?: string;
}) {
  const [form, setForm] = useState<FormState>({
    ...emptyState,
    urgency: initialUrgency ?? null,
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const leadSource = resolveLeadSource(source) ?? "get-quote";
  const markFormStarted = useFormStart(leadSource);

  const skipUrgencyStep = Boolean(initialUrgency);

  const stepKeys = useMemo(
    () => (skipUrgencyStep ? (["need", "system", "property", "contact"] as const) : (["need", "system", "property", "urgency", "contact"] as const)),
    [skipUrgencyStep]
  );
  const totalSteps = stepKeys.length;
  const currentKey = stepKeys[stepIndex];

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  }
  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function handleSubmit() {
    if (!form.need || !form.systemType || !form.urgency) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitLead({
      endpoint: "/api/leads",
      body: {
        need: form.need,
        systemType: form.systemType,
        homeSize: form.homeSize,
        systemAge: form.systemAge,
        urgency: form.urgency,
        name: form.name,
        phone: form.phone,
        email: form.email,
        postalCode: form.postalCode,
        preferredContact: form.preferredContact,
        source,
      },
      leadSource,
      leadParams: { service_need: form.need, urgency: form.urgency },
    });
    if (result.ok) {
      // Leave submitting on until the navigation unmounts the form.
      router.replace(
        thankYouHref(leadSource, { need: form.need, system: form.systemType, urgency: form.urgency })
      );
      return;
    }
    setSubmitError(
      "Something went wrong submitting your request. Please call us directly and we'll help right away."
    );
    setSubmitting(false);
  }

  return (
    <div
      className="rounded-2xl border border-border bg-card p-6 sm:p-8"
      onFocus={markFormStarted}
      onChange={markFormStarted}
    >
      {currentKey === "need" && (
        <StepShell stepNumber={1} totalSteps={totalSteps} title="What do you need?">
          {needOptions.map((opt) => (
            <ChoiceCard
              key={opt.value}
              name="need"
              value={opt.value}
              label={opt.label}
              description={opt.description}
              checked={form.need === opt.value}
              onSelect={() => {
                setForm((f) => ({ ...f, need: opt.value }));
                goNext();
              }}
            />
          ))}
        </StepShell>
      )}

      {currentKey === "system" && (
        <StepShell
          stepNumber={2}
          totalSteps={totalSteps}
          title="What type of system?"
          onBack={goBack}
        >
          {systemTypeOptions.map((opt) => (
            <ChoiceCard
              key={opt.value}
              name="systemType"
              value={opt.value}
              label={opt.label}
              checked={form.systemType === opt.value}
              onSelect={() => {
                setForm((f) => ({ ...f, systemType: opt.value }));
                goNext();
              }}
            />
          ))}
        </StepShell>
      )}

      {currentKey === "property" && (
        <StepShell
          stepNumber={3}
          totalSteps={totalSteps}
          title="Tell us about your home"
          onBack={goBack}
        >
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-navy">Approximate home size</legend>
            <div className="flex flex-col gap-2">
              {homeSizeOptions.map((opt) => (
                <ChoiceCard
                  key={opt.value}
                  name="homeSize"
                  value={opt.value}
                  label={opt.label}
                  checked={form.homeSize === opt.value}
                  onSelect={() => setForm((f) => ({ ...f, homeSize: opt.value }))}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-bold text-navy">Current system age (if known)</legend>
            <div className="flex flex-col gap-2">
              {systemAgeOptions.map((opt) => (
                <ChoiceCard
                  key={opt.value}
                  name="systemAge"
                  value={opt.value}
                  label={opt.label}
                  checked={form.systemAge === opt.value}
                  onSelect={() => setForm((f) => ({ ...f, systemAge: opt.value }))}
                />
              ))}
            </div>
          </fieldset>
          <Button
            className="mt-4"
            size="lg"
            disabled={!form.homeSize || !form.systemAge}
            onClick={goNext}
          >
            Continue
          </Button>
        </StepShell>
      )}

      {currentKey === "urgency" && (
        <StepShell stepNumber={4} totalSteps={totalSteps} title="How urgent is this?" onBack={goBack}>
          {urgencyOptions.map((opt) => (
            <ChoiceCard
              key={opt.value}
              name="urgency"
              value={opt.value}
              label={opt.label}
              description={opt.description}
              checked={form.urgency === opt.value}
              onSelect={() => {
                setForm((f) => ({ ...f, urgency: opt.value }));
                goNext();
              }}
            />
          ))}
        </StepShell>
      )}

      {currentKey === "contact" && (
        <StepShell
          stepNumber={totalSteps}
          totalSteps={totalSteps}
          title="Where should we send your estimate?"
          onBack={goBack}
        >
          {form.urgency === "emergency" && (
            <p className="rounded-xl bg-ember-light p-4 text-sm font-semibold text-ember-dark">
              For fastest emergency response, call {site.phone.display} directly after submitting.
            </p>
          )}
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
              <label htmlFor="postalCode" className="mb-1 block text-sm font-bold text-navy">
                Postal code
              </label>
              <input
                id="postalCode"
                required
                value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                className="w-full min-h-[48px] rounded-lg border border-border bg-card px-4 py-2 text-navy"
                autoComplete="postal-code"
              />
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-navy">Preferred contact method</legend>
              <div className="flex gap-2">
                {(["phone", "email", "text"] as const).map((method) => (
                  <label
                    key={method}
                    className={`flex-1 cursor-pointer rounded-lg border-2 py-2 text-center text-sm font-semibold capitalize ${
                      form.preferredContact === method
                        ? "border-ember bg-ember-light text-ember-dark"
                        : "border-border text-navy"
                    }`}
                  >
                    <input
                      type="radio"
                      name="preferredContact"
                      value={method}
                      checked={form.preferredContact === method}
                      onChange={() => setForm((f) => ({ ...f, preferredContact: method }))}
                      className="sr-only"
                    />
                    {method}
                  </label>
                ))}
              </div>
            </fieldset>

            {submitError && <p className="text-sm font-semibold text-ember-dark">{submitError}</p>}

            <Button size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                  Submitting…
                </>
              ) : (
                "Get My Free Estimate"
              )}
            </Button>
          </form>
        </StepShell>
      )}
    </div>
  );
}
