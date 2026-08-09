import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  Headset,
  LifeBuoy,
  Package,
  SlidersHorizontal,
  Truck,
  Users,
} from "lucide-react";

export interface ServiceDetail {
  slug: string;
  name: string;
  headline: string;
  description: string;
  icon: LucideIcon;
  cta: { label: string; href: string };
}

export const serviceDetails: ServiceDetail[] = [
  {
    slug: "equipment-rental",
    name: "Equipment Rental",
    headline: "The full catalogue, ready when you are.",
    description:
      "Cameras, lenses, lighting, grip, audio and more — inspected and tested before every rental. Browse by category or build a kit from scratch, with real-time availability and transparent day and week rates.",
    icon: Package,
    cta: { label: "Browse Equipment", href: "/equipment" },
  },
  {
    slug: "production-support",
    name: "Production Support",
    headline: "Guidance before you commit to a kit.",
    description:
      "Not sure what you need for a given setup? OUTTA's team can talk through a shot list or brief and suggest equipment that actually fits the shoot — before you spend on gear you won't use.",
    icon: LifeBuoy,
    cta: { label: "Talk to OUTTA", href: "/contact" },
  },
  {
    slug: "delivery-collection",
    name: "Delivery & Collection",
    headline: "Gear delivered to set, collected when you wrap.",
    description:
      "Skip the depot run. OUTTA can deliver equipment directly to your shoot location and collect it when you're done, so the crew's time goes toward the work, not logistics.",
    icon: Truck,
    cta: { label: "Ask About Delivery", href: "/contact" },
  },
  {
    slug: "prep-testing",
    name: "Prep & Testing",
    headline: "Every kit checked before it leaves the depot.",
    description:
      "Bodies, lenses and fixtures are tested and configured ahead of pickup — batteries charged, firmware current, accessories matched — so what arrives on set is ready to shoot, not troubleshoot.",
    icon: ClipboardCheck,
    cta: { label: "See What's Included", href: "/equipment" },
  },
  {
    slug: "technical-support",
    name: "Technical Support",
    headline: "A line to someone who knows the gear.",
    description:
      "If something isn't behaving mid-shoot, OUTTA's technical team is reachable while you're rolling — not just during business hours at a call center.",
    icon: Headset,
    cta: { label: "Contact Support", href: "/contact" },
  },
  {
    slug: "crew-support",
    name: "Crew Support",
    headline: "Technicians and operators, when a kit needs one.",
    description:
      "Some equipment is easier to run with someone who knows it well. OUTTA can connect productions with technicians and operators for gear that benefits from a dedicated hand.",
    icon: Users,
    cta: { label: "Request Crew", href: "/contact" },
  },
  {
    slug: "custom-packages",
    name: "Custom Packages",
    headline: "Kits assembled around your shot list.",
    description:
      "Send over a brief or a shot list and OUTTA will put together a package built for it — camera, lighting and grip considered together, not rented one line item at a time.",
    icon: SlidersHorizontal,
    cta: { label: "Build Your Kit", href: "/equipment" },
  },
];
