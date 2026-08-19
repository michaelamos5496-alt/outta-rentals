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

/** Stock headshots for the testimonials hover-carousel — paired by index with `testimonials` in placeholder-data.ts. */
export const testimonialImages: string[] = [
  pexelsUrl(27086922, 700),
  pexelsUrl(37148308, 700),
  pexelsUrl(34381971, 700),
  pexelsUrl(12396627, 700),
];

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
 * Best-effort per-product photos for OUTTA's real inventory, keyed by
 * catalogue slug. Free stock libraries don't carry verified, model-specific
 * photography for pro cinema gear, so several visually-similar products
 * (e.g. every Amaran fixture) intentionally share one photo rather than
 * being paired with an unrelated stock shot for the sake of uniqueness —
 * these are the closest visually-plausible match, not confirmed exact-unit
 * photos. Products without an entry here fall back to their category photo
 * (see `categoryImages`).
 */
export const productImages: Record<string, string> = {
  "arri-alexa-mini": "/equipment/arri-alexa-mini.webp",
  "arri-alexa-mini-foreign": pexelsUrl(37593303),
  "red-helium": pexelsUrl(6794832),
  "blackmagic-6k-pro": pexelsUrl(26628428),
  "blackmagic-6k": pexelsUrl(8456847),
  "dzofilm-arles-prime-set-25-35-50-75-100mm": pexelsUrl(2335052),
  "dzofilm-arles-prime-single": pexelsUrl(34956918),
  "dzofilm-vespid-prime-set-16-125mm": pexelsUrl(1231171),
  "dzofilm-pictor-zoom-12-25mm-t2-8": pexelsUrl(17345664),
  "dzofilm-pictor-zoom-20-55mm-t2-8": pexelsUrl(217380),
  "dzofilm-pictor-zoom-50-125mm-t2-8": pexelsUrl(2335052),
  "arri-distagon-12mm": pexelsUrl(34956918),
  "laowa-12mm-ef": pexelsUrl(1231171),
  "sigma-18-35mm": pexelsUrl(17345664),
  "canon-24-105mm": pexelsUrl(217380),
  "heavy-duty-tripod": pexelsUrl(10147377),
  "wireless-focus-system": pexelsUrl(2773541),
  "lidar-focus-pro": pexelsUrl(21773663),
  "teradek-wireless-video-transmitter": pexelsUrl(37893958),
  "smallhd-dir-monitor": pexelsUrl(36786132),
  "atomos-sumo-19-monitor": pexelsUrl(36786133),
  "smallhd-dop-monitor": pexelsUrl(6685888),
  "freefly-movi-pro": pexelsUrl(12205955),
  "mini-jib-12ft": pexelsUrl(10809861),
  "retractable-jib": pexelsUrl(10809888),
  "camera-cart": pexelsUrl(34955426),
  "tiffen-nd-filter-single": pexelsUrl(2226387),
  "tiffen-black-pro-mist": pexelsUrl(4088245),
  "tiffen-hollywood-black-magic": pexelsUrl(20017027),
  "tiffen-black-satin": pexelsUrl(35346700),
  "circular-polarizer": pexelsUrl(2226387),
  "rota-polarizer": pexelsUrl(4088245),
  "wooden-camera-universal-matte-box": pexelsUrl(6664783),
  "tilta-mirage-matte-box-w-vnd": pexelsUrl(31616828),
  "tilta-3-way-matte-box": pexelsUrl(14672296),
  "tilta-mini-matte-box": pexelsUrl(6664785),
  "arri-4k-hmi-m40": pexelsUrl(17266853),
  "nanlux-evoke-2400b": pexelsUrl(34171439),
  "aputure-ls-1200x": pexelsUrl(13884538),
  "aputure-ls-1000c": pexelsUrl(14388173),
  "aputure-ls-1200d": pexelsUrl(13884541),
  "aputure-ls-600c": pexelsUrl(12497812),
  "aputure-ls-300d-ii": pexelsUrl(13884540),
  "aputure-ls-120d-ii": pexelsUrl(19659899),
  "aputure-nova-p300c": pexelsUrl(36502332),
  "aputure-mc-ls-mini": pexelsUrl(34171441),
  "amaran-f22c": pexelsUrl(20142962),
  "amaran-300c": pexelsUrl(20142962),
  "amaran-150c": pexelsUrl(20142962),
  "godox-knowled-mat-light-4x4": pexelsUrl(28772529),
  "godox-mat-light-4x2": pexelsUrl(28772538),
  "godox-mat-light-2x2": pexelsUrl(28772532),
  "godox-airtube-light": pexelsUrl(28772536),
  "infinibar-full-set": pexelsUrl(8774458),
  "nanlite-pavotube-4ft": pexelsUrl(14388173),
  "nanlite-pavotube-1ft": pexelsUrl(34171439),
  "12x12ft-butterfly": pexelsUrl(13710681),
  "12x12ft-checkerboard": pexelsUrl(9396401),
  "12x12ft-ultrabounce": pexelsUrl(13710681),
  "8x8ft-checkerboard": pexelsUrl(9396401),
  "8x8ft-butterfly": pexelsUrl(13710681),
  "8x8ft-ultrabounce": pexelsUrl(9396401),
  "8x8ft-black-out": pexelsUrl(26743060),
  "6x6ft-ultrabounce": pexelsUrl(13710681),
  "6x6ft-checkerboard": pexelsUrl(9396401),
  "4x4ft-checkerboard": pexelsUrl(9396401),
  "flags-set": pexelsUrl(16566210),
  "floppy": pexelsUrl(16566210),
  "american-stand": pexelsUrl(3426679),
  "haze-machine": pexelsUrl(9694182),
  "smoke-machine": pexelsUrl(9694198),
  "sony-fx3": pexelsUrl(30697927),
  "aputure-600d": pexelsUrl(12497812),
  "aputure-600x": pexelsUrl(13884540),
  "amaran-200x-s": pexelsUrl(20142962),
};

/** Resolves a product's best-effort photo, falling back to its category photo. */
export function getProductImage(productSlug: string, categorySlug: string): string | undefined {
  return productImages[productSlug] ?? categoryImages[categorySlug];
}

/**
 * Products with real OUTTA-supplied photography: an isolated shot on a
 * plain white background, rather than the Pexels lifestyle/location stock
 * used everywhere else. Cards render these with object-contain on a white
 * card (the whole unit visible, nothing cropped) instead of object-cover.
 */
export const isolatedProductPhotos = new Set<string>(["arri-alexa-mini"]);
