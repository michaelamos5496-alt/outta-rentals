/**
 * Images that skip Vercel's image optimizer — each optimized width counts
 * toward the plan's monthly Image Transformations. Pexels photos already
 * arrive resized and compressed from Pexels' own CDN (see `pexelsUrl` in
 * editorial-images.ts), and SVGs are vector, so optimizing them buys nothing.
 */
export function isPreOptimized(src: string): boolean {
  return src.startsWith("https://images.pexels.com/") || /\.svg(\?|$)/i.test(src);
}
