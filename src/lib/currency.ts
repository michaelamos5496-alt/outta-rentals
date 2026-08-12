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
