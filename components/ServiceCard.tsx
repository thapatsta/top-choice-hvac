import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import type { Service } from "@/data/services";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ember-light text-ember">
        <ServiceIcon icon={service.icon} size={24} aria-hidden="true" />
      </span>
      <div>
        <h3 className="font-display text-lg font-bold text-navy">{service.name}</h3>
        <p className="mt-1 text-sm text-muted">{service.heroTagline}</p>
      </div>
      <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-ember">
        Learn more
        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
