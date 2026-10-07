// Advertised offers. Each price lives here once; service pages, promotions
// and the instant estimate tool all read it from here so the site can't
// contradict the ads.
//
// Furnace offer terms confirmed by the client: furnaceInstallPrice is the
// starting price for a base-tier furnace, installed; higher-tier
// (higher-efficiency or larger) furnaces cost more; the exact price is
// confirmed after the free in-home assessment. Don't add terms here that the client hasn't confirmed
// (inclusions, brands, efficiency ratings, tier prices, end dates).

import { formatCAD } from "@/lib/format";

export interface ServiceOffer {
  /** Starting price in Canadian dollars. */
  priceFrom: number;
  /** Large-type price line, e.g. "Furnace installation from $X,XXX". */
  headline: string;
  /** One sentence: what the starting price covers. */
  summary: string;
  /** One sentence: what costs more and how the exact price is set. */
  note: string;
}

const furnaceInstallPrice = 2199;

export const furnaceInstallOffer: ServiceOffer = {
  priceFrom: furnaceInstallPrice,
  headline: `Furnace installation from ${formatCAD(furnaceInstallPrice)}`,
  summary: `Our starting price of ${formatCAD(furnaceInstallPrice)} is for a base-tier furnace, installed.`,
  note: "Higher-tier furnaces (higher-efficiency or larger) cost more, and we confirm your exact price after a free in-home assessment.",
};
