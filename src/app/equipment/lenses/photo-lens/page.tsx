import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { LensTypeTabs } from "@/components/catalogue/lens-type-tabs";

export const revalidate = 86400; // daily safety net — admin edits refresh it straight away (see revalidateStorefront)

export const metadata: Metadata = {
  title: "Photo Lens",
  description: "Stills-style lenses that are compact and fast, used for run-and-gun and gimbal work.",
};

export default async function PhotoLensPage() {
  const products = (await fetchProductsByCategory("lenses")).filter((p) => p.tags.includes("photo-lens"));
  return (
    <CatalogueView
      products={products}
      lockedCategory="lenses"
      title="Photo Lens"
      description="Stills-style lenses that are compact and fast, used for run-and-gun and gimbal work."
      subNav={<LensTypeTabs active="photo" />}
    />
  );
}
