import { getAdminSession } from "@/lib/admin/auth";
import { listEnquiries } from "@/lib/admin/enquiries";
import { formatDateTime } from "@/lib/admin/format";
import { listQuotes } from "@/lib/admin/quotes";

export const dynamic = "force-dynamic";

/**
 * Spreadsheet (CSV) backup of orders or enquiries — opens in Excel, Numbers
 * or Google Sheets. Admin only.
 */

function cell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  // Stop spreadsheet apps treating customer-typed text as a formula — but
  // leave plain phone numbers like "+233 24 583 6258" alone.
  if (/^[=+\-@\t\r]/.test(text) && !/^\+[\d\s()-]+$/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows: unknown[][]): string {
  // BOM so Excel reads "₵", "×" and accented names correctly.
  return "﻿" + rows.map((row) => row.map(cell).join(",")).join("\r\n");
}

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return new Response("Not authorized", { status: 401 });
  }

  const type = new URL(request.url).searchParams.get("type");
  const date = new Date().toISOString().slice(0, 10);
  let csv: string;

  if (type === "quotes") {
    const quotes = await listQuotes();
    csv = toCsv([
      [
        "Received",
        "Status",
        "Customer",
        "Phone",
        "Email",
        "Project",
        "Production type",
        "Start date",
        "End date",
        "Days",
        "Equipment",
        "Estimated total",
        "Customer notes",
        "Admin notes",
      ],
      ...quotes.map((q) => [
        formatDateTime(q.createdAt),
        q.status,
        q.customerName,
        q.customerPhone,
        q.customerEmail,
        q.projectName,
        q.projectType,
        q.startDate.slice(0, 10),
        q.endDate.slice(0, 10),
        q.rentalDays || "",
        q.kit.map((k) => `${k.productName} × ${k.quantity}`).join("; "),
        q.estimatedTotal || "",
        q.projectNotes ?? "",
        q.notes.map((n) => n.text).join(" | "),
      ]),
    ]);
  } else if (type === "enquiries") {
    const enquiries = await listEnquiries();
    csv = toCsv([
      ["Received", "Type", "Name", "Phone", "Email", "Message"],
      ...enquiries.map((e) => [
        formatDateTime(e.createdAt),
        e.kind === "contact" ? "Contact form" : "Consultation",
        e.name,
        e.phone,
        e.email,
        e.message,
      ]),
    ]);
  } else {
    return new Response("Unknown export type", { status: 400 });
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="outta-${type}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
