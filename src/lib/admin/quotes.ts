import "server-only";

import { calculateRentalDays } from "@/lib/kit/rental";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import * as memory from "./store";
import type { ProductAvailability } from "@/lib/catalogue";
import type { AdminQuote, AdminQuoteKitLine, AdminQuoteStatus } from "./types";

/**
 * Quote requests (Send Kit orders) for the admin dashboard.
 *
 * Reads and writes `quote_requests` / `quote_notes` in Supabase via the
 * service role when a project is connected; otherwise falls back to the
 * in-memory demo store (`./store`) so the dashboard still works in local
 * development. Callers must already have checked `getAdminSession()`.
 */

interface QuoteRow {
  id: string;
  status: AdminQuoteStatus;
  start_date: string | null;
  end_date: string | null;
  rental_days: number | null;
  estimated_total: number | string | null;
  kit_snapshot: AdminQuoteKitLine[] | null;
  project_name: string | null;
  project_type: string | null;
  shoot_location: string | null;
  project_description: string | null;
  customer_name: string | null;
  customer_company: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  created_at: string;
  quote_notes?: { id: string; note: string; created_at: string }[];
}

const QUOTE_COLUMNS =
  "id, status, start_date, end_date, rental_days, estimated_total, kit_snapshot, project_name, project_type, shoot_location, project_description, customer_name, customer_company, customer_email, customer_phone, created_at";

function toAdminQuote(row: QuoteRow): AdminQuote {
  return {
    id: row.id,
    customerName: row.customer_name ?? "",
    customerEmail: row.customer_email ?? "",
    customerPhone: row.customer_phone ?? "",
    customerCompany: row.customer_company ?? "",
    projectName: row.project_name ?? "",
    projectType: row.project_type ?? "",
    shootLocation: row.shoot_location ?? "",
    projectNotes: row.project_description ?? "",
    startDate: row.start_date ?? "",
    endDate: row.end_date ?? "",
    rentalDays: row.rental_days ?? 0,
    estimatedTotal: Number(row.estimated_total ?? 0),
    kit: Array.isArray(row.kit_snapshot) ? row.kit_snapshot : [],
    status: row.status,
    notes: [...(row.quote_notes ?? [])]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((n) => ({ id: n.id, text: n.note, createdAt: n.created_at })),
    createdAt: row.created_at,
  };
}

export async function listQuotes(): Promise<AdminQuote[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return memory.listQuotes();

  const { data, error } = await supabase
    .from("quote_requests")
    .select(`${QUOTE_COLUMNS}, quote_notes (id, note, created_at)`)
    .order("created_at", { ascending: false })
    .limit(500)
    .returns<QuoteRow[]>();
  if (error) throw new Error(`Couldn't load quotes: ${error.message}`);
  return (data ?? []).map(toAdminQuote);
}

export async function getQuoteById(id: string): Promise<AdminQuote | undefined> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return memory.getQuoteById(id);
  // Supabase ids are UUIDs; anything else can't exist (and would error).
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;

  const { data, error } = await supabase
    .from("quote_requests")
    .select(`${QUOTE_COLUMNS}, quote_notes (id, note, created_at)`)
    .eq("id", id)
    .maybeSingle<QuoteRow>();
  if (error) throw new Error(`Couldn't load quote: ${error.message}`);
  return data ? toAdminQuote(data) : undefined;
}

export interface BookingConflict {
  productName: string;
  requested: number;
  available: number;
}

export type StatusUpdateResult =
  | { ok: true }
  | { ok: false; error: "no_dates" | "not_found" | "invalid_status" | "failed" }
  | { ok: false; error: "conflict"; conflicts: BookingConflict[] };

/**
 * Changes an order's status. In Supabase this runs `set_quote_status()`,
 * which books the order's equipment for its dates on "confirmed" (refusing
 * if that would double-book) and frees them on any other status.
 */
export async function updateQuoteStatus(
  id: string,
  status: AdminQuoteStatus
): Promise<StatusUpdateResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return memory.updateQuoteStatus(id, status) ? { ok: true } : { ok: false, error: "not_found" };
  }

  const { data, error } = await supabase.rpc("set_quote_status", {
    p_quote_id: id,
    p_status: status,
  });
  if (error) {
    console.error("[admin/quotes] set_quote_status failed:", error.message);
    return { ok: false, error: "failed" };
  }
  return data as StatusUpdateResult;
}

