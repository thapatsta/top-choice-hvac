import { Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button, buttonClasses } from "@/components/ui/Button";
import { PhoneLink, PhoneText } from "@/components/Phone";

export function CTABand({
  heading = "Ready to get this fixed?",
  subheading = "Get a free, no-pressure quote in minutes — or call now and talk to a real person.",
}: {
  heading?: string;
  subheading?: string;
}) {
  return (
    <section data-track-location="cta_band" className="bg-navy py-12 text-white sm:py-16">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">{heading}</h2>
        <p className="max-w-xl text-lg text-white/80">{subheading}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/get-quote" size="lg">
            Get a Free Quote
          </Button>
          <PhoneLink className={buttonClasses("outline-light", "lg")}>
            <Phone size={20} aria-hidden="true" />
            <PhoneText />
          </PhoneLink>
        </div>
      </Container>
    </section>
  );
}
