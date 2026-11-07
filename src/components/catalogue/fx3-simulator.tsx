"use client";

import * as React from "react";
import {
  CircleHelp,
  Focus,
  Globe,
  House,
  Play,
  RotateCcw,
  Star,
  SunMedium,
  Toolbox,
  Undo2,
  Video,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  exposureReadout,
  fx3Items,
  fx3MainPages,
  fx3StartState,
  fx3Tabs,
  isCineEi,
  isLog,
  normalizeFx3,
  optionsFor,
  resolutionOf,
  type Fx3Item,
  type Fx3State,
} from "@/lib/simulators/fx3";

/**
 * OUTTA's own Sony FX3 menu trainer, laid out like the camera's menu: a tab
 * column, numbered group column and item list on a 3:2 screen (sized in
 * container units so it scales like the real LCD), driven by an on-screen
 * control wheel, the keyboard or touch. Settings cascade the way they do on
 * the camera (see `normalizeFx3`).
 */

// The camera's full tab column. Tabs without a `data` entry (My Menu,
// Playback, Network) are shown but not part of this practice simulator.
const TABS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "mymenu", label: "My Menu", icon: Star },
  { key: "main", label: "Main", icon: House },
  { key: "shooting", label: "Shooting", icon: Video },
  { key: "exposure", label: "Exposure/Color", icon: SunMedium },
  { key: "focus", label: "Focus", icon: Focus },
  { key: "playback", label: "Playback", icon: Play },
  { key: "network", label: "Network", icon: Globe },
  { key: "setup", label: "Setup", icon: Toolbox },
];

const ROWS = 7;
const ORANGE = "bg-[#e8731d]";
const SCREEN_FONT = { fontFamily: "Helvetica, Arial, sans-serif" };

type Column = "tabs" | "groups" | "items";
interface Nav {
  col: Column;
  tab: number;
  group: number;
  item: number;
}
interface Picking {
  item: Fx3Item;
  cursor: number;
}

interface Group {
  title: string;
  items: Fx3Item[];
}

/** Main tiles swap to the matching item for the current setup. */
function mainTile(id: keyof Fx3State, s: Fx3State): Fx3Item {
  if (id === "shutterSpeed" && s.shutterMode === "Angle") return fx3Items.shutterAngle;
  if (id === "iso" && isCineEi(s)) return fx3Items.exposureIndex;
  return fx3Items[id];
}

function groupsFor(tabKey: string, s: Fx3State): Group[] {
  if (tabKey === "main") {
    return fx3MainPages.map((page, i) => ({ title: `Main ${i + 1}`, items: page.map((id) => mainTile(id, s)) }));
  }
  const tab = fx3Tabs.find((t) => t.id === tabKey);
  if (!tab) return [];
  return tab.groups
    .map((g) => ({ title: g.title, items: g.items.map((id) => fx3Items[id]).filter((it) => !it.hidden?.(s)) }))
    .filter((g) => g.items.length > 0);
}

