import { Hero } from "@/components/sections/hero";
import { EquipmentStrip } from "@/components/sections/equipment-strip";
import { FeaturedEquipment } from "@/components/sections/featured-equipment";
import { CategoryExperience } from "@/components/sections/category-experience";
import { BuildYourKit } from "@/components/sections/build-your-kit";
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
  // the rest of the featured set (falls back to top of catalogue if fewer
  // than 8 products are marked featured).
  const spotlightProducts = featured.slice(0, 5);
  const gridProducts = (featured.length > 5 ? featured.slice(5) : featured).slice(0, 4);
  const fallbackGrid = gridProducts.length > 0 ? gridProducts : products.slice(0, 4);

  return (
    // flex-col + per-item `order` lets mobile show a more concise, reordered
    // flow (categories surfaced earlier, Services/Testimonials dropped) while
    // `lg:order-none` resets every item to plain source order on desktop —
    // i.e. visually identical to a plain stacked fragment at ≥lg.
    <div className="flex flex-col">
      <Hero products={spotlightProducts} totalCount={products.length} />
      {/* Redundant on mobile — the tab bar's Equipment tab and the listing
          page's own category pills already cover this. Kept on desktop. */}
      <div className="hidden lg:order-none lg:block">
        <EquipmentStrip />
      </div>
      <div className="order-4 lg:order-none">
        <FeaturedEquipment products={fallbackGrid} />
      </div>
      <div className="order-3 lg:order-none">
        <CategoryExperience products={products} />
      </div>
      <div className="order-7 lg:order-none">
        <BuildYourKit />
      </div>
      <div className="order-8 lg:order-none">
        <WhyOutta />
      </div>
      <div className="order-5 lg:order-none">
        <WorkShowcase />
      </div>
      <div className="hidden lg:block">
        <Services />
      </div>
      <div className="order-6 lg:order-none">
        <Testimonials />
      </div>
      <div className="order-9 lg:order-none">
        <FinalCta />
      </div>
    </div>
  );
}
