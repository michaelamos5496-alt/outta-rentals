"use client";

import { Divider } from "@/components/ui/divider";
import { KitItemRow } from "@/components/kit/kit-item-row";
import { RentalDates } from "@/components/kit/rental-dates";
import { WhatsAppButton } from "@/components/quote/whatsapp-button";
import type { ResolvedKitLine } from "@/lib/kit/pricing";

export interface ReviewKitStepProps {
  lines: ResolvedKitLine[];
  startDate: string;
  endDate: string;
}

function ReviewKitStep({ lines, startDate, endDate }: ReviewKitStepProps) {
  return (
    <div className="flex flex-col">
      <RentalDates />
      <Divider className="my-4" />
      <div className="flex flex-col divide-y divide-border">
        {lines.map((line) => (
          <KitItemRow key={line.product.slug} line={line} />
        ))}
      </div>
      <Divider className="mt-2 mb-4" />
      <WhatsAppButton
        items={lines.map((l) => ({ name: l.product.name, quantity: l.quantity }))}
        startDate={startDate}
        endDate={endDate}
        className="w-full sm:w-auto"
      />
    </div>
  );
}

export { ReviewKitStep };
