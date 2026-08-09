import type { LucideIcon } from "lucide-react";
import {
  Aperture,
  Camera,
  Clapperboard,
  Drone,
  Mic2,
  MonitorPlay,
  Spotlight,
  Wrench,
} from "lucide-react";

import type { Category } from "@/types";

/**
 * The eight top-level equipment categories. Each has a matching literal
 * route at `/equipment/[slug]` (see `src/app/equipment/*`).
 */
export const categories: Category[] = [
  {
    id: "cat-cameras",
    name: "Cameras",
    slug: "cameras",
    description: "Cinema and mirrorless camera bodies for every production scale.",
  },
  {
    id: "cat-lenses",
    name: "Lenses",
    slug: "lenses",
    description: "Cine primes, zooms and specialty glass.",
  },
  {
    id: "cat-lighting",
    name: "Lighting",
    slug: "lighting",
    description: "LED, HMI and tungsten fixtures for any setup.",
  },
  {
    id: "cat-grip",
    name: "Grip",
    slug: "grip",
    description: "Support, stabilization and rigging.",
  },
  {
    id: "cat-audio",
    name: "Audio",
    slug: "audio",
    description: "Wireless, boom and field recording gear.",
  },
  {
    id: "cat-monitors",
    name: "Monitors",
    slug: "monitors",
    description: "On-camera and production monitoring.",
  },
  {
    id: "cat-drones",
    name: "Drones",
    slug: "drones",
    description: "Aerial camera platforms and accessories.",
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Power, media, filtration and cabling.",
  },
];

export const categoryIcons: Record<string, LucideIcon> = {
  cameras: Camera,
  lenses: Aperture,
  lighting: Spotlight,
  grip: Wrench,
  audio: Mic2,
  monitors: MonitorPlay,
  drones: Drone,
  accessories: Clapperboard,
};

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryIcon(slug: string): LucideIcon {
  return categoryIcons[slug] ?? Camera;
}

export const categorySlugs = categories.map((c) => c.slug);
