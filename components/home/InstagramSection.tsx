import Script from "next/script";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { InstagramEmbedProcessor } from "@/components/home/InstagramEmbedProcessor";
import { site } from "@/lib/site";

export function InstagramSection() {
  return (
    <section className="bg-card py-14 sm:py-20">
      <Container className="flex flex-col items-center gap-6 text-center">
        <div>
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            See Our Recent Installs
          </h2>
          <p className="mt-3 text-muted">
            Fresh jobsite photos from around the GTA, straight from our Instagram.
          </p>
        </div>
        <Button href={site.social.instagram} variant="secondary">
          Follow us on Instagram
        </Button>
        <div className="flex min-h-[600px] w-full max-w-[540px] items-center justify-center">
          <blockquote
            className="instagram-media w-full"
            data-instgrm-permalink="https://www.instagram.com/topchoiceairsystem/?utm_source=ig_embed&utm_campaign=loading"
            data-instgrm-version="14"
          >
            <a
              href="https://www.instagram.com/topchoiceairsystem/"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-border bg-cream px-6 py-10 font-semibold text-ember hover:underline"
            >
              See our latest work on Instagram → @topchoiceairsystem
            </a>
          </blockquote>
        </div>
        <InstagramEmbedProcessor />
      </Container>
      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
    </section>
  );
}
