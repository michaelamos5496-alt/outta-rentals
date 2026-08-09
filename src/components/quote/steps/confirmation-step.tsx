"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { WhatsAppButton } from "@/components/quote/whatsapp-button";
import type { ResolvedKitLine } from "@/lib/kit/pricing";
import type { CustomerDetails, DeliveryDetails, ProjectDetails } from "@/lib/quote/types";

export type SubmitState = "idle" | "loading" | "success" | "error";

export interface ConfirmationStepProps {
  lines: ResolvedKitLine[];
  startDate: string;
  endDate: string;
  rentalDays: number;
  total: number;
  project: ProjectDetails;
  customer: CustomerDetails;
  delivery: DeliveryDetails;
  submitState: SubmitState;
  submitError: string | null;
  onSubmit: () => void;
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-6 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function ConfirmationStep({
  lines,
  startDate,
  endDate,
  rentalDays,
  total,
  project,
  customer,
  delivery,
  submitState,
  submitError,
  onSubmit,
}: ConfirmationStepProps) {
  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <CheckCircle2 className="size-10 text-brand" />
        <p className="text-h2 mt-5">YOUR REQUEST IS IN.</p>
        <p className="text-body mt-3 max-w-sm">
          We&rsquo;ll review your kit and contact you with a confirmed quotation.
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
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="text-label mb-2">Equipment</p>
        <div className="flex flex-col gap-1">
          {lines.map((line) => (
            <SummaryRow
              key={line.product.slug}
              label={`${line.product.name} × ${line.quantity}`}
              value={`$${line.lineTotal.toLocaleString()}`}
            />
          ))}
        </div>
      </section>

      <Divider />

      <section>
        <p className="text-label mb-2">Dates</p>
        <SummaryRow label="Rental period" value={`${startDate} → ${endDate}`} />
        <SummaryRow label="Rental days" value={rentalDays} />
        <SummaryRow label="Estimated rental" value={<span className="font-medium">${total.toLocaleString()}</span>} />
        <p className="text-meta mt-1">Estimate — final quote confirmed by OUTTA.</p>
      </section>

      <Divider />

      <section>
        <p className="text-label mb-2">Customer</p>
        <SummaryRow label="Name" value={customer.name} />
        {customer.company ? <SummaryRow label="Company" value={customer.company} /> : null}
        <SummaryRow label="Email" value={customer.email} />
        <SummaryRow label="Phone" value={customer.phone} />
      </section>

      <Divider />

      <section>
        <p className="text-label mb-2">Project</p>
        <SummaryRow label="Name" value={project.projectName} />
        <SummaryRow label="Type" value={project.projectType} />
        <SummaryRow label="Location" value={project.shootLocation} />
        {project.productionDays ? (
          <SummaryRow label="Production days" value={project.productionDays} />
        ) : null}
        {project.crewSize ? <SummaryRow label="Crew size" value={project.crewSize} /> : null}
      </section>

      <Divider />

      <section>
        <p className="text-label mb-2">Delivery</p>
        <SummaryRow label="Method" value={delivery.method === "delivery" ? "Delivery" : "Pickup"} />
        {delivery.method === "delivery" && delivery.location ? (
          <SummaryRow label="Location" value={delivery.location} />
        ) : null}
      </section>

      {submitState === "error" ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0 translate-y-0.5" />
          <span>{submitError ?? "Something went wrong. Please try again."}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="flex-1 uppercase tracking-wide"
          disabled={submitState === "loading"}
          onClick={onSubmit}
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
        <WhatsAppButton
          items={lines.map((l) => ({ name: l.product.name, quantity: l.quantity }))}
          startDate={startDate}
          endDate={endDate}
          projectLabel={project.projectName || project.projectType}
          location={project.shootLocation}
          size="lg"
          className="flex-1"
        />
      </div>
    </div>
  );
}

export { ConfirmationStep };
