/**
 * Hand-written row shapes mirroring `schema.sql`. Scoped to the tables the
 * app actually queries today (catalogue reads + quote writes). Regenerate
 * with the Supabase CLI (`supabase gen types typescript`) once a real
 * project exists — these are a stand-in until then, kept in sync by hand.
 *
 * The Supabase clients (`src/lib/supabase/{client,server}.ts`) are
 * deliberately left untyped — hand-rolled generics for nested/embedded
 * selects (joins) are brittle without real codegen. Query call sites cast
 * results against these interfaces instead.
 */

export type ProductStatus =
  | "available"
  | "unavailable"
  | "maintenance"
  | "reserved"
  | "coming_soon";

export interface BrandRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
}

export interface ProductImageRow {
  url: string;
  alt: string;
  is_primary: boolean;
  order: number;
}

export interface ProductSpecificationRow {
  label: string;
  value: string;
  unit: string | null;
  group: string | null;
  order: number;
}

export interface RentalRateRow {
  period: "day" | "weekend" | "week" | "month";
  price: number;
  currency: string;
}

/** Shape returned by the nested `products` select in `db.ts`. */
export interface ProductQueryRow {
  id: string;
  slug: string;
  sku: string;
  name: string;
  short_description: string;
  description: string | null;
  status: ProductStatus;
  stock_quantity: number;
  tags: string[];
  included: string[];
  featured: boolean;
  is_new: boolean;
  brand: { slug: string } | null;
  category: { slug: string } | null;
  product_images: ProductImageRow[];
  product_specifications: ProductSpecificationRow[];
  rental_rates: RentalRateRow[];
}

export interface ProductAccessoryRow {
  product_id: string;
  accessory: { slug: string } | null;
}

export interface ProductCompatibilityRow {
  product_id: string;
  compatible: { slug: string } | null;
}

export interface QuoteRequestInsert {
  status: "pending" | "reviewed" | "quoted" | "converted" | "declined";
  start_date: string;
  end_date: string;
  rental_days: number;
  estimated_total: number;
  kit_snapshot: unknown;
  project_name: string;
  project_type: string;
  shoot_location: string;
  production_days: number | null;
  crew_size: number | null;
  project_description: string | null;
  customer_name: string;
  customer_company: string | null;
  customer_email: string;
  customer_phone: string;
  customer_whatsapp: string | null;
  delivery_method: "pickup" | "delivery";
  delivery_location: string | null;
  delivery_instructions: string | null;
}
