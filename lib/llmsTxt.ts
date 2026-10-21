// Builds /llms.txt (app/llms.txt/route.ts). Generated from lib/site.ts, the
// real service routes and the ready city pages, so it can't drift from the
// site and never lists an unready city. Format: https://llmstxt.org

import { SERVICE_ROUTES, HOURS_LINE, INSTALL_PRICE_LINE } from "@/content/cities/facts";
import { cityPath, publishedCities } from "@/content/cities";
import type { CityContent } from "@/content/cities/types";
import { site } from "@/lib/site";

const abs = (path: string) => `${site.url}${path}`;
const link = (title: string, path: string, note: string) => `- [${title}](${abs(path)}): ${note}`;

export function buildLlmsTxt(cities: CityContent[] = publishedCities()): string {
  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.name} is a residential heating and cooling contractor based in Brampton, Ontario. It repairs furnaces and installs furnaces and air conditioners for homeowners in Brampton and nearby cities, and is open ${HOURS_LINE}.`,
    "",
    `Furnace installation is ${INSTALL_PRICE_LINE}, and installs carry a 10-year labour warranty. We call you back, usually within 15 minutes.`,
    "",
    "## Services",
    "",
    link("Furnace repair", `/services/${SERVICE_ROUTES.furnaceRepair.slug}`, "Diagnosis and repair of furnaces that won't heat, cycle on and off or shut down."),
    link("Furnace installation", `/services/${SERVICE_ROUTES.furnaceInstall.slug}`, "Furnace replacement and new installs, with the price confirmed in writing before work starts."),
    link("AC installation", `/services/${SERVICE_ROUTES.acInstall.slug}`, "Air conditioner replacement and new installs, sized to the house and its ductwork."),
    "",
    "## Service areas",
    "",
    link("Service area", "/service-area", "Where we work and links to each city page."),
    ...cities.map((c) => link(`Furnace and AC service in ${c.name}`, cityPath(c), c.hubLine)),
    "",
    "## About and contact",
    "",
    link("About", "/about", "Who we are and how the business started."),
    link("Get a quote", "/get-quote", "Request a quote online."),
    link("Contact", "/contact", "Ways to reach us."),
    "",
    `Phone: ${site.phone.display}. Hours: ${HOURS_LINE}.`,
    "",
    "## Optional",
    "",
    link("Reviews", "/reviews", "Customer reviews from Google."),
    link("FAQ", "/faq", "Common questions about heating and cooling service."),
    link("Gallery", "/gallery", "Photos of our work."),
    link("Blog", "/blog", "Articles on furnaces, AC and home comfort."),
    "",
  ];
  return lines.join("\n");
}
