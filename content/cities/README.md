# City pages

One shared template, one data file per city.

| What | Where |
| --- | --- |
| Template | `components/city/CityPage.tsx` |
| Route | `app/(site)/service-area/[city]/page.tsx` |
| Schema, metadata, link text | `lib/cityPages.ts` |
| City data | `content/cities/<city>.ts` |
| Data shapes | `content/cities/types.ts` |
| Shared problem pool | `content/cities/shared-issues.ts` |
| Shared FAQs | `content/cities/shared-faqs.ts` |
| Imported jobs and reviews | `content/cities/imports/<city>.json` |
| Publish guard | `content/cities/guard.ts`, run by `tests/cityContent.test.ts` |
| `/llms.txt` | `lib/llmsTxt.ts`, `app/llms.txt/route.ts` |
| Questions for Robin | `INTAKE.md` |
| Measurement notes | `MEASUREMENT.md` |

The template holds no city content. If a sentence is about one city, it belongs in that city's data file.

## The rules

- Never invent jobs, reviews, names, statistics, prices, awards or neighbourhoods. If it isn't real and supplied, leave `TODO_REAL_CONTENT` with a comment saying what is needed and from whom.
- No street address, licence number, rebate claim, duct cleaning, date-bound promotion or filler phrase ("look no further", "state-of-the-art").
- Furnace installs are "starting from $2,199" for a base-tier furnace, never a flat price. No AC or repair prices unless supplied. Warranty: 10-year labour on installs, plus the satisfaction guarantee. Nothing else.
- Reviews: first name only, only reviews tagged to that city, no rating markup.

## Previewing a city that isn't ready

A city with `ready: false` is a 404 in production and is left out of the sitemap, the hub, the home page strip, the footer, the service pages, the "other areas" links and `/llms.txt`. In development it renders so you can read it:

```bash
npm run dev
# http://localhost:3000/service-area/brampton
# http://localhost:3000/service-area/mississauga
# http://localhost:3000/service-area/vaughan
# http://localhost:3000/service-area/etobicoke
```

## Adding a job

A job is real and supplied by Robin or Patrick. Either add it to the sheet and import it (below), or add it to the city file's `jobs` array:

```ts
{
  neighbourhood: "Streetsville",        // neighbourhood or street, never a house number
  service: "furnace-install",           // furnace-repair | furnace-install | ac-install
  problem: "Original furnace stopped heating in January.",
  work: "Replaced it with a high-efficiency furnace and added a condensate drain.",
  year: 2025,
  photos: [],                            // see "Adding photos"
  verified: true,                        // true only when Robin or Patrick supplied it
}
```

`verified: false` is allowed for drafts but blocks `ready: true`.

## Adding a review

Reviews must come from the Google reviews list and be tagged to the city by Robin. Copy the text as written; fix only obvious encoding errors.

```ts
{ firstName: "Nav", stars: 5, text: "…", date: "2025-11", citySource: "robin-tagged" }
```

`citySource` is `robin-tagged` (Robin said which city) or `address-confirmed` (the job address was checked). First name only, never a surname or initial.

## Adding or changing an issue

Issues have a `source`:

- `robin` / `patrick`: supplied by them. These can set `appliesTo`, and it shows as "Who this affects".
- `consultant`: a hedged, city-level claim approved by Patrick. No digits, percentages or the words *all, every, most, always, never*. Never says we worked in a named neighbourhood. Robin confirms or strikes it through `INTAKE.md`; when he answers, replace it with a `robin` issue.
- `general`: from the shared pool. No city, neighbourhood, housing era or home type, and no `appliesTo`.

To change the shared pool, edit `shared-issues.ts` once and every page that uses the issue changes. Each city picks 4-6 issues (Brampton 5-6) with `pickShared("id", …)` in its own order. Keep `INTAKE.md` in sync when a consultant claim changes; the test fails if it drifts.

## Marking things verified

Only Robin or Patrick can verify a job. Set `verified: true` when they have supplied it. Do not set it for anything you wrote or inferred.

## Importing from a sheet

Drop in a sheet instead of editing TypeScript. CSV works as is; `.xlsx` needs `npm i --no-save xlsx`, or save it as CSV.

