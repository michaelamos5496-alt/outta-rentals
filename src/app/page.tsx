import { Hero } from "@/components/sections/hero";
import { FeaturedEquipment } from "@/components/sections/featured-equipment";
import { CategoryExperience } from "@/components/sections/category-experience";
import { WhyOutta } from "@/components/sections/why-outta";
import { WorkShowcase } from "@/components/sections/work-showcase";
import { showWorkSection } from "@/config/site";
import { Services } from "@/components/sections/services";
import { FinalCta } from "@/components/sections/final-cta";
import { fetchAllProducts } from "@/lib/catalogue/db";
import { getProductImage } from "@/lib/editorial-images";
import type { DemoProduct } from "@/lib/catalogue";
import { getPackageBySlug } from "@/lib/packages";

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

// Kept in the catalogue, just not shown in the hero banner / thumbnail strip.
const HERO_EXCLUDED_SLUGS = new Set([
  "freefly-movi-pro",
  "dzofilm-pictor-zoom-20-55mm-t2-8",
  "arri-alexa-mini-foreign",
  "dzofilm-arles-prime-set-25-35-50-75-100mm",
]);

export default async function Home() {
  const products = await fetchAllProducts();
  const heroPool = products.filter((p) => !HERO_EXCLUDED_SLUGS.has(p.slug));
  const featured = heroPool.filter((p) => p.featured);
  const usedSlugs = new Set<string>();
  const usedImages = new Set<string>();

  // Hero rotates through the featured set, topped up with other real
  // catalogue items so the thumbnail strip beneath it fills a wide, varied
  // row (711rent-style) with visually distinct photos, rather than
  // repeating a photo shared by size-variant SKUs (e.g. the 4/6/8/12ft grip
  // frames). 20 rather than 8 — at 8 items, two looped copies (~1,500px)
  // didn't cover very wide viewports, leaving blank space at the end of
  // the marquee track before it looped.
  const SPOTLIGHT_COUNT = 20;
  const spotlightProducts = pickWithUniqueImages(featured, usedSlugs, usedImages, SPOTLIGHT_COUNT);
  if (spotlightProducts.length < SPOTLIGHT_COUNT) {
    spotlightProducts.push(
      ...pickWithUniqueImages(heroPool, usedSlugs, usedImages, SPOTLIGHT_COUNT - spotlightProducts.length)
    );
  }

  // The grid below is a pull from the preset production packages rather
  // than individual equipment, so it reads as "the kit for your shoot"
  // instead of a second product list.
  const featuredPackageSlugs = ["documentary", "commercial", "music-video", "short-film"];
  const featuredPackages = featuredPackageSlugs
    .map((slug) => getPackageBySlug(slug))
    .filter((pkg): pkg is NonNullable<typeof pkg> => pkg !== undefined);

  return (
    // The homepage stays focused on the rental itself — browse-by-category
    // right under the hero, featured picks further down. Kit-building lives
    // on its own page (/packages) rather than being duplicated here, and
    // category browsing now lives in the navbar's Equipment mega menu
    // instead of a second chip row on the homepage.
    <div className="flex flex-col">
      <Hero products={spotlightProducts} />
      <CategoryExperience products={products} />
      <FeaturedEquipment packages={featuredPackages} />
      {showWorkSection ? <WorkShowcase /> : null}
      <WhyOutta />
      <Services />
      <FinalCta />
    </div>
  );
}
