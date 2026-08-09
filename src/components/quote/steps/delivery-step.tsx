"use client";

import { Truck, Warehouse } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DeliveryDetails, DeliveryMethod, FieldErrors } from "@/lib/quote/types";
import { FieldError } from "@/components/quote/steps/project-details-step";

export interface DeliveryStepProps {
  value: DeliveryDetails;
  onChange: (patch: Partial<DeliveryDetails>) => void;
  errors: FieldErrors;
}

const options: { value: DeliveryMethod; label: string; description: string; icon: typeof Truck }[] = [
  {
    value: "pickup",
    label: "Pickup",
    description: "Collect equipment from the OUTTA depot.",
    icon: Warehouse,
  },
  {
    value: "delivery",
    label: "Delivery",
    description: "OUTTA delivers to your shoot location.",
    icon: Truck,
  },
];

function DeliveryStep({ value, onChange, errors }: DeliveryStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange({ method: option.value })}
            className={cn(
              "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
              value.method === option.value
                ? "border-brand bg-brand/5"
                : "border-border hover:border-foreground/30"
            )}
          >
            <option.icon
              className={cn("size-5", value.method === option.value ? "text-brand" : "text-muted-foreground")}
            />
            <span className="font-medium">{option.label}</span>
            <span className="text-small">{option.description}</span>
          </button>
        ))}
      </div>
      <FieldError message={errors.method} />

      {value.method === "delivery" ? (
        <>
          <div>
            <Label htmlFor="delivery-location">Delivery location</Label>
            <Input
              id="delivery-location"
              className="mt-1.5"
              placeholder="Street address, area, city"
              value={value.location}
              onChange={(e) => onChange({ location: e.target.value })}
            />
            <FieldError message={errors.location} />
          </div>
          <div>
            <Label htmlFor="delivery-instructions">Additional instructions</Label>
            <Textarea
              id="delivery-instructions"
              className="mt-1.5"
              rows={3}
              placeholder="Gate code, contact on arrival, parking…"
              value={value.instructions}
              onChange={(e) => onChange({ instructions: e.target.value })}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

export { DeliveryStep };
