import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "A look at the productions OUTTA RENTALS equipment has supported, across commercial, documentary, music video and live production work.",
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
