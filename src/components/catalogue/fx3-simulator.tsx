"use client";

import * as React from "react";
import { Check, ChevronLeft, ChevronRight, Info, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  exposureReadout,
  fx3Items,
  fx3StartState,
  fx3Tabs,
  isLog,
  normalizeFx3,
  optionsFor,
  resolutionOf,
  type Fx3Item,
  type Fx3State,
} from "@/lib/simulators/fx3";

/**
 * OUTTA's own Sony FX3 menu trainer: a camera-style standby screen whose
 * readouts can be tapped, plus the MENU tabs for the key movie settings.
 * Changes cascade the way they do on the camera (see `normalizeFx3`).
 */
function Fx3Simulator() {
  const [state, setState] = React.useState<Fx3State>(fx3StartState);
  const [view, setView] = React.useState<"live" | "menu">("live");
  const [tabId, setTabId] = React.useState(fx3Tabs[0].id);
  const [picking, setPicking] = React.useState<Fx3Item | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [recording, setRecording] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);

  React.useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  function choose(item: Fx3Item, value: string) {
    const next = normalizeFx3({ ...state, [item.id]: value });
    const knockOn = (Object.keys(next) as (keyof Fx3State)[])
      .filter((key) => key !== item.id && next[key] !== state[key])
      .map((key) => `${fx3Items[key]?.label ?? key} → ${next[key]}`);
    setState(next);
    setNotice(knockOn.length ? `Also changed: ${knockOn.join(", ")}` : null);
    setPicking(null);
  }

  function toggleRecord() {
    if (!recording) setSeconds(0);
    setRecording((r) => !r);
  }

  const tab = fx3Tabs.find((t) => t.id === tabId) ?? fx3Tabs[0];

  return (
    <div className="flex size-full flex-col items-center gap-3 overflow-y-auto bg-neutral-900 p-3 text-white sm:justify-center sm:gap-4 sm:p-6">
      <div className="relative flex min-h-[26rem] w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-2xl border-[6px] border-neutral-800 bg-neutral-950 shadow-2xl sm:max-h-[40rem]">
        {view === "live" ? (
          <LiveView
            state={state}
            recording={recording}
            seconds={seconds}
            onPick={(id) => setPicking(fx3Items[id])}
          />
        ) : (
          <MenuView
            state={state}
            recording={recording}
            tab={tab}
            onTab={setTabId}
            onPick={(id) => setPicking(fx3Items[id])}
          />
        )}

        {notice ? (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-start gap-2 rounded-lg bg-amber-400 px-3 py-2 text-xs font-medium text-neutral-950 shadow-lg">
            <Info className="mt-px size-3.5 shrink-0" />
            {notice}
          </div>
        ) : null}

        {picking ? (
          <Picker
            item={picking}
            state={state}
            recording={recording}
            onBack={() => setPicking(null)}
            onChoose={(v) => choose(picking, v)}
          />
        ) : null}
      </div>

      <div className="flex w-full max-w-5xl flex-wrap items-center justify-center gap-3">
        <HardButton
          onClick={() => {
            setPicking(null);
            setView((v) => (v === "live" ? "menu" : "live"));
          }}
        >
          {view === "live" ? "MENU" : "EXIT MENU"}
        </HardButton>
        <button
          type="button"
          onClick={toggleRecord}
          aria-label={recording ? "Stop recording" : "Start recording"}
          className="flex size-14 items-center justify-center rounded-full border-4 border-neutral-700 bg-red-600 text-xs font-bold tracking-wider shadow-lg transition-transform active:scale-95"
        >
          {recording ? <span className="size-4 rounded-sm bg-white" /> : "REC"}
        </button>
        <HardButton
          onClick={() => {
            setState(fx3StartState);
            setRecording(false);
            setPicking(null);
            setNotice("Settings reset to the starting setup.");
          }}
        >
          <RotateCcw className="size-3.5" /> RESET
        </HardButton>
      </div>
      <p className="max-w-xl text-center text-[0.6875rem] text-white/50">
        Practice simulator by OUTTA RENTALS. Menu names and options follow Sony&rsquo;s FX3 Help Guide; not
        affiliated with Sony. Some menu items are left out.
      </p>
    </div>
  );
}

function HardButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 min-w-24 items-center justify-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-4 text-xs font-semibold tracking-wider shadow transition-colors hover:bg-neutral-700 active:scale-95"
    >
      {children}
    </button>
  );
}

