import {
  Flame,
  Snowflake,
  Wind,
  LayoutPanelLeft,
  Droplets,
  Sparkles,
  CalendarCheck,
  Building2,
  type LucideProps,
} from "lucide-react";
import type { Service } from "@/data/services";

const iconMap: Record<Service["icon"], typeof Flame> = {
  flame: Flame,
  snowflake: Snowflake,
  wind: Wind,
  "layout-panel-left": LayoutPanelLeft,
  droplets: Droplets,
  sparkles: Sparkles,
  "calendar-check": CalendarCheck,
  "building-2": Building2,
};

export function ServiceIcon({
  icon,
  ...props
}: { icon: Service["icon"] } & LucideProps) {
  const Icon = iconMap[icon];
  return <Icon {...props} />;
}
