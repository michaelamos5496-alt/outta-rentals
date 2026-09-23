import { Download, Inbox } from "lucide-react";

import { listEnquiries } from "@/lib/admin/enquiries";
import { formatDateTime } from "@/lib/admin/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";

export const metadata = { title: "Enquiries" };

const kindLabels = { contact: "Contact form", consultation: "Consultation" } as const;

export default async function AdminEnquiriesPage() {
  const enquiries = await listEnquiries();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-h2">Enquiries</h1>
          <p className="text-small mt-1">
            Every Contact form and consultation message, kept in case the WhatsApp chat is lost.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href="/admin/export?type=enquiries" download>
            <Download /> Download as spreadsheet
          </a>
        </Button>
      </div>

      <div className="mt-6">
        {enquiries.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No enquiries yet"
            description="Messages sent through the Contact form or consultation popup will appear here."
          />
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {enquiries.map((enquiry) => (
              <div key={enquiry.id} className="flex flex-col gap-2 p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {enquiry.name || "Unnamed"}
                    <span className="text-meta ml-2">
                      {[enquiry.phone, enquiry.email].filter(Boolean).join(" · ")}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{kindLabels[enquiry.kind]}</Badge>
                    <span className="text-meta">{formatDateTime(enquiry.createdAt)}</span>
                  </div>
                </div>
                {enquiry.message ? (
                  <p className="whitespace-pre-wrap text-muted-foreground">{enquiry.message}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
