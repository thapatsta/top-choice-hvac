import { MapPin } from "lucide-react";

export function MapPlaceholder() {
  return (
    <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-navy sm:h-full sm:min-h-[280px]">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center gap-2 px-6 text-center text-white">
        <MapPin size={32} className="text-ember" aria-hidden="true" />
        <p className="text-sm text-white/70">
          [PLACEHOLDER: embed a real Google Maps location once the business
          address is confirmed]
        </p>
      </div>
    </div>
  );
}
