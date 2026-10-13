"use client";

import { Fragment, useSyncExternalStore, type ReactNode } from "react";
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
// Third-party numbers (gas utility, 911) must NOT use these components.

const noSubscribe = () => () => {};
const serverSnapshot = () => null;

/** The forwarding number for Ads visitors, or null (always null when swap is off). */
function useForwardingNumber(swap: boolean): ForwardingNumber | null {
  return useSyncExternalStore(
    swap ? subscribeForwardingNumber : noSubscribe,
    swap ? getForwardingNumber : serverSnapshot,
    serverSnapshot
  );
}

interface PhoneLinkProps {
  className?: string;
  children: ReactNode;
  /** Show the forwarding number to Ads visitors. Off for the footer NAP block. */
  swap?: boolean;
  /** aria-label = prefix + the displayed number, e.g. "Call now, ". */
  ariaLabelPrefix?: string;
  tabIndex?: number;
}

export function PhoneLink({ className, children, swap = true, ariaLabelPrefix, tabIndex }: PhoneLinkProps) {
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
