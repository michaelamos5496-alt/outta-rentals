/** OUTTA RENTALS prices in Ghana Cedis. */
export function formatPrice(amount: number): string {
  return `₵${amount.toLocaleString()}`;
}