```bash
node scripts/import-city-content.ts --jobs jobs.csv --reviews reviews.csv
node scripts/import-city-content.ts --jobs jobs.csv --dry-run     # check without writing
```

The script checks every row, prints each problem with its line number, and writes nothing if any row fails. It writes `content/cities/imports/<city>.json`, which the city files read. A sheet replaces that kind of content for each city in it; cities not in the sheet are left alone. Imported rows replace the `TODO_REAL_CONTENT` placeholders; they are not merged with them. (Node prints a harmless `MODULE_TYPELESS_PACKAGE_JSON` warning.)

**Jobs sheet** (header row required, column order doesn't matter):

| Column | Value |
| --- | --- |
| `city` | `brampton`, `mississauga`, `vaughan` or `etobicoke` |
| `neighbourhood` | Neighbourhood or street name. A house number is rejected. |
| `service` | `furnace repair`, `furnace install` or `ac install` |
| `problem` | What the homeowner's problem was |
| `work` | What we did |
| `year` | Four digits, 2015 or later |
| `verified` | `yes`. Rows that aren't `yes` are rejected. |

**Reviews sheet:**

| Column | Value |
| --- | --- |
| `city` | As above |
| `first_name` | First name only. A surname, initial or space is rejected. |
| `stars` | 1 to 5 |
| `text` | The review as written |
| `date` | `YYYY-MM`, or empty |
| `city_source` | `robin-tagged` or `address-confirmed` |

## Adding photos

Photo slots are built on every job card and render nothing while `photos` is empty.

1. Copy only the photos Patrick assigns to each job. Resize to 1600px wide at most, save as WebP, and strip EXIF and GPS data.
2. Use a descriptive file name, for example `public/images/cities/mississauga/streetsville-furnace-install.webp`.
3. Add up to three entries to the job's `photos` in the city file:

   ```ts
   photos: [{ src: "/images/cities/mississauga/streetsville-furnace-install.webp", alt: "New furnace installation in Streetsville, Mississauga" }],
   ```

No template change is needed. Never publish a customer's face, house number, licence plate or street sign; if a photo shows one, flag it and don't use it. Alt text is factual and describes what the photo shows.

## Making a city ready

1. Fill every slot with real content (no `TODO_REAL_CONTENT`), get the jobs verified, and add the reviews.
2. Set `ready: true` in the city file.
3. Run `npm test`. `tests/cityContent.test.ts` runs the guard on every ready city and the duplicate-content test across ready cities. Fix everything it reports. A failing test blocks the deploy.
4. Run `npm run build` and `npm run test:built`.

The guard fails a ready city if it has a placeholder, too few verified jobs (Brampton 4, others 2), too few reviews (Brampton 3, others 2) or issues (Brampton 5, others 4), an area claim in a `general` issue, a digit or absolute in a `consultant` issue, an answer block outside 40-60 words, fewer than 5 FAQs or fewer than 3 city-specific ones, no `lastReviewed`, or banned content (street address, duct cleaning, rebate, TSSA, `aggregateRating`, filler).

The duplicate-content test cuts each city's local copy (jobs, intro, answer block, issues intro, local FAQs, non-general issues) into 5-word shingles and fails any pair of ready cities that shares more than 30% of the smaller set. If it fails, the cities are too alike: write something that is true of one city and not the other, don't reword.

## Adding a new city

Only when asked. Copy an existing city file, rename it, fill every slot, add `imports/<slug>.json` (`{ "jobs": [], "reviews": [] }`), register it in `index.ts`, add its name to the city list in `scripts/import-city-content.ts`, and add its section to `INTAKE.md`. Leave `ready: false` until the guard passes. Don't create placeholder pages for cities you aren't building.

## Quarterly refresh

1. Add one or two new jobs (real, verified) and any new Google reviews tagged to the city.
2. Read the issues. Retire any that no longer fit, and replace consultant claims with Robin's answers.
3. Check pricing and warranty wording against what's current.
4. Bump `lastReviewed` (`YYYY-MM`) **only if the content changed.** It drives "Last reviewed", the schema `dateModified` and the sitemap `lastmod`.
5. Run the tests and build.
