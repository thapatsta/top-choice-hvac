"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { isPromoActive } from "@/lib/landingPages";

const noSubscribe = () => () => {};

/**
 * Whether MAINTENANCE_PROMO is still running. The pages are prerendered, so
 * the server value (`serverActive`, from build time) is used for the HTML and
 * hydration; the browser then re-checks the clock, so the offer disappears
 * on Nov 1 even if nobody rebuilds the site.
 */
export function usePromoActive(serverActive: boolean): boolean {
  return useSyncExternalStore(noSubscribe, () => serverActive && isPromoActive(), () => serverActive);
}

/** Renders its children only while the maintenance promo is running. */
export function PromoGate({ serverActive, children }: { serverActive: boolean; children: ReactNode }) {
  return usePromoActive(serverActive) ? <>{children}</> : null;
}
