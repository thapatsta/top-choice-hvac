"use client";

import { Fragment, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { leadSentInThisTab, subscribeLeadSent } from "@/lib/callIntent";
import { PHONE } from "@/lib/phone";
import {
  getForwardingNumber,
  subscribeForwardingNumber,
  type ForwardingNumber,
} from "@/lib/phoneSwap";

// The only way our phone number renders on a page. Every link is marked
// data-call-link (components/AnalyticsListeners.tsx counts taps by that
// marker, so a swapped href is still tracked) and, unless swap={false},
// shows the Google forwarding number to Google Ads visitors. The server HTML
// always has the real number: the swap happens on the client, after the
// snippet's callback, so crawlers and organic visitors never see it.
//
// Never swapped once the visitor is post-lead (on /thank-you, or after a
// lead from this tab): a call to the forwarding number then would count as a
// second primary Ads conversion ("Calls from website") for someone already
// counted as a form lead. They see, and call, the real number.
//
// Third-party numbers (gas utility, 911) must NOT use these components.

const noSubscribe = () => () => {};
const serverSnapshot = () => null;
const serverFalse = () => false;

/** The forwarding number for Ads visitors, or null (swap off, or post-lead). */
function useForwardingNumber(swap: boolean): ForwardingNumber | null {
  const pathname = usePathname();
  const leadSent = useSyncExternalStore(subscribeLeadSent, leadSentInThisTab, serverFalse);
  const active = swap && !leadSent && pathname !== "/thank-you";
  const forwarding = useSyncExternalStore(
    active ? subscribeForwardingNumber : noSubscribe,
    active ? getForwardingNumber : serverSnapshot,
    serverSnapshot
  );
  return active ? forwarding : null;
}

interface PhoneLinkProps {
  className?: string;
  children: ReactNode;
  /** Show the forwarding number to Ads visitors. Off for the footer NAP block. */
  swap?: boolean;
  /** aria-label = prefix + the displayed number, e.g. "Call now, ". */
  ariaLabelPrefix?: string;
  tabIndex?: number;
  /** data-track-location on the link itself (click_to_call's link_location). */
  trackLocation?: string;
}

export function PhoneLink({
  className,
  children,
  swap = true,
  ariaLabelPrefix,
  tabIndex,
  trackLocation,
}: PhoneLinkProps) {
  const forwarding = useForwardingNumber(swap);
  const display = forwarding?.display ?? PHONE.display;
  return (
    <a
      href={forwarding?.href ?? PHONE.href}
      className={className}
      data-call-link=""
      data-swappable={swap ? "true" : "false"}
      {...(forwarding ? { "data-swapped": "true" } : {})}
      aria-label={ariaLabelPrefix ? `${ariaLabelPrefix}${display}` : undefined}
      tabIndex={tabIndex}
      data-track-location={trackLocation}
    >
      {children}
    </a>
  );
}

/** The number as text. `js-swap-phone` marks the swappable ones. */
export function PhoneText({ swap = true }: { swap?: boolean }) {
  const forwarding = useForwardingNumber(swap);
  return (
    <span className={swap ? "js-swap-phone" : undefined} data-phone-text="">
      {forwarding?.display ?? PHONE.display}
    </span>
  );
}

/** Renders `text` with every occurrence of our display number as <PhoneText>. */
export function TextWithPhone({ text, swap = true }: { text: string; swap?: boolean }) {
  const parts = text.split(PHONE.display);
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <PhoneText swap={swap} />}
        </Fragment>
      ))}
    </>
  );
}
