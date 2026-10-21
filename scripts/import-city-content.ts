// Turns a jobs sheet and a reviews sheet into content/cities/imports/<city>.json,
// which each city data file reads. Validates the rows against the shapes in
// content/cities/types.ts, so a bad row stops here, not in the build.
//
//   node scripts/import-city-content.ts --jobs jobs.csv --reviews reviews.csv
//   node scripts/import-city-content.ts --jobs jobs.csv --dry-run
//
// Node 22 runs this file as is (it strips the types). Column layout:
// content/cities/README.md. CSV is read natively. For .xlsx the optional
// "xlsx" package is used if installed; otherwise save the sheet as CSV.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Job, Review } from "../content/cities/types.ts";

type Row = Record<string, string>;
export type Imported = { jobs: Job[]; reviews: Review[] };

const SERVICES: Record<string, Job["service"]> = {
  "furnace-repair": "furnace-repair",
  "furnace repair": "furnace-repair",
  "furnace-install": "furnace-install",
  "furnace install": "furnace-install",
  "furnace installation": "furnace-install",
  "ac-install": "ac-install",
  "ac install": "ac-install",
  "ac installation": "ac-install",
};

const SOURCES: Review["citySource"][] = ["robin-tagged", "address-confirmed"];

/** A street with a number in front of it, or a bare number: a house number. */
const HOUSE_NUMBER = /^\s*\d|\b\d{1,5}\s+[A-Za-z]+(\s+[A-Za-z]+)?\s+(Cres|Crescent|St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Court|Ct|Lane|Way)\b/i;

/** Minimal CSV: quoted fields, doubled quotes, CRLF. First row is the header. */
export function parseCsv(text: string): Row[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  const [header, ...body] = rows;
  if (!header) return [];
  const keys = header.map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return body.map((cells) => Object.fromEntries(keys.map((k, i) => [k, (cells[i] ?? "").trim()])));
}

export async function readRows(path: string): Promise<Row[]> {
  if (/\.xlsx$/i.test(path)) {
    const name = "xlsx";
    let xlsx: { readFile(p: string): { SheetNames: string[]; Sheets: Record<string, unknown> }; utils: { sheet_to_csv(s: unknown): string } };
    try {
      xlsx = await import(/* @vite-ignore */ name);
    } catch {
      throw new Error(`Reading ${path} needs the "xlsx" package. Save the sheet as CSV instead, or run: npm i --no-save xlsx`);
    }
    const book = xlsx.readFile(path);
    return parseCsv(xlsx.utils.sheet_to_csv(book.Sheets[book.SheetNames[0]]));
  }
  return parseCsv(readFileSync(path, "utf8"));
}

export type Problem = { line: number; message: string };
export type ByCity<T> = Record<string, T[]>;

export function rowsToJobs(rows: Row[], knownCities: string[], thisYear = new Date().getFullYear()) {
  const jobs: ByCity<Job> = {};
  const problems: Problem[] = [];
  rows.forEach((r, i) => {
    const line = i + 2;
    const bad = (message: string) => problems.push({ line, message });
    const city = (r.city ?? "").toLowerCase();
    const service = SERVICES[(r.service ?? "").toLowerCase()];
    const year = Number(r.year);
    if (!knownCities.includes(city)) return bad(`city "${r.city}" is not one of: ${knownCities.join(", ")}`);
    if (!service) return bad(`service "${r.service}" must be furnace repair, furnace install or ac install`);
    if (!r.neighbourhood) return bad("neighbourhood is empty");
    if (HOUSE_NUMBER.test(r.neighbourhood)) return bad(`neighbourhood "${r.neighbourhood}" looks like a house number; use the neighbourhood or street name only`);
    if (!r.problem || !r.work) return bad("problem and work are both required");
    if (!Number.isInteger(year) || year < 2015 || year > thisYear) return bad(`year "${r.year}" must be a year from 2015 to ${thisYear}`);
    if (!/^(yes|true|y)$/i.test(r.verified ?? "")) return bad("verified must be yes: only jobs Robin or Patrick supplied may be imported");
    if ([r.neighbourhood, r.problem, r.work].some((s) => s.includes("TODO_REAL_CONTENT"))) return bad("contains TODO_REAL_CONTENT");
    (jobs[city] ??= []).push({ neighbourhood: r.neighbourhood, service, problem: r.problem, work: r.work, year, photos: [], verified: true });
  });
  return { byCity: jobs, problems };
}

