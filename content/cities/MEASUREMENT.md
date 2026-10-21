# Measuring the city pages

Documentation only. Nothing here changes GA4, Search Console or the site.

## What the site sends today

- **Call taps** (`click_to_call`, GA4): the hero and bottom Call buttons on every city page send the same parameters as every other page (`link_location`, `device_class`, `intent`, `post_lead`, `swapped`, `page_path`) plus one new one, `city_page` (the city name, for example `Vaughan`). `link_location` is `city_hero` or `city_cta` for the buttons on the page. The site-wide header, sticky call bar and footer buttons sit outside the page template, so they send no `city_page`; use `page_path` for those.
- **City page views**: `page_view` carries `page_path` (`/service-area/<city>`), so city traffic can be filtered without a new parameter.
- **Quote requests**: the "Get a quote" buttons are plain links to `/get-quote`. The site has no click event on them, and the form events (`form_start`, `generate_lead`) fire on `/get-quote`, not on the city page. Attribution still reaches the lead: the first landing page is stored with the visitor (`landing_path`, plus `gclid` and the `utm_*` values) and saved on the lead record, so a lead that started on `/service-area/vaughan` shows that landing path. GA4 does not get `city_page` on the lead events. Adding it would mean carrying the city to `/get-quote`; that is a separate change.
- The call-intent log in KV (and the daily email) already stores `page_path`, so a tap on a city page shows the city in the path. `city_page` is not sent there: that endpoint has a strict list of allowed fields.
- Call buttons on city pages show the real number (no Google forwarding-number swap), so the number on these pages matches the rest of the local listings.

## Search Console

1. Performance > Search results > **+ New** > Page > **Custom (regex)**.
2. Enter `/service-area/` (matches every city page and the hub). To see only the cities, use `/service-area/[a-z]+`.
3. Add the query filter `Queries containing` the city name for one city at a time, or group by Query and sort by impressions.
4. Compare the last 3 months against the previous period; pages need time to be crawled and ranked.

## GA4

**City-page leads (Explore > Free form)**

- Rows: Landing page + query string, or Page path.
- Filter: Page path contains `/service-area/`.
- Columns: Sessions, Key events (calls and leads).
- For call taps, add a second tab: Event name = `click_to_call`, Rows: custom dimension **city_page**.
- Register `city_page` first: Admin > Custom definitions > Create custom dimension > Scope: Event > Event parameter: `city_page`. Until it is registered, GA4 receives the parameter but will not report on it.
- Leads: the lead record (KV and the notification email) holds the landing path. Match leads to cities by that field.

**AI referrals as a custom channel group**

1. Admin > Data display > Channel groups > Create new channel group (copy the default).
2. Add a channel named **AI assistants** above Referral, with the condition *Source matches regex*:

   `chatgpt\.com|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|claude\.ai`

3. Save. Check it in Acquisition > Traffic acquisition with the new channel group as the dimension.
4. Expect small numbers. Many assistants send no referrer, so this undercounts.

## Monthly checklist

1. **Queries by city.** Search Console, page filter `/service-area/`: which queries bring each city page impressions? Note new ones worth answering on the page (they become FAQ or problem ideas).
2. **Impressions and clicks per city page.** Record in a sheet, one row per city per month. Look for a city with impressions but few clicks (title or description problem) or no impressions (not indexed or not ranking).
3. **Leads per city.** Call taps by `city_page`, plus leads whose landing path is a city page.
4. **AI referrals.** Sessions from the AI assistants channel group, and which landing pages they hit.
5. **Citation check, by hand.** Ask the target questions in ChatGPT, Perplexity, Gemini, Claude and Google (AI Overviews). Use plain questions such as "who can replace a furnace in Vaughan" and "why does my furnace keep shutting off in Etobicoke". Note whether Top Choice HVAC or a city page is cited, and with what wording. Do not expect it every month; record it either way.
6. **Freshness.** Check each page's "Last reviewed" date. If content changed this month, bump `lastReviewed` in the city file; if nothing changed, leave it alone.
