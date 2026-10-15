import type { Metadata } from "next";
import { LegacyLandingPage } from "@/components/lp/LegacyLandingPage";
import { getLegacyLandingPage, lpMetadata } from "@/lib/legacyLandingPages";

// Google Ads landing page. Copy lives in lib/legacyLandingPages.ts.
const config = getLegacyLandingPage("outskirts/furnace-installation");

export const metadata: Metadata = lpMetadata(config);

export default function Page() {
  return <LegacyLandingPage config={config} />;
}
