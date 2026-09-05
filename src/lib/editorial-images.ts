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
 * Dedicated hero-banner photography, keyed by product slug — a different,
 * more dramatic shot than the product's regular listing/PDP photo (see
 * `productImages`), for products we've shot one for. Falls back to the
 * regular product photo via `getProductImage` for everything else.
 */
export const heroProductImages: Record<string, string> = {
  "sony-fx3": "/equipment/sony-fx3-rig.jpg",
  "aputure-600d": "/equipment/aputure-600d-rig.jpg",
  "blackmagic-6k-pro": "/equipment/blackmagic-6k-pro-rig.jpg",
  "sigma-18-35mm": "/equipment/sigma-18-35mm-rig.jpg",
  "heavy-duty-tripod": "/equipment/heavy-duty-tripod-rig.webp",
  "aputure-600x": "/equipment/aputure-600x-rig.jpg",
  "amaran-200x-s": "/equipment/amaran-200x-s-rig.jpg",
  "c-stand-kit": "/equipment/c-stand-kit-rig.jpg",
  "red-helium": "/equipment/red-helium-rig.jpg",
};

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
  "red-helium": "/equipment/red-helium.jpg",
  "blackmagic-6k-pro": "/equipment/blackmagic-6k-pro.jpg",
  "blackmagic-6k": "/equipment/blackmagic-6k.jpg",
  "dzofilm-arles-prime-set-25-35-50-75-100mm": pexelsUrl(2335052),
  "dzofilm-arles-prime-single": pexelsUrl(34956918),
  "dzofilm-vespid-prime-set-16-125mm": "/equipment/dzofilm-vespid-prime-set-16-125mm.jpg",
  "dzofilm-pictor-zoom-12-25mm-t2-8": "/equipment/dzofilm-pictor-zoom-12-25mm-t2-8.jpg",
  "dzofilm-pictor-zoom-20-55mm-t2-8": pexelsUrl(217380),
  "dzofilm-pictor-zoom-50-125mm-t2-8": pexelsUrl(2335052),
  "arri-distagon-12mm": "/equipment/arri-distagon-12mm.webp",
  "laowa-12mm-ef": "/equipment/laowa-12mm-ef.jpg",
  "sigma-18-35mm": "/equipment/sigma-18-35mm.webp",
  "canon-24-105mm": "/equipment/canon-24-105mm.png",
  "heavy-duty-tripod": "/equipment/heavy-duty-tripod.webp",
  "wireless-focus-system": "/equipment/wireless-focus-system.jpg",
  "lidar-focus-pro": "/equipment/lidar-focus-pro.webp",
  "teradek-wireless-video-transmitter": "/equipment/teradek-wireless-video-transmitter.jpg",
  "smallhd-dir-monitor": "/equipment/smallhd-dir-monitor.png",
  "atomos-sumo-19-monitor": "/equipment/atomos-sumo-19-monitor.webp",
  "smallhd-dop-monitor": "/equipment/smallhd-dop-monitor.jpg",
  "freefly-movi-pro": "/equipment/freefly-movi-pro.jpg",
  "mini-jib-12ft": "/equipment/mini-jib-12ft.jpg",
  "retractable-jib": "/equipment/retractable-jib.jpg",
  "camera-cart": "/equipment/camera-cart.jpg",
  "tiffen-nd-filter-single": "/equipment/tiffen-nd-filter-single.jpg",
  "tiffen-black-pro-mist": "/equipment/tiffen-black-pro-mist.webp",
  "tiffen-hollywood-black-magic": "/equipment/tiffen-hollywood-black-magic.jpg",
  "tiffen-black-satin": "/equipment/tiffen-black-satin.webp",
  "circular-polarizer": "/equipment/circular-polarizer.jpg",
  "rota-polarizer": "/equipment/rota-polarizer.webp",
  "wooden-camera-universal-matte-box": "/equipment/wooden-camera-universal-matte-box.webp",
  "tilta-mirage-matte-box-w-vnd": "/equipment/tilta-mirage-matte-box-w-vnd.webp",
  "tilta-3-way-matte-box": "/equipment/tilta-3-way-matte-box.webp",
  "tilta-mini-matte-box": "/equipment/tilta-mini-matte-box.webp",
  "arri-4k-hmi-m40": "/equipment/arri-4k-hmi-m40.jpg",
  "nanlux-evoke-2400b": "/equipment/nanlux-evoke-2400b.jpg",
  "aputure-ls-1200x": "/equipment/aputure-ls-1200x.jpg",
  "aputure-ls-1000c": "/equipment/aputure-ls-1000c.jpg",
  "aputure-ls-1200d": "/equipment/aputure-ls-1200d.jpg",
  "aputure-ls-600c": "/equipment/aputure-ls-600c.jpg",
  "aputure-ls-300d-ii": "/equipment/aputure-ls-300d-ii.jpg",
  "aputure-ls-120d-ii": "/equipment/aputure-ls-120d-ii.jpg",
  "aputure-nova-p300c": "/equipment/aputure-nova-p300c.avif",
  "aputure-mc-ls-mini": "/equipment/aputure-mc-ls-mini.png",
  "amaran-f22c": "/equipment/amaran-f22c.webp",
  "amaran-300c": "/equipment/amaran-300c.jpg",
  "amaran-150c": "/equipment/amaran-150c.webp",
  "godox-knowled-mat-light-4x4": "/equipment/godox-knowled-mat-light-4x4.webp",
  "godox-mat-light-4x2": "/equipment/godox-mat-light-4x2.webp",
  "godox-mat-light-2x2": "/equipment/godox-mat-light-2x2.jpg",
  "godox-airtube-light": "/equipment/godox-airtube-light.jpg",
  "infinibar-full-set": "/equipment/infinibar-full-set.webp",
  "nanlite-pavotube-4ft": "/equipment/nanlite-pavotube-4ft.jpg",
  "nanlite-pavotube-1ft": "/equipment/nanlite-pavotube-1ft.jpg",
  "12x12ft-butterfly": "/equipment/12x12ft-butterfly.jpg",
  "12x12ft-checkerboard": "/equipment/12x12ft-checkerboard.jpg",
  "12x12ft-ultrabounce": "/equipment/12x12ft-ultrabounce.jpg",
  "c-stand-kit": "/equipment/c-stand-kit.png",
  "8x8ft-checkerboard": "/equipment/12x12ft-checkerboard.jpg",
  "8x8ft-butterfly": "/equipment/12x12ft-butterfly.jpg",
  "8x8ft-ultrabounce": "/equipment/12x12ft-ultrabounce.jpg",
  "8x8ft-black-out": "/equipment/8x8ft-black-out.jpg",
  "6x6ft-ultrabounce": "/equipment/12x12ft-ultrabounce.jpg",
  "6x6ft-checkerboard": "/equipment/12x12ft-checkerboard.jpg",
  "4x4ft-checkerboard": "/equipment/12x12ft-checkerboard.jpg",
  "flags-set": "/equipment/flags-set.jpg",
  "floppy": "/equipment/floppy.png",
  "american-stand": "/equipment/american-stand.png",
  "haze-machine": "/equipment/haze-machine.avif",
  "smoke-machine": "/equipment/smoke-machine.jpg",
  "sony-fx3": "/equipment/sony-fx3.webp",
  "aputure-600d": "/equipment/aputure-600d.webp",
  "aputure-600x": "/equipment/aputure-600x.jpg",
  "amaran-200x-s": "/equipment/amaran-200x-s.webp",
};

/** Resolves a product's best-effort photo, falling back to its category photo. */
export function getProductImage(productSlug: string, categorySlug: string): string | undefined {
  return productImages[productSlug] ?? categoryImages[categorySlug];
}

/**
 * Products with real OUTTA-supplied photography: an isolated studio shot
 * (transparent or plain-white background) rather than the Pexels
 * lifestyle/location stock used everywhere else. The PDP gallery renders
 * these with object-contain (the whole unit visible, nothing cropped)
 * instead of object-cover.
 */
export const isolatedProductPhotos = new Set<string>([
  "arri-alexa-mini",
  "sony-fx3",
  "blackmagic-6k-pro",
  "blackmagic-6k",
  "red-helium",
  "dzofilm-vespid-prime-set-16-125mm",
  "arri-distagon-12mm",
  "sigma-18-35mm",
  "aputure-600d",
  "aputure-nova-p300c",
  "amaran-200x-s",
  "amaran-150c",
  "c-stand-kit",
  "wooden-camera-universal-matte-box",
  "tiffen-black-pro-mist",
  "tiffen-black-satin",
  "smallhd-dir-monitor",
  "atomos-sumo-19-monitor",
]);