function Fx3Simulator() {
  const [state, setState] = React.useState<Fx3State>(fx3StartState);
  const [view, setView] = React.useState<"live" | "menu">("live");
  const [nav, setNav] = React.useState<Nav>({ col: "items", tab: 1, group: 0, item: 0 });
  const [picking, setPicking] = React.useState<Picking | null>(null);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [recording, setRecording] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

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

  // Lists change as settings hide or reveal items, so clamp the cursor here.
  const tabKey = TABS[nav.tab].key;
  const groups = groupsFor(tabKey, state);
  const group = Math.min(nav.group, Math.max(groups.length - 1, 0));
  const items = groups[group]?.items ?? [];
  const item = Math.min(nav.item, Math.max(items.length - 1, 0));
  const current = { ...nav, group, item };
  const highlighted = view === "menu" && current.col === "items" ? items[item] : undefined;

  function openPicker(target: Fx3Item) {
    const options = optionsFor(target, state);
    setHelpOpen(false);
    setPicking({ item: target, cursor: Math.max(options.indexOf(state[target.id]), 0) });
  }

  function choose(target: Fx3Item, value: string) {
    const next = normalizeFx3({ ...state, [target.id]: value });
    const knockOn = (Object.keys(next) as (keyof Fx3State)[])
      .filter((key) => key !== target.id && next[key] !== state[key])
      .map((key) => `${fx3Items[key]?.label ?? key}: ${next[key]}`);
    setState(next);
    setNotice(knockOn.length ? `Also changed — ${knockOn.join(", ")}` : null);
    setPicking(null);
  }

  function pressMenu() {
    setHelpOpen(false);
    if (picking) return setPicking(null);
    setView((v) => (v === "live" ? "menu" : "live"));
  }

  function move(direction: "up" | "down" | "left" | "right" | "center") {
    setHelpOpen(false);
    if (picking) {
      const options = optionsFor(picking.item, state);
      const reason = picking.item.disabled?.(state, recording);
      if (direction === "up") setPicking({ ...picking, cursor: Math.max(picking.cursor - 1, 0) });
      if (direction === "down") setPicking({ ...picking, cursor: Math.min(picking.cursor + 1, options.length - 1) });
      if (direction === "left") setPicking(null);
      if (direction === "center") {
        if (reason) setPicking(null);
        else choose(picking.item, options[picking.cursor]);
      }
      return;
    }
    if (view === "live") {
      if (direction === "center") setView("menu");
      return;
    }

    const isMain = tabKey === "main";
    const step = (n: number, len: number, by: number) => (len ? (n + by + len) % len : 0);
    const n = current;
    const next = ((): Nav => {
      if (n.col === "tabs") {
        if (direction === "up") return { ...n, tab: step(n.tab, TABS.length, -1), group: 0, item: 0 };
        if (direction === "down") return { ...n, tab: step(n.tab, TABS.length, 1), group: 0, item: 0 };
        if ((direction === "right" || direction === "center") && groups.length) return { ...n, col: "groups" };
        return n;
      }
      if (n.col === "groups") {
        if (direction === "up") return { ...n, group: step(n.group, groups.length, -1), item: 0 };
        if (direction === "down") return { ...n, group: step(n.group, groups.length, 1), item: 0 };
        if (direction === "left") return { ...n, col: "tabs" };
        if (direction === "right" || direction === "center") return { ...n, col: "items" };
        return n;
      }
      // Items. Main tiles sit in a two-column grid.
      if (direction === "left") {
        if (isMain && n.item % 2 === 1) return { ...n, item: n.item - 1 };
        return { ...n, col: "groups" };
      }
      if (direction === "right") {
        if (isMain && n.item % 2 === 0 && n.item + 1 < items.length) return { ...n, item: n.item + 1 };
        return n;
      }
      const by = isMain ? 2 : 1;
      if (direction === "down") {
        if (n.item + by < items.length) return { ...n, item: n.item + by };
        // Scrolling past the end runs on into the next group, like the camera.
        return { ...n, group: step(n.group, groups.length, 1), item: 0 };
      }
      if (direction === "up") {
        if (n.item - by >= 0) return { ...n, item: n.item - by };
        const prev = step(n.group, groups.length, -1);
        return { ...n, group: prev, item: Math.max((groups[prev]?.items.length ?? 1) - 1, 0) };
      }
      return n;
    })();
    if (n.col === "items" && direction === "center" && items[n.item]) openPicker(items[n.item]);
    else setNav(next);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const keys: Record<string, Parameters<typeof move>[0]> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      Enter: "center",
      " ": "center",
    };
    if (keys[e.key]) {
      e.preventDefault();
      move(keys[e.key]);
    } else if (e.key === "Backspace" || e.key.toLowerCase() === "m") {
      e.preventDefault();
      pressMenu();
    }
  }

  const helpItem = picking?.item ?? highlighted;

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className="flex size-full flex-col items-center gap-4 overflow-y-auto bg-neutral-900 p-3 text-white outline-none sm:justify-center sm:p-6"
    >
      <div className="w-full max-w-[52rem] rounded-[1.4rem] border border-neutral-700 bg-neutral-950 p-[1.2%] shadow-2xl">
        <div
          style={SCREEN_FONT}
          className="@container relative aspect-[3/2] w-full overflow-hidden rounded-md bg-black select-none"
        >
          {view === "live" ? (
            <LiveScreen state={state} recording={recording} seconds={seconds} onPick={openPicker} />
          ) : (
            <MenuScreen
              state={state}
              recording={recording}
              nav={current}
              groups={groups}
              onNav={(n) => {
                setHelpOpen(false);
                setNav(n);
              }}
              onOpen={openPicker}
              onHelp={() => setHelpOpen((h) => !h)}
              onBack={pressMenu}
            />
          )}

          {picking ? (
            <SettingScreen
              picking={picking}
              state={state}
              recording={recording}
              onChoose={(v) => choose(picking.item, v)}
              onHelp={() => setHelpOpen((h) => !h)}
              onBack={() => setPicking(null)}
            />
          ) : null}

          {helpOpen && helpItem ? (
            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              className="absolute inset-x-[8cqw] top-[12cqw] z-30 rounded-[0.6cqw] border border-white/40 bg-[#1c1c1c] p-[2.4cqw] text-left text-[2.2cqw] leading-snug shadow-xl"
            >
              <span className="mb-[1cqw] block text-[2.4cqw] font-bold">{helpItem.label}</span>
              {helpItem.help}
            </button>
          ) : null}

          {notice ? (
            <div className="pointer-events-none absolute inset-x-[6cqw] bottom-[8cqw] z-20 rounded-[0.6cqw] border border-white/30 bg-[#262626]/95 px-[2cqw] py-[1.4cqw] text-center text-[2cqw]">
              {notice}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex w-full max-w-[52rem] items-center justify-center gap-5 sm:gap-10">
        <CameraKey label="MENU" onClick={pressMenu} />
        <ControlWheel onPress={move} />
        <button
          type="button"
          onClick={() => {
            if (!recording) setSeconds(0);
            setRecording((r) => !r);
          }}
          aria-label={recording ? "Stop recording" : "Start recording"}
          className="flex size-14 items-center justify-center rounded-full border-4 border-neutral-700 bg-red-600 text-[0.65rem] font-bold tracking-wider shadow-lg transition-transform active:scale-95"
        >
          {recording ? <span className="size-4 rounded-sm bg-white" /> : "REC"}
        </button>
      </div>

      <div className="flex max-w-xl flex-col items-center gap-2 text-center text-[0.6875rem] text-white/50">
        <p>
          Use the control wheel (or your arrow keys and Enter) like the camera&rsquo;s, or tap the screen. MENU goes
          back.
        </p>
        <button
          type="button"
          onClick={() => {
            setState(fx3StartState);
            setRecording(false);
            setPicking(null);
            setNotice("Settings reset to the starting setup.");
          }}
          className="inline-flex items-center gap-1 underline-offset-2 hover:text-white hover:underline"
        >
          <RotateCcw className="size-3" /> Reset settings
        </button>
        <p>
          Practice simulator by OUTTA RENTALS. Menu names and options follow Sony&rsquo;s FX3 Help Guide; not
          affiliated with Sony. Some menu items are left out.
        </p>
      </div>
    </div>
  );
}

