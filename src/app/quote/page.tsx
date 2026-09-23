"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, LoaderCircle, Package } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Divider } from "@/components/ui/divider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/state";
import { useKit } from "@/components/kit/kit-provider";
import { resolveKitLines, getKitTotal } from "@/lib/kit/pricing";
import { ReviewKitStep } from "@/components/quote/steps/review-kit-step";
import { CustomerDetailsStep } from "@/components/quote/steps/customer-details-step";
import { getWhatsAppLink } from "@/lib/quote/whatsapp";
import { validateCustomerDetails } from "@/lib/quote/validation";
import {
  emptyCustomerDetails,
  emptyDeliveryDetails,
  emptyProjectDetails,
  type CustomerDetails,
  type FieldErrors,
} from "@/lib/quote/types";
import { submitQuoteRequest } from "@/lib/quote/actions";

type SubmitState = "idle" | "loading" | "success" | "error";

export default function QuotePage() {
  const { items, startDate, endDate, rentalDays, dateError, projectInfo, clearKit } = useKit();

  const [customer, setCustomer] = React.useState<CustomerDetails>(emptyCustomerDetails);
  const [notes, setNotes] = React.useState("");
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [submitState, setSubmitState] = React.useState<SubmitState>("idle");
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const lines = resolveKitLines(items, rentalDays ?? 0);
  const total = getKitTotal(lines);
  const canPrice = !dateError && rentalDays !== null;

  if (items.length === 0 && submitState !== "success") {
    return (
      <Section>
        <Heading level="h1" eyebrow="Quote">
          Request a quote
        </Heading>
        <div className="mt-10">
          <EmptyState
            icon={Package}
            title="Your kit is empty"
            description="Add equipment to your kit before requesting a quote."
            action={
              <Button asChild variant="outline">
                <Link href="/equipment">Browse equipment</Link>
              </Button>
            }
          />
        </div>
      </Section>
    );
  }

  if (submitState === "success") {
    return (
      <Section>
        <div className="flex flex-col items-center py-10 text-center">
          <CheckCircle2 className="size-10 text-brand" />
          <p className="text-h2 mt-5">YOUR REQUEST IS IN.</p>
          <p className="text-body mt-3 max-w-sm">
            We opened WhatsApp with your request pre-filled — hit send there to reach OUTTA
            directly, and we&rsquo;ll follow up with a confirmed quotation.
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/equipment">Continue browsing</Link>
            </Button>
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  async function handleSubmit() {
    if (items.length === 0 || !canPrice) {
      setErrors({ kit: "Add equipment and set valid dates before continuing." });
      return;
    }
    const customerErrors = validateCustomerDetails(customer);
    setErrors(customerErrors);
    if (Object.keys(customerErrors).length > 0) return;

    const whatsappLink = getWhatsAppLink({
      items: lines.map((l) => ({ name: l.product.name, quantity: l.quantity })),
      startDate,
      endDate,
      projectLabel: projectInfo.projectName || projectInfo.productionType,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      notes,
    });

    // WhatsApp is where every order lands, so it opens first — synchronously,
    // within the click handler, so browsers treat it as a direct result of the
    // tap and don't block it as a popup. The database save below is only a
    // backup record and never stops the order reaching WhatsApp.
    if (whatsappLink) {
      window.open(whatsappLink, "_blank", "noopener,noreferrer");
    }

    setSubmitState("loading");
    setSubmitError(null);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 500));
    const [result] = await Promise.all([
      submitQuoteRequest({
        kit: lines.map((l) => ({
          productSlug: l.product.slug,
          productName: l.product.name,
          quantity: l.quantity,
          dayRate: l.product.dayRate,
        })),
        startDate,
        endDate,
        rentalDays: rentalDays ?? 0,
        estimatedTotal: total,
        project: {
          ...emptyProjectDetails,
          projectName: projectInfo.projectName || "Untitled project",
          projectType: projectInfo.productionType || "Not specified",
          shootLocation: "Not specified",
          additionalNotes: notes,
        },
        customer,
        delivery: { ...emptyDeliveryDetails, method: "pickup" },
      }).catch(() => ({ ok: false as const, error: "We couldn't submit your request. Please try again." })),
      minDelay,
    ]);

    if (result.ok || whatsappLink) {
      setSubmitState("success");
      clearKit();
    } else {
      setSubmitState("error");
      setSubmitError(result.error);
    }
  }

  return (
    <Section>
      <Heading level="h1" eyebrow="Quote">
        Request a quote
      </Heading>

      <div className="mt-10 max-w-2xl">
        <ReviewKitStep lines={lines} startDate={startDate} endDate={endDate} />

        <Divider className="my-8" />

        <CustomerDetailsStep
          value={customer}
          onChange={(p) => setCustomer((s) => ({ ...s, ...p }))}
          errors={errors}
        />

        <div className="mt-5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            className="mt-1.5"
            rows={3}
            placeholder="Shoot dates, location, anything OUTTA should know…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {errors.kit ? <p className="mt-3 text-sm text-destructive">{errors.kit}</p> : null}

        {submitState === "error" ? (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="size-4 shrink-0 translate-y-0.5" />
            <span>{submitError ?? "Something went wrong. Please try again."}</span>
          </div>
        ) : null}

        <Button
          size="lg"
          className="mt-8 w-full uppercase tracking-wide"
          disabled={submitState === "loading"}
          onClick={handleSubmit}
        >
          {submitState === "loading" ? (
            <>
              <LoaderCircle className="animate-spin" /> Submitting…
            </>
          ) : submitState === "error" ? (
            "Retry — Request My Quote"
          ) : (
            "Request My Quote"
          )}
        </Button>
        <p className="text-meta mt-2 text-center">
          Opens WhatsApp with your request pre-filled — just hit send there.
        </p>
      </div>
    </Section>
  );
}
