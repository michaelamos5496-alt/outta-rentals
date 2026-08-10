import dynamic from "next/dynamic";

import { Hero } from "@/components/sections/hero";
import { EquipmentStrip } from "@/components/sections/equipment-strip";
import { fetchAllProducts } from "@/lib/catalogue/db";
import type { DemoProduct } from "@/lib/catalogue";

// Below-the-fold sections split into their own chunks — keeps the initial
// bundle (and main-thread work during the LCP window) limited to what's
// actually visible on load. Still server-rendered (ssr: true, the default)
// so content and SEO are unaffected.
const FeaturedEquipment = dynamic<{ products: DemoProduct[] }>(() =>
  import("@/components/sections/featured-equipment").then((m) => m.FeaturedEquipment)
);
const CategoryExperience = dynamic(() =>
  import("@/components/sections/category-experience").then((m) => m.CategoryExperience)
);
const BuildYourKit = dynamic(() =>
  import("@/components/sections/build-your-kit").then((m) => m.BuildYourKit)
);
const WhyOutta = dynamic(() =>
  import("@/components/sections/why-outta").then((m) => m.WhyOutta)
);
const WorkShowcase = dynamic(() =>
  import("@/components/sections/work-showcase").then((m) => m.WorkShowcase)
);
const Services = dynamic(() =>
  import("@/components/sections/services").then((m) => m.Services)
);
const Testimonials = dynamic(() =>
  import("@/components/sections/testimonials").then((m) => m.Testimonials)
);
const FinalCta = dynamic(() =>
  import("@/components/sections/final-cta").then((m) => m.FinalCta)
);

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
      <Hero products={spotlightProducts} />
      <div className="order-2 lg:order-none">
        <EquipmentStrip />
      </div>
      <div className="order-4 lg:order-none">
        <FeaturedEquipment products={fallbackGrid} />
      </div>
      <div className="order-3 lg:order-none">
        <CategoryExperience />
      </div>
      <div className="order-6 lg:order-none">
        <BuildYourKit />
      </div>
      <div className="order-7 lg:order-none">
        <WhyOutta />
      </div>
      <div className="order-5 lg:order-none">
        <WorkShowcase />
      </div>
      <div className="hidden lg:block">
        <Services />
      </div>
      <div className="hidden lg:block">
        <Testimonials />
      </div>
      <div className="order-8 lg:order-none">
        <FinalCta />
      </div>
    </div>
  );
}
