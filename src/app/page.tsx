import { Hero } from "@/components/sections/hero";
import { FeaturedEquipment } from "@/components/sections/featured-equipment";
import { CategoryExperience } from "@/components/sections/category-experience";
import { WhyOutta } from "@/components/sections/why-outta";
import { WorkShowcase } from "@/components/sections/work-showcase";
import { showWorkSection } from "@/config/site";
import { Services } from "@/components/sections/services";
import { FinalCta } from "@/components/sections/final-cta";
import { fetchAllProducts } from "@/lib/catalogue/db";
import { getPackageBySlug } from "@/lib/packages";

// Statically imported (not next/dynamic) — this tree is passed as `children`
// into SmoothScroll (a "use client" wrapper) now that the homepage has
// smooth scroll too, and next/dynamic() elements passed as children into a
// client component duplicate on the server→client boundary in this Next.js
// version (confirmed: 9 children resolved as 17). Static imports sidestep it.

/**
 * The hero banner and the thumbnail strip under it show this fixed set, in
 * this order — they do NOT pick up new equipment automatically, so photos
 * added to the catalogue later never appear on the homepage banner. To
 * change what the hero shows, edit this list.
 */
const HERO_SLUGS = [
  "sony-fx3",
  "aputure-600d",
  "aputure-600x",
  "amaran-200x-s",
  "c-stand-kit",
  "arri-alexa-mini",
  "red-helium",
  "blackmagic-6k-pro",
  "blackmagic-6k",
  "dzofilm-arles-prime-single",
  "dzofilm-vespid-prime-set-16-125mm",
  "dzofilm-pictor-zoom-12-25mm-t2-8",
  "arri-distagon-12mm",
  "laowa-12mm-ef",
  "sigma-18-35mm",
  "canon-24-105mm",
  "heavy-duty-tripod",
];

export default async function Home() {
  const products = await fetchAllProducts();
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const spotlightProducts = HERO_SLUGS.flatMap((slug) => {
    const product = bySlug.get(slug);
    return product ? [product] : [];
  });

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
