import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Admin product-image uploads — writes to the public `product-images`
 * Supabase Storage bucket (see scripts/setup-storage-bucket.ts) and returns
 * its public URL. `product-form.tsx` caps callers at 4 images per product;
 * this module just handles one file at a time.
 */

const BUCKET = "product-images";
const MAX_BYTES = 8 * 1024 * 1024;
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type UploadImageResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadProductImage(file: File): Promise<UploadImageResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Image storage isn't connected yet." };
  }

  const extension = EXTENSION_BY_TYPE[file.type];
  if (!extension) {
    return { ok: false, error: "Use a JPEG, PNG or WebP image." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Image must be under 8MB." };
  }

  const path = `products/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    console.error("[admin/image-upload] Upload failed:", error.message);
    return { ok: false, error: "Upload failed. Please try again." };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
