"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useKit } from "@/components/kit/kit-provider";

export interface MobileStickyRentProps {
  productSlug: string;
}

// Mobile-only sticky action bar for the product detail page — desktop keeps
// its existing inline `ProductActions` untouched (this renders `lg:hidden`).
function MobileStickyRent({ productSlug }: MobileStickyRentProps) {
  const router = useRouter();
  const { addItem } = useKit();
  const [added, setAdded] = React.useState(false);

  React.useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 1400);
    return () => clearTimeout(timeout);
  }, [added]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-5 py-3 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <p className="text-meta hidden min-[380px]:block">Pricing on request</p>
        <div className="flex gap-2">
          <Button
            variant={added ? "secondary" : "outline"}
            size="lg"
            aria-label="Add to kit"
            onClick={() => {
              addItem(productSlug);
              setAdded(true);
            }}
          >
            {added ? <Check /> : <Plus />}
            {added ? "Added" : "Add to Kit"}
          </Button>
          <Button
            size="lg"
            onClick={() => {
              addItem(productSlug);
              router.push("/kit");
            }}
          >
            Rent Now
          </Button>
        </div>
      </div>
    </div>
  );
}

export { MobileStickyRent };
