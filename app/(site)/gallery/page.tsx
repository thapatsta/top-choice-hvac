import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CTABand } from "@/components/CTABand";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

// Hidden until real job photos exist: noindex, not linked from the footer,
// and left out of app/sitemap.ts. To re-enable, add photos below, drop the
// robots override, and restore the footer link and sitemap entry.
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Job Gallery",
    description:
      "Before-and-after photos of furnace, AC, and HVAC installations by Top Choice HVAC in Brampton & the GTA.",
    path: "/gallery",
  }),
  robots: { index: false, follow: false },
};

// TODO: fill with real before/after job photos (see CONTENT-NEEDED.md).
const galleryPhotos: { src: string; alt: string }[] = [];

export default function GalleryPage() {
  return (
    <>
      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Recent Work</h1>
          <p className="mt-4 text-lg text-white/80">
            Furnace, AC, and HVAC installs from homes across Brampton and the
            GTA. Follow along on Instagram for our latest jobs.
          </p>
          <div className="mt-6">
            <Button href={site.social.instagram} variant="primary">
              Follow us on Instagram
            </Button>
          </div>
        </Container>
      </section>

      {galleryPhotos.length > 0 && (
        <section className="py-14 sm:py-20">
          <Container>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {galleryPhotos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      <CTABand />
    </>
  );
}
