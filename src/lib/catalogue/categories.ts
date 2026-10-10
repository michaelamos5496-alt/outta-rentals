import type { LucideIcon } from "lucide-react";
import {
  Aperture,
  Camera,
  Mic2,
  MonitorPlay,
  Settings2,
  Spotlight,
  Sun,
  Wifi,
  Wrench,
} from "lucide-react";

import type { Category } from "@/types";

/**
 * The top-level equipment categories. Each has a matching literal route at
 * `/equipment/[slug]` (see `src/app/equipment/*`). Only categories that hold
 * real equipment are listed — add one back here (plus a route and an icon)
 * when OUTTA stocks drones or the like.
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
    description: "Tripods, gimbals, jibs, sliders, stands and camera support.",
  },
  {
    id: "cat-monitors",
    name: "Monitors",
    slug: "monitors",
    description: "On-camera and production monitoring.",
  },
  {
    id: "cat-camera-accessories",
    name: "Camera Accessories",
    slug: "camera-accessories",
    description: "Wireless focus, video transmitters and on-set camera support.",
  },
  {
    id: "cat-lighting-modifiers",
    name: "Lighting Modifiers",
    slug: "lighting-modifiers",
    description: "Bounce, diffusion, flags and grip for lighting.",
  },
  {
    id: "cat-audio",
    name: "Audio",
    slug: "audio",
    description: "Wireless mics, boom and field recording gear.",
  },
  {
    id: "cat-wireless-systems",
    name: "Wireless Systems",
    slug: "wireless-systems",
    description: "Wireless video transmitters, receivers and monitoring links.",
  },
];

export const categoryIcons: Record<string, LucideIcon> = {
  cameras: Camera,
  lenses: Aperture,
  lighting: Spotlight,
  grip: Wrench,
  monitors: MonitorPlay,
  "camera-accessories": Settings2,
  "lighting-modifiers": Sun,
  audio: Mic2,
  "wireless-systems": Wifi,
};

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryIcon(slug: string): LucideIcon {
  return categoryIcons[slug] ?? Camera;
}

export const categorySlugs = categories.map((c) => c.slug);
