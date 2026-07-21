import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { blogOutlines } from "@/data/blog";

export function BlogTeaser() {
  return (
    <section className="bg-card py-16 sm:py-20">
      <Container>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            From the Blog
          </h2>
          <Link href="/blog" className="font-semibold text-ember hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {blogOutlines.slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-cream p-6 hover:shadow-md"
            >
              <h3 className="font-display text-lg font-bold text-navy">{post.title}</h3>
              <p className="text-sm text-muted">{post.description}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
