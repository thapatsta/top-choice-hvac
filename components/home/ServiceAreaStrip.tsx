import Link from "next/link";
import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export function ServiceAreaStrip() {
  return (
    <section className="bg-navy-light py-10 text-white">
      <Container className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <MapPin size={22} className="text-ember" aria-hidden="true" />
          <p className="text-lg">
            <span className="font-display font-bold">Proudly serving: </span>
            {site.serviceAreas.join(", ")}
          </p>
        </div>
        <Link
          href="/service-area"
          className="whitespace-nowrap font-semibold text-ember hover:underline"
        >
          See full service area →
        </Link>
      </Container>
    </section>
  );
}
