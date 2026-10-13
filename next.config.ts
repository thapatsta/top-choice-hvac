import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { BASE_PATH } from "./lib/basePath";

const isDev = process.env.NODE_ENV === "development";

// Baseline Content-Security-Policy. Pages are prerendered, so per-request
// nonces aren't possible (they need dynamic rendering). script-src therefore
// needs 'unsafe-inline' for Next's inline RSC payload scripts and the GA4
// bootstrap in app/layout.tsx. The value here is in locking down script/
// connect/frame origins, plugins, <base>, form targets and framing.
// JSON-LD (<script type="application/ld+json">) isn't executed, so CSP
// doesn't apply to it.

// Google Ads hosts (added for the Ads conversion + "calls from website"
// tags). NOT yet verified by watching a real browser: the build environment
// could not reach Google. Violations are reported to /api/csp-report and
// logged as [csp:BLOCKED] (see README "Call tracking"), so a missing host
// shows up in Workers Logs instead of failing silently. Adjust from there.
const googleAds = {
  // Conversion / remarketing pings and the forwarding-number lookup.
  adServices: "https://www.googleadservices.com",
  // Conversion pings and remarketing (ad clicks).
  doubleClick: "https://googleads.g.doubleclick.net",
  // /pagead/1p-conversion, /pagead/1p-user-list and /ccm/collect pings.
  google: "https://www.google.com",
  // Same pings on the visitor's country Google domain (Canada).
  googleCa: "https://www.google.ca",
  // Website call metrics loader used by the forwarding-number swap.
  gstatic: "https://www.gstatic.com",
  // Ads remarketing iframe.
  tdDoubleClick: "https://td.doubleclick.net",
};

const csp = [
  "default-src 'self'",
  // GA4/GTM (gtag.js, gtm.js) and the optional Instagram embed.js, plus the
  // Google Ads scripts gtag.js pulls in (see googleAds above).
  // 'unsafe-eval' only in `next dev` (React dev tooling needs it).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.instagram.com ${googleAds.adServices} ${googleAds.doubleClick} ${googleAds.google} ${googleAds.gstatic}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com ${googleAds.adServices} ${googleAds.doubleClick} ${googleAds.google} ${googleAds.googleCa}`,
  "font-src 'self'",
  // Lead forms and the call-tap beacon POST same-origin ('self'). GA4 sends
  // hits to the analytics hosts; the Ads tags to googleAds.
  `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com ${googleAds.adServices} ${googleAds.doubleClick} ${googleAds.google} ${googleAds.googleCa}`,
  // GoogleMapEmbed (google.com/maps?output=embed), Instagram post embeds,
  // the Ads remarketing iframe and gtag's service-worker iframe.
  `frame-src https://www.google.com https://www.instagram.com ${googleAds.tdDoubleClick} https://www.googletagmanager.com`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
  // Blocked requests are logged by app/api/csp-report/route.ts.
  "report-uri /api/csp-report",
].join("; ");

// Applied by the Next server inside the Worker, so it covers every HTML page
// and API route. It does NOT cover files the Workers ASSETS binding serves
// directly (/_next/static/*, favicon.ico). Those skip the Worker; see
// public/_headers.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  ...(BASE_PATH ? { basePath: BASE_PATH } : {}),
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;
