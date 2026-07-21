import { Phone, ClipboardList } from "lucide-react";
import { site } from "@/lib/site";

export function StickyCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-navy shadow-[0_-2px_10px_rgba(0,0,0,0.15)] lg:hidden">
      <a
        href={site.phone.href}
        className="flex flex-1 items-center justify-center gap-2 py-3 text-base font-bold text-white active:bg-navy-light"
      >
        <Phone size={18} aria-hidden="true" />
        Call Now
      </a>
      <div className="w-px bg-white/15" aria-hidden="true" />
      <a
        href="/get-quote"
        className="flex flex-1 items-center justify-center gap-2 bg-ember py-3 text-base font-bold text-white active:bg-ember-dark"
      >
        <ClipboardList size={18} aria-hidden="true" />
        Get Quote
      </a>
    </div>
  );
}
