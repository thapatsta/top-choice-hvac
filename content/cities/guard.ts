// The publish guard for city pages. Pure functions, so the tests
// (tests/cityContent.test.ts) and the import script
// (scripts/import-city-content.ts) share one definition of "ready".
//
// guardViolations(city) is what blocks a deploy: it must be empty for every
// city with ready: true. contentRuleViolations(city) is the subset that
// applies to written copy regardless of `ready`, so mistakes in a
// not-yet-ready city show up now, not on the day it goes live.

import { TODO } from "./facts";
import type { CityContent, Faq, Issue } from "./types";

/** Every string in a value, depth-first. */
export function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => allStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => allStrings(v, out));
  return out;
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Filler the brief bans ("Look no further" and friends). */
export const BANNED_FILLER: RegExp[] = [
  /look no further/i,
  /state[- ]of[- ]the[- ]art/i,
  /your trusted partner/i,
  /comprehensive solutions/i,
  /top[- ]notch/i,
  /second to none/i,
  /one[- ]stop[- ]shop/i,
];

/** Content that must never appear on a city page (copy or schema). */
export const BANNED_CONTENT: RegExp[] = [
  // Street address: the business address, or any "<number> <street> <suffix>".
  /Lloyd/i,
  /L7A\s?0G4/i,
  /\b\d{1,5}\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?\s+(Cres|Crescent|St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Court|Ct|Lane|Way)\b/,
  /duct cleaning/i,
  /rebate/i,
  /\bTSSA\b/i,
  /aggregateRating/i,
  /Top Choice Air System/i,
  ...BANNED_FILLER,
];

/** A general (shared-pool) issue may not read as local. */
const LOCAL_WORDS =
  /\b(neighbou?rhoods?|subdivisions?|condos?|condominiums?|townhomes?|townhouses?|semi-detached|detached|bungalows?|basement apartments?|mid-century|century|older (homes?|houses?)|newer (homes?|houses?|builds?)|new builds?|built in|era|vintage|woodbridge|kleinburg|mimico|humber|brampton|mississauga|vaughan|etobicoke|toronto|peel|york|gta|common in|in your area)\b/i;

/** Hedging rule for consultant claims: no digits, percentages or absolutes. */
const ABSOLUTES = /\b(all|every|most|always|never)\b/i;

const minimums = (city: CityContent) =>
  city.isHomeBase ? { jobs: 4, reviews: 3, issues: 5 } : { jobs: 2, reviews: 2, issues: 4 };

function issueStrings(issue: Issue): string[] {
  return allStrings(issue);
}

function faqProblems(faqs: Faq[]): string[] {
  const out: string[] = [];
  faqs.forEach((f) => {
    const n = wordCount(f.a);
    if (n < 40 || n > 90) out.push(`FAQ answer "${f.q}" is ${n} words (needs 40-90)`);
  });
  if (!faqs.some((f) => /smell gas/i.test(f.q))) out.push("missing the gas smell / carbon monoxide FAQ");
  return out;
}

/** Rules for the written copy. Placeholders are skipped here; the guard rejects them. */
export function contentRuleViolations(city: CityContent): string[] {
  const out: string[] = [];
  const fail = (msg: string) => out.push(`${city.slug}: ${msg}`);

  if (city.seoTitle.length > 60) fail(`seoTitle is ${city.seoTitle.length} chars (max 60)`);
  if (city.metaDescription.length > 155) fail(`metaDescription is ${city.metaDescription.length} chars (max 155)`);

  if (!city.answerBlock.includes(TODO)) {
    const n = wordCount(city.answerBlock);
    if (n < 40 || n > 60) fail(`answerBlock is ${n} words (needs 40-60)`);
  }
  if (city.faqs.length < 5 || city.faqs.length > 7) fail(`${city.faqs.length} FAQs (needs 5-7)`);
  if (city.faqs.filter((f) => f.cityspecific).length < 3) fail("fewer than 3 city-specific FAQs");
  faqProblems(city.faqs.filter((f) => !f.a.includes(TODO))).forEach(fail);

  for (const text of allStrings(city)) {
    if (text.includes(TODO)) continue;
    for (const re of BANNED_CONTENT) if (re.test(text)) fail(`banned content ${re} in: ${text.slice(0, 100)}`);
  }

  for (const issue of city.issues) {
    const text = issueStrings(issue).join(" ");
    if (issue.source === "general") {
      if (issue.appliesTo) fail(`general issue "${issue.title}" has appliesTo`);
      const hit = text.match(LOCAL_WORDS);
      if (hit) fail(`general issue "${issue.title}" reads as local: "${hit[0]}"`);
    }
    if (issue.source === "consultant") {
      if (/\d/.test(text) || /%/.test(text)) fail(`consultant issue "${issue.title}" contains a digit or percentage`);
      const hit = text.match(ABSOLUTES);
      if (hit) fail(`consultant issue "${issue.title}" uses an absolute: "${hit[0]}"`);
    }
    if (issue.source !== "robin" && issue.source !== "patrick" && issue.source !== "consultant" && issue.appliesTo) {
      fail(`issue "${issue.title}" has appliesTo but is not a robin / patrick / consultant issue`);
    }
  }
  return out;
}

