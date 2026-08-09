"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  validateCustomerDetails,
  validateDeliveryDetails,
  validateProjectDetails,
} from "./validation";
import type { QuoteSubmissionPayload } from "./types";
import type { QuoteRequestInsert } from "@/lib/supabase/database.types";

export type SubmitQuoteResult = { ok: true } | { ok: false; error: string };

/**
 * Persists a quote request to Supabase (`quote_requests`, extended per
 * `src/lib/supabase/schema.sql`). No Supabase project is connected yet in
 * this environment — `getSupabaseServerClient()` returns `null` until
 * `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are set, in which
 * case the request is validated and logged server-side but not persisted,
 * so the UI flow can still be built and tested end-to-end.
 */
export async function submitQuoteRequest(
  payload: QuoteSubmissionPayload
): Promise<SubmitQuoteResult> {
  if (payload.kit.length === 0) {
    return { ok: false, error: "Your kit is empty." };
  }
  if (!payload.startDate || !payload.endDate || payload.rentalDays < 1) {
    return { ok: false, error: "Choose valid rental dates before submitting." };
  }

  const projectErrors = validateProjectDetails(payload.project);
  const customerErrors = validateCustomerDetails(payload.customer);
  const deliveryErrors = validateDeliveryDetails(payload.delivery);
  if (
    Object.keys(projectErrors).length > 0 ||
    Object.keys(customerErrors).length > 0 ||
    Object.keys(deliveryErrors).length > 0
  ) {
    return { ok: false, error: "Some details are missing or invalid. Please review the form." };
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    console.warn(
      "[quote] Supabase is not configured — quote request validated but not persisted.",
      payload
    );
    return { ok: true };
  }

  const insertPayload: QuoteRequestInsert = {
    status: "new",
    start_date: payload.startDate,
    end_date: payload.endDate,
    rental_days: payload.rentalDays,
    estimated_total: payload.estimatedTotal,
    kit_snapshot: payload.kit,
    project_name: payload.project.projectName,
    project_type: payload.project.projectType,
    shoot_location: payload.project.shootLocation,
    production_days: payload.project.productionDays ? Number(payload.project.productionDays) : null,
    crew_size: payload.project.crewSize ? Number(payload.project.crewSize) : null,
    project_description: payload.project.additionalNotes || null,
    customer_name: payload.customer.name,
    customer_company: payload.customer.company || null,
    customer_email: payload.customer.email,
    customer_phone: payload.customer.phone,
    customer_whatsapp: payload.customer.whatsapp || null,
    delivery_method: payload.delivery.method || "pickup",
    delivery_location: payload.delivery.location || null,
    delivery_instructions: payload.delivery.instructions || null,
  };

  const { error } = await supabase.from("quote_requests").insert(insertPayload);

  if (error) {
    console.error("[quote] Supabase insert failed:", error.message);
    return { ok: false, error: "We couldn't submit your request. Please try again." };
  }

  return { ok: true };
}
