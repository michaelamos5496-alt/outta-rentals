import type { Metadata } from "next";

import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const metadata: Metadata = {
  title: "Cameras",
};

export default function CamerasPage() {
  return <CatalogueView lockedCategory="cameras" />;
}