function CameraKey({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="h-7 w-12 rounded-full border border-neutral-600 bg-neutral-800 shadow transition-transform active:scale-95"
      />
      <span className="text-[0.625rem] font-semibold tracking-wider text-white/70">{label}</span>
    </div>
  );
}

function ControlWheel({ onPress }: { onPress: (d: "up" | "down" | "left" | "right" | "center") => void }) {
  const arrow = "absolute flex items-center justify-center text-white/60 hover:text-white active:text-[#e8731d]";
  return (
    <div className="relative size-28 shrink-0 rounded-full border-4 border-neutral-700 bg-neutral-800 shadow-lg">
      <button type="button" aria-label="Up" onClick={() => onPress("up")} className={cn(arrow, "inset-x-8 top-0 h-8")}>
        ▲
      </button>
      <button type="button" aria-label="Down" onClick={() => onPress("down")} className={cn(arrow, "inset-x-8 bottom-0 h-8")}>
        ▼
      </button>
      <button type="button" aria-label="Left" onClick={() => onPress("left")} className={cn(arrow, "inset-y-8 left-0 w-8")}>
        ◀
      </button>
      <button type="button" aria-label="Right" onClick={() => onPress("right")} className={cn(arrow, "inset-y-8 right-0 w-8")}>
        ▶
      </button>
      <button
        type="button"
        aria-label="Select"
        onClick={() => onPress("center")}
        className="absolute inset-9 rounded-full border border-neutral-600 bg-neutral-700 shadow-inner active:bg-neutral-600"
      />
    </div>
  );
}

