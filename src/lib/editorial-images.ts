/**
 * Editorial stock photography (Pexels, free-to-use license) for brand/category
 * imagery — homepage sections, category tiles, work showcase, services,
 * packages. Deliberately NOT used on product-specific cards/galleries, since
 * a stock photo shown against a real SKU (e.g. "RED V-RAPTOR") would show the
 * wrong gear labeled as the real product.
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
