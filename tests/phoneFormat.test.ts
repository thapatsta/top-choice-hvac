// Format exactness: Google's "calls from website" snippet only swaps a number
// configured exactly as the page shows it, so our number may appear in one
// display format only, and every link to it must go through <PhoneLink>.
// tests-built/call-tracking.test.ts checks the same rules on the built HTML.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PHONE } from "@/lib/phone";
import { site } from "@/lib/site";

const ROOTS = ["app", "components", "lib", "data"];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|mjs)$/.test(name) ? [path] : [];
  });
}

const files = ROOTS.flatMap(sourceFiles).map((path) => ({ path, text: readFileSync(path, "utf8") }));

/** Any spelling of 647 763 2970: separators, country code, bare digits. */
const ANY_FORMAT_RE = /(?:\+?1[\s.-]?)?\(?647\)?[\s.-]*763[\s.-]*2970/g;

describe("phone number format", () => {
  it("site.phone is the single source (lib/phone.ts)", () => {
    expect(site.phone).toBe(PHONE);
    expect(PHONE.display).toBe("(647) 763-2970");
    expect(PHONE.href).toBe("tel:+16477632970");
  });

  it("no other format of our number appears in source", () => {
    const offenders: string[] = [];
    for (const { path, text } of files) {
      for (const match of text.matchAll(ANY_FORMAT_RE)) {
        if (path === join("lib", "phone.ts") && (match[0] === PHONE.display || match[0] === "+16477632970")) continue;
        offenders.push(`${path}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("our tel: href is only rendered by components/Phone.tsx", () => {
    // The lib files only compare digits with it; Phone.tsx is the one renderer.
    const allowed = new Set(
      ["lib/phone.ts", "lib/site.ts", "lib/callTracking.ts", "lib/phoneSwap.ts", "components/Phone.tsx"].map((p) => join(...p.split("/")))
    );
    const offenders = files
      .filter(({ path, text }) => !allowed.has(path) && /(site\.phone|PHONE)\.href/.test(text))
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  it("the display number is rendered through <PhoneText> in JSX, never as {site.phone.display}", () => {
    const offenders = files
      .filter(({ path }) => path.endsWith(".tsx"))
      .filter(({ text }) => /\{\s*(site\.phone|PHONE)\.display\s*\}/.test(text))
      .filter(({ path }) => path !== join("components", "Phone.tsx"))
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  it("JSON-LD keeps the real number in E.164", async () => {
    const { NAP_JSON_LD } = await import("@/lib/site");
    expect(NAP_JSON_LD.telephone).toBe("+16477632970");
  });
});
