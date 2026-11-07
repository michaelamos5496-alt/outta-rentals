"use client";

import * as React from "react";
import {
  CircleHelp,
  Focus,
  Globe,
  House,
  Play,
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
  isCineEi,
  isLog,
  optionsFor,
  resolutionOf,
  type Fx3Item,
  type Fx3State,
} from "@/lib/simulators/fx3";

/**
 * The FX3 simulator's screens — menu, setting, shooting, Fn and playback —
 * drawn on a 3:2 container and sized in container units so they scale like
 * the camera's LCD. State lives in `fx3-simulator.tsx`.
 */

// The camera's full tab column. Tabs without data in fx3Tabs (My Menu,
// Playback, Network) are shown but not part of this practice simulator.
export const TABS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "mymenu", label: "My Menu", icon: Star },
  { key: "main", label: "Main", icon: House },
  { key: "shooting", label: "Shooting", icon: Video },
  { key: "exposure", label: "Exposure/Color", icon: SunMedium },
  { key: "focus", label: "Focus", icon: Focus },
  { key: "playback", label: "Playback", icon: Play },
  { key: "network", label: "Network", icon: Globe },
  { key: "setup", label: "Setup", icon: Toolbox },
];

export const ROWS = 7;
const ORANGE = "bg-[#e8731d]";

