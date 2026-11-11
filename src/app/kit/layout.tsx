import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review and manage the equipment in your OUTTA RENTALS cart.",
  robots: { index: false, follow: true },
};

export default function KitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
