"use client";

import * as React from "react";
import { AlertCircle, Check, Clock, Minus, Plus, ShoppingCart } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { getQuickViewAddOns, type QuickViewAddOn } from "@/lib/catalogue/actions";
import { getProductImage } from "@/lib/editorial-images";
import {
  CLOSING_TIME,
  OPENING_TIME,
  formatTime,
  isWithinOpeningHours,
  todayIso,
} from "@/lib/kit/rental";

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
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
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
  const {
    addItem,
    items,
    openDrawer,
    rentalDays,
    dateError,
    startDate,
    endDate,
    startTime,
    endTime,
    setStartDate,
    setEndDate,
    setStartTime,
    setEndTime,
  } = useKit();
  const [quantity, setQuantity] = React.useState(1);
  // Chosen add-ons: slug -> quantity.
  const [picked, setPicked] = React.useState<Record<string, number>>({});
  const addOns = useAddOns(productSlug, startDate, endDate);

  const brand = getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug;
  const inCart = items.some((i) => i.productSlug === productSlug);
  const datesValid = !dateError && rentalDays !== null;
  const timeError = !isWithinOpeningHours(startTime) || !isWithinOpeningHours(endTime)
    ? `We're open ${formatTime(OPENING_TIME)} – ${formatTime(CLOSING_TIME)} daily.`
    : startDate === endDate && endTime <= startTime
      ? "Return time must be after pickup time."
      : null;

  const pickedAddOns = (addOns ?? []).filter((a) => picked[a.slug]);
  const addOnDayTotal = pickedAddOns.reduce((sum, a) => sum + a.dayRate * picked[a.slug], 0);
  const dayTotal = product.dayRate * quantity + addOnDayTotal;

  function togglePick(slug: string) {
    setPicked((p) => {
      const next = { ...p };
      if (next[slug]) delete next[slug];
      else next[slug] = 1;
      return next;
    });
  }

  function setPickQty(slug: string, qty: number) {
    setPicked((p) => ({ ...p, [slug]: Math.max(1, qty) }));
  }

  function handleAction() {
    if (inCart) {
      close();
      openDrawer();
      return;
    }
    for (const a of pickedAddOns) addItem(a.slug, picked[a.slug], { silent: true });
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
        images={product.images}
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

        <Divider className="my-5" />

        <div className="grid grid-cols-2 gap-3">
          <DateTimeField
            label="Pickup date"
            timeLabel="Pickup time"
            date={startDate}
            time={startTime}
            minDate={todayIso()}
            onDate={setStartDate}
            onTime={setStartTime}
          />
          <DateTimeField
            label="Return date"
            timeLabel="Return time"
            date={endDate}
            time={endTime}
            minDate={startDate || todayIso()}
            onDate={setEndDate}
            onTime={setEndTime}
          />
        </div>
        {dateError || timeError ? (
          <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
            {dateError ?? timeError}
          </p>
        ) : null}
        <p className="text-meta mt-2 flex items-center gap-1.5">
          <Clock className="size-3 shrink-0" />
          Open {formatTime(OPENING_TIME)} – {formatTime(CLOSING_TIME)} daily
        </p>

        {addOns === null || addOns.length > 0 ? (
          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <p className="text-label">Add to your booking</p>
              <p className="text-meta">Tap to add</p>
            </div>
            {addOns === null ? (
              <p className="text-meta mt-2">Loading add-ons…</p>
            ) : (
              <ul className="mt-2 flex max-h-72 flex-col gap-2 overflow-y-auto pr-0.5">
                {addOns.map((a) => (
                  <AddOnRow
                    key={a.slug}
                    addOn={a}
                    qty={picked[a.slug] ?? 0}
                    onToggle={() => togglePick(a.slug)}
                    onQty={(q) => setPickQty(a.slug, q)}
                    disabled={inCart}
                  />
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3">
          <p className="text-small">Estimated total</p>
          {product.dayRate > 0 ? (
            <p className="font-mono font-semibold">
              {datesValid
                ? formatPrice(dayTotal * rentalDays, product.currency)
                : `${formatPrice(dayTotal, product.currency)}/day`}
            </p>
          ) : (
            <p className="text-small">—</p>
          )}
        </div>
        {!datesValid ? (
          <p className="text-meta mt-1.5">Choose valid pickup and return dates for a full estimate.</p>
        ) : null}

        <Button size="lg" className="mt-5 w-full" onClick={handleAction} disabled={!inCart && Boolean(timeError)}>
          {inCart ? <ShoppingCart /> : <Plus />}
          {inCart
            ? "View Cart"
            : pickedAddOns.length > 0
              ? `Add to Cart (+${pickedAddOns.length} add-on${pickedAddOns.length === 1 ? "" : "s"})`
              : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}

/**
 * Suggested add-ons for the dates in the cart. `null` while loading; the
 * answer is stored with the request it answers so a stale list is never
 * shown after the product or dates change.
 */
function useAddOns(productSlug: string, startDate: string, endDate: string): QuickViewAddOn[] | null {
  const key = `${productSlug}|${startDate}|${endDate}`;
  const [answer, setAnswer] = React.useState<{ key: string; list: QuickViewAddOn[] }>();

  React.useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      getQuickViewAddOns(productSlug, startDate, endDate)
        .then((list) => !cancelled && setAnswer({ key, list }))
        .catch(() => !cancelled && setAnswer({ key, list: [] }));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, productSlug, startDate, endDate]);

  return answer?.key === key ? answer.list : null;
}

function DateTimeField({
  label,
  timeLabel,
  date,
  time,
  minDate,
  onDate,
  onTime,
}: {
  label: string;
  timeLabel: string;
  date: string;
  time: string;
  minDate: string;
  onDate: (v: string) => void;
  onTime: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1.5">
        <span className="text-label">{label}</span>
        <Input type="date" min={minDate} value={date} onChange={(e) => onDate(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-label">{timeLabel}</span>
        <Input
          type="time"
          min={OPENING_TIME}
          max={CLOSING_TIME}
          step={900}
          value={time}
          onChange={(e) => e.target.value && onTime(e.target.value)}
        />
      </label>
    </div>
  );
}

function AddOnRow({
  addOn,
  qty,
  onToggle,
  onQty,
  disabled,
}: {
  addOn: QuickViewAddOn;
  qty: number;
  onToggle: () => void;
  onQty: (q: number) => void;
  disabled: boolean;
}) {
  const selected = qty > 0;
  return (
    <li
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors",
        selected ? "border-brand bg-brand/10" : "border-border bg-muted/50"
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        aria-label={`${selected ? "Remove" : "Add"} ${addOn.name}`}
        disabled={disabled}
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left disabled:opacity-50"
      >
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-full border",
            selected ? "border-brand bg-brand text-white" : "border-input bg-background"
          )}
        >
          {selected ? <Check className="size-3" /> : null}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={addOn.imageUrl ?? getProductImage(addOn.slug, addOn.categorySlug)}
          alt=""
          className="size-10 shrink-0 rounded-md bg-white object-contain"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{addOn.name}</span>
          <span className="text-meta block">
            <span className="font-mono font-semibold text-brand">
              {formatPrice(addOn.dayRate, addOn.currency)}
            </span>
            /day
          </span>
        </span>
      </button>
      <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-input bg-background">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Decrease ${addOn.name} quantity`}
          disabled={!selected || qty <= 1 || disabled}
          onClick={() => onQty(qty - 1)}
        >
          <Minus />
        </Button>
        <span className="w-5 text-center text-sm tabular-nums">{selected ? qty : 1}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Increase ${addOn.name} quantity`}
          disabled={disabled}
          onClick={() => (selected ? onQty(qty + 1) : onToggle())}
        >
          <Plus />
        </Button>
      </div>
    </li>
  );
}

export { EquipmentQuickView };
