"use server";

import { loadLiveCatalogue } from "@/lib/catalogue/live-server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { buildBooking } from "./booking";

export interface KitRequestInput {
  /**
   * `packageSlug`/`packageTierSlug` say "this line belongs to that package".
   * They're only a claim — the server checks them against OUTTA's own package
   * data and prices the order itself; any price sent from the browser is ignored.
   */
  items: { productSlug: string; quantity: number; packageSlug?: string; packageTierSlug?: string }[];
  startDate?: string;
  endDate?: string;
  customerName?: string;
  customerPhone?: string;
  projectName?: string;
  productionType?: string;
  notes?: string;
}

/** A repeat of the same order from the same phone inside this window is the same order, not a new one. */
const DUPLICATE_WINDOW_MS = 2 * 60_000;

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
 * Public server action: the payload is untrusted. Product names, rates and
 * package prices are looked up server-side (see `buildBooking`) rather than
 * taken from the client. Package bookings keep their package name, tier and
 * price inside `kit_snapshot`, so they stay identifiable even if the package
 * is renamed or repriced later.
 */
export async function recordKitRequest(input: KitRequestInput): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  if (!input || !Array.isArray(input.items)) return;

  // Make sure this server has the current catalogue and package edits before pricing.
  await loadLiveCatalogue();

  const booking = buildBooking(input);
  if (!booking.ok) {
    console.error("[kit-request] Not recorded:", booking.error);
    return;
  }
  for (const warning of booking.warnings) console.warn("[kit-request]", warning);

  const customerPhone = cleanText(input.customerPhone, 40);
  const notes = [cleanText(input.notes, 2000), ...booking.warnings.map((w) => `[Note] ${w}`)]
    .filter(Boolean)
    .join("\n");

  // Same phone, same kit, same total, moments ago → already recorded.
  if (customerPhone) {
    const since = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
    const { data: recent } = await supabase
      .from("quote_requests")
      .select("kit_snapshot, estimated_total")
      .eq("customer_phone", customerPhone)
      .gte("created_at", since)
      .limit(5);
    const same = (recent ?? []).some(
      (row) =>
        Number(row.estimated_total ?? 0) === Number(booking.estimatedTotal ?? 0) &&
        JSON.stringify(row.kit_snapshot) === JSON.stringify(booking.kit)
    );
    if (same) return;
  }

  const { error } = await supabase.from("quote_requests").insert({
    status: "new",
    start_date: booking.startDate || null,
    end_date: booking.endDate || null,
    rental_days: booking.rentalDays,
    estimated_total: booking.estimatedTotal,
    kit_snapshot: booking.kit,
    customer_name: cleanText(input.customerName, 120),
    customer_phone: customerPhone,
    project_name: cleanText(input.projectName, 200),
    project_type: cleanText(input.productionType, 100),
    project_description: notes || null,
  });

  if (error) console.error("[kit-request] Failed to record kit request:", error.message);
}

export interface EnquiryInput {
  kind: "contact" | "consultation";
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

/**
 * Records a Contact form or consultation message so it appears under
 * Enquiries in admin. Like `recordKitRequest`, runs in the background next to
 * the WhatsApp hand-off and never surfaces errors to the visitor.
 */
export async function recordEnquiry(input: EnquiryInput): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase || !input) return;
  if (input.kind !== "contact" && input.kind !== "consultation") return;

  const row = {
    kind: input.kind,
    name: cleanText(input.name, 120),
    email: cleanText(input.email, 200),
    phone: cleanText(input.phone, 40),
    message: cleanText(input.message, 4000),
  };
  if (!row.name && !row.message) return;

  const { error } = await supabase.from("enquiries").insert(row);
  if (error) console.error("[enquiry] Failed to record enquiry:", error.message);
}
