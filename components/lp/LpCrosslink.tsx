"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import type { LpContext, LpSlug } from "@/lib/landingPage";

// The query string never changes while the page is open.
const noSubscribe = () => () => {};
const readSearch = () => window.location.search;

/**
 * A link from one landing page to another that keeps the visitor's query
 * string (gclid, UTMs), so the next page's attribution still sees the ad
 * click. Fires lp_crosslink when clicked.
 */
export function LpCrosslink({
  to,
  from,
  location,
  className,
  children,
}: {
  to: LpSlug;
  from: LpContext;
  location: string;
  className?: string;
  children: ReactNode;
}) {
  // The query string only exists in the browser; the static HTML links to
  // the bare path until hydration.
  const search = useSyncExternalStore(noSubscribe, readSearch, () => "");
  const href = `/lp/${to}${search}`;

  return (
    <a
      href={href}
      className={className}
      onClick={() => track("lp_crosslink", { ...from, link_location: location, lp_destination: to })}
    >
      {children}
    </a>
  );
}
