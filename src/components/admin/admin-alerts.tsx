"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BellOff } from "lucide-react";

import type { AlertSummary } from "@/app/admin/alerts/route";

const POLL_MS = 5 * 60_000;
const SEEN_KEY = "outta-admin-alerts-seen";

interface AlertsContextValue {
  alerts: AlertSummary[];
}

const AlertsContext = React.createContext<AlertsContextValue>({ alerts: [] });

export function useAdminAlerts() {
  return React.useContext(AlertsContext);
}

function readSeen(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function writeSeen(seen: Set<string>) {
  try {
    // Only keep recent keys — each key starts with its date.
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-200)));
  } catch {
    // Storage unavailable — notifications may repeat, nothing breaks.
  }
}

/**
 * Checks for due/overdue rentals in the background (on load, every 5 minutes
 * and when the tab regains focus) without slowing page loads. Feeds the
 * sidebar badge and shows a browser notification for each new alert once
 * notifications are turned on.
 */
export function AdminAlertsProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = React.useState<AlertSummary[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  const check = React.useCallback(async () => {
    try {
      const res = await fetch("/admin/alerts", { cache: "no-store" });
      if (!res.ok) return;
      const { alerts: next } = (await res.json()) as { alerts: AlertSummary[] };
      setAlerts(next);

      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const seen = readSeen();
      const fresh = next.filter((a) => !seen.has(a.key));
      for (const alert of fresh) {
        const note = new Notification(`OUTTA — ${alert.label}`, {
          body: alert.customer,
          tag: alert.key,
          icon: "/brand/outta-favicon.png",
        });
        note.onclick = () => {
          window.focus();
          router.push(`/admin/quotes/${alert.quoteId}`);
        };
        seen.add(alert.key);
      }
      if (fresh.length) writeSeen(seen);
    } catch {
      // Offline or signed out — try again next time.
    }
  }, [router]);

  React.useEffect(() => {
    // Kick off after the page has painted so it never delays navigation.
    const first = setTimeout(check, 1500);
    const interval = setInterval(check, POLL_MS);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [check]);

  // Re-check after actions like "Mark returned" move you around admin.
  React.useEffect(() => {
    const t = setTimeout(check, 800);
    return () => clearTimeout(t);
  }, [pathname, check]);

  return <AlertsContext.Provider value={{ alerts }}>{children}</AlertsContext.Provider>;
}

/** Count badge for the sidebar's Dashboard link. */
export function AlertsBadge() {
  const { alerts } = useAdminAlerts();
  if (alerts.length === 0) return null;
  const urgent = alerts.some((a) => a.urgent);
  return (
    <span
      aria-label={`${alerts.length} alert${alerts.length === 1 ? "" : "s"}`}
      className={
        urgent
          ? "ml-auto rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white"
          : "ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-black"
      }
    >
      {alerts.length}
    </span>
  );
}

/** Lets the admin turn on browser pop-ups (browsers require a click to ask). */
export function NotificationToggle() {
  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">(
    "default"
  );

  React.useEffect(() => {
    // Read after mount: Notification doesn't exist during server rendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);

  if (permission === "unsupported") return null;

  const base =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-brand-foreground/85 transition-colors hover:bg-brand-foreground/10 hover:text-brand-foreground";

  if (permission === "granted") {
    return (
      <p className={base.replace("hover:bg-brand-foreground/10 hover:text-brand-foreground", "")}>
        <Bell className="size-4" /> Alerts on
      </p>
    );
  }
  if (permission === "denied") {
    return (
      <p className={base} title="Allow notifications for this site in your browser settings">
        <BellOff className="size-4" /> Alerts blocked in browser
      </p>
    );
  }
  return (
    <button
      type="button"
      className={base}
      onClick={async () => setPermission(await Notification.requestPermission())}
    >
      <Bell className="size-4" /> Turn on alerts
    </button>
  );
}
