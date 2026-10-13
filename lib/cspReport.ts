// Parses CSP violation reports for app/api/csp-report/route.ts. Keeps only
// the directive and the blocked origin: never a full URL (it can carry a
// gclid or query string) or the page.

export const CSP_REPORT_MAX_BYTES = 8192;

interface Violation {
  directive: string;
  blocked: string;
}

function originOf(value: unknown): string {
  if (typeof value !== "string" || !value) return "unknown";
  if (!value.includes(":")) return value.slice(0, 40); // "inline", "eval", "self"
  try {
    return new URL(value).origin.slice(0, 100);
  } catch {
    return value.split(/[/?#]/)[0].slice(0, 40);
  }
}

/** Accepts both the legacy {"csp-report": {...}} body and the Reporting API array. */
export function parseViolations(raw: unknown): Violation[] {
  const items = Array.isArray(raw) ? raw : [raw];
  const out: Violation[] = [];
  for (const item of items.slice(0, 20)) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const body = (r["csp-report"] ?? r.body ?? r) as Record<string, unknown>;
    const directive = body["effective-directive"] ?? body.effectiveDirective ?? body["violated-directive"];
    out.push({
      directive: typeof directive === "string" ? directive.slice(0, 40) : "unknown",
      blocked: originOf(body["blocked-uri"] ?? body.blockedURL),
    });
  }
  return out;
}
