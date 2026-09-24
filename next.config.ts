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
const csp = [
  "default-src 'self'",
  // GA4/GTM (gtag.js, gtm.js) and the optional Instagram embed.js.
  // 'unsafe-eval' only in `next dev` (React dev tooling needs it).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.instagram.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self'",
  // Lead forms POST same-origin. GA4 sends hits to these hosts.
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  // GoogleMapEmbed (google.com/maps?output=embed) and Instagram post embeds.
  "frame-src https://www.google.com https://www.instagram.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
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
