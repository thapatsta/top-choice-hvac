import { Star } from "lucide-react";

export function ReviewStars({
  rating,
  count,
  size = 18,
}: {
  rating: number;
  count?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`Rated ${rating} out of 5 stars`}>
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < Math.round(rating) ? "fill-ember text-ember" : "fill-border text-border"}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-sm text-muted">
          {rating.toFixed(1)} ({count} reviews)
        </span>
      )}
    </div>
  );
}
