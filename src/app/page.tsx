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
