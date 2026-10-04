"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "./auth";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  setProductArchived,
  createCategory,
  updateCategory,
  deleteCategory,
  type AdminProductInput,
  type AdminCategoryInput,
} from "./catalogue";
import { invalidateProductCache } from "@/lib/catalogue/db";
import { uploadProductImage, type UploadImageResult } from "./image-upload";
import {
  addQuoteNote,
  deleteQuote,
  markPickedUp,
  markReturned,
  undoTimelineStep,
  setProductStatus,
  setProductUnits,
  updateQuoteDates,
  updateQuoteStatus,
  type StatusUpdateResult,
} from "./quotes";
import type { ProductAvailability } from "@/lib/catalogue";
import type { AdminQuoteStatus } from "./types";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Not authorized.");
  return session;
}

function revalidateStorefront() {
  invalidateProductCache();
  revalidatePath("/equipment", "layout");
  revalidatePath("/", "page");
}

// ---------------------------------------------------------------- Products

export async function uploadProductImageAction(formData: FormData): Promise<UploadImageResult> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };
  return uploadProductImage(file);
}

export async function createProductAction(input: AdminProductInput) {
  await requireAdmin();
  const product = await createProduct(input);
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidateStorefront();
  return product;
}

export async function updateProductAction(id: string, patch: Partial<AdminProductInput>) {
  await requireAdmin();
  const product = await updateProduct(id, patch);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/inventory");
  revalidateStorefront();
  return product;
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const ok = await deleteProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidateStorefront();
  return ok;
}

export async function setProductArchivedAction(id: string, archived: boolean) {
  await requireAdmin();
  const product = await setProductArchived(id, archived);
  revalidatePath("/admin/products");
  revalidateStorefront();
  return product;
}

export async function setProductAvailabilityAction(
  id: string,
  availability: AdminProductInput["availability"]
) {
  await requireAdmin();
  const product = await updateProduct(id, { availability });
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidateStorefront();
  return product;
}

// -------------------------------------------------------------- Categories

export async function createCategoryAction(input: AdminCategoryInput) {
  await requireAdmin();
  const category = await createCategory(input);
  revalidatePath("/admin/categories");
  return category;
}

export async function updateCategoryAction(id: string, patch: Partial<AdminCategoryInput>) {
  await requireAdmin();
  const category = await updateCategory(id, patch);
  revalidatePath("/admin/categories");
  return category;
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  const ok = await deleteCategory(id);
  revalidatePath("/admin/categories");
  return ok;
}

// ------------------------------------------------------------------ Quotes

const validStatuses: AdminQuoteStatus[] = [
  "new",
  "reviewing",
  "quoted",
  "confirmed",
  "completed",
  "cancelled",
];

export async function updateQuoteStatusAction(
  id: string,
  status: AdminQuoteStatus
): Promise<StatusUpdateResult> {
  await requireAdmin();
  if (typeof id !== "string" || !validStatuses.includes(status)) {
    throw new Error("Invalid status update.");
  }
  const result = await updateQuoteStatus(id, status);
  // Booked dates show on product pages — refresh them when bookings change.
  if (result.ok) revalidatePath("/equipment", "layout");
  revalidatePath("/admin/quotes");
  revalidatePath("/admin/orders", "layout");
  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin");
  return result;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function updateQuoteDatesAction(id: string, startDate: string, endDate: string) {
  await requireAdmin();
  if (typeof id !== "string" || !ISO_DATE.test(startDate) || !ISO_DATE.test(endDate)) {
    return { ok: false as const, error: "Choose a valid start and end date." };
  }
  const result = await updateQuoteDates(id, startDate, endDate);
  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin/quotes");
  revalidatePath("/admin/orders", "layout");
  return result;
}

const productStatuses: ProductAvailability[] = [
  "available",
  "reserved",
  "maintenance",
  "coming_soon",
  "unavailable",
];

/** Saved stock status — shown on the live site straight away. */
export async function setProductStatusAction(slug: string, status: ProductAvailability) {
  await requireAdmin();
  if (typeof slug !== "string" || !productStatuses.includes(status)) return false;
  const ok = await setProductStatus(slug, status);
  revalidatePath("/admin/inventory");
  revalidateStorefront();
  return ok;
}

export async function setProductUnitsAction(slug: string, units: number) {
  await requireAdmin();
  if (typeof slug !== "string" || !Number.isInteger(units) || units < 0 || units > 999) {
    return false;
  }
  const ok = await setProductUnits(slug, units);
  revalidatePath("/admin/inventory");
  return ok;
}

function revalidateOrder(id: string) {
  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin/quotes");
  revalidatePath("/admin/orders", "layout");
  revalidatePath("/admin");
}

export async function markPickedUpAction(id: string, method: "pickup" | "delivery") {
  await requireAdmin();
  if (typeof id !== "string" || (method !== "pickup" && method !== "delivery")) {
    return { ok: false as const, error: "Invalid request." };
  }
  const result = await markPickedUp(id, method);
  revalidateOrder(id);
  return result;
}

export async function markReturnedAction(id: string) {
  await requireAdmin();
  if (typeof id !== "string") return { ok: false as const, error: "Invalid request." };
  const result = await markReturned(id);
  revalidateOrder(id);
  revalidatePath("/equipment", "layout");
  return result;
}

export async function undoTimelineStepAction(id: string) {
  await requireAdmin();
  if (typeof id !== "string") return { ok: false as const, error: "Invalid request." };
  const result = await undoTimelineStep(id);
  revalidateOrder(id);
  revalidatePath("/equipment", "layout");
  return result;
}

export async function deleteQuoteAction(id: string) {
  await requireAdmin();
  if (typeof id !== "string") return false;
  const ok = await deleteQuote(id);
  revalidatePath("/admin/quotes");
  revalidatePath("/admin/orders", "layout");
  revalidatePath("/admin/customers", "layout");
  revalidatePath("/admin");
  revalidatePath("/equipment", "layout");
  return ok;
}

export async function addQuoteNoteAction(id: string, text: string) {
  await requireAdmin();
  if (typeof id !== "string" || typeof text !== "string") throw new Error("Invalid note.");
  const quote = await addQuoteNote(id, text);
  revalidatePath(`/admin/quotes/${id}`);
  return quote;
}
