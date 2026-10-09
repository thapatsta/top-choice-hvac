"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import {
  buildLandingLeadBody,
  CALLBACK_PROMISE,
  landingServiceOptions,
  type LandingService,
  type LpContext,
} from "@/lib/landingPage";
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

function emptyState(service: LandingService | ""): FormState {
  return { service, name: "", phone: "", email: "", postalCode: "" };
}

const labelClass = "mb-1 block text-sm font-bold text-navy";
// Colours come from the .lp scope in globals.css: card is white, border is
// the LP line colour. text-base keeps iOS from zooming on focus.
const inputClass =
  "block h-11 w-full min-w-0 rounded-[10px] border-[1.5px] border-border bg-card px-3 text-base text-navy";

/**
 * The ad landing page's one-screen quote form. `location` prefixes every
 * element id so the form can render more than once on a page. `lp` says
 * which landing page this is; it goes into the lead (hidden fields) and onto
 * the generate_lead event.
 */
export function LpLeadForm({
  location,
  lp,
  defaultService = "",
  buttonLabel = "Get my free quote",
}: {
  location: string;
  lp: LpContext;
  defaultService?: LandingService | "";
  buttonLabel?: string;
}) {
  const [form, setForm] = useState<FormState>(() => emptyState(defaultService));
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
      body: buildLandingLeadBody(form, lp),
      leadSource: "landing-page",
      leadParams: lp,
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
      className="flex flex-col gap-3"
      onFocus={markFormStarted}
      onChange={markFormStarted}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {/* Which landing page sent the lead (also in the JSON body above). */}
      <input type="hidden" name="lp_slug" value={lp.lp_slug} />
      <input type="hidden" name="lp_region" value={lp.lp_region} />
      <input type="hidden" name="lp_service" value={lp.lp_service} />

      <p className="text-sm text-muted">
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
      {/* Phone and postal code share a row, even at 390px. */}
      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
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
        <div className="min-w-0">
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

      {submitError && (
        <p role="alert" className="text-sm font-semibold text-ember-dark">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-b-[3px] border-ember-dark bg-ember px-5 font-display text-lg font-extrabold text-white transition-colors duration-150 hover:bg-ember-dark disabled:opacity-80"
      >
        {submitting ? (
          <>
            <Loader2 size={20} className="animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          buttonLabel
        )}
      </button>
      <p className="flex items-center justify-center gap-2 text-center text-xs text-muted">
        <Lock size={14} className="shrink-0" aria-hidden="true" />
        No spam. No pressure. We never sell your information.
      </p>
    </form>
  );
}
