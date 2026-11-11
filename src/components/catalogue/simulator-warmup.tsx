"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { cameraSimulators, type ArriSimulator } from "@/lib/camera-simulators";

const DONE_KEY = "outta-simulators-warmed";

interface NetworkInfo {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * Loads ARRI's simulators in the background once any page of the site has
 * finished loading, so the browser has their files (~12 MB, served slowly
 * and uncompressed by ARRI) cached by the time someone opens one. Runs once
 * per visit, one simulator at a time, and skips visitors with data saver on
 * or a slow connection. Pages that show a simulator load it themselves.
 */
function SimulatorWarmup() {
  const pathname = usePathname();
  const [active, setActive] = React.useState<ArriSimulator | null>(null);
  const queue = React.useRef<ArriSimulator[]>([]);

  React.useEffect(() => {
    try {
      if (sessionStorage.getItem(DONE_KEY)) return;
    } catch {
      // Storage blocked: warm up anyway, it's only a cache hint.
    }
    const connection = (navigator as Navigator & { connection?: NetworkInfo }).connection;
    if (connection?.saveData || /(^|-)2g$|^3g$/.test(connection?.effectiveType ?? "")) return;

    const onSimulatorPage =
      pathname === "/camera-simulators" ||
      cameraSimulators.some((s) => s.productSlugs.some((slug) => pathname === `/equipment/${slug}`));
    if (onSimulatorPage) return;

    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      queue.current = cameraSimulators.filter((s): s is ArriSimulator => s.kind === "arri");
      setActive(queue.current.shift() ?? null);
    };
    // Let the page itself finish loading first.
    const idle = () => setTimeout(start, 2500);
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", idle);
    };
    // Only on the first page of a visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!active) return null;

  return (
    <iframe
      key={active.id}
      src={active.url}
      title=""
      aria-hidden
      tabIndex={-1}
      onLoad={() => {
        const next = queue.current.shift() ?? null;
        if (!next) {
          try {
            sessionStorage.setItem(DONE_KEY, "1");
          } catch {
            // ignore
          }
        }
        setActive(next);
      }}
      style={{ position: "fixed", width: 1, height: 1, left: -10, top: -10, opacity: 0, pointerEvents: "none", border: 0 }}
    />
  );
}

export { SimulatorWarmup };
