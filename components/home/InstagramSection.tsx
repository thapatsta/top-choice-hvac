import Script from "next/script";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { InstagramEmbedProcessor } from "@/components/home/InstagramEmbedProcessor";
import { site } from "@/lib/site";

export function InstagramSection({
  posts = site.instagramPosts,
}: {
  posts?: readonly string[];
}) {
  const hasPosts = posts.length > 0;

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
        {hasPosts && (
          <>
            <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
              {posts.map((permalink) => (
                <div key={permalink} className="flex min-w-0 justify-center">
                  <blockquote
                    className="instagram-media w-full"
                    data-instgrm-permalink={permalink}
                    data-instgrm-version="14"
                  >
                    <a
                      href={permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-2xl border border-border bg-cream px-6 py-10 font-semibold text-ember hover:underline"
                    >
                      View this post on Instagram →
                    </a>
                  </blockquote>
                </div>
              ))}
            </div>
            <InstagramEmbedProcessor />
          </>
        )}
      </Container>
      {hasPosts && (
        <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
      )}
    </section>
  );
}
