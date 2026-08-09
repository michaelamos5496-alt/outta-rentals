import { getProductBySlug, type DemoProduct } from "@/lib/catalogue";
import type { KitLineItem } from "./types";

export interface ResolvedKitLine {
  product: DemoProduct;
  quantity: number;
  rentalDays: number;
  lineTotal: number;
}

/** Daily Rate × Quantity × Rental Days, skipping any items whose product no longer exists. */
export function resolveKitLines(items: KitLineItem[], rentalDays: number): ResolvedKitLine[] {
  const days = Math.max(rentalDays, 0);
  return items.reduce<ResolvedKitLine[]>((lines, item) => {
    const product = getProductBySlug(item.productSlug);
    if (!product) return lines;
    lines.push({
      product,
      quantity: item.quantity,
      rentalDays: days,
      lineTotal: product.dayRate * item.quantity * days,
    });
    return lines;
  }, []);
}

export function getKitTotal(lines: ResolvedKitLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}
