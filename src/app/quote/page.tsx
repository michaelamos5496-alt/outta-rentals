import { redirect } from "next/navigation";

// Orders go straight to WhatsApp from the kit — the old quote form lives on
// only as a redirect so existing links still land somewhere useful.
export default function QuotePage() {
  redirect("/kit");
}
