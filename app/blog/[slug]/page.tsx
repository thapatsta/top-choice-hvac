import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/CTABand";
import { blogOutlines } from "@/data/blog";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return blogOutlines.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogOutlines.find((p) => p.slug === slug);
  if (!post) return {};
  const title = post.title;
  return {
    title,
    description: post.description,
    alternates: { canonical: `${site.url}/blog/${post.slug}` },
    openGraph: { title, description: post.description, type: "article" },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogOutlines.find((p) => p.slug === slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    publisher: { "@type": "Organization", name: site.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-navy py-14 text-white sm:py-20">
        <Container className="max-w-2xl text-center">
          <span className="mx-auto flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-ember-light">
            <FileText size={16} aria-hidden="true" />
            Content Outline — Full Article Pending
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-lg text-white/80">{post.description}</p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="max-w-2xl">
          <div className="rounded-xl border border-dashed border-ember bg-ember-light p-4 text-sm text-ember-dark">
            [PLACEHOLDER: this is a starter outline, not a finished article.
            Target keyword: <strong>{post.targetKeyword}</strong>. Full copy
            should come from the client or a follow-up content phase.]
          </div>

          <h2 className="mt-8 font-display text-xl font-bold text-navy">Planned Outline</h2>
          <ol className="mt-4 flex flex-col gap-3">
            {post.outline.map((section, i) => (
              <li key={section} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-ember">
                  {i + 1}
                </span>
                <span className="text-navy">{section}</span>
              </li>
            ))}
          </ol>

          <p className="mt-10 text-sm text-muted">
            <Link href="/blog" className="font-semibold text-ember hover:underline">
              ← Back to all posts
            </Link>
          </p>
        </Container>
      </section>

      <CTABand />
    </>
  );
}
