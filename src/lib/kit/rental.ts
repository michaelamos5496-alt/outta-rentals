const MS_PER_DAY = 86_400_000;

/** Pickup/return window, 24h "HH:MM". */
export const OPENING_TIME = "07:00";
export const CLOSING_TIME = "21:00";
export const DEFAULT_TIME = "09:00";

export function isWithinOpeningHours(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time) && time >= OPENING_TIME && time <= CLOSING_TIME;
}

/** "08:30" -> "8:30 AM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

function parseDate(iso: string): Date | null {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Inclusive day count: a same-day rental is 1 day, next-day is 2 days. */
export function calculateRentalDays(startDate: string, endDate: string): number | null {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return null;
  const diff = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
  if (diff < 0) return null;
  return diff + 1;
}

export interface DateRangeValidation {
  valid: boolean;
  error: string | null;
}

export function validateDateRange(startDate: string, endDate: string): DateRangeValidation {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) {
    return { valid: false, error: "Choose a start and end date." };
  }

  const today = parseDate(todayIso())!;
  if (start.getTime() < today.getTime()) {
    return { valid: false, error: "Start date can't be in the past." };
  }
  if (end.getTime() < start.getTime()) {
    return { valid: false, error: "End date must be on or after the start date." };
  }

  return { valid: true, error: null };
}