/** Sets an order's rental dates. Refused while confirmed (its equipment is booked). */
export async function updateQuoteDates(
  id: string,
  startDate: string,
  endDate: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const quote = await getQuoteById(id);
  if (!quote) return { ok: false, error: "Order not found." };
  if (quote.status === "confirmed") {
    return { ok: false, error: "Change the status from Confirmed before editing dates." };
  }
  const rentalDays = calculateRentalDays(startDate, endDate);
  if (!rentalDays) return { ok: false, error: "End date must be on or after the start date." };
  const estimatedTotal = quote.kit.reduce(
    (sum, line) => sum + line.dayRate * line.quantity * rentalDays,
    0
  );

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    Object.assign(quote, { startDate, endDate, rentalDays, estimatedTotal });
    memory.replaceQuote(quote);
    return { ok: true };
  }

  const { error } = await supabase
    .from("quote_requests")
    .update({
      start_date: startDate,
      end_date: endDate,
      rental_days: rentalDays,
      estimated_total: estimatedTotal,
    })
    .eq("id", id);
  if (error) {
    console.error("[admin/quotes] Date update failed:", error.message);
    return { ok: false, error: "Couldn't save the dates. Please try again." };
  }
  return { ok: true };
}

export async function addQuoteNote(id: string, text: string): Promise<boolean> {
  const note = text.trim().slice(0, 4000);
  if (!note) return false;
  const supabase = getSupabaseServerClient();
  if (!supabase) return Boolean(memory.addQuoteNote(id, note));

  const { error } = await supabase
    .from("quote_notes")
    .insert({ quote_request_id: id, note });
  if (error) throw new Error(`Couldn't save note: ${error.message}`);
  return true;
}

// --------------------------------------------------------------- Customers

export interface AdminCustomerSummary {
  /** URL-safe key: phone digits, else lowercased email, else lowercased name. */
  key: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  quotes: AdminQuote[];
}

function customerKey(quote: AdminQuote): string {
  const digits = quote.customerPhone.replace(/\D/g, "").replace(/^0/, "233");
  if (digits) return digits;
  if (quote.customerEmail) return quote.customerEmail.trim().toLowerCase();
  return quote.customerName.trim().toLowerCase();
}

/** Customers are derived from orders, grouped by phone number (or email/name). */
export async function listCustomers(): Promise<AdminCustomerSummary[]> {
  const byKey = new Map<string, AdminCustomerSummary>();
  for (const quote of await listQuotes()) {
    const key = customerKey(quote);
    if (!key) continue;
    const existing = byKey.get(key);
    if (existing) {
      existing.quotes.push(quote);
      existing.name ||= quote.customerName;
      existing.email ||= quote.customerEmail;
      existing.phone ||= quote.customerPhone;
      existing.company ||= quote.customerCompany;
    } else {
      byKey.set(key, {
        key,
        name: quote.customerName,
        email: quote.customerEmail,
        phone: quote.customerPhone,
        company: quote.customerCompany,
        quotes: [quote],
      });
    }
  }
  return Array.from(byKey.values()).sort((a, b) =>
    (a.name || a.phone).localeCompare(b.name || b.phone)
  );
}

export async function getCustomerByKey(key: string): Promise<AdminCustomerSummary | undefined> {
  return (await listCustomers()).find((c) => c.key === key);
}

// ------------------------------------------------------------------- Stock

export interface ProductStockRow {
  units: number;
  /** Saved status, or null to use the catalogue default. */
  status: ProductAvailability | null;
}

/** Saved stock per product slug (products without a row: 1 unit, default status). */
export async function listProductStock(): Promise<Map<string, ProductStockRow>> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return new Map();
  const { data, error } = await supabase.from("product_stock").select("product_slug, units, status");
  if (error) throw new Error(`Couldn't load stock: ${error.message}`);
  return new Map(
    (data ?? []).map((row) => [
      row.product_slug as string,
      { units: row.units as number, status: (row.status as ProductAvailability | null) ?? null },
    ])
  );
}

export async function setProductStatus(slug: string, status: ProductAvailability): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;
  // Upsert only the status so an existing units-owned value is kept.
  const { data: existing } = await supabase
    .from("product_stock")
    .select("units")
    .eq("product_slug", slug)
    .maybeSingle();
  const { error } = await supabase.from("product_stock").upsert({
    product_slug: slug,
    units: existing?.units ?? 1,
    status,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error("[admin/quotes] Status update failed:", error.message);
    return false;
  }
  return true;
}

export async function setProductUnits(slug: string, units: number): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;
  // Update if the row exists (keeping its status); otherwise insert.
  const { data: updated, error: updateError } = await supabase
    .from("product_stock")
    .update({ units, updated_at: new Date().toISOString() })
    .eq("product_slug", slug)
    .select("product_slug");
  if (updateError) {
    console.error("[admin/quotes] Stock update failed:", updateError.message);
    return false;
  }
  if (updated && updated.length > 0) return true;
  const { error } = await supabase.from("product_stock").insert({ product_slug: slug, units });
  if (error) {
    console.error("[admin/quotes] Stock update failed:", error.message);
    return false;
  }
  return true;
}
