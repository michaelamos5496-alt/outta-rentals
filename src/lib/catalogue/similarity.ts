import type { DemoProduct } from "./types";

/**
 * Grip that rigs lights (stands), as opposed to the rest of the grip category,
 * which supports cameras (tripods, gimbals, sliders, jibs…).
 */
export const LIGHT_RIGGING = new Set(["c-stand-kit", "american-stand"]);

/** In the modifiers category but effects, not something that shapes a light. */
export const NOT_A_MODIFIER = new Set(["haze-machine", "smoke-machine"]);

/**
 * What a product can be swapped for in a package. Two products are "similar"
 * when they share this key — their category, narrowed where one category
 * mixes different kinds of gear (cine vs photo lenses, camera support vs light
 * rigging, light modifiers vs atmosphere machines).
 */
export function similarityKey(p: Pick<DemoProduct, "slug" | "categorySlug" | "tags">): string {
  switch (p.categorySlug) {
    case "lenses":
      return `lenses:${p.tags.includes("cine-lens") ? "cine" : p.tags.includes("photo-lens") ? "photo" : "other"}`;
    case "grip":
      return `grip:${LIGHT_RIGGING.has(p.slug) ? "light-rigging" : "camera-support"}`;
    case "lighting-modifiers":
      return `lighting-modifiers:${NOT_A_MODIFIER.has(p.slug) ? "atmosphere" : "shaping"}`;
    case "camera-accessories": {
      const kind = p.slug.includes("focus")
        ? "focus"
        : p.slug.includes("transmitter") || p.tags.includes("wireless-video")
          ? "wireless-video"
          : p.slug.includes("cable")
            ? "cable"
            : "other";
      return `camera-accessories:${kind}`;
    }
    case "audio":
      return `audio:${p.slug.includes("solidcom") ? "comms" : p.slug.includes("recorder") ? "recorder" : "mics"}`;
    default:
      return p.categorySlug;
  }
}
