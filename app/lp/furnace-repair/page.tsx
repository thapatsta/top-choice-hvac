import type { Metadata } from "next";
import { LpTemplate, lpPageMetadata } from "@/components/lp/LpTemplate";
import { LP_PAGES } from "@/lib/landingPages";

// Google Ads landing page ("repair"). Copy lives in
// lib/landingPages.ts; the shared layout in components/lp/LpTemplate.tsx.
const config = LP_PAGES.repair;

export const metadata: Metadata = lpPageMetadata(config);

export default function Page() {
  return <LpTemplate config={config} />;
}
