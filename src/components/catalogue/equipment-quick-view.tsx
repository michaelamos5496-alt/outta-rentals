"use client";

import * as React from "react";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";
import {
  availabilityLabels,
  availabilityVariant,
  getBrandBySlug,
} from "@/lib/catalogue";
import { ProductGallery } from "@/components/catalogue/product-gallery";
import { useQuickView } from "@/components/catalogue/quick-view-provider";
import { useKit } from "@/components/kit/kit-provider";
import { formatPrice } from "@/lib/currency";

/**
 * The site-wide "click an equipment card" experience — a popup with the
 * photo, price, specs and an Add to Cart, standing in for a full product
 * page. Mounted once in `SiteChrome`; opened via `useQuickView().open()`
 * from anywhere a product card renders.
 */
function EquipmentQuickView() {
  const { product, close } = useQuickView();

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-[oklch(0.97_0.025_143)] p-0 sm:max-w-3xl">
        {product ? <QuickViewBody key={product.slug} productSlug={product.slug} /> : null}
      </DialogContent>
    </Dialog>
  );
}

// Keyed by slug in the parent so quantity resets and the gallery starts back
// at its main photo every time a different product is opened.
function QuickViewBody({ productSlug }: { productSlug: string }) {
  const { product: current, close } = useQuickView();
  // `current` always matches `productSlug` here (the key above remounts this
  // component when it changes) — narrowed so TypeScript knows it's non-null.
  const product = current!;
  const { addItem, items, openDrawer, rentalDays, dateError } = useKit();
  const [quantity, setQuantity] = React.useState(1);

  const brand = getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug;
  const inCart = items.some((i) => i.productSlug === productSlug);
  const datesValid = !dateError && rentalDays !== null;

  function handleAction() {
    if (inCart) {
      close();
      openDrawer();
      return;
    }
    addItem(product.slug, quantity);
    close();
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 sm:gap-8 sm:p-7">
      <DialogTitle className="sr-only">{product.name}</DialogTitle>

      <ProductGallery
        productSlug={product.slug}
        categorySlug={product.categorySlug}
        sku={product.sku}
        name={product.name}
        frameCount={1}
      />

      <div className="flex flex-col">
        <p className="text-label text-brand">{brand}</p>
        <h2 className="text-h2 mt-1">{product.name}</h2>
        <div className="mt-3 flex items-center gap-3">
          <Badge variant={availabilityVariant[product.availability]}>
            {availabilityLabels[product.availability]}
          </Badge>
        </div>

        {product.dayRate > 0 ? (
          <p className="font-mono text-h3 mt-4 font-semibold">
            {formatPrice(product.dayRate, product.currency)}
            <span className="font-sans text-sm font-normal text-muted-foreground"> / day</span>
          </p>
        ) : null}

        <p className="text-small mt-4">{product.description || product.shortDescription}</p>

        {product.specifications.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.specifications.slice(0, 8).map((spec) => (
              <Badge key={spec.label} variant="outline" className="h-auto py-1">
                <Check className="size-3" />
                {spec.label}: {spec.value}
              </Badge>
            ))}
          </div>
        ) : null}

        {product.included.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-1.5">
            {product.included.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <Check className="size-3.5 shrink-0 text-brand" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        <Divider className="my-5" />

        <div className="flex items-center justify-between gap-3">
          <p className="text-label">Quantity</p>
          <div className="flex items-center gap-1 rounded-lg border border-input">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Decrease quantity"
              disabled={quantity <= 1 || inCart}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus />
            </Button>
            <span className="w-6 text-center text-sm tabular-nums">{quantity}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Increase quantity"
              disabled={inCart}
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3">
          <p className="text-small">Estimated total</p>
          {product.dayRate > 0 ? (
            <p className="font-mono font-semibold">
              {datesValid
                ? formatPrice(product.dayRate * quantity * rentalDays, product.currency)
                : `${formatPrice(product.dayRate * quantity, product.currency)}/day`}
            </p>
          ) : (
            <p className="text-small">—</p>
          )}
        </div>
        {!datesValid ? (
          <p className="text-meta mt-1.5">Set rental dates in your cart for a full estimate.</p>
        ) : null}

        <Button size="lg" className="mt-5 w-full" onClick={handleAction}>
          {inCart ? <ShoppingCart /> : <Plus />}
          {inCart ? "View Cart" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}

export { EquipmentQuickView };
