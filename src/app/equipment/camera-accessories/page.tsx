import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 60; // seconds — keep inventory reasonably fresh once a real DB is connected

export const metadata: Metadata = {
  title: "Camera Accessories",
  description: "Wireless focus, monitors, jibs and on-set camera support.",
};

export default async function CameraAccessoriesPage() {
  const products = await fetchProductsByCategory("camera-accessories");
  return <CatalogueView products={products} lockedCategory="camera-accessories" />;
}
