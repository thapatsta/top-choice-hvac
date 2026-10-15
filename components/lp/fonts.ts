import { Archivo, Barlow_Semi_Condensed, Source_Sans_3 } from "next/font/google";

// Landing-page fonts. Imported by the /lp/* templates only, so the rest of
// the site doesn't download them.

// The legacy template's headline weight (900), used through .lp-black.
export const archivoBlack = Archivo({
  variable: "--font-lp-black",
  subsets: ["latin"],
  weight: "900",
});

// The repair and install pages (LpTemplate): headings and body copy, as in
// the mockups. Used through font-lp-display / font-lp-body (globals.css).
export const barlowSemiCondensed = Barlow_Semi_Condensed({
  variable: "--font-lp-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const sourceSans3 = Source_Sans_3({
  variable: "--font-lp-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});