function MenuScreen({
  state,
  recording,
  nav,
  groups,
  onNav,
  onOpen,
  onHelp,
  onBack,
}: {
  state: Fx3State;
  recording: boolean;
  nav: Nav;
  groups: Group[];
  onNav: (n: Nav) => void;
  onOpen: (item: Fx3Item) => void;
  onHelp: () => void;
  onBack: () => void;
}) {
  const tab = TABS[nav.tab];
  const isMain = tab.key === "main";
  const items = groups[nav.group]?.items ?? [];
  const pages = isMain ? 1 : Math.max(Math.ceil(items.length / ROWS), 1);
  const page = isMain ? 0 : Math.floor(nav.item / ROWS);
  const shown = isMain ? items : items.slice(page * ROWS, page * ROWS + ROWS);
  const title = nav.col === "tabs" || !groups.length ? tab.label : isMain ? "Main" : groups[nav.group].title;
  const pageLabel = isMain ? `${nav.group + 1}/${groups.length}` : `${page + 1}/${pages}`;

  return (
    <div className="flex size-full flex-col text-[2.6cqw]">
      <div className="flex h-[7cqw] shrink-0 items-center justify-between border-b border-[#4a4a4a] px-[2cqw]">
        <span className="truncate font-bold">{title}</span>
        <span className="text-[2.2cqw] text-[#bdbdbd]">{groups.length ? pageLabel : ""}</span>
      </div>

      <div className="flex min-h-0 flex-1">
        <ul className="flex w-[8cqw] shrink-0 flex-col border-r border-[#4a4a4a]">
          {TABS.map((t, i) => {
            const selected = i === nav.tab;
            return (
              <li key={t.key} className="flex-1">
                <button
                  type="button"
                  aria-label={t.label}
                  onClick={() => onNav({ col: "tabs", tab: i, group: 0, item: 0 })}
                  className={cn(
                    "flex size-full items-center justify-center",
                    selected && nav.col === "tabs" && "bg-white text-black",
                    selected && nav.col !== "tabs" && "bg-[#5a5a5a]"
                  )}
                >
                  <t.icon className="size-[3.4cqw]" strokeWidth={2} />
                </button>
              </li>
            );
          })}
        </ul>

        <ul className="flex w-[7cqw] shrink-0 flex-col border-r border-[#4a4a4a] py-[0.6cqw]">
          {Array.from({ length: ROWS }, (_, i) => {
            const exists = i < groups.length;
            const selected = exists && i === nav.group && nav.col !== "tabs";
            return (
              <li key={i} className="flex flex-1 items-center justify-center">
                {exists ? (
                  <button
                    type="button"
                    aria-label={groups[i].title}
                    onClick={() => onNav({ ...nav, col: "groups", group: i, item: 0 })}
                    className={cn(
                      "flex h-[5.4cqw] w-[4.6cqw] items-center justify-center rounded-[0.3cqw] border border-[#8a8a8a] text-[2.4cqw] font-bold",
                      selected && nav.col === "groups" && "border-white bg-white text-black",
                      selected && nav.col === "items" && "bg-[#5a5a5a]"
                    )}
                  >
                    {i + 1}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>

        <div className="min-w-0 flex-1">
          {!groups.length ? (
            <p className="flex size-full items-center justify-center px-[4cqw] text-center text-[2.2cqw] text-[#9a9a9a]">
              {tab.label} isn&rsquo;t part of this practice simulator.
            </p>
          ) : isMain ? (
            <MainTiles state={state} nav={nav} items={shown} onNav={onNav} onOpen={onOpen} />
          ) : (
            <ul className="flex h-full flex-col py-[0.6cqw]">
              {shown.map((it, i) => {
                const index = page * ROWS + i;
                const selected = nav.col === "items" && index === nav.item;
                const reason = it.disabled?.(state, recording);
                return (
                  <li key={it.id} className="h-[calc(100%/7)]">
                    <button
                      type="button"
                      onClick={() => (selected ? onOpen(it) : onNav({ ...nav, col: "items", item: index }))}
                      className={cn(
                        "flex size-full items-center gap-[2cqw] px-[2cqw] text-left",
                        selected && ORANGE,
                        reason && !selected && "text-[#6e6e6e]"
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{it.label}</span>
                      <span className={cn("max-w-[45%] truncate text-[2.3cqw]", selected ? "text-white" : "text-[#bdbdbd]")}>
                        {state[it.id]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <ScreenFooter more={!isMain && page < pages - 1} onHelp={onHelp} onBack={onBack} />
    </div>
  );
}

function ScreenFooter({ more, onHelp, onBack }: { more?: boolean; onHelp: () => void; onBack: () => void }) {
  return (
    <div className="relative flex h-[5.6cqw] shrink-0 items-center justify-end gap-[1.6cqw] border-t border-[#4a4a4a] px-[2cqw] text-[#cfcfcf]">
      {more ? <span className="absolute left-1/2 -translate-x-1/2 text-[2cqw]">▼</span> : null}
      <button type="button" aria-label="Help" onClick={onHelp} className="hover:text-white">
        <CircleHelp className="size-[3cqw]" />
      </button>
      <button type="button" aria-label="Back" onClick={onBack} className="hover:text-white">
        <Undo2 className="size-[3cqw]" />
      </button>
    </div>
  );
}

const EXPOSURE_LETTER: Record<string, string> = {
  "Program Auto": "P",
  "Aperture Priority": "A",
  "Shutter Priority": "S",
  "Manual Exposure": "M",
};

/** What a Main tile shows: a small caption and the value, Sony-style. */
function tileContent(it: Fx3Item, s: Fx3State): { caption: string; value: React.ReactNode } {
  switch (it.id) {
    case "shutterSpeed":
    case "shutterAngle":
      return {
        caption: "Shutter",
        value: (
          <>
            <Badge>{EXPOSURE_LETTER[s.exposureMode]}</Badge>
            {s.exposureMode === "Program Auto" || s.exposureMode === "Aperture Priority" ? "AUTO" : s[it.id]}
          </>
        ),
      };
    case "aperture":
      return {
        caption: "Iris",
        value: s.exposureMode === "Program Auto" || s.exposureMode === "Shutter Priority" ? "AUTO" : s.aperture,
      };
    case "iso":
    case "exposureIndex":
      return { caption: isCineEi(s) ? "EI" : "ISO", value: exposureReadout(s) };
    case "whiteBalance":
      return { caption: "WB", value: s.whiteBalance === "C.Temp./Filter" ? s.colorTemp : s.whiteBalance };
    case "pictureProfile":
      return { caption: "Picture Profile", value: isLog(s) ? "—" : s.pictureProfile };
    case "fileFormat":
      return { caption: "File Format", value: s.fileFormat.replace("XAVC ", "XAVC ") };
    case "recordSetting":
      return { caption: "Record Setting", value: s.recordSetting.replace(":", "").replace(":", "") };
    case "gammaAssist":
      return { caption: "Gamma Assist", value: `Assist ${s.gammaAssist.toUpperCase()}` };
    case "proxyRecording":
      return { caption: "Proxy", value: <><Badge>Px</Badge>{s.proxyRecording.toUpperCase()}</> };
    case "windNoise":
      return { caption: "Wind Noise", value: s.windNoise.toUpperCase() };
    case "audioLevel":
      return {
        caption: "Audio Rec Level",
        value: (
          <span className="flex items-center gap-[0.8cqw]">
            {s.audioLevel}
            <span className="flex flex-col gap-[0.4cqw]">
              {[0, 1].map((ch) => (
                <span key={ch} className="flex gap-[0.2cqw]">
                  {Array.from({ length: 12 }, (_, i) => (
                    <span
                      key={i}
                      className={cn("h-[0.8cqw] w-[0.6cqw]", i < Math.round((Number(s.audioLevel) / 31) * 12) ? "bg-white" : "bg-[#555]")}
                    />
                  ))}
                </span>
              ))}
            </span>
          </span>
        ),
      };
    case "logShooting":
      return { caption: "Log Shooting", value: s.logShooting };
    case "exposureMode":
      return { caption: "Exposure Mode", value: <Badge>{EXPOSURE_LETTER[s.exposureMode]}</Badge> };
    case "steadyShot":
      return { caption: "SteadyShot", value: { Active: "Act", Standard: "Std", Off: "OFF" }[s.steadyShot] ?? s.steadyShot };
    case "focusMode":
      return { caption: "Focus Mode", value: s.focusMode === "Manual Focus" ? "MF" : "AF-C" };
    case "focusArea":
      return { caption: "Focus Area", value: s.focusArea };
    case "faceEye":
      return { caption: "Face/Eye AF", value: `AF ${s.faceEye.toUpperCase()}` };
    default:
      return { caption: it.label, value: String(s[it.id]) };
  }
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="mr-[0.8cqw] inline-flex h-[3.2cqw] min-w-[3.2cqw] items-center justify-center rounded-[0.4cqw] bg-white px-[0.4cqw] text-[2.2cqw] font-bold text-black">
      {children}
    </span>
  );
}

function MainTiles({
  state,
  nav,
  items,
  onNav,
  onOpen,
}: {
  state: Fx3State;
  nav: Nav;
  items: Fx3Item[];
  onNav: (n: Nav) => void;
  onOpen: (item: Fx3Item) => void;
}) {
  return (
    <ul className="grid h-full grid-cols-2 grid-rows-6">
      {items.map((it, i) => {
        const selected = nav.col === "items" && i === nav.item;
        const { caption, value } = tileContent(it, state);
        return (
          <li key={it.id} className="border-r border-b border-[#3a3a3a]">
            <button
              type="button"
              onClick={() => (selected ? onOpen(it) : onNav({ ...nav, col: "items", item: i }))}
              className={cn(
                "relative flex size-full flex-col items-center justify-center px-[1cqw]",
                selected && "outline-[0.5cqw] -outline-offset-[0.5cqw] outline-[#e8731d] outline-solid"
              )}
            >
              <span className="absolute top-[0.6cqw] left-[0.8cqw] flex size-[2.4cqw] items-center justify-center rounded-full bg-white text-[1.5cqw] font-bold text-black">
                {i + 1}
              </span>
              <span className="text-[1.4cqw] text-[#9a9a9a]">{caption}</span>
              <span className="flex max-w-full items-center truncate text-[2.8cqw] leading-tight font-bold">{value}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function SettingScreen({
  picking,
  state,
  recording,
  onChoose,
  onHelp,
  onBack,
}: {
  picking: Picking;
  state: Fx3State;
  recording: boolean;
  onChoose: (value: string) => void;
  onHelp: () => void;
  onBack: () => void;
}) {
  const { item, cursor } = picking;
  const reason = item.disabled?.(state, recording) ?? null;
  const options = optionsFor(item, state);
  const page = Math.floor(cursor / ROWS);
  const pages = Math.max(Math.ceil(options.length / ROWS), 1);
  const shown = options.slice(page * ROWS, page * ROWS + ROWS);

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-black text-[2.6cqw]">
      <div className="flex h-[7cqw] shrink-0 items-center justify-between border-b border-[#4a4a4a] px-[2cqw]">
        <span className="truncate font-bold">{item.label}</span>
        <span className="text-[2.2cqw] text-[#bdbdbd]">{reason ? "" : `${page + 1}/${pages}`}</span>
      </div>
      {reason ? (
        <div className="flex flex-1 items-center justify-center px-[6cqw]">
          <p className="rounded-[0.6cqw] border border-white/40 bg-[#1c1c1c] px-[3cqw] py-[2cqw] text-center text-[2.4cqw]">
            {reason}
          </p>
        </div>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col py-[0.6cqw] pl-[15cqw]">
          {shown.map((option, i) => {
            const index = page * ROWS + i;
            const active = index === cursor;
            const isCurrent = option === state[item.id];
            return (
              <li key={option} className="h-[calc(100%/7)]">
                <button
                  type="button"
                  onClick={() => onChoose(option)}
                  className={cn("flex size-full items-center gap-[2cqw] px-[2cqw] text-left", active && ORANGE)}
                >
                  <span className="w-[2.4cqw] text-center">{isCurrent ? "●" : ""}</span>
                  <span className="min-w-0 flex-1 truncate">{item.describe?.[option] ?? option}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <ScreenFooter more={!reason && page < pages - 1} onHelp={onHelp} onBack={onBack} />
    </div>
  );
}

function formatTimecode(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function LiveScreen({
  state,
  recording,
  seconds,
  onPick,
}: {
  state: Fx3State;
  recording: boolean;
  seconds: number;
  onPick: (item: Fx3Item) => void;
}) {
  const auto = (field: "shutter" | "iris") =>
    state.exposureMode === "Program Auto" ||
    (field === "shutter" ? state.exposureMode === "Aperture Priority" : state.exposureMode === "Shutter Priority");
  const shutterItem = state.shutterMode === "Angle" ? fx3Items.shutterAngle : fx3Items.shutterSpeed;
  const footer: { item: Fx3Item; value: string }[] = [
    { item: shutterItem, value: auto("shutter") ? "AUTO" : state[shutterItem.id] },
    { item: fx3Items.aperture, value: auto("iris") ? "AUTO" : state.aperture },
    { item: isCineEi(state) ? fx3Items.exposureIndex : fx3Items.iso, value: exposureReadout(state) },
    {
      item: state.whiteBalance === "C.Temp./Filter" ? fx3Items.colorTemp : fx3Items.whiteBalance,
      value: state.whiteBalance === "C.Temp./Filter" ? state.colorTemp : state.whiteBalance,
    },
    isLog(state)
      ? { item: fx3Items.logShooting, value: "S-Log3" }
      : { item: fx3Items.pictureProfile, value: state.pictureProfile === "Off" ? "PP OFF" : state.pictureProfile },
  ];

  return (
    <div className="flex size-full flex-col text-[2.4cqw]">
      <div className="flex h-[6.4cqw] shrink-0 items-center gap-[2cqw] px-[2cqw]">
        <Badge>{EXPOSURE_LETTER[state.exposureMode]}</Badge>
        <button type="button" onClick={() => onPick(fx3Items.fileFormat)}>
          {state.fileFormat}
        </button>
        <button type="button" onClick={() => onPick(fx3Items.recFrameRate)} className="font-bold">
          {state.recFrameRate}
        </button>
        <button type="button" onClick={() => onPick(fx3Items.recordSetting)} className="text-[#cfcfcf]">
          {state.recordSetting}
        </button>
        <span className="ml-auto flex items-center gap-[1.6cqw]">
          {state.proxyRecording === "On" ? <Badge>Px</Badge> : null}
          <span className="text-[#cfcfcf]">{state.system}</span>
          <span className="flex items-center gap-[0.4cqw]">
            <span className="h-[2.4cqw] w-[4.6cqw] rounded-[0.3cqw] border border-white p-[0.3cqw]">
              <span className="block size-full bg-white" />
            </span>
            100%
          </span>
        </span>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_center,#3d4248_0%,#16191c_72%)]">
        <span
          className={cn(
            "absolute top-[1.6cqw] left-1/2 -translate-x-1/2 text-[3.2cqw] font-bold",
            recording ? "text-red-500" : "text-[#58d65c]"
          )}
        >
          {recording ? `● REC ${formatTimecode(seconds)}` : "STBY"}
        </span>
        {state.zebra === "On" ? (
          <div
            aria-hidden
            className="absolute top-[20%] right-[16%] h-1/4 w-1/4 rounded-full opacity-60"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0 0.4cqw,transparent 0.4cqw 1.2cqw)" }}
          />
        ) : null}
        <FocusFrame state={state} />
        <span className="absolute bottom-[1.2cqw] left-[2cqw] text-[1.8cqw] text-[#cfcfcf]">
          {resolutionOf[state.fileFormat]}
        </span>
        <span className="absolute right-[2cqw] bottom-[1.2cqw] text-[1.8cqw] text-[#cfcfcf]">
          {state.focusMode === "Manual Focus" ? "MF" : `AF-C · ${state.focusArea}`}
          {state.steadyShot !== "Off" ? ` · SteadyShot ${state.steadyShot}` : ""}
        </span>
      </div>

      <div className="grid h-[10cqw] shrink-0 grid-cols-5 bg-black">
        {footer.map(({ item, value }) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPick(item)}
            className="flex min-w-0 items-center justify-center truncate px-[0.6cqw] text-[3.4cqw] font-bold hover:bg-white/10"
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function FocusFrame({ state }: { state: Fx3State }) {
  if (state.focusMode === "Manual Focus") return null;
  const size: Record<string, string> = {
    Wide: "h-[78%] w-[86%]",
    Zone: "h-1/2 w-1/2",
    "Center Fix": "size-[10cqw]",
    "Spot: S": "size-[5cqw]",
    "Spot: M": "size-[7.5cqw]",
    "Spot: L": "size-[10cqw]",
    "Expand Spot": "size-[9cqw]",
  };
  const corners = state.focusArea === "Wide" || state.focusArea === "Zone";
  return (
    <div aria-hidden className={cn("relative", size[state.focusArea], !corners && "border-[0.3cqw] border-white/85")}>
      {corners
        ? [
            "top-0 left-0 border-t-[0.3cqw] border-l-[0.3cqw]",
            "top-0 right-0 border-t-[0.3cqw] border-r-[0.3cqw]",
            "bottom-0 left-0 border-b-[0.3cqw] border-l-[0.3cqw]",
            "right-0 bottom-0 border-r-[0.3cqw] border-b-[0.3cqw]",
          ].map((c) => <span key={c} className={cn("absolute size-[3cqw] border-white/75", c)} />)
        : null}
    </div>
  );
}

export default Fx3Simulator;
