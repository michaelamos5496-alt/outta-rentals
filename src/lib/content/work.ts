import type { LucideIcon } from "lucide-react";
import { Camera, Clapperboard, Mic2, Spotlight } from "lucide-react";

export interface WorkEquipmentUsed {
  productSlug: string;
  quantity: number;
}

export interface WorkProject {
  slug: string;
  title: string;
  productionType: string;
  description: string;
  equipmentUsed: WorkEquipmentUsed[];
  story: string;
  icon: LucideIcon;
}

/**
 * Placeholder portfolio entries for layout and tone. No real clients or
 * productions are represented — every title is explicitly a sample.
 * `equipmentUsed` links to real catalogue slugs so the gear list on /work
 * can be viewed and added to a kit, not just displayed as text.
 */
export const workProjects: WorkProject[] = [
  {
    slug: "sample-project-01",
    title: "Sample Project 01",
    productionType: "Commercial",
    description:
      "A brand campaign shot over three days with a full lighting package, built around a single hero product and a fast turnaround.",
    equipmentUsed: [
      { productSlug: "blackmagic-6k-pro", quantity: 1 },
      { productSlug: "canon-24-105mm", quantity: 1 },
      { productSlug: "aputure-600d", quantity: 2 },
    ],
    story:
      "The brief called for a clean, high-key look across multiple set changes in a single studio day. A two-camera setup with matched LED fixtures kept lighting continuity consistent between angles without slowing down the schedule.",
    icon: Clapperboard,
  },
  {
    slug: "sample-project-02",
    title: "Sample Project 02",
    productionType: "Documentary",
    description:
      "A long-form documentary supported with a lightweight, run-and-gun travel kit across multiple locations.",
    equipmentUsed: [
      { productSlug: "sony-fx3", quantity: 1 },
      { productSlug: "sigma-18-35mm", quantity: 1 },
    ],
    story:
      "With a small crew covering several locations over consecutive shoot days, the kit prioritized weight and battery life over size — a compact body, a matched prime set, and wireless audio that could be handed off between subjects quickly.",
    icon: Camera,
  },
  {
    slug: "sample-project-03",
    title: "Sample Project 03",
    productionType: "Music Video",
    description:
      "A single-location shoot built around specialty lenses, haze, and a bold, saturated lighting design.",
    equipmentUsed: [
      { productSlug: "red-helium", quantity: 1 },
      { productSlug: "dzofilm-vespid-prime-set-16-125mm", quantity: 1 },
      { productSlug: "aputure-600x", quantity: 3 },
    ],
    story:
      "The concept leaned on strong practicals and colored gels rather than location changes, so the equipment list stayed camera- and lighting-heavy — high resolution to hold up to aggressive crops in the edit, and enough fixtures to layer color across the frame.",
    icon: Spotlight,
  },
  {
    slug: "sample-project-04",
    title: "Sample Project 04",
    productionType: "Feature Film",
    description:
      "A full crew production supplied with camera, grip and lighting across a multi-week shoot.",
    equipmentUsed: [
      { productSlug: "arri-alexa-mini", quantity: 1 },
      { productSlug: "dzofilm-vespid-prime-set-16-125mm", quantity: 1 },
      { productSlug: "heavy-duty-tripod", quantity: 1 },
    ],
    story:
      "A longer shoot meant equipment needed to hold up over weeks, not days — a large-format body and matched primes for a consistent look across the cut, with support gear built for repeated rigging and de-rigging on a moving unit.",
    icon: Clapperboard,
  },
  {
    slug: "sample-project-05",
    title: "Sample Project 05",
    productionType: "Live Production",
    description:
      "A multi-camera live event setup with dedicated audio capture and on-camera monitoring throughout.",
    equipmentUsed: [
      { productSlug: "blackmagic-6k-pro", quantity: 2 },
      { productSlug: "smallhd-dir-monitor", quantity: 1 },
    ],
    story:
      "Live coverage left no room for a second take, so redundancy mattered: two matched camera bodies, on-camera monitoring for framing checks in real time, and multitrack audio capture running independently of either camera.",
    icon: Mic2,
  },
];
