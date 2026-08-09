"use client";

import * as React from "react";

import { getDefaultKitState, loadKit, saveKit } from "@/lib/kit/storage";
import { calculateRentalDays, validateDateRange } from "@/lib/kit/rental";
import type { KitLineItem, KitState, ProjectInfo } from "@/lib/kit/types";

export interface KitContextValue {
  items: KitLineItem[];
  itemCount: number;
  startDate: string;
  endDate: string;
  rentalDays: number | null;
  dateError: string | null;
  projectInfo: ProjectInfo;
  drawerOpen: boolean;
  hydrated: boolean;
  addItem: (productSlug: string, quantity?: number) => void;
  removeItem: (productSlug: string) => void;
  setQuantity: (productSlug: string, quantity: number) => void;
  clearKit: () => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setProjectInfo: (patch: Partial<ProjectInfo>) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const KitContext = React.createContext<KitContextValue | null>(null);

export function KitProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<KitState>(getDefaultKitState);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  // Load any persisted kit once, after mount, to avoid an SSR/client
  // hydration mismatch (localStorage doesn't exist on the server). This is
  // the one legitimate case for a setState-in-effect: syncing from a
  // browser-only API that isn't available during the initial render.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadKit());
    setHydrated(true);
  }, []);

  // Persist on every change, once hydrated (so we don't immediately
  // overwrite a stored kit with the default state before it's loaded).
  React.useEffect(() => {
    if (!hydrated) return;
    saveKit(state);
  }, [state, hydrated]);

  const addItem = React.useCallback((productSlug: string, quantity = 1) => {
    setState((s) => {
      const existing = s.items.find((i) => i.productSlug === productSlug);
      const items = existing
        ? s.items.map((i) =>
            i.productSlug === productSlug ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [...s.items, { productSlug, quantity }];
      return { ...s, items };
    });
  }, []);

  const removeItem = React.useCallback((productSlug: string) => {
    setState((s) => ({ ...s, items: s.items.filter((i) => i.productSlug !== productSlug) }));
  }, []);

  const setQuantity = React.useCallback((productSlug: string, quantity: number) => {
    setState((s) => ({
      ...s,
      items: s.items.map((i) =>
        i.productSlug === productSlug ? { ...i, quantity: Math.max(1, quantity) } : i
      ),
    }));
  }, []);

  const clearKit = React.useCallback(() => {
    setState((s) => ({ ...s, items: [] }));
  }, []);

  const setStartDate = React.useCallback((date: string) => {
    setState((s) => ({ ...s, startDate: date }));
  }, []);

  const setEndDate = React.useCallback((date: string) => {
    setState((s) => ({ ...s, endDate: date }));
  }, []);

  const setProjectInfo = React.useCallback((patch: Partial<ProjectInfo>) => {
    setState((s) => ({ ...s, projectInfo: { ...s.projectInfo, ...patch } }));
  }, []);

  const { valid, error } = validateDateRange(state.startDate, state.endDate);
  const rentalDays = valid ? calculateRentalDays(state.startDate, state.endDate) : null;
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  const value: KitContextValue = {
    items: state.items,
    itemCount,
    startDate: state.startDate,
    endDate: state.endDate,
    rentalDays,
    dateError: error,
    projectInfo: state.projectInfo,
    drawerOpen,
    hydrated,
    addItem,
    removeItem,
    setQuantity,
    clearKit,
    setStartDate,
    setEndDate,
    setProjectInfo,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  };

  return <KitContext.Provider value={value}>{children}</KitContext.Provider>;
}

export function useKit(): KitContextValue {
  const ctx = React.useContext(KitContext);
  if (!ctx) throw new Error("useKit must be used within a KitProvider");
  return ctx;
}
