import { redirect } from "next/navigation";

// Send Kit orders live under Quotes — this old placeholder route just points there.
export default function AdminOrdersPage() {
  redirect("/admin/quotes");
}
