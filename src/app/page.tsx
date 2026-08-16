import { Hero } from "@/components/sections/hero";
import { FeaturedEquipment } from "@/components/sections/featured-equipment";
import { CategoryExperience } from "@/components/sections/category-experience";
import { WhyOutta } from "@/components/sections/why-outta";
import { WorkShowcase } from "@/components/sections/work-showcase";
import { Services } from "@/components/sections/services";
import { Testimonials } from "@/components/sections/testimonials";
import { FinalCta } from "@/components/sections/final-cta";
import { fetchAllProducts } from "@/lib/catalogue/db";

// Statically imported (not next/dynamic) — this tree is passed as `children`
// into SmoothScroll (a "use client" wrapper) now that the homepage has
// smooth scroll too, and next/dynamic() elements passed as children into a
// client component duplicate on the server→client boundary in this Next.js
// version (confirmed: 9 children resolved as 17). Static imports sidestep it.

export default async function Home() {
  const products = await fetchAllProducts();
  const featured = products.filter((p) => p.featured);
  // Hero rotates through a handful of flagship items; the grid below gets
  // the rest of the featured set, topped up with other real catalogue items
  // (not already in the hero) so it always shows a full row of 4 rather than
  // shrinking whenever fewer than a handful of products are marked featured.
  const spotlightProducts = featured.slice(0, 5);
  const spotlightSlugs = new Set(spotlightProducts.map((p) => p.slug));
  const gridProducts = featured.filter((p) => !spotlightSlugs.has(p.slug)).slice(0, 4);
  if (gridProducts.length < 4) {
    const gridSlugs = new Set(gridProducts.map((p) => p.slug));
    const filler = products.filter((p) => !spotlightSlugs.has(p.slug) && !gridSlugs.has(p.slug));
    gridProducts.push(...filler.slice(0, 4 - gridProducts.length));
  }

  return (
    // The homepage stays focused on the rental itself — browse-by-category
    // right under the hero, featured picks further down. Kit-building lives
    // on its own page (/packages) rather than being duplicated here, and
    // category browsing now lives in the navbar's Equipment mega menu
    // instead of a second chip row on the homepage.
    <div className="flex flex-col">
      <Hero products={spotlightProducts} totalCount={products.length} />
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
