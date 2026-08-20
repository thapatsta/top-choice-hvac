// Single source of truth for the path this app is mounted under.
// The site now lives at the root of its own domain, topchoicehvac.ca.
// next.config.ts's `basePath` option auto-prefixes next/link, next/image,
// and internal routing, but NOT plain fetch() calls to relative API
// routes — those must be prefixed manually using this constant.
export const BASE_PATH = "";
