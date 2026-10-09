import type { Metadata } from "next";
import { ShieldCheck, Clock, DollarSign } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Get a Free Instant HVAC Estimate",
  description:
    "Answer a few quick questions and get a real price range for your furnace, AC, heat pump, or water heater project in minutes — free, no obligation.",
  path: "/get-quote",
});

const trustPoints = [
  { icon: Clock, text: "Takes about 60 seconds" },
  { icon: DollarSign, text: "No cost, no obligation" },
  { icon: ShieldCheck, text: "We never sell your information" },
];

export default function GetQuotePage() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            Get Your Free Instant Estimate
          </h1>
          <p className="mt-4 text-lg text-muted">
            Tell us a bit about your situation and get a realistic price range
            right away. We’ll confirm the exact number with a free, no-pressure
            in-home assessment.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {trustPoints.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-navy">
                <Icon size={20} className="text-ember" aria-hidden="true" />
                <span className="font-semibold">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <QuoteForm source="get-quote" />
      </Container>
    </section>
  );
}
