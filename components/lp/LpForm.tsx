"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { PhoneLink, PhoneText } from "@/components/Phone";
import { usePromoActive } from "@/components/lp/PromoGate";
import { lpButtonClass, lpXlButtonClass } from "@/components/lp/styles";
import {
  buildLandingLeadBody,
  isLandingService,
  type LandingService,
  type LpContext,
  type LpPageKey,
} from "@/lib/landingPage";
import { MAINTENANCE_PROMO, type LpFormConfig } from "@/lib/landingPages";
import { PHONE } from "@/lib/phone";
import { submitLead } from "@/lib/submitLead";
import { prepareThankYou } from "@/lib/thankYou";
import { useFormStart } from "@/lib/useFormStart";

// The repair ("callback") and install ("quote") lead forms. Both post the
// same landing-page lead through submitLead(), so attribution, rate limiting
// and the single generate_lead per delivered lead work exactly as on every
// other form; `landing_page` rides along on that same event.
//
// Buttons elsewhere on the page can steer the form: data-lp-pick="<service>"
// sets the service (the repair-or-replace cards), data-lp-maintenance ticks
// the maintenance interest (the tune-up section).

const inputClass =
  "block h-[52px] w-full min-w-0 rounded-md border-[1.5px] border-lp-fline bg-white px-3 text-[18px] text-[#111] focus:border-transparent focus:outline-3 focus:outline-offset-0 focus:outline-lp-cta";
const ERROR_TEXT = "Something went wrong sending your request. Please call us and we'll help right away.";

/** Text with our display number turned into a tracked tap-to-call link. */
function TextWithCallLink({ text, trackLocation }: { text: string; trackLocation: string }) {
  const [before, after] = text.split(PHONE.display);
  if (after === undefined) return <>{text}</>;
  return (
    <>
      {before}
      <PhoneLink trackLocation={trackLocation} className="font-bold text-lp-ink underline-offset-2 hover:underline">
        <PhoneText />
      </PhoneLink>
      {after}
    </>
  );
}

