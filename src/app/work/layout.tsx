import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { showWorkSection } from "@/config/site";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "A look at the productions OUTTA RENTALS equipment has supported, across commercial, documentary, music video and live production work.",
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  // Sample projects only for now — see showWorkSection in src/config/site.ts.
  if (!showWorkSection) notFound();
  return children;
}
