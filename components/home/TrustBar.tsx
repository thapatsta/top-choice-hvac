import { ShieldCheck, Award, Clock, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

const items = [
  {
    icon: Clock,
    label: "[PLACEHOLDER: years] Years in Business",
  },
  {
    icon: ShieldCheck,
    label: "Licensed & Insured",
  },
  {
    icon: Star,
    label: "[PLACEHOLDER: rating / review count once collected]",
  },
  {
    icon: Award,
    label: "[PLACEHOLDER: manufacturer dealer certification]",
  },
];

export function TrustBar() {
  return (
    <section className="border-b border-border bg-card py-6">
      <Container className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon size={26} className="text-ember" aria-hidden="true" />
            <span className="text-sm font-semibold text-navy">{label}</span>
          </div>
        ))}
      </Container>
      <Container className="mt-3">
        <p className="text-center text-xs text-muted">
          {site.insurance} — License {site.license}
        </p>
      </Container>
    </section>
  );
}
