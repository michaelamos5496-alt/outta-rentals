export const siteConfig = {
  name: "OUTTA RENTALS",
  shortName: "OUTTA",
  tagline: "Production equipment, ready when you are.",
  description:
    "OUTTA RENTALS is a premium film, photography and production-equipment rental company.",
} as const;

export interface NavItem {
  label: string;
  href: string;
}

export const primaryNav: NavItem[] = [
  { label: "Equipment", href: "/equipment" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export interface FooterLinkGroup {
  title: string;
  links: NavItem[];
}

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "Equipment",
    links: [
      { label: "Cameras", href: "/equipment/cameras" },
      { label: "Lenses", href: "/equipment/lenses" },
      { label: "Lighting", href: "/equipment/lighting" },
      { label: "Grip", href: "/equipment/grip" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Kit Building", href: "/services/kit-building" },
      { label: "On-Set Support", href: "/services/on-set-support" },
      { label: "Delivery", href: "/services/delivery" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Work", href: "/work" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Instagram", href: "#" },
      { label: "WhatsApp", href: "#" },
      { label: "Email", href: "#" },
      { label: "Location", href: "#" },
    ],
  },
];

export const legalLinks: NavItem[] = [
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Rental Terms", href: "/legal/rental-terms" },
];
