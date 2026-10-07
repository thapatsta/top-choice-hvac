"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getEstimateFraming } from "@/lib/estimate";
import { CALLBACK_PROMISE } from "@/lib/landingPage";
import { site } from "@/lib/site";
import { parseThankYouParams, readStoredThankYou, type ThankYouParams } from "@/lib/thankYou";

// sessionStorage never changes while this page is open, so there is nothing
// to subscribe to; the server snapshot (null) renders the generic card.
const noSubscribe = () => () => {};

/** Reads what the form stored in sessionStorage before navigating here. */
export function ThankYouContent() {
  const stored = useSyncExternalStore(noSubscribe, readStoredThankYou, () => null);
  return <ThankYouCard params={parseThankYouParams(new URLSearchParams(stored ?? ""))} />;
}

function CallButton({ location, large = false }: { location: string; large?: boolean }) {
  return (
    <div className="mt-6" data-track-location={location}>
      <Button href={site.phone.href} size="lg" className={large ? "w-full text-xl" : ""}>
        <Phone size={large ? 24 : 20} aria-hidden="true" />
        Call {site.phone.display}
      </Button>
    </div>
  );
}

const cardClass = "rounded-2xl border border-border bg-card p-8 text-center";
const headingClass = "mt-4 font-display text-2xl font-bold text-navy";

export function ThankYouCard({ params }: { params: ThankYouParams }) {
  switch (params.source) {
    case "get-quote": {
      const { need, system, urgency } = params;
      return (
        <div className={cardClass}>
          <CheckCircle2 size={48} className="mx-auto text-success" aria-hidden="true" />
          <h1 className={headingClass}>Got it, thanks!</h1>
          {need && system && <p className="mt-3 text-muted">{getEstimateFraming(need, system)}</p>}
          <p className="mt-4 text-navy">
            {urgency === "emergency"
              ? "Since this is an emergency, please call us now for the fastest response:"
              : "A member of our team will reach out shortly to confirm details and book your free in-home assessment."}
          </p>
          <CallButton location="thank_you_quote" />
        </div>
      );
    }

    case "emergency-service":
      return (
        <div className={cardClass}>
          <CheckCircle2 size={48} className="mx-auto text-success" aria-hidden="true" />
          <h1 className={headingClass}>Got it, thanks!</h1>
          <p className="mt-3 text-navy">
            We&apos;ll call you back shortly. For the fastest response, call{" "}
            {site.phone.display} now.
          </p>
          <CallButton location="thank_you_emergency" large />
        </div>
      );

    case "landing-page":
      return (
        <div className={cardClass}>
          <CheckCircle2 size={48} className="mx-auto text-success" aria-hidden="true" />
          <h1 className={headingClass}>Got it, thanks!</h1>
          <p className="mt-3 text-navy">
            A Top Choice expert will call you back, {CALLBACK_PROMISE}. Need us sooner? Call{" "}
            {site.phone.display}, {site.hours.emergency}.
          </p>
          <CallButton location="thank_you_landing" />
        </div>
      );

    case "contact":
      return (
        <div className={cardClass}>
          <CheckCircle2 size={48} className="mx-auto text-success" aria-hidden="true" />
          <h1 className={headingClass}>Message sent</h1>
          <p className="mt-3 text-muted">
            Thanks — we’ll get back to you soon. For anything urgent, please call us directly.
          </p>
          <CallButton location="thank_you_contact" />
        </div>
      );

    default:
      // Direct visit or nothing stored: don't claim a request arrived.
      return (
        <div className={cardClass}>
          {/* A phone, not a check mark: nothing here confirms a submission. */}
          <Phone size={48} className="mx-auto text-ember" aria-hidden="true" />
          <h1 className={headingClass}>Thanks for getting in touch</h1>
          <p className="mt-3 text-muted">
            The fastest way to reach us is by phone — {site.hours.emergency}.
          </p>
          <CallButton location="thank_you" />
          <div className="mt-4">
            <Button href="/" variant="secondary">
              Back to home
            </Button>
          </div>
        </div>
      );
  }
}
