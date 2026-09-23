import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import * as memory from "./store";
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
    .select(QUOTE_COLUMNS)
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

export async function updateQuoteStatus(id: string, status: AdminQuoteStatus): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return Boolean(memory.updateQuoteStatus(id, status));

  const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
  if (error) throw new Error(`Couldn't update status: ${error.message}`);
  return true;
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
