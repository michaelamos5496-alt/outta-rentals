/**
 * OUTTA RENTALS prices — almost everything is in Ghana Cedis, but a handful
 * of "foreign" units are priced in USD (see `DemoProduct.currency`), so the
 * symbol must follow the product's actual currency rather than being
 * hardcoded.
 */
export function formatPrice(amount: number, currency: string = "GHS"): string {
  const symbol = currency === "USD" ? "$" : "₵";
  return `${symbol}${amount.toLocaleString()}`;
}

/**
 * Sums amounts per currency and formats the result — "₵2,000 + $500" when a
 * cart or package mixes Cedi and USD items, since the two can't be added.
 */
export function formatTotal(entries: { amount: number; currency?: string }[]): string {
  const totals = new Map<string, number>();
  for (const { amount, currency = "GHS" } of entries) {
    totals.set(currency, (totals.get(currency) ?? 0) + amount);
  }
  if (totals.size === 0) return formatPrice(0);
  return [...totals.entries()]
    .sort(([a], [b]) => (a === "GHS" ? -1 : b === "GHS" ? 1 : a.localeCompare(b)))
    .map(([currency, amount]) => formatPrice(amount, currency))
    .join(" + ");
}
