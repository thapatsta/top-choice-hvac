import type { Metadata } from "next";
import { Camera } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/CTABand";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Job Gallery",
  description:
    "Before-and-after photos of furnace, AC, and HVAC installations by Top Choice HVAC in Brampton & the GTA.",
  path: "/gallery",
});

// [PLACEHOLDER: replace every entry below with real before/after job photos]
const galleryPlaceholders = [
  "Furnace install — before/after",
  "AC replacement — before/after",
  "Ductless mini-split install",
  "Water heater replacement",
  "Company van / technician",
  "Team on a job site",
];

export default function GalleryPage() {
  return (
    <>
      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Our Work</h1>
          <p className="mt-4 text-lg text-white/80">
            Real job photos are pending from the client — this page is fully
            wired up and ready to drop real images into as soon as they’re
            available.
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryPlaceholders.map((label) => (
              <div
                key={label}
                className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card text-center"
              >
                <Camera size={32} className="text-muted" aria-hidden="true" />
                <p className="px-6 text-sm text-muted">[PLACEHOLDER: {label}]</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CTABand />
    </>
  );
}
