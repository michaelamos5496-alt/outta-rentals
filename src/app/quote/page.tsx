"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Package } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { useKit } from "@/components/kit/kit-provider";
import { resolveKitLines, getKitTotal } from "@/lib/kit/pricing";
import { QuoteStepper } from "@/components/quote/quote-stepper";
import { ReviewKitStep } from "@/components/quote/steps/review-kit-step";
import { ProjectDetailsStep } from "@/components/quote/steps/project-details-step";
import { CustomerDetailsStep } from "@/components/quote/steps/customer-details-step";
import { DeliveryStep } from "@/components/quote/steps/delivery-step";
import { ConfirmationStep, type SubmitState } from "@/components/quote/steps/confirmation-step";
import {
  validateCustomerDetails,
  validateDeliveryDetails,
  validateProjectDetails,
} from "@/lib/quote/validation";
import {
  emptyCustomerDetails,
  emptyDeliveryDetails,
  emptyProjectDetails,
  type CustomerDetails,
  type DeliveryDetails,
  type FieldErrors,
  type ProjectDetails,
} from "@/lib/quote/types";
import { submitQuoteRequest } from "@/lib/quote/actions";

export default function QuotePage() {
  const { items, startDate, endDate, rentalDays, dateError, projectInfo, clearKit } = useKit();

  const [step, setStep] = React.useState(0);
  const [project, setProject] = React.useState<ProjectDetails>({
    ...emptyProjectDetails,
    projectName: projectInfo.projectName,
    projectType: projectInfo.productionType,
    additionalNotes: projectInfo.notes,
  });
  const [customer, setCustomer] = React.useState<CustomerDetails>(emptyCustomerDetails);
  const [delivery, setDelivery] = React.useState<DeliveryDetails>(emptyDeliveryDetails);
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

  function goNext() {
    if (step === 0) {
      if (items.length === 0 || !canPrice) {
        setErrors({ kit: "Add equipment and set valid dates before continuing." });
        return;
      }
    }
    if (step === 1) {
      const projectErrors = validateProjectDetails(project);
      setErrors(projectErrors);
      if (Object.keys(projectErrors).length > 0) return;
    }
    if (step === 2) {
      const customerErrors = validateCustomerDetails(customer);
      setErrors(customerErrors);
      if (Object.keys(customerErrors).length > 0) return;
    }
    if (step === 3) {
      const deliveryErrors = validateDeliveryDetails(delivery);
      setErrors(deliveryErrors);
      if (Object.keys(deliveryErrors).length > 0) return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, 4));
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setSubmitState("loading");
    setSubmitError(null);

    const result = await submitQuoteRequest({
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
      project,
      customer,
      delivery,
    });

    if (result.ok) {
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

      <div className="mt-8 overflow-x-auto pb-2">
        <QuoteStepper
          currentStep={step}
          onStepClick={submitState === "success" ? undefined : setStep}
        />
      </div>

      <div className="mt-10 max-w-2xl">
        {step === 0 ? <ReviewKitStep lines={lines} startDate={startDate} endDate={endDate} /> : null}
        {step === 1 ? (
          <ProjectDetailsStep value={project} onChange={(p) => setProject((s) => ({ ...s, ...p }))} errors={errors} />
        ) : null}
        {step === 2 ? (
          <CustomerDetailsStep
            value={customer}
            onChange={(p) => setCustomer((s) => ({ ...s, ...p }))}
            errors={errors}
          />
        ) : null}
        {step === 3 ? (
          <DeliveryStep value={delivery} onChange={(p) => setDelivery((s) => ({ ...s, ...p }))} errors={errors} />
        ) : null}
        {step === 4 ? (
          <ConfirmationStep
            lines={lines}
            startDate={startDate}
            endDate={endDate}
            rentalDays={rentalDays ?? 0}
            total={total}
            project={project}
            customer={customer}
            delivery={delivery}
            submitState={submitState}
            submitError={submitError}
            onSubmit={handleSubmit}
          />
        ) : null}

        {errors.kit ? <p className="mt-3 text-sm text-destructive">{errors.kit}</p> : null}

        {step < 4 ? (
          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={goBack} disabled={step === 0}>
              <ArrowLeft /> Back
            </Button>
            <Button onClick={goNext}>
              Next <ArrowRight />
            </Button>
          </div>
        ) : submitState !== "success" ? (
          <div className="mt-8">
            <Button variant="ghost" onClick={goBack} disabled={submitState === "loading"}>
              <ArrowLeft /> Back
            </Button>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
