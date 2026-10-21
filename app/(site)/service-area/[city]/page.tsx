import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityPage } from "@/components/city/CityPage";
import { ALL_CITIES, getCity, isServable } from "@/content/cities";
import { cityMetadata } from "@/lib/cityPages";

// City pages are static. A city that is not `ready` is built and served in
// development only, for preview (`npm run dev`, then /service-area/<city>).
// In production its slug is not generated and the page 404s, so nothing
// unready is reachable, indexable or linked. See content/cities/index.ts.
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_CITIES.filter((c) => isServable(c)).map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city || !isServable(city)) return {};
  return cityMetadata(city);
}

export default async function ServiceAreaCityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city || !isServable(city)) notFound();
  return <CityPage city={city} />;
}
