import type { Metadata } from "next";
import { LpTemplate, lpPageMetadata } from "@/components/lp/LpTemplate";
import { LP_PAGES } from "@/lib/landingPages";

// Google Ads landing page ("install"), live in running ads: this URL must
// never 404. Copy lives in lib/landingPages.ts; the shared layout in
// components/lp/LpTemplate.tsx.
const config = LP_PAGES.install;

export const metadata: Metadata = lpPageMetadata(config);

export default function Page() {
  return <LpTemplate config={config} />;
}
