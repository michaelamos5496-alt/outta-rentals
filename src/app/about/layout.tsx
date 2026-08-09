import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "OUTTA RENTALS is a production-equipment partner built around the brief, not the biggest gear list — here's what we believe and how we work.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
