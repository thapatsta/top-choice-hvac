// Claims and address rules for the /lp/* ad landing pages, shared by
// tests/lp-content.test.ts (config + component source) and
// tests-built/lp-smoke.test.ts (the built HTML).

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/** Credential-type claims: licensing, certification, insurance, regulators. */
export const CREDENTIAL_TERMS: RegExp[] = [
  /licen[cs]/i,
  /certif/i,
  /insur/i,
  /\bTSSA\b/i,
  /\bregist(er|ered|ration|ry)\b/i,
  /\bbonded\b/i,
  /accredit/i,
  /\bWSIB\b/i,
  /\bHRAI\b/i,
  /\bTECA\b/i,
];

/** Superlatives, awards and invented stats or guarantees. */
export const SUPERLATIVE_TERMS: RegExp[] = [
  /\bbest\b/i,
  /#\s?1\b/,
  /\bno\.\s?1\b/i,
  /\bnumber one\b/i,
  /\btop[- ]rated\b/i,
  /\b(cheapest|lowest|fastest|unbeatable)\b/i,
  /\baward/i,
  /\d+\s?%/,
  /\d+\+?\s(years|homes|customers|jobs|installs)\b/i,
  // Only the satisfaction guarantee is a confirmed guarantee.
  /(?<!satisfaction )guarantee/i,
  // Response times: only "typically within 30 minutes" is allowed.
  /(?<!typically )within \d+\s?(minutes|mins|hours|hrs)/i,
];

/** Round-the-clock wording: repair pages only, and only with showEmergency247. */
export const ALWAYS_OPEN_TERMS: RegExp[] = [
  /24\s*\/\s*7/,
  /24-7/,
  /24 hours/i,
  /around[- ]the[- ]clock/i,
  /\bany ?time\b/i,
];

export const SAME_DAY = /same[- ]day/i;
export const SAME_DAY_QUALIFIER = /in (many|some) cases/i;

export const PRICE = /\$\s?\d/;

/** Business street address or postal code. The city alone is fine. */
export const ADDRESS_TERMS: RegExp[] = [/Lloyd/i, /L7A\s?0G4/i];

export interface ScanRules {
  /** Allow credential terms (only when credentialClaims is verified). */
  allowCredentials?: boolean;
  /** Allow round-the-clock wording (repair pages with showEmergency247). */
  allowAlwaysOpen?: boolean;
  /** Ban every price (the heating & cooling pages). */
  noPrices?: boolean;
}

/**
 * Scans one unit of copy (a field, or an FAQ question with its answer) and
 * returns a description of each rule it breaks.
 */
export function scanCopy(text: string, rules: ScanRules = {}): string[] {
  const problems: string[] = [];
  const hit = (list: RegExp[], label: string) => {
    for (const re of list) {
      const m = text.match(re);
      if (m) problems.push(`${label} "${m[0]}" in: ${text}`);
    }
  };
  if (!rules.allowCredentials) hit(CREDENTIAL_TERMS, "credential claim");
  hit(SUPERLATIVE_TERMS, "superlative/unverified claim");
  if (!rules.allowAlwaysOpen) hit(ALWAYS_OPEN_TERMS, "24/7 wording outside a repair page");
  hit(ADDRESS_TERMS, "business address");
  if (SAME_DAY.test(text) && !SAME_DAY_QUALIFIER.test(text)) {
    problems.push(`unqualified same-day claim in: ${text}`);
  }
  if (PRICE.test(text)) {
    if (rules.noPrices) problems.push(`price on a no-price page in: ${text}`);
    if (/rebate/i.test(text)) problems.push(`rebate amount in: ${text}`);
    if (/heat pump|air condition|\bAC\b/i.test(text)) {
      problems.push(`heat pump / AC price in: ${text}`);
    }
  }
  return problems;
}

/** Every string in a value, depth-first. */
export function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => collectStrings(v, out));
  }
  return out;
}

/**
 * Source text with comments and Tailwind class lists removed, so only copy
 * and code remain (class names like "text-white/60" aren't copy).
 */
export function stripSource(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/(^|[^:"'`])\/\/.*$/gm, "$1")
    .replace(/className=\{`[^`]*`\}/g, "")
    .replace(/className="[^"]*"/g, "")
    .replace(/const \w+ =\s*\n?\s*"[^"]*(min-h|rounded|font-|text-)[^"]*";/g, "");
}

export function listFiles(dir: string, ext: RegExp): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listFiles(full, ext));
    else if (ext.test(name)) out.push(full);
  }
  return out;
}

export function readSource(path: string): string {
  return readFileSync(path, "utf8");
}
