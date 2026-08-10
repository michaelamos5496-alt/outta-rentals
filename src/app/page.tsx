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
import { ScrollSnap } from "@/components/home/scroll-snap";

// Statically imported (not next/dynamic) — ScrollSnap needs every section's
// DOM node to exist synchronously when it wires up GSAP on mount, which a
// still-loading/Suspense-deferred section can't guarantee. Passing
// next/dynamic() components as children across the server/client boundary
// into ScrollSnap also hit a real Next.js RSC serialization bug (each lazy
// reference was duplicated in the children array).
export default function Home() {
  return (
    <ScrollSnap>
      {/* Hero + the category chip strip share one slide — the strip is a thin
          nav aid, not enough content to justify its own full-screen slide. */}
      <div className="flex min-h-full flex-col">
        <Hero />
        <EquipmentStrip />
      </div>
      <FeaturedEquipment />
      <CategoryExperience />
      <BuildYourKit />
      <WhyOutta />
      <WorkShowcase />
      <Services />
      <Testimonials />
      <FinalCta />
    </ScrollSnap>
  );
}
