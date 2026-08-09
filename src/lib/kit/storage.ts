import { emptyProjectInfo, type KitState } from "./types";

const STORAGE_KEY = "outta-kit-v1";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
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
      items: Array.isArray(parsed.items) ? parsed.items : fallback.items,
      startDate: parsed.startDate ?? fallback.startDate,
      endDate: parsed.endDate ?? fallback.endDate,
      projectInfo: { ...fallback.projectInfo, ...parsed.projectInfo },
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
