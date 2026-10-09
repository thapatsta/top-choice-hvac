import type { Metadata } from "next";
import { LandingPage } from "@/components/lp/LandingPage";
import { getLandingPage, lpMetadata } from "@/lib/landing-pages";

// Google Ads landing page. Copy lives in lib/landing-pages.ts.
const config = getLandingPage("outskirts/furnace-installation");

export const metadata: Metadata = lpMetadata(config);

export default function Page() {
  return <LandingPage config={config} />;
}
