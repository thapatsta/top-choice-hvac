import Link from "next/link";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import type { Service } from "@/data/services";

export function ServiceTile({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="flex min-h-[44px] items-center gap-3 rounded-xl border border-border bg-card p-3"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ember-light text-ember">
        <ServiceIcon icon={service.icon} size={18} aria-hidden="true" />
      </span>
      <span className="font-display text-sm font-bold text-navy">{service.name}</span>
    </Link>
  );
}
