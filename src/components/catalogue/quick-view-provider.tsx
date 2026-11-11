"use client";

import * as React from "react";

import type { DemoProduct } from "@/lib/catalogue";

export interface QuickViewContextValue {
  product: DemoProduct | null;
  open: (product: DemoProduct) => void;
  close: () => void;
}

const QuickViewContext = React.createContext<QuickViewContextValue | null>(null);

/**
 * Holds which equipment's quick-view popup is open, site-wide — every
 * product card opens the same popup instead of navigating to a full page
 * (see `EquipmentQuickView`, mounted once in `SiteChrome`).
 */
function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = React.useState<DemoProduct | null>(null);

  const open = React.useCallback((next: DemoProduct) => setProduct(next), []);
  const close = React.useCallback(() => setProduct(null), []);

  const value = React.useMemo(() => ({ product, open, close }), [product, open, close]);

  return <QuickViewContext.Provider value={value}>{children}</QuickViewContext.Provider>;
}

function useQuickView(): QuickViewContextValue {
  const ctx = React.useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used within a QuickViewProvider");
  return ctx;
}

export { QuickViewProvider, useQuickView };
