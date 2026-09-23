"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { availabilityLabels, type ProductAvailability } from "@/lib/catalogue";
import { setProductStatusAction } from "@/lib/admin/actions";

const options = Object.keys(availabilityLabels) as ProductAvailability[];

/** Saved stock status for one item — shown on the live site straight away. */
function InventoryStatusSelect({
  slug,
  value,
  disabled,
}: {
  slug: string;
  value: ProductAvailability;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState(value);
  const [pending, setPending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  async function handleChange(next: string) {
    const previous = status;
    setStatus(next as ProductAvailability);
    setPending(true);
    setFailed(false);
    const ok = await setProductStatusAction(slug, next as ProductAvailability).catch(() => false);
    if (ok) {
      router.refresh();
    } else {
      setStatus(previous);
      setFailed(true);
    }
    setPending(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={handleChange} disabled={disabled || pending}>
        <SelectTrigger className="w-40" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {availabilityLabels[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {failed ? <span className="text-xs text-destructive">Not saved</span> : null}
    </div>
  );
}

export { InventoryStatusSelect };
