import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

// Rendered under the root layout only. Next embeds this boundary in every
// page's payload, the /lp/* ad landing pages included, so it deliberately
// does NOT use the site Header/Footer (the footer carries the street
// address, which must never reach the landing pages).
export default function NotFound() {
  return (
    <main id="main-content" className="flex-1">
      <section className="py-14 sm:py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold text-navy">Page not found</h1>
          <p className="mt-4 text-muted">This page could not be found.</p>
          <p className="mt-6 flex flex-col items-center gap-3">
            <Link href="/" className="font-semibold text-ember hover:underline">
              Back to home
            </Link>
            <a href={site.phone.href} className="font-semibold text-navy hover:underline">
              Call {site.phone.display}
            </a>
          </p>
        </Container>
      </section>
    </main>
  );
}
