import type { Metadata } from "next";

import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const metadata: Metadata = {
  title: "Equipment",
};

export default function EquipmentPage() {
  return <CatalogueView />;
}