function formatTimecode(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function LiveView({
  state,
  recording,
  seconds,
  onPick,
}: {
  state: Fx3State;
  recording: boolean;
  seconds: number;
  onPick: (id: keyof Fx3State) => void;
}) {
  const shutter = state.shutterMode === "Angle" ? state.shutterAngle : state.shutterSpeed;
  const look = isLog(state)
    ? { id: "logShooting" as const, value: "S-Log3", sub: state.colorGamut }
    : {
        id: "pictureProfile" as const,
        value: state.pictureProfile === "Off" ? "PP Off" : state.pictureProfile,
        sub: fx3Items.pictureProfile.describe?.[state.pictureProfile]?.split("— ")[1] ?? "",
      };

  const cells: { id: keyof Fx3State; label: string; value: string; sub?: string }[] = [
    {
      id: state.shutterMode === "Angle" ? "shutterAngle" : "shutterSpeed",
      label: "Shutter",
      value: state.exposureMode === "Program Auto" || state.exposureMode === "Aperture Priority" ? "AUTO" : shutter,
    },
    {
      id: "aperture",
      label: "Iris",
      value: state.exposureMode === "Program Auto" || state.exposureMode === "Shutter Priority" ? "AUTO" : state.aperture,
    },
    {
      id: isLog(state) && state.logShooting !== "Flexible ISO" ? "exposureIndex" : "iso",
      label: state.logShooting === "Cine EI" || state.logShooting === "Cine EI Quick" ? "EI" : "ISO",
      value: exposureReadout(state),
    },
    {
      id: state.whiteBalance === "C.Temp./Filter" ? "colorTemp" : "whiteBalance",
      label: "WB",
      value: state.whiteBalance === "C.Temp./Filter" ? state.colorTemp : state.whiteBalance,
    },
    { id: look.id, label: "Look", value: look.value, sub: look.sub },
    {
      id: "focusMode",
      label: "Focus",
      value: state.focusMode === "Manual Focus" ? "MF" : "AF-C",
      sub: state.focusMode === "Manual Focus" ? "" : state.focusArea,
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-white/10 px-3 py-2 font-mono text-xs sm:text-sm">
        {recording ? (
          <span className="flex items-center gap-1.5 font-bold text-red-500">
            <span className="size-2.5 animate-pulse rounded-full bg-red-500" /> REC {formatTimecode(seconds)}
          </span>
        ) : (
          <span className="font-bold text-green-400">STBY</span>
        )}
        <button type="button" onClick={() => onPick("fileFormat")} className="hover:text-amber-300">
          {state.fileFormat}
        </button>
        <button type="button" onClick={() => onPick("recFrameRate")} className="hover:text-amber-300">
          {state.recFrameRate}
        </button>
        <button type="button" onClick={() => onPick("recordSetting")} className="text-white/70 hover:text-amber-300">
          {state.recordSetting}
        </button>
        <span className="ml-auto flex gap-2 text-[0.6875rem] text-white/70">
          {state.proxyRecording === "On" ? <Tag>PROXY</Tag> : null}
          {state.steadyShot !== "Off" ? <Tag>SteadyShot {state.steadyShot}</Tag> : null}
          <Tag>{state.system}</Tag>
        </span>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,#3a3f45_0%,#15181b_70%)]">
        {state.zebra === "On" ? (
          <div
            aria-hidden
            className="absolute top-[18%] right-[16%] h-1/4 w-1/4 rounded-full opacity-60"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0 3px,transparent 3px 9px)" }}
          />
        ) : null}
        <FocusFrame state={state} />
        <p className="pointer-events-none absolute bottom-3 px-6 text-center text-xs text-white/50">
          {resolutionOf[state.fileFormat]} · Tap a setting to change it, or press MENU
        </p>
      </div>

      <div className="grid grid-cols-3 border-t border-white/10 sm:grid-cols-6">
        {cells.map((cell) => (
          <button
            key={cell.label}
            type="button"
            onClick={() => onPick(cell.id)}
            className="flex min-w-0 flex-col items-start gap-0.5 border-white/10 px-3 py-2.5 text-left transition-colors not-last:border-r hover:bg-white/5 max-sm:nth-[3n]:border-r-0 max-sm:nth-[-n+3]:border-b"
          >
            <span className="text-[0.625rem] tracking-wider text-white/50 uppercase">{cell.label}</span>
            <span className="w-full truncate font-mono text-sm font-semibold sm:text-base">{cell.value}</span>
            {cell.sub ? <span className="w-full truncate text-[0.625rem] text-white/50">{cell.sub}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded border border-white/25 px-1.5 py-px">{children}</span>;
}

function FocusFrame({ state }: { state: Fx3State }) {
  if (state.focusMode === "Manual Focus") {
    return <span className="font-mono text-sm text-white/60">MF</span>;
  }
  const size: Record<string, string> = {
    Wide: "h-[80%] w-[88%]",
    Zone: "h-1/2 w-1/2",
    "Center Fix": "size-16",
    "Spot: S": "size-8",
    "Spot: M": "size-12",
    "Spot: L": "size-16",
    "Expand Spot": "size-14",
  };
  const corners = state.focusArea === "Wide" || state.focusArea === "Zone";
  return (
    <div
      aria-hidden
      className={cn(
        "relative",
        size[state.focusArea],
        corners ? "" : "rounded-sm border-2 border-white/80"
      )}
    >
      {corners
        ? ["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "bottom-0 left-0 border-b-2 border-l-2", "right-0 bottom-0 border-r-2 border-b-2"].map(
            (c) => <span key={c} className={cn("absolute size-5 border-white/70", c)} />
          )
        : null}
      {state.faceEye === "On" ? (
        <span className="absolute -top-5 left-0 text-[0.625rem] whitespace-nowrap text-white/60">
          Face/Eye: {state.faceEyeSubject}
        </span>
      ) : null}
    </div>
  );
}

function MenuView({
  state,
  recording,
  tab,
  onTab,
  onPick,
}: {
  state: Fx3State;
  recording: boolean;
  tab: (typeof fx3Tabs)[number];
  onTab: (id: string) => void;
  onPick: (id: keyof Fx3State) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
      <nav className="scrollbar-none flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 p-2 sm:w-44 sm:flex-col sm:border-r sm:border-b-0">
        {fx3Tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTab(t.id)}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-left text-xs font-semibold whitespace-nowrap transition-colors sm:text-sm",
              t.id === tab.id ? "bg-amber-400 text-neutral-950" : "text-white/70 hover:bg-white/10"
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
        {tab.groups.map((group) => {
          const items = group.items.map((id) => fx3Items[id]).filter((item) => !item.hidden?.(state));
          if (items.length === 0) return null;
          return (
            <section key={group.title} className="mb-3">
              {tab.id !== "main" ? (
                <p className="px-2 pb-1 text-[0.625rem] font-semibold tracking-wider text-amber-300/80 uppercase">
                  {group.title}
                </p>
              ) : null}
              <ul className="flex flex-col">
                {items.map((item) => {
                  const reason = item.disabled?.(state, recording) ?? null;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onPick(item.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-white/5",
                          reason ? "text-white/40" : ""
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        <span className="max-w-[45%] truncate font-mono text-xs text-white/70">
                          {state[item.id]}
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-white/40" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Picker({
  item,
  state,
  recording,
  onBack,
  onChoose,
}: {
  item: Fx3Item;
  state: Fx3State;
  recording: boolean;
  onBack: () => void;
  onChoose: (value: string) => void;
}) {
  const reason = item.disabled?.(state, recording) ?? null;
  const current = state[item.id];
  const listRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    listRef.current?.querySelector("[data-current]")?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-neutral-950">
      <div className="flex items-center gap-2 border-b border-white/10 px-2 py-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-md hover:bg-white/10"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="text-sm font-semibold">{item.label}</p>
      </div>
      <p className="border-b border-white/10 px-4 py-2.5 text-xs leading-relaxed text-white/70">{item.help}</p>
      {reason ? (
        <p className="m-4 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
          {reason}
        </p>
      ) : (
        <ul ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2">
          {optionsFor(item, state).map((option) => {
            const selected = option === current;
            return (
              <li key={option}>
                <button
                  type="button"
                  data-current={selected || undefined}
                  onClick={() => onChoose(option)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                    selected ? "bg-amber-400 font-semibold text-neutral-950" : "hover:bg-white/10"
                  )}
                >
                  <span className="flex-1">{item.describe?.[option] ?? option}</span>
                  {selected ? <Check className="size-4 shrink-0" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Fx3Simulator;
