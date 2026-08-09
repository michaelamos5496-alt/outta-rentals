import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Kit",
  description: "Review and manage the equipment kit you've put together with OUTTA RENTALS.",
  robots: { index: false, follow: true },
};

export default function KitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
