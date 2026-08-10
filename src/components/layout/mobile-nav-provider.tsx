"use client";

import * as React from "react";

// Shared open/close state for the full-screen mobile nav panel (defined in
// `navbar.tsx`) so both the navbar's own hamburger button AND the mobile tab
// bar's "Menu" tab can control the same panel.
export interface MobileNavContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MobileNavContext = React.createContext<MobileNavContextValue | null>(null);

function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const value = React.useMemo(() => ({ open, setOpen }), [open]);
  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>;
}

function useMobileNav(): MobileNavContextValue {
  const ctx = React.useContext(MobileNavContext);
  if (!ctx) throw new Error("useMobileNav must be used within a MobileNavProvider");
  return ctx;
}

export { MobileNavProvider, useMobileNav };
