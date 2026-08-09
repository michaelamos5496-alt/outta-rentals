import type { Metadata } from "next";

import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const metadata: Metadata = {
  title: "Grip",
};

export default function GripPage() {
  return <CatalogueView lockedCategory="grip" />;
}
