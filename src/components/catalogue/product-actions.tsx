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

function ProductActions({ productSlug, productName }: ProductActionsProps) {
  const router = useRouter();
  const { addItem } = useKit();
  const [added, setAdded] = React.useState(false);

  React.useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(timeout);
  }, [added]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        variant={added ? "secondary" : "default"}
        className="flex-1"
        onClick={() => {
          addItem(productSlug);
          setAdded(true);
        }}
      >
        {added ? <Check /> : <Plus />}
        {added ? `${productName} added` : "Add to Kit"}
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="flex-1"
        onClick={() => {
          addItem(productSlug);
          router.push("/kit");
        }}
      >
        <MessageCircle /> Request Quote
      </Button>
    </div>
  );
}

export { ProductActions };
