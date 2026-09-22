import { site } from "@/lib/site";
import { aggregateRating } from "@/data/reviews";

interface GoogleMapEmbedProps {
  className?: string;
}

export function GoogleMapEmbed({ className = "h-64 sm:h-full sm:min-h-[280px]" }: GoogleMapEmbedProps) {
  const address = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;
  const mapQuery = `${site.googleListingName}, ${address}`;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  const reviewsLabel = aggregateRating
    ? `Read our ${aggregateRating.reviewCount} Google reviews`
    : "Read our Google reviews";

  return (
    <div className="flex flex-col gap-3">
      <div className={`relative w-full overflow-hidden rounded-2xl border border-border ${className}`}>
        <iframe
          src={mapSrc}
          loading="lazy"
          title={`Map showing the location of ${site.googleListingName} at ${address}`}
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <a
          href={site.social.google}
          target="_blank"
          rel="noopener"
          className="font-semibold text-ember hover:underline"
        >
          View on Google Maps
        </a>
        <a
          href={site.social.google}
          target="_blank"
          rel="noopener"
          className="font-semibold text-ember hover:underline"
        >
          {reviewsLabel}
        </a>
      </div>
    </div>
  );
}
