import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ThankYouContent, ThankYouCard } from "@/components/thankyou/ThankYouContent";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Thank You",
  description: "Thanks for getting in touch with Top Choice HVAC.",
  path: "/thank-you",
  noindex: true,
});

// Stays statically prerendered: the query string is read on the client by
// ThankYouContent (useSearchParams under Suspense), never via the page's
// searchParams prop, which would make this route dynamic. The prerendered
// HTML shows the generic state until the client knows which form sent the
// visitor here. No analytics event fires on this page; generate_lead fires
// once in submitLead() before the form navigates here.
export default function ThankYouPage() {
  return (
    <section className="py-14 sm:py-20">
      <Container className="max-w-2xl">
        <Suspense fallback={<ThankYouCard params={{}} />}>
          <ThankYouContent />
        </Suspense>
      </Container>
    </section>
  );
}
