"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleCheck } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getBrandBySlug, getCategoryIcon, getProductBySlug } from "@/lib/catalogue";
import { getProductImage } from "@/lib/editorial-images";
import { useKit } from "@/components/kit/kit-provider";

const AUTO_CLOSE_MS = 6000;

// Amazon / B&H-style confirmation: after any "Add to Cart" a bottom sheet
// shows what was added with "View cart" and "Continue browsing".
function AddedToCartSheet() {
  const { lastAdded, addedSheetOpen, dismissLastAdded, itemCount, items } = useKit();
  const pathname = usePathname();
  const onCartPage = pathname === "/kit";

  const p = lastAdded ? getProductBySlug(lastAdded.slug) : undefined;
  const open = addedSheetOpen && !onCartPage;

  // Restart the auto-close timer on every add (lastAdded.id changes).
  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(dismissLastAdded, AUTO_CLOSE_MS);
    return () => clearTimeout(timeout);
  }, [open, lastAdded?.id, dismissLastAdded]);

  if (!p) return null;

  const quantity = items.find((i) => i.productSlug === p.slug)?.quantity ?? 1;
  const brand = getBrandBySlug(p.brandSlug)?.name ?? p.brandSlug;

  return (
    <Drawer open={open} onOpenChange={(next) => !next && dismissLastAdded()}>
      <DrawerContent side="bottom" showCloseButton={false} className="rounded-t-2xl px-4 pt-5 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:mx-auto sm:max-w-md">
        <div className="flex items-center gap-2 text-brand">
          <CircleCheck className="size-5" />
          <DrawerTitle className="text-brand">Added to cart</DrawerTitle>
        </div>
        <DrawerDescription className="sr-only">
          {p.name} was added to your cart.
        </DrawerDescription>

        <div className="flex gap-4">
          <div className="size-20 shrink-0 overflow-hidden rounded-lg">
            <MediaPlaceholder
              src={getProductImage(p.slug, p.categorySlug)}
              alt={p.name}
              icon={getCategoryIcon(p.categorySlug)}
              className="size-full"
            />
          </div>
          <div className="min-w-0">
            <p className="text-label truncate text-muted-foreground">{brand}</p>
            <p className="line-clamp-2 font-medium leading-snug">{p.name}</p>
            <p className="text-meta mt-1">
              Qty {quantity} · {itemCount} item{itemCount === 1 ? "" : "s"} in your cart
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild size="lg" className="w-full" onClick={dismissLastAdded}>
            <Link href="/kit">View cart ({itemCount})</Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={dismissLastAdded}>
            Continue browsing
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export { AddedToCartSheet };
