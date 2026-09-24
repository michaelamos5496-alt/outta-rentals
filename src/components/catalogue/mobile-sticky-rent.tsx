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
  const { addItem, items, openDrawer } = useKit();
  // Stays "In Cart" for as long as the item is in the cart, so it can't be added twice by accident.
  const added = items.some((i) => i.productSlug === productSlug);


  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-5 py-3 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <p className="text-meta hidden min-[380px]:block">Pricing on request</p>
        <div className="flex gap-2">
          <Button
            variant={added ? "secondary" : "outline"}
            size="lg"
            aria-label={added ? "In cart — view cart" : "Add to cart"}
            onClick={() => {
              if (added) openDrawer();
              else addItem(productSlug);
            }}
          >
            {added ? <Check /> : <Plus />}
            {added ? "In Cart" : "Add to Cart"}
          </Button>
          <Button
            size="lg"
            onClick={() => {
              addItem(productSlug, 1, { silent: true });
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
