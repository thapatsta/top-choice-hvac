// Business facts the city pages may state (decided with Patrick). One place,
// so the copy, the at-a-glance list and the tests agree.

import { CALLBACK_PROMISE, PRICE_FROM } from "@/lib/landingPages";

export { CALLBACK_PROMISE, PRICE_FROM };

export const INSTALL_PRICE_LINE = `starting from ${PRICE_FROM} (base-tier furnace)`;
export const WARRANTY_LINE = "10-year labour warranty on installs";
export const HOURS_LINE = "24/7";
export const CALLBACK_LINE = "15 minutes";

/** Real routes, confirmed in Step 0. */
export const SERVICE_ROUTES = {
  furnaceRepair: { slug: "furnace-repair", label: "Furnace repair" },
  furnaceInstall: { slug: "furnace-installation", label: "Furnace installation" },
  acInstall: { slug: "ac-installation", label: "AC installation" },
} as const;

export const TODO = "TODO_REAL_CONTENT";
