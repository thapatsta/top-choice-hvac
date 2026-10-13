import { NextResponse } from "next/server";
import { CSP_REPORT_MAX_BYTES, parseViolations } from "@/lib/cspReport";

// CSP violation reports (report-uri in next.config.ts), so a Google Ads host
// the policy forgot shows up in Workers Logs as [csp:BLOCKED] instead of
// failing silently. Logs only the directive and the blocked origin: never the
// full URL (it can carry a gclid or query string) or the page. Nothing is
// stored and nothing is emailed, so it is not rate limited: sharing
// CALL_RATE_LIMITER would let a page full of violations use up a visitor's
// call-tap budget.

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length <= CSP_REPORT_MAX_BYTES) {
      for (const v of parseViolations(JSON.parse(text))) {
        console.warn(`[csp:BLOCKED] directive=${v.directive} blocked=${v.blocked}`);
      }
    }
  } catch {
    // Malformed report: ignore.
  }
  return new NextResponse(null, { status: 204 });
}
