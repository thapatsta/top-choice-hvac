import { ShieldCheck, Award, Clock, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

// TODO: "10+ Years in Business" and "Certified Dealer Network" are fake
// placeholder claims — confirm real numbers/certifications before launch.
// The review-count slot is intentionally NOT a fabricated star rating —
// swap it for a real rating + review count once reviews are collected
// (never fabricate a rating/count in the meantime).
const items = [
  {
    icon: Clock,
    label: "10+ Years in Business",
  },
  {
    icon: ShieldCheck,
    label: "Licensed & Insured",
  },
  {
    icon: Star,
    label: "Free In-Home Estimates",
  },
  {
    icon: Award,
    label: "Certified Dealer Network",
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