/** Everything that must hold before a city can be ready: true. */
export function guardViolations(city: CityContent): string[] {
  const out: string[] = [];
  const fail = (msg: string) => out.push(`${city.slug}: ${msg}`);
  const min = minimums(city);

  for (const text of allStrings(city)) {
    if (text.includes(TODO)) fail(`placeholder left in: ${text.slice(0, 80)}`);
  }
  const verifiedJobs = city.jobs.filter((j) => j.verified);
  if (verifiedJobs.length < min.jobs) fail(`${verifiedJobs.length} verified jobs (needs ${min.jobs})`);
  if (city.jobs.some((j) => !j.verified)) fail("a job has verified: false");
  if (city.reviews.length < min.reviews) fail(`${city.reviews.length} reviews (needs ${min.reviews})`);
  if (city.reviews.some((r) => !r.citySource)) fail("a review has no citySource");
  if (city.issues.length < min.issues) fail(`${city.issues.length} issues (needs ${min.issues})`);
  if (city.issues.length > 6) fail(`${city.issues.length} issues (max 6)`);
  if (!city.lastReviewed || !/^\d{4}-\d{2}$/.test(city.lastReviewed)) fail("lastReviewed missing or not YYYY-MM");
  if (city.isHomeBase && !city.homeBaseParagraph) fail("home base paragraph missing");
  return [...out, ...contentRuleViolations(city)];
}

// ---------------------------------------------------------------------------
// Duplicate-content check
// ---------------------------------------------------------------------------

/**
 * The city-specific copy: jobs, intro, answer block, issues intro, local FAQs
 * and the consultant / robin / patrick issues. The shared pool issues and
 * shared FAQs are left out on purpose: they are identical by design.
 * Placeholders are skipped so unfinished cities don't match each other.
 */
export function localCopy(city: CityContent): string[] {
  const parts: unknown[] = [
    city.jobs,
    city.introParagraph,
    city.answerBlock,
    city.issuesIntro,
    city.faqs.filter((f) => f.cityspecific),
    city.issues.filter((i) => i.source !== "general"),
  ];
  return allStrings(parts).filter((s) => !s.includes(TODO));
}

/** Lower-case words with punctuation removed. */
function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * The set of 5-word shingles (overlapping runs of five consecutive words) in
 * a list of strings. Each string is shingled on its own so a shingle never
 * runs across two fields.
 */
export function shingles(texts: string[], size = 5): Set<string> {
  const set = new Set<string>();
  for (const text of texts) {
    const w = words(text);
    for (let i = 0; i + size <= w.length; i++) set.add(w.slice(i, i + size).join(" "));
  }
  return set;
}

/**
 * Overlap between two cities' local copy: the number of shared 5-word
 * shingles divided by the size of the smaller set. Using the smaller set is
 * the strict choice: a short page that mostly repeats another scores high.
 * The brief fails any pair above 30% (0.3).
 */
export function shingleOverlap(a: CityContent, b: CityContent): number {
  const sa = shingles(localCopy(a));
  const sb = shingles(localCopy(b));
  const smaller = Math.min(sa.size, sb.size);
  if (smaller === 0) return 0;
  let shared = 0;
  for (const s of sa) if (sb.has(s)) shared++;
  return shared / smaller;
}

export const MAX_OVERLAP = 0.3;
