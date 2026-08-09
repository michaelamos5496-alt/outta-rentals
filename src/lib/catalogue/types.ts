/**
 * Mirrors the `product_status` enum in `src/lib/supabase/schema.sql`. This
 * is the product's current operational status, distinct from date-specific
 * availability (see `checkProductAvailability` in `src/lib/catalogue/db.ts`).
 */
export type ProductAvailability =
  | "available"
  | "unavailable"
  | "maintenance"
  | "reserved"
  | "coming_soon";

export interface DemoProductSpec {
  label: string;
  value: string;
  group?: string;
}

/**
 * Demo catalogue product. Deliberately denormalized (slug references
 * instead of joined rows) for easy hand-authoring and client-side
 * filtering — the relational shape this will become is defined in
 * `src/lib/supabase/schema.sql` (products / rental_rates / availability /
 * product_accessories / product_compatibility).
 */
export interface DemoProduct {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brandSlug: string;
  categorySlug: string;
  tags: string[];
  shortDescription: string;
  description: string;
  dayRate: number;
  weekRate: number;
  currency: string;
  availability: ProductAvailability;
  featured?: boolean;
  isNew?: boolean;
  specifications: DemoProductSpec[];
  included: string[];
  accessorySlugs: string[];
  compatibleSlugs: string[];
}
