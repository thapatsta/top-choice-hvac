import { ChevronDown } from "lucide-react";
import type { FAQ } from "@/data/faqs";

export function FAQAccordion({ items }: { items: FAQ[] }) {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {items.map((item, i) => (
        <details key={i} className="group p-5 sm:p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-navy">
            {item.question}
            <ChevronDown
              size={20}
              className="shrink-0 text-ember transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="mt-3 text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
