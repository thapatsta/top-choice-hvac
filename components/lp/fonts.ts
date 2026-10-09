import { Archivo } from "next/font/google";

// The headline weight (900) is loaded by the landing pages only, so the rest
// of the site doesn't download it. Used through the .lp-black class in
// globals.css.
export const archivoBlack = Archivo({
  variable: "--font-lp-black",
  subsets: ["latin"],
  weight: "900",
});
