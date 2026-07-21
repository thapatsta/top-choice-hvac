import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { WhyUs } from "@/components/home/WhyUs";
import { ServiceAreaStrip } from "@/components/home/ServiceAreaStrip";
import { QuoteTeaser } from "@/components/home/QuoteTeaser";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { RebatesPromoTeaser } from "@/components/home/RebatesPromoTeaser";
import { BlogTeaser } from "@/components/home/BlogTeaser";
import { CTABand } from "@/components/CTABand";
import { site, NAP_JSON_LD } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${site.name} | Furnace & AC Repair in Brampton, ON` },
  description:
    "Licensed HVAC contractor in Brampton, ON serving the GTA. Furnace repair, AC repair, installations, heat pumps & more. Upfront pricing, fast response.",
  alternates: { canonical: site.url },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    ...NAP_JSON_LD,
    url: site.url,
    priceRange: "$$",
    areaServed: site.serviceAreas.map((city) => ({
      "@type": "City",
      name: city,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <TrustBar />
      <ServicesGrid />
      <WhyUs />
      <ServiceAreaStrip />
      <QuoteTeaser />
      <ReviewsSection />
      <RebatesPromoTeaser />
      <BlogTeaser />
      <CTABand />
    </>
  );
}
