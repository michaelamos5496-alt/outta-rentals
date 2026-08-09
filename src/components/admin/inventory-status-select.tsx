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
import { setProductAvailabilityAction } from "@/lib/admin/actions";

const options = Object.keys(availabilityLabels) as ProductAvailability[];

function InventoryStatusSelect({ id, value }: { id: string; value: ProductAvailability }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleChange(next: string) {
    setPending(true);
    await setProductAvailabilityAction(id, next as ProductAvailability);
    router.refresh();
    setPending(false);
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="w-40" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((status) => (
          <SelectItem key={status} value={status}>
            {availabilityLabels[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { InventoryStatusSelect };
