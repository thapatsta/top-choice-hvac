"use client";

import { useEffect, useState } from "react";
import { Phone, ClipboardList } from "lucide-react";
import { site } from "@/lib/site";

const SCROLL_THRESHOLD = 480;

export function StickyCallBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateVisibility = () => {
      ticking = false;
      const threshold = Math.min(SCROLL_THRESHOLD, window.innerHeight * 0.6);
      setVisible(window.scrollY > threshold);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateVisibility);
      }
    };

    updateVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-navy shadow-[0_-2px_10px_rgba(0,0,0,0.15)] transition-all duration-300 lg:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <a
        href={site.phone.href}
        tabIndex={visible ? undefined : -1}
        className="flex flex-1 items-center justify-center gap-2 py-3 text-base font-bold text-white active:bg-navy-light"
      >
        <Phone size={18} aria-hidden="true" />
        Call Now
      </a>
      <div className="w-px bg-white/15" aria-hidden="true" />
      <a
        href="/get-quote"
        tabIndex={visible ? undefined : -1}
        className="flex flex-1 items-center justify-center gap-2 bg-ember py-3 text-base font-bold text-white active:bg-ember-dark"
      >
        <ClipboardList size={18} aria-hidden="true" />
        Get Quote
      </a>
    </div>
  );
}
