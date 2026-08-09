import type { Metadata } from "next";

import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const metadata: Metadata = {
  title: "Drones",
};

export default function DronesPage() {
  return <CatalogueView lockedCategory="drones" />;
}
