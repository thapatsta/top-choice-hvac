import { ClipboardCheck, MousePointerClick, MessageSquareText } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const steps = [
  { icon: MousePointerClick, label: "Answer a few quick questions" },
  { icon: MessageSquareText, label: "Get an instant price range" },
  { icon: ClipboardCheck, label: "Book a free in-home assessment" },
];

export function QuoteTeaser() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-ember">
            The only instant estimate tool in Brampton HVAC
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl">
            Know your price range before we ever step in your driveway.
          </h2>
          <p className="mt-4 text-muted">
            Answer a few questions about your system and situation, and get a
            realistic price range in minutes — no waiting on hold, no
            pressure. We’ll confirm the exact number with a free in-home
            assessment.
          </p>
          <div className="mt-6">
            <Button href="/get-quote" size="lg">
              Start My Free Estimate
            </Button>
          </div>
        </div>
        <div className="grid gap-4">
          {steps.map(({ icon: Icon, label }, i) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy font-display text-lg font-bold text-ember">
                {i + 1}
              </span>
              <Icon size={22} className="shrink-0 text-ember" aria-hidden="true" />
              <span className="font-semibold text-navy">{label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
