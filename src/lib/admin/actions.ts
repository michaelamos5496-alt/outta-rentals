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
  updateQuoteStatus,
  addQuoteNote,
  type AdminProductInput,
  type AdminCategoryInput,
} from "./store";
import type { AdminQuoteStatus } from "./types";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Not authorized.");
  return session;
}

function revalidateStorefront() {
  revalidatePath("/equipment", "layout");
  revalidatePath("/", "page");
}

// ---------------------------------------------------------------- Products

export async function createProductAction(input: AdminProductInput) {
  await requireAdmin();
  const product = createProduct(input);
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidateStorefront();
  return product;
}

export async function updateProductAction(id: string, patch: Partial<AdminProductInput>) {
  await requireAdmin();
  const product = updateProduct(id, patch);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/inventory");
  revalidateStorefront();
  return product;
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const ok = deleteProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidateStorefront();
  return ok;
}

export async function setProductArchivedAction(id: string, archived: boolean) {
  await requireAdmin();
  const product = setProductArchived(id, archived);
  revalidatePath("/admin/products");
  revalidateStorefront();
  return product;
}

export async function setProductAvailabilityAction(
  id: string,
  availability: AdminProductInput["availability"]
) {
  await requireAdmin();
  const product = updateProduct(id, { availability });
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidateStorefront();
  return product;
}

// -------------------------------------------------------------- Categories

export async function createCategoryAction(input: AdminCategoryInput) {
  await requireAdmin();
  const category = createCategory(input);
  revalidatePath("/admin/categories");
  return category;
}

export async function updateCategoryAction(id: string, patch: Partial<AdminCategoryInput>) {
  await requireAdmin();
  const category = updateCategory(id, patch);
  revalidatePath("/admin/categories");
  return category;
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  const ok = deleteCategory(id);
  revalidatePath("/admin/categories");
  return ok;
}

// ------------------------------------------------------------------ Quotes

export async function updateQuoteStatusAction(id: string, status: AdminQuoteStatus) {
  await requireAdmin();
  const quote = updateQuoteStatus(id, status);
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin");
  return quote;
}

export async function addQuoteNoteAction(id: string, text: string) {
  await requireAdmin();
  const quote = addQuoteNote(id, text);
  revalidatePath(`/admin/quotes/${id}`);
  return quote;
}
