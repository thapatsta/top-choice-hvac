#!/usr/bin/env node
// End-of-day report: call taps and form leads for one America/Toronto
// calendar day, read from LEADS_KV. See README "Call tracking".
//
//   node scripts/call-report.mjs                 # today (Toronto)
//   node scripts/call-report.mjs 2026-10-13      # a given Toronto day
//   node scripts/call-report.mjs --local         # wrangler dev's local KV
//
// Needs `wrangler login` (or CLOUDFLARE_API_TOKEN). Uses `wrangler kv key
// list` (4 list calls) plus one `get` per form lead for its attribution. It
// never prints a lead's name, phone, email or message: only counts.
//
// Keys are UTC ISO timestamps (`calls:<ISO>:<id>`, `leads:<ISO>:<id>`), so a
// Toronto day spans two UTC dates; torontoDayRange() gives the exact UTC
// bounds, DST included.

import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const TZ = "America/Toronto";

/** Offset of Toronto from UTC at instant `ms`, in ms (e.g. -4h in EDT). */
function torontoOffsetMs(ms) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ms));
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(ms / 1000) * 1000;
}

/** UTC instant of Toronto midnight at the start of y-m-d. */
function torontoMidnightUtc(y, m, d) {
  const wall = Date.UTC(y, m - 1, d);
  let guess = wall;
  // Two passes settle the offset (Toronto's DST switches at 2am, never at midnight).
  for (let i = 0; i < 3; i++) guess = wall - torontoOffsetMs(guess);
  return guess;
}

/**
 * The UTC bounds [start, end) of a Toronto calendar day "YYYY-MM-DD", plus the
 * UTC dates its keys can start with.
 */
export function torontoDayRange(day) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) throw new Error(`Expected YYYY-MM-DD, got "${day}"`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const start = torontoMidnightUtc(y, mo, d);
  const end = torontoMidnightUtc(y, mo, d + 1);
  const utcDates = [...new Set([new Date(start).toISOString().slice(0, 10), new Date(end - 1).toISOString().slice(0, 10)])];
  return { start: new Date(start).toISOString(), end: new Date(end).toISOString(), utcDates };
}

/** Today's date in Toronto, "YYYY-MM-DD". */
export function torontoToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** The ISO timestamp inside a `calls:` / `leads:` key. */
export function keyTimestamp(key) {
  const m = /^(?:calls|leads):(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z):/.exec(key);
  return m ? m[1] : null;
}

/** Keys whose timestamp falls inside [start, end). ISO strings compare correctly as text. */
export function keysInRange(keys, { start, end }) {
  return keys.filter((k) => {
    const ts = keyTimestamp(k.name);
    return ts !== null && ts >= start && ts < end;
  });
}

/** Same rule as callSourceLabel() in lib/notify.ts. */
export function sourceLabel(attribution) {
  if (!attribution) return "organic";
  if (attribution.gclid || attribution.gbraid || attribution.wbraid) return "Google Ads";
  if (attribution.utm_source) return String(attribution.utm_source).slice(0, 40);
  return "organic";
}

function countBy(items, fn) {
  const out = {};
  for (const item of items) {
    const k = fn(item);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

/**
 * Builds the report from listed call keys (metadata from logCallIntent) and
 * leads ({ source, attribution } only). Pure: no I/O.
 */
export function buildReport(day, callKeys, leads) {
  const taps = callKeys.map((k) => k.metadata ?? {});
  const newIntent = taps.filter((t) => !t.post);
  const mobileNew = newIntent.filter((t) => t.dev === "touch");
  return {
    day,
    calls: {
      total: taps.length,
      newIntent: newIntent.length,
      mobileNewIntent: mobileNew.length,
      postLead: taps.length - newIntent.length,
      swapped: taps.filter((t) => t.swap).length,
      byLocation: countBy(taps, (t) => (t.lp ? `${t.lp} / ${t.loc}` : t.loc ?? "unknown")),
      byDevice: countBy(taps, (t) => (t.dev === "touch" ? "mobile" : "desktop")),
      byIntent: countBy(taps, (t) => t.intent ?? "general"),
      bySource: countBy(taps, (t) => t.src ?? "organic"),
    },
    leads: {
      total: leads.length,
      bySource: countBy(leads, (l) => l.source ?? "unknown"),
      byOrigin: countBy(leads, (l) => sourceLabel(l.attribution)),
    },
    // Mobile, not-after-a-lead taps per form lead. Null with no leads.
    tapsPerLead: leads.length ? Math.round((mobileNew.length / leads.length) * 100) / 100 : null,
  };
}

function printTable(title, counts) {
  console.log(`  ${title}`);
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!rows.length) console.log("    (none)");
  for (const [k, v] of rows) console.log(`    ${String(v).padStart(4)}  ${k}`);
}

export function printReport(r) {
  console.log(`\nTop Choice HVAC: calls and leads for ${r.day} (America/Toronto)\n`);
  console.log(`Call taps (intent, not connected calls): ${r.calls.total}`);
  console.log(`  new intent: ${r.calls.newIntent} (mobile: ${r.calls.mobileNewIntent}), after a form lead: ${r.calls.postLead}, showed forwarding number: ${r.calls.swapped}`);
  printTable("by landing page / button", r.calls.byLocation);
  printTable("by device", r.calls.byDevice);
  printTable("by intent", r.calls.byIntent);
  printTable("by source", r.calls.bySource);
  console.log(`\nForm leads: ${r.leads.total}`);
  printTable("by form", r.leads.bySource);
  printTable("by source", r.leads.byOrigin);
  console.log(`\nMobile call taps per form lead: ${r.tapsPerLead ?? "n/a (no leads)"}`);
  console.log("Connected calls from ads: Google Ads → Conversions → \"Calls from website\" (not in KV).\n");
}

function wrangler(args, remote) {
  const out = execFileSync("npx", ["wrangler", ...args, "--binding=LEADS_KV", remote ? "--remote" : "--local"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    maxBuffer: 64 * 1024 * 1024,
  });
  return out;
}

function listKeys(prefix, remote) {
  const out = wrangler(["kv", "key", "list", `--prefix=${prefix}`], remote);
  return JSON.parse(out.slice(out.indexOf("[")));
}

async function main(argv) {
  const remote = !argv.includes("--local");
  const day = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) ?? torontoToday();
  const range = torontoDayRange(day);
  const callKeys = [];
  const leadKeys = [];
  for (const date of range.utcDates) {
    callKeys.push(...listKeys(`calls:${date}`, remote));
    leadKeys.push(...listKeys(`leads:${date}`, remote));
  }
  const calls = keysInRange(callKeys, range);
  const leads = keysInRange(leadKeys, range).map((k) => {
    // Full record for its attribution; only source + attribution are kept.
    const out = wrangler(["kv", "key", "get", k.name], remote);
    const record = JSON.parse(out.slice(out.indexOf("{")));
    return { source: record.source, attribution: record.attribution };
  });
  printReport(buildReport(day, calls, leads));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
