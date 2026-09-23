import { getProductBySlug } from "@/lib/catalogue";
import { emptyProjectInfo, type KitLineItem, type KitState, type ProjectInfo } from "./types";

const STORAGE_KEY = "outta-kit-v1";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Drops malformed entries and products that are no longer in the catalogue,
// so a stale kit can't show a count for items the kit page can't render.
function isValidStoredItem(item: unknown): item is KitLineItem {
  if (!item || typeof item !== "object") return false;
  const { productSlug, quantity } = item as Partial<KitLineItem>;
  return (
    typeof productSlug === "string" &&
    Number.isInteger(quantity) &&
    (quantity as number) > 0 &&
    Boolean(getProductBySlug(productSlug))
  );
}

function sanitizeProjectInfo(stored: unknown, fallback: ProjectInfo): ProjectInfo {
  if (!stored || typeof stored !== "object") return fallback;
  const result = { ...fallback };
  for (const key of Object.keys(fallback) as (keyof ProjectInfo)[]) {
    const value = (stored as Record<string, unknown>)[key];
    if (typeof value === "string") result[key] = value;
  }
  return result;
}

export function getDefaultKitState(): KitState {
  const today = todayIso();
  return { items: [], startDate: today, endDate: today, projectInfo: { ...emptyProjectInfo } };
}

/**
 * Persistence is abstracted behind these two functions so the storage
 * backend can change without touching `KitProvider`. Today this reads and
 * writes `localStorage` for guest/anonymous kits. Once accounts exist, swap
 * the body of these functions for an authenticated API call (e.g. GET/PUT
 * `/api/kit`) keyed to the signed-in user — the provider's call sites don't
 * need to change.
 */
export function loadKit(): KitState {
  if (typeof window === "undefined") return getDefaultKitState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultKitState();
    const parsed = JSON.parse(raw) as Partial<KitState>;
    const fallback = getDefaultKitState();
    return {
      items: Array.isArray(parsed.items) ? parsed.items.filter(isValidStoredItem) : fallback.items,
      startDate: typeof parsed.startDate === "string" ? parsed.startDate : fallback.startDate,
      endDate: typeof parsed.endDate === "string" ? parsed.endDate : fallback.endDate,
      projectInfo: sanitizeProjectInfo(parsed.projectInfo, fallback.projectInfo),
    };
  } catch {
    return getDefaultKitState();
  }
}

export function saveKit(state: KitState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can fail (private browsing, quota). The kit still works for
    // the current session via in-memory state; it just won't persist.
  }
}
