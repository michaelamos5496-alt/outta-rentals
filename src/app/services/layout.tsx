import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Delivery, technical support, kit customization and on-set assistance — the services OUTTA RENTALS wraps around every equipment rental.",
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
