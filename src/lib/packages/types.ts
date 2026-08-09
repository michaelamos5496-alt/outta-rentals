export type PackageRole =
  | "Camera"
  | "Lens"
  | "Lighting"
  | "Audio"
  | "Support"
  | "Accessories"
  | "Monitoring";

export interface PackageLineItem {
  role: PackageRole;
  productSlug: string;
  quantity: number;
}

export interface ProductionPackage {
  slug: string;
  name: string;
  description: string;
  items: PackageLineItem[];
}
