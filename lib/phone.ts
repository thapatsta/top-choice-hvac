// Our phone number, in its one display format. Client-safe and NAP-free, so
// client components (the phone links, the click listener) can import it
// without bundling lib/site.ts and its street address.
//
// `display` is the only format the number may appear in on a page:
// Google's call tracking needs the number configured in the tag to match the
// page exactly, and tests/phoneFormat.test.ts plus tests-built/ fail if any
// other format shows up. lib/site.ts re-exports this as site.phone.

export const PHONE = {
  display: "(647) 763-2970",
  href: "tel:+16477632970",
} as const;

/** National digits: "+1 (416) 555-0123" and "tel:+14165550123" both give "4165550123". */
export function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}
