import { ChevronDown } from "lucide-react";
import type { LpFaqItem } from "@/lib/landingPages";

/**
 * Landing-page FAQ. `legacy`: the card look of the site's FAQAccordion, with
 * an optional link per answer. `themed`: the repair / install pages' ruled
 * list with a + / − marker (globals.css .lpt-faq).
 */
export function LpFaq({ items, variant = "legacy" }: { items: LpFaqItem[]; variant?: "legacy" | "themed" }) {
  if (variant === "themed") {
    return (
      <div className="lpt-faq border-t border-lp-line">
        {items.map((item) => (
          <details key={item.question} className="border-b border-lp-line py-4">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 text-[19px] font-bold">
              {item.question}
            </summary>
            <p className="mt-2 max-w-[40em] text-lp-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {items.map((item) => (
        <details key={item.question} className="group p-5 sm:p-6">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-navy">
            {item.question}
            <ChevronDown
              size={20}
              className="shrink-0 text-ember transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="mt-3 text-muted">
            {item.answer}
            {item.link && (
              <>
                {" "}
                <a
                  href={item.link.href}
                  className="font-semibold text-navy underline underline-offset-4 hover:no-underline"
                >
                  {item.link.label}
                </a>
              </>
            )}
          </p>
        </details>
      ))}
    </div>
  );
}
