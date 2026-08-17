import { Hero } from "@/components/sections/hero";
import { FeaturedEquipment } from "@/components/sections/featured-equipment";
import { CategoryExperience } from "@/components/sections/category-experience";
import { WhyOutta } from "@/components/sections/why-outta";
import { WorkShowcase } from "@/components/sections/work-showcase";
import { Services } from "@/components/sections/services";
import { Testimonials } from "@/components/sections/testimonials";
import { FinalCta } from "@/components/sections/final-cta";
import { fetchAllProducts } from "@/lib/catalogue/db";
import { getProductImage } from "@/lib/editorial-images";
import type { DemoProduct } from "@/lib/catalogue";

// Statically imported (not next/dynamic) — this tree is passed as `children`
// into SmoothScroll (a "use client" wrapper) now that the homepage has
// smooth scroll too, and next/dynamic() elements passed as children into a
// client component duplicate on the server→client boundary in this Next.js
// version (confirmed: 9 children resolved as 17). Static imports sidestep it.

/**
 * Picks up to `count` products from `pool`, skipping any already in
 * `usedSlugs` and any whose real photo (several grip/lighting size-variant
 * SKUs legitimately share one reference photo) is already showing
 * elsewhere — the hero's thumbnail strip and the featured grid should
 * never repeat the same image twice.
 */
function pickWithUniqueImages(
  pool: DemoProduct[],
  usedSlugs: Set<string>,
  usedImages: Set<string>,
  count: number
): DemoProduct[] {
  const picked: DemoProduct[] = [];
  for (const p of pool) {
    if (picked.length >= count) break;
    if (usedSlugs.has(p.slug)) continue;
    const image = getProductImage(p.slug, p.categorySlug);
    if (image && usedImages.has(image)) continue;
    picked.push(p);
    usedSlugs.add(p.slug);
    if (image) usedImages.add(image);
  }
  return picked;
}

export default async function Home() {
  const products = await fetchAllProducts();
  const featured = products.filter((p) => p.featured);
  const usedSlugs = new Set<string>();
  const usedImages = new Set<string>();

  // Hero rotates through the featured set, topped up with other real
  // catalogue items so the thumbnail strip beneath it always fills a full
  // row of 8 (711rent-style) with 8 visually distinct photos, rather than
  // repeating a photo shared by size-variant SKUs (e.g. the 4/6/8/12ft grip
  // frames) or leaving most of the row blank.
  const spotlightProducts = pickWithUniqueImages(featured, usedSlugs, usedImages, 8);
  if (spotlightProducts.length < 8) {
    spotlightProducts.push(
      ...pickWithUniqueImages(products, usedSlugs, usedImages, 8 - spotlightProducts.length)
    );
  }

  // The grid below gets the rest of the featured set, topped up with other
  // real catalogue items — same real-photo, no-repeats rule.
  const gridProducts = pickWithUniqueImages(featured, usedSlugs, usedImages, 4);
  if (gridProducts.length < 4) {
    gridProducts.push(...pickWithUniqueImages(products, usedSlugs, usedImages, 4 - gridProducts.length));
  }

  return (
    // The homepage stays focused on the rental itself — browse-by-category
    // right under the hero, featured picks further down. Kit-building lives
    // on its own page (/packages) rather than being duplicated here, and
    // category browsing now lives in the navbar's Equipment mega menu
    // instead of a second chip row on the homepage.
    <div className="flex flex-col">
      <Hero products={spotlightProducts} />
      <CategoryExperience products={products} />
      <FeaturedEquipment products={gridProducts} />
      <WorkShowcase />
      <WhyOutta />
      <Services />
      <Testimonials />
      <FinalCta />
    </div>
  );
}
