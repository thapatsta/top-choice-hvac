"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Renders the site-wide header, footer and sticky call bar everywhere except
 * the ad landing pages under /lp/, which bring their own minimal chrome so a
 * visitor from an ad sees only the offer and the form.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/lp/")) return null;
  return <>{children}</>;
}
