import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ThankYouContent } from "@/components/thankyou/ThankYouContent";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Thank You",
  description: "Thanks for getting in touch with Top Choice HVAC.",
  path: "/thank-you",
  noindex: true,
});

// Stays statically prerendered with a plain "/thank-you" URL: which form sent
// the visitor here is read from sessionStorage on the client by
// ThankYouContent. The prerendered HTML shows the generic state until the
// client has read it. No analytics event fires on this page; generate_lead fires
// once in submitLead() before the form navigates here.
export default function ThankYouPage() {
  return (
    <section className="py-14 sm:py-20">
      <Container className="max-w-2xl">
        <ThankYouContent />
      </Container>
    </section>
  );
}
