import type { Metadata } from "next";
import { Phone, AlertTriangle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "24/7 Emergency HVAC Service in Brampton & the GTA",
  description:
    "No heat? No AC? Emergency furnace and air conditioner repair in Brampton & the GTA. Call now for the fastest response.",
  path: "/emergency-service",
});

export default function EmergencyServicePage() {
  return (
    <section className="bg-navy py-10 text-white sm:py-16">
      <Container className="max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ember">
            <AlertTriangle size={28} aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-5xl">
            No heat? No AC? We respond fast.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">
            {site.hours.emergency}. Call now and talk to a real person — or
            submit an emergency request below and we’ll call you back right
            away.
          </p>
          <div className="mt-6">
            <Button href={site.phone.href} size="lg" className="text-xl">
              <Phone size={24} aria-hidden="true" />
              Call Now: {site.phone.display}
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <QuoteForm initialUrgency="emergency" source="emergency-service" />
        </div>
      </Container>
    </section>
  );
}
