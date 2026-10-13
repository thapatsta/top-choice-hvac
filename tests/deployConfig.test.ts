// Guards against the most likely failure mode: a deploy that silently drops
// a secret, var or binding the call tracking needs.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** wrangler.jsonc without comments (no "//" inside its strings except URLs, handled). */
function readJsonc(path: string) {
  const text = readFileSync(path, "utf8")
    .split("\n")
    .map((line) => line.replace(/^\s*\/\/.*$/, ""))
    .join("\n");
  return JSON.parse(text);
}

const wrangler = readJsonc("wrangler.jsonc");
const deploy = readFileSync(".github/workflows/deploy.yml", "utf8");

describe("wrangler.jsonc", () => {
  it("binds both rate limiters with distinct namespaces", () => {
    const names = wrangler.ratelimits.map((r: { name: string }) => r.name);
    expect(names).toEqual(expect.arrayContaining(["LEAD_RATE_LIMITER", "CALL_RATE_LIMITER"]));
    const ids = wrangler.ratelimits.map((r: { namespace_id: string }) => r.namespace_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ships CALL_INTENT_NOTIFY as a var (email by default)", () => {
    expect(wrangler.vars.CALL_INTENT_NOTIFY).toBe("email");
  });

  it("binds LEADS_KV (call taps are logged there)", () => {
    expect(wrangler.kv_namespaces.map((k: { binding: string }) => k.binding)).toContain("LEADS_KV");
  });
});

describe("deploy.yml passes every secret the call-tap email needs", () => {
  // Call taps add no new secret: they reuse these two from the lead pipeline.
  for (const name of ["RESEND_API_KEY", "LEAD_NOTIFY_EMAIL"]) {
    it(`${name} is checked, written to the secrets file and listed in both steps`, () => {
      const envLines = deploy.match(new RegExp(`${name}: \\$\\{\\{ secrets\\.${name} \\}\\}`, "g")) ?? [];
      expect(envLines.length).toBe(2); // the check step and the secrets-file step
      expect(deploy).toMatch(new RegExp(`for name in [^\\n]*\\b${name}\\b`));
      expect(deploy).toMatch(new RegExp(`const names = \\[[^\\]]*"${name}"`));
    });
  }

  it("deploys with the secrets file in the same Worker version", () => {
    expect(deploy).toContain("deploy --secrets-file");
  });
});
