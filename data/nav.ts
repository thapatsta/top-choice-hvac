export type NavLink = { label: string; href: string };
export type NavItem = NavLink | { label: string; items: NavLink[] };

export const mainNav: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Reviews", href: "/reviews" },
  {
    label: "Offers",
    items: [
      { label: "Rebates", href: "/rebates" },
      { label: "Financing", href: "/financing" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
