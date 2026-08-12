import type { ProductionPackage } from "./types";

/**
 * Preset production packages — a starting point, not a fixed order. Each
 * maps one product per role; the package builder lets a customer adjust
 * quantities or drop a role entirely before adding it to their kit.
 *
 * Every productSlug here resolves to real OUTTA inventory. Roles that had
 * no real equivalent yet (audio, batteries, media) were dropped rather than
 * kept pointing at removed demo products.
 */
export const packages: ProductionPackage[] = [
  {
    slug: "commercial",
    name: "Commercial",
    description: "Fast-turnaround kits built for brand and agency shoots.",
    items: [
      { role: "Camera", productSlug: "blackmagic-6k-pro", quantity: 1 },
      { role: "Lens", productSlug: "canon-24-105mm", quantity: 1 },
      { role: "Lighting", productSlug: "aputure-600d", quantity: 1 },
      { role: "Monitoring", productSlug: "smallhd-dir-monitor", quantity: 1 },
      { role: "Support", productSlug: "heavy-duty-tripod", quantity: 1 },
    ],
  },
  {
    slug: "documentary",
    name: "Documentary",
    description: "Lightweight, run-and-gun setups for long shooting days.",
    items: [
      { role: "Camera", productSlug: "sony-fx3", quantity: 1 },
      { role: "Lens", productSlug: "canon-24-105mm", quantity: 1 },
      { role: "Support", productSlug: "freefly-movi-pro", quantity: 1 },
    ],
  },
  {
    slug: "music-video",
    name: "Music Video",
    description: "Bold lighting and specialty glass for high-concept looks.",
    items: [
      { role: "Camera", productSlug: "red-helium", quantity: 1 },
      { role: "Lens", productSlug: "dzofilm-vespid-prime-set-16-125mm", quantity: 1 },
      { role: "Lighting", productSlug: "aputure-600x", quantity: 1 },
      { role: "Monitoring", productSlug: "smallhd-dop-monitor", quantity: 1 },
      { role: "Support", productSlug: "freefly-movi-pro", quantity: 1 },
    ],
  },
  {
    slug: "wedding",
    name: "Wedding",
    description: "Discreet, reliable gear for once-only moments.",
    items: [
      { role: "Camera", productSlug: "sony-fx3", quantity: 1 },
      { role: "Lens", productSlug: "dzofilm-pictor-zoom-50-125mm-t2-8", quantity: 1 },
    ],
  },
  {
    slug: "feature-film",
    name: "Feature Film",
    description: "Full production packages built around your shot list.",
    items: [
      { role: "Camera", productSlug: "arri-alexa-mini", quantity: 1 },
      { role: "Lens", productSlug: "dzofilm-vespid-prime-set-16-125mm", quantity: 1 },
      { role: "Lighting", productSlug: "aputure-600d", quantity: 2 },
      { role: "Monitoring", productSlug: "atomos-sumo-19-monitor", quantity: 1 },
      { role: "Support", productSlug: "heavy-duty-tripod", quantity: 1 },
    ],
  },
  {
    slug: "interview",
    name: "Interview",
    description: "Clean two-camera setups with matched lighting.",
    items: [
      { role: "Camera", productSlug: "blackmagic-6k", quantity: 2 },
      { role: "Lens", productSlug: "canon-24-105mm", quantity: 1 },
      { role: "Lighting", productSlug: "amaran-200x-s", quantity: 2 },
      { role: "Monitoring", productSlug: "smallhd-dir-monitor", quantity: 1 },
      { role: "Support", productSlug: "heavy-duty-tripod", quantity: 2 },
    ],
  },
  {
    slug: "content",
    name: "Content",
    description: "Fast, flexible kits for creators and social teams.",
    items: [
      { role: "Camera", productSlug: "sony-fx3", quantity: 1 },
      { role: "Lens", productSlug: "canon-24-105mm", quantity: 1 },
      { role: "Lighting", productSlug: "amaran-200x-s", quantity: 1 },
      { role: "Support", productSlug: "freefly-movi-pro", quantity: 1 },
    ],
  },
  {
    slug: "live-production",
    name: "Live Production",
    description: "Multi-camera and audio kits built for live events.",
    items: [
      { role: "Camera", productSlug: "blackmagic-6k-pro", quantity: 2 },
      { role: "Lighting", productSlug: "godox-knowled-mat-light-4x4", quantity: 2 },
      { role: "Monitoring", productSlug: "smallhd-dop-monitor", quantity: 1 },
      { role: "Support", productSlug: "heavy-duty-tripod", quantity: 2 },
    ],
  },
];
