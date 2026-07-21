import { Clock, DollarSign, MapPin, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";

// [PLACEHOLDER: confirm Top Choice HVAC's real differentiators with the
// client rather than relying on this generic-but-plausible starting set].
const reasons = [
  {
    icon: Clock,
    title: "Fast, real response times",
    description:
      "No-heat and no-AC calls get priority scheduling — you talk to a real person, not a queue.",
  },
  {
    icon: DollarSign,
    title: "Upfront pricing, no surprises",
    description:
      "You get a written quote before any work starts. What we quote is what you pay.",
  },
  {
    icon: MapPin,
    title: "Local Brampton team",
    description:
      "We live and work in the communities we serve — not a franchise call centre routing you to a stranger.",
  },
  {
    icon: MessageCircle,
    title: "We explain, we don't upsell",
    description:
      "Every recommendation is explained in plain language, including when repair beats replacement.",
  },
];

export function WhyUs() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            Why Homeowners Choose Top Choice HVAC
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ember-light text-ember">
                <Icon size={26} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm text-muted">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
