"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export const quoteSteps = [
  "Review Kit",
  "Project Details",
  "Customer Details",
  "Delivery",
  "Confirmation",
] as const;

export interface QuoteStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

function QuoteStepper({ currentStep, onStepClick }: QuoteStepperProps) {
  return (
    <ol className="scrollbar-none flex gap-2 overflow-x-auto sm:gap-3">
      {quoteSteps.map((label, i) => {
        const state = i < currentStep ? "done" : i === currentStep ? "active" : "upcoming";
        const clickable = state === "done" && onStepClick;

        return (
          <li key={label} className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(i)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-left transition-colors",
                state === "active" && "border-brand bg-brand/10",
                state === "done" && "border-border hover:border-foreground/40",
                state === "upcoming" && "border-border opacity-50"
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-medium",
                  state === "active" && "bg-brand text-brand-foreground",
                  state === "done" && "bg-foreground text-background",
                  state === "upcoming" && "bg-muted text-muted-foreground"
                )}
              >
                {state === "done" ? <Check className="size-3" /> : i + 1}
              </span>
              <span className="text-label whitespace-nowrap">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export { QuoteStepper };
