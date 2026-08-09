import "server-only";

import { products as staticProducts } from "@/lib/catalogue/products";
import { categories as staticCategories } from "@/lib/catalogue/categories";
import type { AdminCategory, AdminProduct, AdminQuote } from "./types";

/**
 * In-memory admin data store.
 *
 * No Supabase project is connected (see `src/lib/supabase/server.ts`), and
 * admin mutations need somewhere real to write for this phase to be
 * testable at all. This module is that place: seeded once per server
 * process from the existing demo catalogue, then mutated directly by the
 * CRUD functions below. It resets on every server restart and is never
 * read by the public storefront (which still reads the read-only demo
 * catalogue via `src/lib/catalogue/db.ts`, Supabase-aware since Phase 8).
 *
 * Swapping this for real Supabase writes later means replacing the bodies
 * of the functions in this directory — the call sites in `src/app/admin/**`
 * don't need to change.
 */

let products: AdminProduct[] | null = null;
let categories: AdminCategory[] | null = null;
let quotes: AdminQuote[] | null = null;

function seedProducts(): AdminProduct[] {
  return structuredClone(staticProducts).map((p) => ({
    ...p,
    images: [],
    archived: false,
  }));
}

function seedCategories(): AdminCategory[] {
  return structuredClone(staticCategories).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
  }));
}

function seedQuotes(): AdminQuote[] {
  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 86_400_000).toISOString();

  return [
    {
      id: "quote-seed-1",
      customerName: "Ama Owusu",
      customerEmail: "ama@owusustudio.com",
      customerPhone: "+233 55 123 4567",
      customerCompany: "Owusu Studio",
      projectName: "Coca-Cola Summer Campaign",
      projectType: "Commercial",
      shootLocation: "Accra",
      startDate: daysAgo(-5),
      endDate: daysAgo(-2),
      rentalDays: 3,
      estimatedTotal: 915,
      kit: [
        { productSlug: "sony-fx6", productName: "Sony FX6", quantity: 1, dayRate: 220 },
        {
          productSlug: "aputure-600d",
          productName: "Aputure LS 600d Pro",
          quantity: 2,
          dayRate: 95,
        },
      ],
      status: "new",
      notes: [],
      createdAt: daysAgo(1),
    },
    {
      id: "quote-seed-2",
      customerName: "Kwame Boateng",
      customerEmail: "kwame@boatengfilms.com",
      customerPhone: "+233 24 987 6543",
      customerCompany: "Boateng Films",
      projectName: "Independent Feature — Dust",
      projectType: "Feature Film",
      shootLocation: "Kumasi",
      startDate: daysAgo(-14),
      endDate: daysAgo(-4),
      rentalDays: 10,
      estimatedTotal: 12500,
      kit: [
        {
          productSlug: "arri-alexa-mini-lf",
          productName: "ARRI Alexa Mini LF",
          quantity: 1,
          dayRate: 650,
        },
        {
          productSlug: "sigma-cine-prime-set",
          productName: "Sigma Cine Prime Five-Lens Set",
          quantity: 1,
          dayRate: 240,
        },
      ],
      status: "reviewing",
      notes: [
        {
          id: "note-1",
          text: "Asked about extending to 14 days — waiting to hear back.",
          createdAt: daysAgo(2),
        },
      ],
      createdAt: daysAgo(3),
    },
    {
      id: "quote-seed-3",
      customerName: "Efua Mensah",
      customerEmail: "efua@mensahcreative.com",
      customerPhone: "+233 20 555 1122",
      customerCompany: "Mensah Creative",
      projectName: "Brand Documentary",
      projectType: "Documentary",
      shootLocation: "Cape Coast",
      startDate: daysAgo(10),
      endDate: daysAgo(15),
      rentalDays: 5,
      estimatedTotal: 1450,
      kit: [
        { productSlug: "sony-fx3", productName: "Sony FX3", quantity: 1, dayRate: 145 },
        {
          productSlug: "sennheiser-ew-wireless-lav",
          productName: "Sennheiser EW-DX Wireless Lavalier Kit",
          quantity: 1,
          dayRate: 55,
        },
      ],
      status: "quoted",
      notes: [
        { id: "note-2", text: "Sent quotation PDF via email.", createdAt: daysAgo(4) },
      ],
      createdAt: daysAgo(6),
    },
    {
      id: "quote-seed-4",
      customerName: "Nana Adjei",
      customerEmail: "nana@adjeiproductions.com",
      customerPhone: "+233 27 444 8899",
      customerCompany: "Adjei Productions",
      projectName: "Wedding — Adjei/Owusu",
      projectType: "Wedding",
      shootLocation: "Accra",
      startDate: daysAgo(20),
      endDate: daysAgo(20),
      rentalDays: 1,
      estimatedTotal: 245,
      kit: [
        { productSlug: "sony-fx3", productName: "Sony FX3", quantity: 1, dayRate: 145 },
        {
          productSlug: "sony-70-200mm-gm-ii",
          productName: "Sony FE 70–200mm f/2.8 GM II",
          quantity: 1,
          dayRate: 70,
        },
      ],
      status: "confirmed",
      notes: [],
      createdAt: daysAgo(25),
    },
    {
      id: "quote-seed-5",
      customerName: "Yaw Darko",
      customerEmail: "yaw@darkomedia.com",
      customerPhone: "+233 55 222 3344",
      customerCompany: "Darko Media",
      projectName: "Product Launch Livestream",
      projectType: "Live Production",
      shootLocation: "Accra",
      startDate: daysAgo(35),
      endDate: daysAgo(34),
      rentalDays: 2,
      estimatedTotal: 990,
      kit: [
        { productSlug: "sony-fx6", productName: "Sony FX6", quantity: 2, dayRate: 220 },
        {
          productSlug: "zoom-field-recorder",
          productName: "8-Channel Field Audio Recorder",
          quantity: 1,
          dayRate: 60,
        },
      ],
      status: "completed",
      notes: [{ id: "note-3", text: "Wrapped, gear returned in good condition.", createdAt: daysAgo(33) }],
      createdAt: daysAgo(38),
    },
    {
      id: "quote-seed-6",
      customerName: "Abena Frimpong",
      customerEmail: "abena@frimpongvisuals.com",
      customerPhone: "+233 24 111 2233",
      customerCompany: "Frimpong Visuals",
      projectName: "Music Video — Loose Change",
      projectType: "Music Video",
      shootLocation: "Tema",
      startDate: daysAgo(-8),
      endDate: daysAgo(-8),
      rentalDays: 1,
      estimatedTotal: 890,
      kit: [
        { productSlug: "red-v-raptor", productName: "RED V-RAPTOR 8K VV", quantity: 1, dayRate: 595 },
        {
          productSlug: "aputure-600x",
          productName: "Aputure LS 600x Pro",
          quantity: 1,
          dayRate: 105,
        },
      ],
      status: "cancelled",
      notes: [{ id: "note-4", text: "Client postponed the shoot indefinitely.", createdAt: daysAgo(1) }],
      createdAt: daysAgo(5),
    },
  ];
}

