import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminEnquiry {
  id: string;
  kind: "contact" | "consultation";
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

/** Contact form and consultation messages, newest first. Empty without Supabase. */
export async function listEnquiries(): Promise<AdminEnquiry[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("enquiries")
    .select("id, kind, name, email, phone, message, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(`Couldn't load enquiries: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    kind: row.kind,
    name: row.name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    message: row.message ?? "",
    createdAt: row.created_at,
  }));
}
