"use client";

import * as React from "react";

import { useKit } from "@/components/kit/kit-provider";
import { WhatsAppButton } from "@/components/quote/whatsapp-button";
import { resolveKitLines } from "@/lib/kit/pricing";
import { recordKitRequest, type KitRequestInput } from "@/lib/quote/actions";

/** The one "Send Kit" button — opens WhatsApp and records the request for admin. */
function SendKitButton({ className }: { className?: string }) {
  const { items, startDate, endDate, rentalDays, dateError, projectInfo } = useKit();
  const lines = resolveKitLines(items, rentalDays ?? 0);
  // Remembers the last request recorded so tapping Send Kit twice for the
  // same kit doesn't create duplicate orders in admin.
  const lastRecorded = React.useRef<string | null>(null);
  const validStart = dateError ? undefined : startDate;
  const validEnd = dateError ? undefined : endDate;

  function handleSend() {
    const request: KitRequestInput = {
      items: lines.map((l) => ({ productSlug: l.product.slug, quantity: l.quantity })),
      startDate: validStart,
      endDate: validEnd,
      customerName: projectInfo.customerName,
      customerPhone: projectInfo.customerPhone,
      projectName: projectInfo.projectName,
      productionType: projectInfo.productionType,
      notes: projectInfo.notes,
    };
    const signature = JSON.stringify(request);
    if (signature === lastRecorded.current) return;
    lastRecorded.current = signature;
    // Fire-and-forget: WhatsApp is the order; this record must never block it.
    recordKitRequest(request).catch(() => {
      lastRecorded.current = null;
    });
  }

  return (
    <WhatsAppButton
      items={lines.map((l) => ({ name: l.product.name, quantity: l.quantity }))}
      startDate={validStart}
      endDate={validEnd}
      projectLabel={projectInfo.projectName || projectInfo.productionType}
      customerName={projectInfo.customerName.trim() || undefined}
      customerPhone={projectInfo.customerPhone.trim() || undefined}
      notes={projectInfo.notes}
      variant="default"
      className={className}
      onSend={handleSend}
    />
  );
}

export { SendKitButton };
