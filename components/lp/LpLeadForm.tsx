"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CALLBACK_PROMISE, landingServiceOptions, type LandingService } from "@/lib/landingPage";
import { submitLead } from "@/lib/submitLead";
import { prepareThankYou } from "@/lib/thankYou";
import { useFormStart } from "@/lib/useFormStart";

interface FormState {
  service: LandingService | "";
  name: string;
  phone: string;
  email: string;
  postalCode: string;
}

const emptyState: FormState = {
  service: "",
  name: "",
  phone: "",
  email: "",
  postalCode: "",
};

const labelClass = "mb-1 block text-sm font-bold text-navy";
const inputClass =
  "w-full min-h-[48px] rounded-lg border border-border bg-card px-4 py-2 text-navy";

/**
 * The ad landing page's one-screen quote form. `location` prefixes every
 * element id so the form can render more than once on a page.
 */
export function LpLeadForm({ location }: { location: string }) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const markFormStarted = useFormStart("landing-page");
  const id = (field: string) => `${location}-${field}`;

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.service || !form.name || !form.phone || !form.postalCode) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitLead({
      endpoint: "/api/leads",
      body: {
        service: form.service,
        name: form.name,
        phone: form.phone,
        email: form.email,
        postalCode: form.postalCode,
        source: "landing-page",
      },
      leadSource: "landing-page",
    });
    if (result.ok) {
      // Leave submitting on until the navigation unmounts the form.
      router.replace(prepareThankYou("landing-page"));
      return;
    }
    setSubmitError(
      "Something went wrong sending your request. Please call us and we'll help right away."
    );
    setSubmitting(false);
  }

  return (
    <form
      className="flex flex-col gap-4"
      onFocus={markFormStarted}
      onChange={markFormStarted}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <p className="text-muted">
        Tell us what you need. A Top Choice expert calls you back, {CALLBACK_PROMISE}.
      </p>

      <div>
        <label htmlFor={id("service")} className={labelClass}>
          What do you need?
        </label>
        <select
          id={id("service")}
          required
          value={form.service}
          onChange={(e) => update("service", e.target.value as LandingService)}
          className={inputClass}
        >
          <option value="" disabled>
            Choose a service
          </option>
          {landingServiceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={id("name")} className={labelClass}>
          Full name
        </label>
        <input
          id={id("name")}
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className={inputClass}
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor={id("phone")} className={labelClass}>
          Phone number
        </label>
        <input
          id={id("phone")}
          type="tel"
          required
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className={inputClass}
          autoComplete="tel"
        />
      </div>
      <div>
        <label htmlFor={id("email")} className={labelClass}>
          Email (optional)
        </label>
        <input
          id={id("email")}
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className={inputClass}
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor={id("postal-code")} className={labelClass}>
          Postal code
        </label>
        <input
          id={id("postal-code")}
          required
          value={form.postalCode}
          onChange={(e) => update("postalCode", e.target.value)}
          className={inputClass}
          autoComplete="postal-code"
        />
      </div>

      {submitError && (
        <p role="alert" className="text-sm font-semibold text-ember-dark">
          {submitError}
        </p>
      )}

      <Button size="lg" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 size={20} className="animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          "Get My Free Quote"
        )}
      </Button>
      <p className="flex items-center justify-center gap-2 text-center text-xs text-muted">
        <Lock size={14} className="shrink-0" aria-hidden="true" />
        No spam. No pressure. We never sell your information.
      </p>
    </form>
  );
}
