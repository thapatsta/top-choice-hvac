import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

/**
 * The only footer on /lp/*: business name, phone and copyright. No address
 * (tests/lp-content.test.ts checks), no links away from the page.
 */
export function LpFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      data-track-location="lp_footer"
      className="lp-dark border-t border-white/10 bg-navy pb-24 pt-6 text-sm text-(--lp-hero-sub) lg:pb-6"
    >
      <Container className="flex flex-col gap-1 text-center">
        <p className="font-semibold text-white">{site.legalName}</p>
        <p>
          <a
            href={site.phone.href}
            className="inline-flex min-h-[44px] items-center hover:text-white hover:underline"
          >
            {site.phone.display}
          </a>
        </p>
        <p className="text-xs text-white/60">
          &copy; {year} {site.legalName} All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
