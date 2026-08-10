import dynamic from "next/dynamic";

import { Hero } from "@/components/sections/hero";
import { EquipmentStrip } from "@/components/sections/equipment-strip";

// Below-the-fold sections split into their own chunks — keeps the initial
// bundle (and main-thread work during the LCP window) limited to what's
// actually visible on load. Still server-rendered (ssr: true, the default)
// so content and SEO are unaffected.
const FeaturedEquipment = dynamic(() =>
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

export default function Home() {
  return (
    <>
      <Hero />
      <EquipmentStrip />
      <FeaturedEquipment />
      <CategoryExperience />
      <BuildYourKit />
      <WhyOutta />
      <WorkShowcase />
      <Services />
      <Testimonials />
      <FinalCta />
    </>
  );
}
