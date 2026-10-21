// Metadata, JSON-LD, link text and text extraction for the city pages under
// /service-area/<city>. The content is in content/cities/*; the template is
// components/city/CityPage.tsx.

import type { Metadata } from "next";
import { SERVICE_ROUTES, HOURS_LINE } from "@/content/cities/facts";
import { cityPath, formatLastReviewed, lastReviewedDate } from "@/content/cities";
import type { CityContent } from "@/content/cities/types";
import { NAP_JSON_LD, site } from "@/lib/site";

export const SERVICE_AREA_PATH = "/service-area";

const absolute = (path: string) => `${site.url}${path}`;

export function cityH1(city: Pick<CityContent, "name">): string {
  return `Furnace Repair & Installation in ${city.name}`;
}

export function cityMetadata(city: CityContent): Metadata {
  const url = absolute(cityPath(city));
  return {
    title: { absolute: city.seoTitle },
    description: city.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: city.seoTitle,
      description: city.metaDescription,
      url,
      siteName: site.name,
      type: "website",
    },
    twitter: { card: "summary_large_image", title: city.seoTitle, description: city.metaDescription },
    // A page that isn't ready is a 404 in production; this only matters in
    // development previews and is a second lock if the 404 is ever removed.
    ...(city.ready ? {} : { robots: { index: false, follow: false } }),
  };
}

/** Link text for a city, varied by position so a list never repeats one anchor. */
export function cityAnchor(city: Pick<CityContent, "name">, position: number): string {
  const options = [
    `Furnace installation in ${city.name}`,
    `Furnace repair in ${city.name}`,
    `AC installation in ${city.name}`,
    `Heating and cooling in ${city.name}`,
  ];
  return options[position % options.length];
}

export const SERVICE_PAGE_PATHS = {
  furnaceRepair: `/services/${SERVICE_ROUTES.furnaceRepair.slug}`,
  furnaceInstall: `/services/${SERVICE_ROUTES.furnaceInstall.slug}`,
  acInstall: `/services/${SERVICE_ROUTES.acInstall.slug}`,
} as const;

export type Breadcrumb = { name: string; path: string };

export function cityBreadcrumbs(city: CityContent): Breadcrumb[] {
  return [
    { name: "Home", path: "/" },
    { name: "Service Area", path: SERVICE_AREA_PATH },
    { name: city.name, path: cityPath(city) },
  ];
}

const SERVICE_NODES = [
  { key: "furnaceRepair", name: "Furnace repair", path: SERVICE_PAGE_PATHS.furnaceRepair },
  { key: "furnaceInstall", name: "Furnace installation", path: SERVICE_PAGE_PATHS.furnaceInstall },
  { key: "acInstall", name: "AC installation", path: SERVICE_PAGE_PATHS.acInstall },
] as const;

/**
 * One connected JSON-LD graph per city page: HVACBusiness, WebPage,
 * BreadcrumbList, three Service nodes and FAQPage. Reuses the telephone,
 * hours and sameAs from NAP_JSON_LD (lib/site.ts) but deliberately leaves out
 * its street address and aggregateRating: city pages carry neither.
 */
export function cityJsonLd(city: CityContent) {
  const pageUrl = absolute(cityPath(city));
  const businessId = `${site.url}/#business`;
  const cityNode = {
    "@type": "City",
    name: city.name,
    containedInPlace: { "@type": "AdministrativeArea", name: city.region },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HVACBusiness",
        "@id": businessId,
        name: site.name,
        url: site.url,
        telephone: NAP_JSON_LD.telephone,
        openingHoursSpecification: NAP_JSON_LD.openingHoursSpecification,
        areaServed: cityNode,
        sameAs: NAP_JSON_LD.sameAs,
        description: `Residential heating and cooling contractor based in Brampton, Ontario. Open ${HOURS_LINE}.`,
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: city.seoTitle,
        description: city.metaDescription,
        dateModified: lastReviewedDate(city).toISOString().slice(0, 10),
        inLanguage: "en-CA",
        about: { "@id": businessId },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: cityBreadcrumbs(city).map((crumb, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: crumb.name,
          item: absolute(crumb.path),
        })),
      },
      ...SERVICE_NODES.map((service) => ({
        "@type": "Service",
        "@id": `${pageUrl}#${service.key}`,
        serviceType: service.name,
        name: `${service.name} in ${city.name}`,
        description: city.serviceBlurbs[service.key],
        url: absolute(service.path),
        provider: { "@id": businessId },
        areaServed: cityNode,
      })),
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: city.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

/** Escapes "<" so a "</script>" in content can't end the JSON-LD tag early. */
export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export { formatLastReviewed };