export function rowsToReviews(rows: Row[], knownCities: string[]) {
  const reviews: ByCity<Review> = {};
  const problems: Problem[] = [];
  rows.forEach((r, i) => {
    const line = i + 2;
    const bad = (message: string) => problems.push({ line, message });
    const city = (r.city ?? "").toLowerCase();
    const stars = Number(r.stars);
    const source = (r.city_source ?? "") as Review["citySource"];
    if (!knownCities.includes(city)) return bad(`city "${r.city}" is not one of: ${knownCities.join(", ")}`);
    if (!/^[\p{L}'-]+$/u.test(r.first_name ?? "")) return bad(`first_name "${r.first_name}" must be a first name only (no surname, initial or spaces)`);
    if (![1, 2, 3, 4, 5].includes(stars)) return bad(`stars "${r.stars}" must be 1 to 5`);
    if (!r.text) return bad("text is empty");
    if (r.date && !/^\d{4}-(0[1-9]|1[0-2])$/.test(r.date)) return bad(`date "${r.date}" must be YYYY-MM or empty`);
    if (!SOURCES.includes(source)) return bad(`city_source "${r.city_source}" must be ${SOURCES.join(" or ")}`);
    if (r.text.includes("TODO_REAL_CONTENT")) return bad("contains TODO_REAL_CONTENT");
    (reviews[city] ??= []).push({
      firstName: r.first_name,
      stars: stars as Review["stars"],
      text: r.text,
      ...(r.date ? { date: r.date } : {}),
      citySource: source,
    });
  });
  return { byCity: reviews, problems };
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "content", "cities", "imports");
  const known = ["brampton", "mississauga", "vaughan", "etobicoke"].filter((c) => existsSync(join(dir, `${c}.json`)));
  const jobsPath = arg("jobs");
  const reviewsPath = arg("reviews");
  const dryRun = process.argv.includes("--dry-run");
  if (!jobsPath && !reviewsPath) {
    console.error("Usage: node scripts/import-city-content.ts [--jobs jobs.csv] [--reviews reviews.csv] [--dry-run]");
    process.exit(2);
  }

  const problems: string[] = [];
  const jobs = jobsPath ? rowsToJobs(await readRows(resolve(jobsPath)), known) : undefined;
  const reviews = reviewsPath ? rowsToReviews(await readRows(resolve(reviewsPath)), known) : undefined;
  jobs?.problems.forEach((p) => problems.push(`${jobsPath} line ${p.line}: ${p.message}`));
  reviews?.problems.forEach((p) => problems.push(`${reviewsPath} line ${p.line}: ${p.message}`));
  if (problems.length > 0) {
    console.error(problems.join("\n"));
    console.error(`\n${problems.length} problem(s). Nothing was written.`);
    process.exit(1);
  }

  // A sheet replaces that kind of content for every city in it. Cities not in
  // the sheet keep what they had.
  for (const city of known) {
    const file = join(dir, `${city}.json`);
    const current = JSON.parse(readFileSync(file, "utf8")) as Imported;
    const next: Imported = {
      jobs: jobs?.byCity[city] ?? current.jobs,
      reviews: reviews?.byCity[city] ?? current.reviews,
    };
    if (JSON.stringify(next) === JSON.stringify(current)) continue;
    console.log(`${city}: ${next.jobs.length} jobs, ${next.reviews.length} reviews${dryRun ? " (dry run)" : ""}`);
    if (!dryRun) writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
  }
  console.log("Done. Set ready: true in the city file only when tests/cityContent.test.ts passes.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
