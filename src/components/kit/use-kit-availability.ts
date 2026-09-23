"use client";

import * as React from "react";

import { useKit } from "@/components/kit/kit-provider";
import { checkKitAvailability, type KitAvailabilityResult } from "@/lib/catalogue/actions";

// Shared across components so the kit page and its Send Kit button make one
// request per kit/date combination, not one each.
const cache = new Map<string, Promise<KitAvailabilityResult[]>>();

/**
 * Availability of every kit item for the chosen dates, re-checked
 * automatically (debounced) whenever the kit or dates change. Empty while
 * dates are invalid or the kit is empty.
 */
export function useKitAvailability() {
  const { items, startDate, endDate, dateError } = useKit();
  // Results are stored with the request they answer, so stale results are
  // never shown for a changed kit — no need to reset state in the effect.
  const [answer, setAnswer] = React.useState<{ key: string; results: KitAvailabilityResult[] }>();

  const request = React.useMemo(() => {
    if (dateError || items.length === 0) return null;
    return {
      key: JSON.stringify([items, startDate, endDate]),
      items: items.map((i) => ({ productSlug: i.productSlug, quantity: i.quantity })),
      startDate,
      endDate,
    };
  }, [items, startDate, endDate, dateError]);

  React.useEffect(() => {
    if (!request) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      let pending = cache.get(request.key);
      if (!pending) {
        pending = checkKitAvailability(request.items, request.startDate, request.endDate);
        cache.set(request.key, pending);
        pending.catch(() => cache.delete(request.key));
      }
      pending
        .then((results) => {
          if (!cancelled) setAnswer({ key: request.key, results });
        })
        .catch(() => {
          if (!cancelled) setAnswer({ key: request.key, results: [] });
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [request]);

  const current = request && answer?.key === request.key ? answer.results : [];
  const checking = Boolean(request) && answer?.key !== request?.key;
  const unavailable = current.filter((r) => !r.available);
  return { results: current, unavailable, checking };
}
