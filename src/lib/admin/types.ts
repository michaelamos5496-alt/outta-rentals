import type { DemoProduct } from "@/lib/catalogue";

export interface AdminProductImage {
  url: string;
  alt: string;
}

export interface AdminProduct extends DemoProduct {
  images: AdminProductImage[];
  archived: boolean;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export type AdminQuoteStatus =
  | "new"
  | "reviewing"
  | "quoted"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface AdminQuoteNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface AdminQuoteKitLine {
  productSlug: string;
  productName: string;
  quantity: number;
  dayRate: number;
}

export interface AdminQuote {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;
  projectName: string;
  projectType: string;
  shootLocation: string;
  startDate: string;
  endDate: string;
  rentalDays: number;
  estimatedTotal: number;
  kit: AdminQuoteKitLine[];
  status: AdminQuoteStatus;
  notes: AdminQuoteNote[];
  createdAt: string;
}

export interface AdminCustomer {
  name: string;
  email: string;
  phone: string;
  company: string;
  quotes: AdminQuote[];
}
