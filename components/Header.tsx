"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Menu, X, Flame } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { mainNav } from "@/data/nav";
import { site } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-3 sm:h-20">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-xl font-bold tracking-tight text-navy sm:text-2xl"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy text-ember">
            <Flame size={20} aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap">
            Top Choice <span className="text-ember">HVAC</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 xl:flex" aria-label="Main">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-sm font-semibold text-navy hover:text-ember"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <a
            href={site.phone.href}
            className="hidden items-center gap-2 font-display text-base font-bold text-navy hover:text-ember sm:flex"
          >
            <Phone size={18} aria-hidden="true" />
            Call Now
          </a>
          <Button
            href="/get-quote"
            size="md"
            className="max-sm:hidden whitespace-nowrap"
          >
            Get a Free Quote
          </Button>
          <a
            href={site.phone.href}
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-ember text-white sm:hidden"
            aria-label={`Call ${site.name} at ${site.phone.display}`}
          >
            <Phone size={20} />
          </a>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-navy xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-border bg-cream xl:hidden"
        >
          <Container className="flex flex-col gap-1 py-3">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3 text-base font-semibold text-navy hover:bg-ember-light"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/get-quote"
              className="mt-2 rounded-lg bg-ember px-3 py-3 text-center text-base font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Get a Free Quote
            </Link>
          </Container>
        </nav>
      )}
    </header>
  );
}
