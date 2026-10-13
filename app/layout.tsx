import type { Metadata } from "next";
import Script from "next/script";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { AnalyticsListeners } from "@/components/AnalyticsListeners";
import { PageViewTracker } from "@/components/PageViewTracker";
import { PRODUCTION_HOST_RE } from "@/lib/analytics";
import { EARLY_TAP_QUEUE_JS } from "@/lib/callTracking";
import { isRealTagValue } from "@/lib/googleTag";
import { PHONE_CONVERSION_CALLBACK_JS } from "@/lib/phoneSwap";
import { site } from "@/lib/site";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Brampton & GTA Heating and Cooling`,
    template: `%s | ${site.name}`,
  },
  description:
    "Licensed HVAC contractor serving Brampton and the greater GTA. Furnace and AC repair, installation, heat pumps, and more. Upfront pricing, fast response.",
  // iOS would otherwise turn plain-text numbers into its own tel: links,
  // which bypass <PhoneLink> (untracked, never swapped) and mutate DOM that
  // React owns. Every number we want tappable is already a <PhoneLink>.
  formatDetection: { telephone: false },
};

/**
 * The inline gtag bootstrap. gtag() is defined on every host so track() in
 * lib/analytics.ts stays safe, but only production hosts configure anything
 * (PRODUCTION_HOST_RE, the same regex isProductionHost() uses). Each Google
 * Ads part is skipped while its ID/label is a "[PLACEHOLDER" value.
 *
 * - GA4: send_page_view false; components/PageViewTracker.tsx sends page_view.
 * - Google Ads: plain config (conversion linker, gclid cookie) with Google's
 *   default page view.
 * - Calls from website: Google's phone snippet, config 'AW-ID/label' with
 *   phone_conversion_number set to the number exactly as the page shows it.
 *   No phone_conversion_css_class: the callback hands the forwarding number
 *   to React (lib/phoneSwap.ts), which renders it in <PhoneLink>/<PhoneText>
 *   only. phone_conversion_options is left at Google's defaults: its keys
 *   could not be verified against Google's docs (see the PR).
 */
function googleTagSnippet(): string {
  const { adsId, adsConversionLabels: labels, ga4Id } = site;
  const lines = [
    // Queues call taps made before hydration (lib/callTracking.ts drains it).
    EARLY_TAP_QUEUE_JS,
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){dataLayer.push(arguments);}",
    `if (${PRODUCTION_HOST_RE}.test(location.hostname)) {`,
    "gtag('js', new Date());",
    `gtag('config', ${JSON.stringify(ga4Id)}, { send_page_view: false });`,
  ];
  if (isRealTagValue(adsId)) {
    lines.push(`gtag('config', ${JSON.stringify(adsId)});`);
    if (isRealTagValue(labels.callFromWebsite)) {
      lines.push(
        `gtag('config', ${JSON.stringify(`${adsId}/${labels.callFromWebsite}`)}, {`,
        `'phone_conversion_number': ${JSON.stringify(site.phone.display)},`,
        `'phone_conversion_callback': ${PHONE_CONVERSION_CALLBACK_JS}`,
        "});"
      );
    }
  }
  lines.push("}");
  return lines.join("\n");
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = site.gtmId;
  const ga4Id = site.ga4Id;
  const hasRealGtm = isRealTagValue(gtmId);
  const hasRealGa4 = isRealTagValue(ga4Id);

  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} h-full antialiased`}
    >
      {/* Google tag (GA4 + Google Ads) as plain <script> tags in the
          server-rendered <head>: Google's tag checks need it in the raw HTML.
          next/script can't do that here: afterInteractive only ships it in
          the RSC payload, and beforeInteractive emits a <link rel=preload>
          plus a self.__next_s queue that Next's runtime injects later.
          tests-built/call-tracking.test.ts asserts the served HTML. */}
      {hasRealGa4 && (
        <head>
          <script
            id="gtag-init"
            dangerouslySetInnerHTML={{ __html: googleTagSnippet() }}
          />
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
        </head>
      )}
      <body className="flex min-h-full flex-col">
        {/* Google Tag Manager: replace site.gtmId in lib/site.ts with the real container ID to activate */}
        {hasRealGtm && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ember focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>

        {/* The site header, footer and sticky call bar live in
            app/(site)/layout.tsx. The /lp/* ad landing pages have their own
            layout (app/lp/layout.tsx) and never render or ship the site
            chrome, so its address and claims stay out of their HTML. */}
        {children}
        <AnalyticsListeners />
        <PageViewTracker />
      </body>
    </html>
  );
}
