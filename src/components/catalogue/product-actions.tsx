"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, MessageCircle, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useKit } from "@/components/kit/kit-provider";

export interface ProductActionsProps {
  productSlug: string;
  productName: string;
}

function ProductActions({ productSlug }: ProductActionsProps) {
  const router = useRouter();
  const { addItem, items, openDrawer } = useKit();
  // Stays "In Cart" for as long as the item is in the cart, so it can't be added twice by accident.
  const added = items.some((i) => i.productSlug === productSlug);


  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        variant={added ? "secondary" : "default"}
        className="flex-1"
        onClick={() => {
          if (added) openDrawer();
          else addItem(productSlug);
        }}
      >
        {added ? <Check /> : <Plus />}
        {added ? "In Cart — view cart" : "Add to Cart"}
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="flex-1"
        onClick={() => {
          addItem(productSlug, 1, { silent: true });
          router.push("/kit");
        }}
      >
        <MessageCircle /> Request Quote
      </Button>
    </div>
  );
}

export { ProductActions };
