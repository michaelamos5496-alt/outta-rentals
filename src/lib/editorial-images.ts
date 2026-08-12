/**
 * Editorial stock photography (Pexels, free-to-use license) for brand/category
 * imagery — homepage sections, category tiles, work showcase, services,
 * packages, and per-product cards/galleries (see `productImages` below).
 */

function pexelsUrl(id: number, width = 1200): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

export const categoryImages: Record<string, string> = {
  cameras: pexelsUrl(6794832),
  lenses: pexelsUrl(2335052),
  lighting: pexelsUrl(4417017),
  grip: pexelsUrl(20101684),
  audio: pexelsUrl(347700),
  monitors: pexelsUrl(11234306),
  drones: pexelsUrl(9977848),
  accessories: pexelsUrl(1738643),
  // Added alongside the real inventory import — reuse the closest existing
  // category photo rather than sourcing new stock for a first pass.
  "camera-accessories": pexelsUrl(11234306), // shares the monitors/support photo
  filters: pexelsUrl(2335052), // shares the lenses photo
  "matte-boxes": pexelsUrl(20101684), // shares the grip photo
  "lighting-modifiers": pexelsUrl(4417017), // shares the lighting photo
};

/** Shared by the homepage "Build Your Kit" presets and the /packages grid — same 8 themes. */
export const themeImages: Record<string, string> = {
  commercial: pexelsUrl(1114126),
  documentary: pexelsUrl(18886385),
  "music-video": pexelsUrl(4889279),
  wedding: pexelsUrl(17057198),
  "feature-film": pexelsUrl(8088372),
  interview: pexelsUrl(4662717),
  content: pexelsUrl(9040539),
  "live-production": pexelsUrl(7709688),
};

export const serviceImages: Record<string, string> = {
  "equipment-rental": pexelsUrl(34929059),
  "production-support": pexelsUrl(3651904),
  "delivery-collection": pexelsUrl(21838827),
  "prep-testing": pexelsUrl(20762578),
  "technical-support": pexelsUrl(11267080),
  "crew-support": pexelsUrl(13812362),
  "custom-packages": pexelsUrl(1114126),
};

export const finalCtaImage = pexelsUrl(30697927, 1920);

/**
 * Best-effort per-product photos, keyed by catalogue slug. Free stock photo
 * libraries don't carry verified, model-specific photography for niche pro
 * cinema gear (a "Sony camera" stock photo can't be confirmed to actually be
 * an FX3 vs FX6, and brand-specific searches for Aputure/Godox/Sigma gear
 * turned up nothing usable) — these are the closest visually-plausible match
 * found per product, not verified exact-unit photos. Products without an
 * entry here fall back to their category photo (see `categoryImages`).
 */
export const productImages: Record<string, string> = {
  "sony-fx3": pexelsUrl(30697927),
  "sony-fx6": pexelsUrl(17333518),
  "sony-fx9": pexelsUrl(34623018),
  "canon-c70": pexelsUrl(2335048),
  "arri-alexa-mini-lf": pexelsUrl(17145214),
  "red-v-raptor": pexelsUrl(6794832),

  "sony-24-70mm-gm-ii": pexelsUrl(2179865),
  "sony-70-200mm-gm-ii": pexelsUrl(35790629),
  "sigma-cine-prime-set": pexelsUrl(4164088),

  "sachtler-flowtech-75": pexelsUrl(30670957),
  "dji-rs-3-pro": pexelsUrl(20101684),
  "camera-slider": pexelsUrl(28532580),

  "zoom-field-recorder": pexelsUrl(14358512),

  "dji-inspire-3": pexelsUrl(8821970),
  "dji-mavic-3-cine": pexelsUrl(13310698),

  "nd-filter-matte-box-kit": pexelsUrl(1114126),
};

/** Resolves a product's best-effort photo, falling back to its category photo. */
export function getProductImage(productSlug: string, categorySlug: string): string | undefined {
  return productImages[productSlug] ?? categoryImages[categorySlug];
}