function getProductsStore(): AdminProduct[] {
  if (!products) products = seedProducts();
  return products;
}

function getCategoriesStore(): AdminCategory[] {
  if (!categories) categories = seedCategories();
  return categories;
}

function getQuotesStore(): AdminQuote[] {
  if (!quotes) quotes = seedQuotes();
  return quotes;
}

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------- Products

export function listProducts(): AdminProduct[] {
  return getProductsStore();
}

export function getProductById(id: string): AdminProduct | undefined {
  return getProductsStore().find((p) => p.id === id);
}

export type AdminProductInput = Omit<AdminProduct, "id">;

export function createProduct(input: AdminProductInput): AdminProduct {
  const store = getProductsStore();
  const product: AdminProduct = {
    ...input,
    id: generateId("prod"),
    slug: input.slug || slugify(input.name),
  };
  store.unshift(product);
  return product;
}

export function updateProduct(
  id: string,
  patch: Partial<AdminProductInput>
): AdminProduct | undefined {
  const store = getProductsStore();
  const index = store.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  store[index] = { ...store[index], ...patch };
  return store[index];
}

export function deleteProduct(id: string): boolean {
  const store = getProductsStore();
  const index = store.findIndex((p) => p.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}

export function setProductArchived(id: string, archived: boolean): AdminProduct | undefined {
  return updateProduct(id, { archived });
}

// -------------------------------------------------------------- Categories

export function listCategories(): AdminCategory[] {
  return getCategoriesStore();
}

export function getCategoryById(id: string): AdminCategory | undefined {
  return getCategoriesStore().find((c) => c.id === id);
}

export type AdminCategoryInput = Omit<AdminCategory, "id">;

export function createCategory(input: AdminCategoryInput): AdminCategory {
  const store = getCategoriesStore();
  const category: AdminCategory = {
    ...input,
    id: generateId("cat"),
    slug: input.slug || slugify(input.name),
  };
  store.push(category);
  return category;
}

export function updateCategory(
  id: string,
  patch: Partial<AdminCategoryInput>
): AdminCategory | undefined {
  const store = getCategoriesStore();
  const index = store.findIndex((c) => c.id === id);
  if (index === -1) return undefined;
  store[index] = { ...store[index], ...patch };
  return store[index];
}

export function deleteCategory(id: string): boolean {
  const store = getCategoriesStore();
  const index = store.findIndex((c) => c.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}

// ------------------------------------------------------------------ Quotes

export function listQuotes(): AdminQuote[] {
  return [...getQuotesStore()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getQuoteById(id: string): AdminQuote | undefined {
  return getQuotesStore().find((q) => q.id === id);
}

export function updateQuoteStatus(
  id: string,
  status: AdminQuote["status"]
): AdminQuote | undefined {
  const quote = getQuoteById(id);
  if (!quote) return undefined;
  quote.status = status;
  return quote;
}

export function addQuoteNote(id: string, text: string): AdminQuote | undefined {
  const quote = getQuoteById(id);
  if (!quote || !text.trim()) return quote;
  quote.notes.push({ id: generateId("note"), text: text.trim(), createdAt: new Date().toISOString() });
  return quote;
}

// --------------------------------------------------------------- Customers

export interface AdminCustomerSummary {
  name: string;
  email: string;
  phone: string;
  company: string;
  quotes: AdminQuote[];
}

export function listCustomers(): AdminCustomerSummary[] {
  const byEmail = new Map<string, AdminCustomerSummary>();
  for (const quote of getQuotesStore()) {
    const existing = byEmail.get(quote.customerEmail);
    if (existing) {
      existing.quotes.push(quote);
    } else {
      byEmail.set(quote.customerEmail, {
        name: quote.customerName,
        email: quote.customerEmail,
        phone: quote.customerPhone,
        company: quote.customerCompany,
        quotes: [quote],
      });
    }
  }
  return Array.from(byEmail.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function getCustomerByEmail(email: string): AdminCustomerSummary | undefined {
  return listCustomers().find((c) => c.email === email);
}
