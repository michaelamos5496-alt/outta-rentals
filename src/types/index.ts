/**
 * OUTTA RENTALS — Core domain types.
 *
 * These mirror the Supabase-ready schema in `src/lib/supabase/schema.ts`.
 * Kept intentionally extensible: optional fields represent data that will
 * be populated as later phases wire up the real backend.
 */

export type ID = string;
export type ISODateString = string;

/* ------------------------------------------------------------------ */
/* Catalogue                                                          */
/* ------------------------------------------------------------------ */

export interface Brand {
  id: ID;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
}

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  parentId?: ID | null;
  imageUrl?: string;
}

export type SpecUnit =
  | "mm"
  | "kg"
  | "g"
  | "in"
  | "ft"
  | "m"
  | "W"
  | "V"
  | "fps"
  | "K"
  | "stops"
  | "other";

export interface ProductSpecification {
  id: ID;
  productId: ID;
  label: string;
  value: string;
  unit?: SpecUnit;
  group?: string;
  order?: number;
}

export interface ProductImage {
  id: ID;
  productId: ID;
  url: string;
  alt: string;
  isPrimary?: boolean;
  order?: number;
}

export interface ProductAccessory {
  id: ID;
  productId: ID;
  accessoryProductId: ID;
  included: boolean;
  quantity: number;
}

export interface ProductCompatibility {
  id: ID;
  productId: ID;
  compatibleProductId: ID;
  note?: string;
}

export type RentalPeriod = "day" | "weekend" | "week" | "month";

export interface RentalRate {
  id: ID;
  productId: ID;
  period: RentalPeriod;
  price: number;
  currency: string;
  discountPercent?: number;
}

export type AvailabilityStatus = "available" | "reserved" | "maintenance" | "unavailable";

export interface Availability {
  id: ID;
  productId: ID;
  date: ISODateString;
  status: AvailabilityStatus;
  quantityAvailable: number;
}

export interface Product {
  id: ID;
  name: string;
  slug: string;
  sku: string;
  brandId: ID;
  brand?: Brand;
  categoryId: ID;
  category?: Category;
  shortDescription: string;
  description?: string;
  images: ProductImage[];
  specifications?: ProductSpecification[];
  accessories?: ProductAccessory[];
  compatibility?: ProductCompatibility[];
  rentalRates?: RentalRate[];
  featured?: boolean;
  isNew?: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/* ------------------------------------------------------------------ */
/* Kit lists (build-a-kit)                                            */
/* ------------------------------------------------------------------ */

export interface KitItem {
  id: ID;
  kitId: ID;
  productId: ID;
  product?: Product;
  quantity: number;
  rentalDays?: number;
}

export interface Kit {
  id: ID;
  customerId?: ID;
  name?: string;
  items: KitItem[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/* ------------------------------------------------------------------ */
/* Customers, quotes, orders                                          */
/* ------------------------------------------------------------------ */

export interface Customer {
  id: ID;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  createdAt: ISODateString;
}

export type QuoteRequestStatus = "pending" | "reviewed" | "quoted" | "converted" | "declined";

export interface QuoteRequest {
  id: ID;
  customerId?: ID;
  customer?: Customer;
  kitId?: ID;
  kit?: Kit;
  startDate: ISODateString;
  endDate: ISODateString;
  projectDescription?: string;
  status: QuoteRequestStatus;
  createdAt: ISODateString;
}

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "out"
  | "returned"
  | "cancelled";

export interface Order {
  id: ID;
  customerId: ID;
  customer?: Customer;
  kitId?: ID;
  quoteRequestId?: ID;
  status: OrderStatus;
  startDate: ISODateString;
  endDate: ISODateString;
  total: number;
  currency: string;
  createdAt: ISODateString;
}

/* ------------------------------------------------------------------ */
/* Marketing / content                                                */
/* ------------------------------------------------------------------ */

export interface Project {
  id: ID;
  title: string;
  slug: string;
  summary: string;
  coverImageUrl: string;
  clientName?: string;
  serviceIds?: ID[];
  productIds?: ID[];
  publishedAt?: ISODateString;
}

export interface Service {
  id: ID;
  name: string;
  slug: string;
  description: string;
  iconName?: string;
}

export interface Testimonial {
  id: ID;
  authorName: string;
  authorRole?: string;
  authorCompany?: string;
  quote: string;
  avatarUrl?: string;
  projectId?: ID;
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export type AdminRole = "owner" | "manager" | "staff";

export interface AdminUser {
  id: ID;
  fullName: string;
  email: string;
  role: AdminRole;
}
