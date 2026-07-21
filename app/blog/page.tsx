import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/CTABand";
import { blogOutlines } from "@/data/blog";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "HVAC Tips & Guides",
  description:
    "Furnace, AC, and HVAC tips and guides for Brampton & GTA homeowners from Top Choice HVAC.",
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <>
      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">HVAC Tips & Guides</h1>
          <p className="mt-4 text-lg text-white/80">
            The posts below are starter outlines only — titles and structure,
            ready for full articles in a follow-up content phase.
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogOutlines.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 hover:shadow-md"
            >
              <span className="w-fit rounded-full bg-ember-light px-3 py-1 text-xs font-bold uppercase tracking-wide text-ember-dark">
                Outline
              </span>
              <h2 className="font-display text-lg font-bold text-navy">{post.title}</h2>
              <p className="text-sm text-muted">{post.description}</p>
            </Link>
          ))}
        </Container>
      </section>

      <CTABand />
    </>
  );
}
