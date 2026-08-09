"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerDetails, FieldErrors } from "@/lib/quote/types";
import { FieldError } from "@/components/quote/steps/project-details-step";

export interface CustomerDetailsStepProps {
  value: CustomerDetails;
  onChange: (patch: Partial<CustomerDetails>) => void;
  errors: FieldErrors;
}

function CustomerDetailsStep({ value, onChange, errors }: CustomerDetailsStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label htmlFor="customer-name">Name</Label>
        <Input
          id="customer-name"
          className="mt-1.5"
          placeholder="Ama Owusu"
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        <FieldError message={errors.name} />
      </div>

      <div>
        <Label htmlFor="customer-company">Company</Label>
        <Input
          id="customer-company"
          className="mt-1.5"
          placeholder="Optional"
          value={value.company}
          onChange={(e) => onChange({ company: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="customer-email">Email</Label>
          <Input
            id="customer-email"
            type="email"
            className="mt-1.5"
            placeholder="ama@studio.com"
            value={value.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
          <FieldError message={errors.email} />
        </div>
        <div>
          <Label htmlFor="customer-phone">Phone</Label>
          <Input
            id="customer-phone"
            type="tel"
            className="mt-1.5"
            placeholder="+233 55 123 4567"
            value={value.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
          <FieldError message={errors.phone} />
        </div>
      </div>

      <div>
        <Label htmlFor="customer-whatsapp">WhatsApp</Label>
        <Input
          id="customer-whatsapp"
          type="tel"
          className="mt-1.5"
          placeholder="Optional, if different from phone"
          value={value.whatsapp}
          onChange={(e) => onChange({ whatsapp: e.target.value })}
        />
        <FieldError message={errors.whatsapp} />
      </div>
    </div>
  );
}

export { CustomerDetailsStep };
