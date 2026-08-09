import type { LucideIcon } from "lucide-react";
import { Camera, Clapperboard, Mic2, Spotlight } from "lucide-react";

export interface WorkProject {
  slug: string;
  title: string;
  productionType: string;
  description: string;
  equipmentUsed: string[];
  story: string;
  icon: LucideIcon;
}

/**
 * Placeholder portfolio entries for layout and tone. No real clients or
 * productions are represented — every title is explicitly a sample.
 */
export const workProjects: WorkProject[] = [
  {
    slug: "sample-project-01",
    title: "Sample Project 01",
    productionType: "Commercial",
    description:
      "A brand campaign shot over three days with a full lighting package, built around a single hero product and a fast turnaround.",
    equipmentUsed: ["Sony FX6", "Sony FE 24–70mm f/2.8 GM II", "Aputure LS 600d Pro ×2"],
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
    equipmentUsed: ["Sony FX3", "Sigma Cine Prime Set", "Sennheiser EW-DX Wireless Lavalier Kit"],
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
    equipmentUsed: ["RED V-RAPTOR 8K VV", "Sigma Cine Prime Set", "Aputure LS 600x Pro ×3"],
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
    equipmentUsed: ["ARRI Alexa Mini LF", "Sigma Cine Prime Set", "Sachtler Flowtech 75 Tripod System"],
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
    equipmentUsed: ["Sony FX6 ×2", "SmallHD 702 Touch", "8-Channel Field Audio Recorder"],
    story:
      "Live coverage left no room for a second take, so redundancy mattered: two matched camera bodies, on-camera monitoring for framing checks in real time, and multitrack audio capture running independently of either camera.",
    icon: Mic2,
  },
];
