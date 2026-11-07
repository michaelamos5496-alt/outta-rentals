"use client";

import * as React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ArrowUpRight, LoaderCircle, MonitorPlay, Smartphone, X } from "lucide-react";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { getCameraSimulator, type ArriSimulator, type CameraSimulator } from "@/lib/camera-simulators";

// OUTTA's own KOMODO simulator, only downloaded once its viewer opens.
const KomodoSimulator = dynamic(() => import("@/components/catalogue/komodo-simulator"), { ssr: false });

/**
 * "Try the camera menu" card for bodies that have a simulator. Renders
 * nothing for other products. The simulator only loads once the viewer is
 * opened, so product pages don't pay for it on every visit.
 */
function CameraSimulatorCard({
  productSlug,
  simulator: given,
  className,
}: {
  productSlug?: string;
  simulator?: CameraSimulator;
  className?: string;
}) {
  const simulator = given ?? (productSlug ? getCameraSimulator(productSlug) : undefined);
  const [open, setOpen] = React.useState(false);
  if (!simulator) return null;

  return (
    <>
      <div className={cn("flex items-start gap-4 rounded-xl border border-border bg-muted/50 p-4", className)}>
        <MonitorPlay className="size-8 shrink-0 text-brand" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <p className="text-label text-brand">Try Before You Rent</p>
          <p className="mt-0.5 text-sm font-medium">Explore the {simulator.cameraName} menu</p>
          <p className="text-small mt-1">
            Practise the camera&rsquo;s menus and settings on the interactive simulator before your shoot.
          </p>
          <Button size="sm" className="mt-3" onClick={() => setOpen(true)}>
            <MonitorPlay /> Launch simulator
          </Button>
        </div>
      </div>
      <CameraSimulatorViewer simulator={simulator} open={open} onOpenChange={setOpen} />
    </>
  );
}

/** Full-screen, OUTTA-branded frame around ARRI's simulator app. */
function CameraSimulatorViewer({
  simulator,
  open,
  onOpenChange,
}: {
  simulator: CameraSimulator;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none bg-black p-0 ring-0 sm:max-w-none"
      >
        {/* On short screens (a phone turned sideways) the header and footer
            give way to a small logo and close button over the black margins,
            so the simulator gets the full height. */}
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 bg-brand px-3 sm:h-16 sm:px-5 [@media(max-height:500px)]:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex shrink-0 items-center rounded-lg bg-white px-2.5 py-1.5">
              <Image
                src="/brand/outta-logo.png"
                unoptimized
                alt={siteConfig.name}
                width={595}
                height={225}
                className="h-6 w-auto sm:h-7"
              />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-sm font-semibold text-white sm:text-base">
                {simulator.cameraName} Simulator
              </DialogTitle>
              <DialogDescription className="truncate text-xs text-white/70">
                {simulator.kind === "arri" ? "Interactive camera menu by ARRI" : "Touchscreen practice by OUTTA RENTALS"}
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close simulator"
              className="shrink-0 text-white hover:bg-white/10 hover:text-white"
            >
              <X />
            </Button>
          </DialogClose>
        </div>

        <div className="relative min-h-0 flex-1">
          {/* Radix unmounts the content when closed, so each open starts fresh. */}
          {simulator.kind === "arri" ? <ArriFrame simulator={simulator} /> : <KomodoSimulator />}
          <span className="absolute top-2 left-2 z-20 hidden items-center rounded-md bg-white px-2 py-1 [@media(max-height:500px)]:inline-flex">
            <Image
              src="/brand/outta-logo.png"
              unoptimized
              alt={siteConfig.name}
              width={595}
              height={225}
              className="h-5 w-auto"
            />
          </span>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close simulator"
              className="absolute top-2 right-2 z-20 hidden bg-white/10 text-white hover:bg-white/20 hover:text-white [@media(max-height:500px)]:inline-flex"
            >
              <X />
            </Button>
          </DialogClose>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 bg-brand px-3 py-2 text-xs text-white/70 sm:px-5 [@media(max-height:500px)]:hidden">
          <span>
            {simulator.kind === "arri" ? "Simulator © ARRI. " : ""}Rent the {simulator.cameraName} from {siteConfig.name}.
          </span>
          <a
            href={simulator.kind === "arri" ? simulator.arriPage : simulator.guideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 hover:text-white"
          >
            {simulator.kind === "arri" ? "arri.com" : "RED guide"} <ArrowUpRight className="size-3" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * ARRI's app draws a fixed-size canvas, pins it top-left and scales it to fit
 * its window once loaded (its own `autofit`), filling the rest with white. So
 * the frame is sized to the canvas's own shape and centred on black, and the
 * app stays hidden behind a spinner until it has loaded and fitted itself.
 */
function ArriFrame({ simulator }: { simulator: ArriSimulator }) {
  const [loaded, setLoaded] = React.useState(false);
  const [box, setBox] = React.useState<{ width: number; height: number; portrait: boolean } | null>(null);
  const [rotateHint, setRotateHint] = React.useState(true);
  const areaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const { width: cw, height: ch, maxScale } = simulator.canvas;
    const fit = () => {
      const { width, height } = area.getBoundingClientRect();
      const scale = Math.min(width / cw, height / ch, maxScale);
      setBox({ width: Math.floor(cw * scale), height: Math.floor(ch * scale), portrait: height > width && width < 768 });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(area);
    return () => observer.disconnect();
  }, [simulator.canvas]);

  return (
    <div ref={areaRef} className="absolute inset-0 flex items-center justify-center bg-black">
      {!loaded ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-sm text-white/70">
          <LoaderCircle className="size-6 animate-spin" />
          <p>
            Loading simulator&hellip;
            <br />
            <span className="text-xs text-white/50">ARRI&rsquo;s simulator can take up to a minute to load.</span>
          </p>
        </div>
      ) : null}
      {box ? (
        <iframe
          src={simulator.url}
          title={`${simulator.cameraName} camera simulator`}
          onLoad={() => setLoaded(true)}
          style={{ width: box.width, height: box.height }}
          className={cn("shrink-0 border-0 bg-white transition-opacity", loaded ? "opacity-100" : "opacity-0")}
          allow="fullscreen"
        />
      ) : null}
      {box?.portrait && rotateHint ? (
        <button
          type="button"
          onClick={() => setRotateHint(false)}
          className="absolute inset-x-4 top-4 z-10 flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left text-sm text-white backdrop-blur"
        >
          <Smartphone className="size-6 shrink-0 rotate-90 text-white/80" />
          <span className="flex-1">
            Rotate your phone for the best view.
            <span className="block text-xs text-white/60">Tap to dismiss</span>
          </span>
        </button>
      ) : null}
    </div>
  );
}

export { CameraSimulatorCard };
