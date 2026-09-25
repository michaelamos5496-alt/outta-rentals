"use client";

import * as React from "react";
import { LoaderCircle, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useKit } from "@/components/kit/kit-provider";
import { WhatsAppButton } from "@/components/quote/whatsapp-button";
import { useKitAvailability } from "@/components/kit/use-kit-availability";
import { resolveKitLines } from "@/lib/kit/pricing";
import { isValidPhone } from "@/lib/kit/phone";
import { recordKitRequest, type KitRequestInput } from "@/lib/quote/actions";

/**
 * The one "Send Kit" button — opens WhatsApp and records the request for
 * admin. Disabled while the kit holds an item that's booked or out of service
 * for the chosen dates (the kit page lists which, and why).
 */
function SendKitButton({
  className,
  hint,
  withPhoneField,
}: {
  className?: string;
  hint?: boolean;
  /** Shows a contact-number field above the button — for places (like the cart drawer) that don't have one. */
  withPhoneField?: boolean;
}) {
  const { items, startDate, endDate, rentalDays, dateError, projectInfo, setProjectInfo } = useKit();
  const phone = projectInfo.customerPhone;
  const phoneOk = isValidPhone(phone);
  const [phoneTouched, setPhoneTouched] = React.useState(false);
  const lines = resolveKitLines(items, rentalDays ?? 0);
  const { unavailable, checking } = useKitAvailability();
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

  const phoneField = withPhoneField ? (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="checkout-phone">Contact number</Label>
      <Input
        id="checkout-phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required
        placeholder="024 123 4567"
        value={phone}
        aria-invalid={phoneTouched && !phoneOk}
        onBlur={() => setPhoneTouched(true)}
        onChange={(e) => setProjectInfo({ customerPhone: e.target.value })}
      />
    </div>
  ) : null;

  // No valid contact number yet — the button stays off until there is one.
  if (!phoneOk) {
    const typed = phone.trim().length > 0;
    return (
      <div className="flex flex-col gap-2">
        {phoneField}
        <Button size="lg" className={className} disabled>
          <MessageCircle /> Checkout via WhatsApp
        </Button>
        <p className={typed ? "text-xs text-destructive" : "text-meta"}>
          {typed
            ? "Enter a valid contact number to check out."
            : withPhoneField
              ? "Add a contact number so OUTTA can reach you."
              : "Add your contact number above so OUTTA can reach you."}
        </p>
      </div>
    );
  }

  if (checking || unavailable.length > 0) {
    return (
      <div className="flex flex-col gap-1.5">
        {phoneField}
        <Button size="lg" className={className} disabled>
          {checking ? <LoaderCircle className="animate-spin" /> : <MessageCircle />}
          {checking ? "Checking availability…" : "Checkout via WhatsApp"}
        </Button>
        {!checking && hint ? (
          <p className="text-xs text-destructive">
            {unavailable.map((r) => r.productName).join(", ")}{" "}
            {unavailable.length === 1 ? "isn't" : "aren't"} available for these dates — remove{" "}
            {unavailable.length === 1 ? "it" : "them"} or change your dates to send.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {phoneField}
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
    </div>
  );
}

export { SendKitButton };
