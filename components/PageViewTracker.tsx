"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

/**
 * Sends the GA4 page_view on first load and on every client-side pathname
 * change. The GA4 config in app/layout.tsx sets send_page_view: false, so
 * this is the only source of page_view. GA4's Enhanced measurement option
 * "Page changes based on browser history events" must be OFF, or client
 * navigations count twice (see README "Call tracking").
 */
export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) trackPageView(pathname);
  }, [pathname]);
  return null;
}
