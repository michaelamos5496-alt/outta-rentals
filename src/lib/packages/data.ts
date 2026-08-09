import type { ProductionPackage } from "./types";

/**
 * Preset production packages — a starting point, not a fixed order. Each
 * maps one product per role; the package builder lets a customer adjust
 * quantities or drop a role entirely before adding it to their kit.
 */
export const packages: ProductionPackage[] = [
  {
    slug: "commercial",
    name: "Commercial",
    description: "Fast-turnaround kits built for brand and agency shoots.",
    items: [
      { role: "Camera", productSlug: "sony-fx6", quantity: 1 },
      { role: "Lens", productSlug: "sony-24-70mm-gm-ii", quantity: 1 },
      { role: "Lighting", productSlug: "aputure-600d", quantity: 1 },
      { role: "Monitoring", productSlug: "smallhd-702-touch", quantity: 1 },
      { role: "Support", productSlug: "sachtler-flowtech-75", quantity: 1 },
    ],
  },
  {
    slug: "documentary",
    name: "Documentary",
    description: "Lightweight, run-and-gun setups for long shooting days.",
    items: [
      { role: "Camera", productSlug: "sony-fx3", quantity: 1 },
      { role: "Lens", productSlug: "sony-24-70mm-gm-ii", quantity: 1 },
      { role: "Audio", productSlug: "sennheiser-ew-wireless-lav", quantity: 1 },
      { role: "Support", productSlug: "dji-rs-3-pro", quantity: 1 },
      { role: "Accessories", productSlug: "v-mount-battery-kit", quantity: 1 },
    ],
  },
  {
    slug: "music-video",
    name: "Music Video",
    description: "Bold lighting and specialty glass for high-concept looks.",
    items: [
      { role: "Camera", productSlug: "red-v-raptor", quantity: 1 },
      { role: "Lens", productSlug: "sigma-cine-prime-set", quantity: 1 },
      { role: "Lighting", productSlug: "aputure-600x", quantity: 1 },
      { role: "Monitoring", productSlug: "smallhd-cine-7", quantity: 1 },
      { role: "Support", productSlug: "dji-rs-3-pro", quantity: 1 },
    ],
  },
  {
    slug: "wedding",
    name: "Wedding",
    description: "Discreet, reliable gear for once-only moments.",
    items: [
      { role: "Camera", productSlug: "sony-fx3", quantity: 1 },
      { role: "Lens", productSlug: "sony-70-200mm-gm-ii", quantity: 1 },
      { role: "Audio", productSlug: "sennheiser-ew-wireless-lav", quantity: 1 },
      { role: "Accessories", productSlug: "v-mount-battery-kit", quantity: 1 },
    ],
  },
  {
    slug: "feature-film",
    name: "Feature Film",
    description: "Full production packages built around your shot list.",
    items: [
      { role: "Camera", productSlug: "arri-alexa-mini-lf", quantity: 1 },
      { role: "Lens", productSlug: "sigma-cine-prime-set", quantity: 1 },
      { role: "Lighting", productSlug: "aputure-600d", quantity: 2 },
      { role: "Monitoring", productSlug: "smallhd-cine-7", quantity: 1 },
      { role: "Support", productSlug: "sachtler-flowtech-75", quantity: 1 },
    ],
  },
  {
    slug: "interview",
    name: "Interview",
    description: "Clean two-camera setups with matched lighting.",
    items: [
      { role: "Camera", productSlug: "canon-c70", quantity: 2 },
      { role: "Lens", productSlug: "sony-24-70mm-gm-ii", quantity: 1 },
      { role: "Lighting", productSlug: "amaran-200x-s", quantity: 2 },
      { role: "Audio", productSlug: "sennheiser-ew-wireless-lav", quantity: 1 },
      { role: "Monitoring", productSlug: "smallhd-702-touch", quantity: 1 },
      { role: "Support", productSlug: "sachtler-flowtech-75", quantity: 2 },
    ],
  },
  {
    slug: "content",
    name: "Content",
    description: "Fast, flexible kits for creators and social teams.",
    items: [
      { role: "Camera", productSlug: "sony-fx3", quantity: 1 },
      { role: "Lens", productSlug: "sony-24-70mm-gm-ii", quantity: 1 },
      { role: "Lighting", productSlug: "amaran-200x-s", quantity: 1 },
      { role: "Support", productSlug: "dji-rs-3-pro", quantity: 1 },
      { role: "Accessories", productSlug: "cfexpress-media-kit", quantity: 1 },
    ],
  },
  {
    slug: "live-production",
    name: "Live Production",
    description: "Multi-camera and audio kits built for live events.",
    items: [
      { role: "Camera", productSlug: "sony-fx6", quantity: 2 },
      { role: "Lighting", productSlug: "godox-vl300", quantity: 2 },
      { role: "Audio", productSlug: "zoom-field-recorder", quantity: 1 },
      { role: "Monitoring", productSlug: "smallhd-702-touch", quantity: 1 },
      { role: "Support", productSlug: "sachtler-flowtech-75", quantity: 2 },
    ],
  },
];
