// Shared Tailwind class lists for the repair / install template (LpTemplate).
// Colours are the page-scoped lp-* tokens from globals.css.

// Primary CTA. Labels stay >= 19px bold: large text for WCAG on the repair
// orange. Size classes are kept apart so the two never conflict.
const ctaBase =
  "inline-flex items-center justify-center gap-2.5 rounded-md bg-lp-cta px-6 font-bold leading-tight text-white no-underline transition-colors duration-150 hover:bg-lp-cta-dark disabled:opacity-80";

export const lpButtonClass = `${ctaBase} min-h-[54px] text-[19px]`;

export const lpXlButtonClass = `${ctaBase} min-h-[66px] text-[clamp(21px,3.4vw,27px)]`;

/** Outlined secondary button (the repair-or-replace cards). */
export const lpLineButtonClass =
  "inline-flex min-h-[54px] items-center justify-center rounded-md border-2 border-lp-ink bg-transparent px-6 text-[19px] font-bold text-lp-ink no-underline transition-colors duration-150 hover:bg-lp-ink hover:text-lp-bg";

export const lpWrapClass = "mx-auto max-w-[1080px] px-5";
export const lpSectionClass = "border-t border-lp-line py-9 min-[701px]:py-[52px]";
export const lpH2Class = "mb-3 text-[clamp(28px,4.2vw,38px)]";
export const lpLeadClass = "max-w-[34em] text-[clamp(18px,2.2vw,21px)] text-lp-muted";