export function LpForm({
  config,
  lp,
  pageKey,
  promoServerActive,
}: {
  config: LpFormConfig;
  lp: LpContext;
  pageKey: LpPageKey;
  promoServerActive: boolean;
}) {
  const initialService = config.variant === "callback" ? config.service : config.defaultService;
  const [service, setService] = useState<LandingService>(initialService);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [maintenance, setMaintenance] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const markFormStarted = useFormStart("landing-page");
  const promoActive = usePromoActive(promoServerActive);
  const id = (field: string) => `lp-${pageKey}-${field}`;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!(e.target instanceof Element)) return;
      const pick = e.target.closest<HTMLElement>("[data-lp-pick]")?.dataset.lpPick;
      if (pick && isLandingService(pick)) setService(pick);
      if (e.target.closest("[data-lp-maintenance]")) setMaintenance(true);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function handleSubmit() {
    if (submitting || !name.trim() || !phone.trim()) return;
    setSubmitting(true);
    setError(null);
    // The maintenance box only exists while the promo runs; a ticked box
    // after the deadline is dropped. The repair form only sends it when the
    // visitor used "Ask about maintenance pricing".
    const maintenanceInterest =
      config.variant === "quote" ? (promoActive ? maintenance : undefined) : maintenance && promoActive ? true : undefined;
    const result = await submitLead({
      endpoint: "/api/leads",
      body: buildLandingLeadBody({ service, name, phone, maintenanceInterest }, lp, pageKey),
      leadSource: "landing-page",
      leadParams: { ...lp, landing_page: pageKey },
    });
    if (result.ok) {
      // Leave submitting on until the navigation unmounts the form.
      router.replace(prepareThankYou("landing-page"));
      return;
    }
    setError(ERROR_TEXT);
    setSubmitting(false);
  }

  const formProps = {
    onFocus: markFormStarted,
    onChange: markFormStarted,
    onSubmit: (e: React.FormEvent) => {
      e.preventDefault();
      handleSubmit();
    },
  };

  const hidden = (
    <>
      {/* Which landing page sent the lead (also in the JSON body). */}
      <input type="hidden" name="lp_slug" value={lp.lp_slug} />
      <input type="hidden" name="lp_region" value={lp.lp_region} />
      <input type="hidden" name="lp_service" value={lp.lp_service} />
      <input type="hidden" name="landingPage" value={pageKey} />
    </>
  );

  const buttonLabel = submitting ? (
    <>
      <Loader2 size={20} className="animate-spin" aria-hidden="true" />
      Sending…
    </>
  ) : (
    config.button
  );

  const errorLine = error && (
    <p role="alert" className="mt-2 text-[16px] font-semibold text-lp-cta-darker">
      {error}{" "}
      <PhoneLink trackLocation={`lp_${pageKey}_form_error`} className="underline">
        <PhoneText />
      </PhoneLink>
    </p>
  );

  if (config.variant === "callback") {
    return (
      <div id="quote" className="max-w-[480px] min-[560px]:max-w-[620px]" data-sticky-avoid="">
        <p className="mb-2.5 mt-[18px] max-w-[480px] text-[16px] text-lp-muted">{config.intro}</p>
        <form {...formProps} className="grid gap-2.5 min-[560px]:grid-cols-[1fr_1fr_auto]">
          {hidden}
          <label htmlFor={id("name")} className="sr-only">
            {config.namePlaceholder}
          </label>
          <input
            id={id("name")}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={config.namePlaceholder}
            autoComplete="name"
            className={inputClass}
          />
          <label htmlFor={id("phone")} className="sr-only">
            {config.phonePlaceholder}
          </label>
          <input
            id={id("phone")}
            type="tel"
            inputMode="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={config.phonePlaceholder}
            autoComplete="tel"
            className={inputClass}
          />
          <button type="submit" disabled={submitting} className={lpButtonClass}>
            {buttonLabel}
          </button>
        </form>
        {maintenance && promoActive && (
          <p className="mt-2 flex items-center gap-1.5 text-[15px] text-lp-muted" role="status">
            <Check size={16} className="text-lp-cta-dark" aria-hidden="true" />
            {config.maintenanceNote}
          </p>
        )}
        {errorLine}
      </div>
    );
  }

  return (
    <form
      {...formProps}
      id="quote"
      data-sticky-avoid=""
      aria-labelledby={id("heading")}
      className="rounded-lg border border-lp-line bg-lp-panel p-[22px]"
    >
      {hidden}
      <h2 id={id("heading")} className="mb-0.5 text-[22px]">
        {config.heading}
      </h2>
      <p className="mb-4 text-[16px] text-lp-muted">{config.sub}</p>
      <div className="mb-3">
        <label htmlFor={id("name")} className="mb-1 block text-[15px] font-semibold">
          Name
        </label>
        <input
          id={id("name")}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className={inputClass}
        />
      </div>
      <div className="mb-3">
        <label htmlFor={id("phone")} className="mb-1 block text-[15px] font-semibold">
          Phone number
        </label>
        <input
          id={id("phone")}
          type="tel"
          inputMode="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          className={inputClass}
        />
      </div>
      <div className="mb-3">
        <label htmlFor={id("service")} className="mb-1 block text-[15px] font-semibold">
          {config.serviceLabel}
        </label>
        <select
          id={id("service")}
          required
          value={service}
          onChange={(e) => isLandingService(e.target.value) && setService(e.target.value)}
          className={inputClass}
        >
          {config.serviceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {promoActive && (
        <label className="mb-3.5 mt-0.5 flex cursor-pointer items-start gap-2.5 text-[15.5px] leading-snug">
          <input
            type="checkbox"
            checked={maintenance}
            onChange={(e) => setMaintenance(e.target.checked)}
            className="mt-[3px] h-5 w-5 flex-none accent-lp-cta"
          />
          {MAINTENANCE_PROMO.checkboxLabel}
        </label>
      )}
      <button
        type="submit"
        disabled={submitting}
        className={`${lpXlButtonClass} flex w-full`}
      >
        {buttonLabel}
      </button>
      {errorLine}
      <p className="mt-2.5 text-[14px] text-lp-muted">
        <TextWithCallLink text={config.fine} trackLocation="lp_install_form" />
      </p>
    </form>
  );
}
