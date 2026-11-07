"use client";

import * as React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ArrowUpRight, LoaderCircle, MonitorPlay, X } from "lucide-react";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { getCameraSimulator, type CameraSimulator } from "@/lib/camera-simulators";

// Only downloaded once someone opens the FX3 viewer.
const Fx3Simulator = dynamic(() => import("@/components/catalogue/fx3-simulator"), {
  ssr: false,
  loading: () => <Loading />,
});

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

/** Full-screen, OUTTA-branded frame around a camera simulator. */
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
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 bg-brand px-3 sm:h-16 sm:px-5">
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
                {simulator.kind === "arri" ? "Interactive camera menu by ARRI" : "Menu practice by OUTTA RENTALS"}
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
          {simulator.kind === "arri" ? <ArriFrame simulator={simulator} /> : <Fx3Simulator />}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 bg-brand px-3 py-2 text-xs text-white/70 sm:px-5">
          {simulator.kind === "arri" ? (
            <>
              <span>Simulator &copy; ARRI. Rent the {simulator.cameraName} from {siteConfig.name}.</span>
              <a
                href={simulator.arriPage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 hover:text-white"
              >
                arri.com <ArrowUpRight className="size-3" />
              </a>
            </>
          ) : (
            <span>Rent the {simulator.cameraName} from {siteConfig.name}.</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * ARRI's app takes several seconds to load and only scales its 2880px canvas
 * to fit once it has (its own `autofit` on window load). Keep it hidden behind
 * a spinner until then so viewers never see it oversized.
 */
function ArriFrame({ simulator }: { simulator: Extract<CameraSimulator, { kind: "arri" }> }) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <>
      {!loaded ? <Loading /> : null}
      <iframe
        src={simulator.url}
        title={`${simulator.cameraName} camera simulator`}
        onLoad={() => setLoaded(true)}
        className={cn(
          "relative size-full border-0 bg-white transition-opacity",
          loaded ? "opacity-100" : "opacity-0"
        )}
        allow="fullscreen"
      />
    </>
  );
}

function Loading() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-white/70">
      <LoaderCircle className="size-6 animate-spin" />
      Loading simulator&hellip;
    </div>
  );
}

export { CameraSimulatorCard };
