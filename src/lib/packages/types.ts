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

export interface PackageTier {
  /** e.g. "lite", "yolo", "top-boy" — used in the tier switcher and URLs. */
  slug: string;
  /** Display label, e.g. "LITE", "YOLO", "TOP BOY". */
  label: string;
  /**
   * OUTTA's quoted flat day rate for this exact bundle (already discounted
   * off the sum of its line items). When set, this is shown instead of a
   * live sum of the chosen items' day rates. Required together with
   * `currency` — a tier is either fully flat-priced or not priced at all.
   */
  price?: number;
  currency?: string;
  items: PackageLineItem[];
}

export interface ProductionPackage {
  slug: string;
  name: string;
  description: string;
  /** At least one tier. A package with a single tier renders with no tier switcher. */
  tiers: PackageTier[];
}