export type Column = "tabs" | "groups" | "items";
export interface Nav {
  col: Column;
  tab: number;
  group: number;
  item: number;
}
export interface Picking {
  item: Fx3Item;
  cursor: number;
}
export interface Group {
  title: string;
  items: Fx3Item[];
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

export interface Clip {
  name: string;
  seconds: number;
  fileFormat: string;
  recFrameRate: string;
  recordSetting: string;
}

function LiveScreen({
  state,
  recording,
  seconds,
  showInfo,
  magnified,
  focusFlash,
  onPick,
}: {
  state: Fx3State;
  recording: boolean;
  seconds: number;
  showInfo: boolean;
  magnified: boolean;
  focusFlash: boolean;
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

  const recLabel = (
    <span
      className={cn(
        "absolute top-[1.6cqw] left-1/2 z-10 -translate-x-1/2 text-[3.2cqw] font-bold",
        recording ? "text-red-500" : "text-[#58d65c]"
      )}
    >
      {recording ? `● REC ${formatTimecode(seconds)}` : "STBY"}
    </span>
  );

  return (
    <div className="flex size-full flex-col text-[2.4cqw]">
      {showInfo ? (
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
      ) : null}

      <div
        className={cn(
          "relative flex min-h-0 flex-1 items-center justify-center overflow-hidden",
          magnified
            ? "bg-[radial-gradient(circle_at_center,#5a6068_0%,#2a2e33_45%,#16191c_80%)]"
            : "bg-[radial-gradient(ellipse_at_center,#3d4248_0%,#16191c_72%)]"
        )}
      >
        {recLabel}
        {state.zebra === "On" ? (
          <div
            aria-hidden
            className="absolute top-[20%] right-[16%] h-1/4 w-1/4 rounded-full opacity-60"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0 0.4cqw,transparent 0.4cqw 1.2cqw)" }}
          />
        ) : null}
        {magnified ? (
          <>
            <span className="absolute top-[1.6cqw] right-[2cqw] rounded-[0.4cqw] bg-white px-[0.8cqw] text-[2.4cqw] font-bold text-black">
              ×4.0
            </span>
            <span className="absolute right-[2cqw] bottom-[2cqw] flex h-[7cqw] w-[10.5cqw] items-center justify-center border border-white/70">
              <span className="size-[2cqw] border border-[#e8731d]" />
            </span>
          </>
        ) : (
          <FocusFrame state={state} flash={focusFlash} />
        )}
        {showInfo ? (
          <>
            <span className="absolute bottom-[1.2cqw] left-[2cqw] text-[1.8cqw] text-[#cfcfcf]">
              {resolutionOf[state.fileFormat]}
            </span>
            {!magnified ? (
              <span className="absolute right-[2cqw] bottom-[1.2cqw] text-[1.8cqw] text-[#cfcfcf]">
                {state.focusMode === "Manual Focus" ? "MF" : `AF-C · ${state.focusArea}`}
                {state.steadyShot !== "Off" ? ` · SteadyShot ${state.steadyShot}` : ""}
              </span>
            ) : null}
          </>
        ) : null}
      </div>

      {showInfo ? (
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
      ) : null}
    </div>
  );
}

function FocusFrame({ state, flash }: { state: Fx3State; flash: boolean }) {
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
  const color = flash ? "border-[#58d65c]" : "border-white/80";
  return (
    <div aria-hidden className={cn("relative", size[state.focusArea], !corners && "border-[0.3cqw]", !corners && color)}>
      {corners
        ? [
            "top-0 left-0 border-t-[0.3cqw] border-l-[0.3cqw]",
            "top-0 right-0 border-t-[0.3cqw] border-r-[0.3cqw]",
            "bottom-0 left-0 border-b-[0.3cqw] border-l-[0.3cqw]",
            "right-0 bottom-0 border-r-[0.3cqw] border-b-[0.3cqw]",
          ].map((c) => <span key={c} className={cn("absolute size-[3cqw]", color, c)} />)
        : null}
    </div>
  );
}

/** Quick settings shown over the shooting screen by the Fn button. */
export const FN_ITEMS: (keyof Fx3State)[] = [
  "fileFormat",
  "recFrameRate",
  "recordSetting",
  "logShooting",
  "pictureProfile",
  "steadyShot",
  "focusMode",
  "focusArea",
  "faceEye",
  "whiteBalance",
  "zebra",
  "audioLevel",
];

function FnMenu({
  state,
  cursor,
  onSelect,
}: {
  state: Fx3State;
  cursor: number;
  onSelect: (index: number) => void;
}) {
  const item = fx3Items[FN_ITEMS[cursor]];
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 bg-black/85 px-[1.4cqw] pt-[1cqw] pb-[1.4cqw]">
      <p className="pb-[0.8cqw] text-center text-[2.2cqw] font-bold">{item.label}</p>
      <ul className="grid grid-cols-6 gap-[0.8cqw]">
        {FN_ITEMS.map((id, i) => {
          const it = fx3Items[id];
          const selected = i === cursor;
          const reason = it.disabled?.(state, false);
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                className={cn(
                  "flex h-[8cqw] w-full flex-col items-center justify-center rounded-[0.4cqw] border px-[0.4cqw]",
                  selected ? "border-[#e8731d] bg-[#e8731d]" : "border-[#555] bg-[#1a1a1a]",
                  reason && !selected && "text-[#6e6e6e]"
                )}
              >
                <span className="w-full truncate text-center text-[1.3cqw] text-white/70">{it.label}</span>
                <span className="w-full truncate text-center text-[1.9cqw] font-bold">{String(state[id])}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PlaybackScreen({
  clips,
  index,
  deleting,
  deleteChoice,
  onDeleteChoice,
}: {
  clips: Clip[];
  index: number;
  deleting: boolean;
  deleteChoice: number;
  onDeleteChoice: (choice: number) => void;
}) {
  const clip = clips[index];
  return (
    <div className="relative flex size-full flex-col bg-black text-[2.4cqw]">
      {!clip ? (
        <p className="flex flex-1 items-center justify-center text-[2.8cqw]">No images.</p>
      ) : (
        <>
          <div className="flex h-[6.4cqw] shrink-0 items-center justify-between px-[2cqw]">
            <span className="flex items-center gap-[1cqw]">
              <Play className="size-[2.6cqw] fill-white" /> {clip.name}
            </span>
            <span className="text-[#cfcfcf]">
              {index + 1}/{clips.length}
            </span>
          </div>
          <div className="relative flex flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_center,#3d4248_0%,#16191c_72%)]">
            <span className="flex size-[10cqw] items-center justify-center rounded-full border-[0.4cqw] border-white/80">
              <Play className="ml-[0.6cqw] size-[4.4cqw] fill-white" />
            </span>
          </div>
          <div className="flex h-[8cqw] shrink-0 items-center justify-between px-[2cqw] text-[2.2cqw]">
            <span>{clip.fileFormat}</span>
            <span>{clip.recFrameRate}</span>
            <span className="text-[#cfcfcf]">{clip.recordSetting}</span>
            <span className="font-bold">{formatTimecode(clip.seconds)}</span>
          </div>
        </>
      )}

      {deleting && clip ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
          <div className="w-[50cqw] rounded-[0.6cqw] border border-white/40 bg-[#1c1c1c] p-[2.4cqw] text-center">
            <p className="mb-[2cqw] text-[2.6cqw]">Delete?</p>
            {["Delete", "Cancel"].map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => onDeleteChoice(i)}
                className={cn("mb-[0.8cqw] block w-full rounded-[0.4cqw] py-[1.2cqw]", deleteChoice === i ? "bg-[#e8731d]" : "bg-[#2e2e2e]")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { FnMenu, LiveScreen, MenuScreen, PlaybackScreen, SettingScreen, formatTimecode };
