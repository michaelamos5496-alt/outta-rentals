"use server";

import { getProductBySlug } from "@/lib/catalogue";
import { calculateRentalDays, validateDateRange } from "@/lib/kit/rental";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface KitRequestInput {
  items: { productSlug: string; quantity: number }[];
  startDate?: string;
  endDate?: string;
  customerName?: string;
  customerPhone?: string;
  projectName?: string;
  productionType?: string;
  notes?: string;
}

const MAX_ITEMS = 100;
const MAX_QUANTITY = 999;

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed || null;
}

/**
 * Records a "Send Kit" request so it appears in the admin dashboard. Called
 * in the background when the customer taps Send Kit — the WhatsApp message is
 * the actual order, this is OUTTA's own record of it, so failures are logged
 * and never surfaced to the customer.
 *
 * Public server action: the payload is untrusted. Product names and rates are
 * looked up server-side from slugs rather than taken from the client.
 */
export async function recordKitRequest(input: KitRequestInput): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  if (!input || !Array.isArray(input.items)) return;

  const kit = input.items
    .slice(0, MAX_ITEMS)
    .flatMap((item) => {
      if (!item || typeof item.productSlug !== "string") return [];
      if (!Number.isInteger(item.quantity) || item.quantity < 1) return [];
      const product = getProductBySlug(item.productSlug);
      if (!product) return [];
      return [
        {
          productSlug: product.slug,
          productName: product.name,
          quantity: Math.min(item.quantity, MAX_QUANTITY),
          dayRate: product.dayRate,
        },
      ];
    });
  if (kit.length === 0) return;

  const startDate = typeof input.startDate === "string" ? input.startDate : "";
  const endDate = typeof input.endDate === "string" ? input.endDate : "";
  const datesValid = validateDateRange(startDate, endDate).valid;
  const rentalDays = datesValid ? calculateRentalDays(startDate, endDate) : null;
  const estimatedTotal = rentalDays
    ? kit.reduce((sum, line) => sum + line.dayRate * line.quantity * rentalDays, 0)
    : null;

  const { error } = await supabase.from("quote_requests").insert({
    status: "new",
    start_date: datesValid ? startDate : null,
    end_date: datesValid ? endDate : null,
    rental_days: rentalDays,
    estimated_total: estimatedTotal,
    kit_snapshot: kit,
    customer_name: cleanText(input.customerName, 120),
    customer_phone: cleanText(input.customerPhone, 40),
    project_name: cleanText(input.projectName, 200),
    project_type: cleanText(input.productionType, 100),
    project_description: cleanText(input.notes, 2000),
  });

  if (error) console.error("[kit-request] Failed to record kit request:", error.message);
}
