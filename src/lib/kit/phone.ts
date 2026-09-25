/**
 * A contact number is required to check out (it's how OUTTA reaches the
 * customer, and what the admin dashboard groups customers by). Accepts local
 * (024 123 4567) and international (+233 24 123 4567) formats.
 */
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\+?[\d\s().-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}
