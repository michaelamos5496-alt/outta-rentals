import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 86400; // daily safety net — admin edits refresh it straight away (see revalidateStorefront)

export const metadata: Metadata = {
  title: "Camera Accessories",
  description: "Wireless focus, video transmitters and on-set camera support.",
};

export default async function CameraAccessoriesPage() {
  const products = await fetchProductsByCategory("camera-accessories");
  return <CatalogueView products={products} lockedCategory="camera-accessories" />;
}
