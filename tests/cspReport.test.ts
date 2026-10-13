import { describe, expect, it } from "vitest";
import { parseViolations } from "@/lib/cspReport";

describe("parseViolations", () => {
  it("reads the legacy report-uri body and keeps only directive + origin", () => {
    expect(
      parseViolations({
        "csp-report": {
          "document-uri": "https://topchoicehvac.ca/lp/furnace-repair?gclid=SECRET",
          "effective-directive": "connect-src",
          "blocked-uri": "https://www.google.ca/pagead/1p-user-list/123?gclid=SECRET",
        },
      })
    ).toEqual([{ directive: "connect-src", blocked: "https://www.google.ca" }]);
  });

  it("reads the Reporting API array", () => {
    expect(
      parseViolations([
        { type: "csp-violation", body: { effectiveDirective: "img-src", blockedURL: "https://x.example/a.gif" } },
        { type: "csp-violation", body: { effectiveDirective: "script-src", blockedURL: "inline" } },
      ])
    ).toEqual([
      { directive: "img-src", blocked: "https://x.example" },
      { directive: "script-src", blocked: "inline" },
    ]);
  });

  it("never leaks a query string or path", () => {
    const out = JSON.stringify(
      parseViolations({ "csp-report": { "violated-directive": "frame-src", "blocked-uri": "https://a.example/p?gclid=SECRET" } })
    );
    expect(out).not.toContain("SECRET");
    expect(out).not.toContain("/p");
  });

  it("ignores junk", () => {
    expect(parseViolations(null)).toEqual([]);
    expect(parseViolations([1, "x"])).toEqual([]);
  });
});
