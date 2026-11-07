"use client";

import * as React from "react";
import { BookOpen, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  fx3Items,
  fx3MainPages,
  fx3StartState,
  fx3Tabs,
  isCineEi,
  normalizeFx3,
  optionsFor,
  type Fx3Item,
  type Fx3State,
} from "@/lib/simulators/fx3";
import { Fx3Rear, Fx3Top, partGuide, type Fx3Control, type Fx3Part } from "@/components/catalogue/fx3-body";
import {
  FN_ITEMS,
  FnMenu,
  LiveScreen,
  MenuScreen,
  PlaybackScreen,
  SettingScreen,
  TABS,
  type Clip,
  type Group,
  type Nav,
  type Picking,
} from "@/components/catalogue/fx3-screens";

/**
 * OUTTA's own Sony FX3 trainer: an illustrated FX3 (rear panel and top
 * plate) whose buttons and dials work like the camera's, around a screen
 * laid out like its menu. Settings cascade the way they do on the camera
 * (see `normalizeFx3`). Guide mode explains each control instead of using it.
 */

const SCREEN_FONT = { fontFamily: "Helvetica, Arial, sans-serif" };
// The top plate and rear panel together are about 0.83× as tall as they are
// wide; cap the width so the whole camera fits the viewer without scrolling.
const CAMERA_WIDTH = { maxWidth: "min(64rem, calc((100dvh - 16rem) * 1.2))" };
type Direction = "up" | "down" | "left" | "right" | "center";

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
  const [power, setPower] = React.useState(true);
  const [view, setView] = React.useState<"live" | "menu" | "playback">("live");
  const [nav, setNav] = React.useState<Nav>({ col: "items", tab: 1, group: 0, item: 0 });
  const [picking, setPicking] = React.useState<Picking | null>(null);
  const [fn, setFn] = React.useState<number | null>(null);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [recording, setRecording] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const [clips, setClips] = React.useState<Clip[]>([]);
  const [playIndex, setPlayIndex] = React.useState(0);
  const [deleting, setDeleting] = React.useState<number | null>(null);
  const [showInfo, setShowInfo] = React.useState(true);
  const [magnified, setMagnified] = React.useState(false);
  const [focusFlash, setFocusFlash] = React.useState(false);
  const [guide, setGuide] = React.useState(false);
  const [part, setPart] = React.useState<Fx3Part | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const lastDial = React.useRef(0);

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
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  React.useEffect(() => {
    if (!focusFlash) return;
    const timer = setTimeout(() => setFocusFlash(false), 700);
    return () => clearTimeout(timer);
  }, [focusFlash]);

  // Lists change as settings hide or reveal items, so clamp the cursor here.
  const tabKey = TABS[nav.tab].key;
  const groups = groupsFor(tabKey, state);
  const group = Math.min(nav.group, Math.max(groups.length - 1, 0));
  const items = groups[group]?.items ?? [];
  const item = Math.min(nav.item, Math.max(items.length - 1, 0));
  const current: Nav = { ...nav, group, item };
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

  /** Turning a dial in the shooting screen steps one setting. */
  function stepSetting(target: Fx3Item, by: number) {
    const reason = target.disabled?.(state, recording);
    if (reason) return setNotice(reason);
    const options = optionsFor(target, state);
    const index = options.indexOf(state[target.id]);
    const next = Math.min(Math.max(index + by, 0), options.length - 1);
    if (next !== index) choose(target, options[next]);
  }

  function toggleRecording() {
    if (recording) {
      setClips((list) => [
        ...list,
        {
          name: `C${String(list.length + 1).padStart(4, "0")}`,
          seconds,
          fileFormat: state.fileFormat,
          recFrameRate: state.recFrameRate,
          recordSetting: state.recordSetting,
        },
      ]);
    } else {
      setSeconds(0);
    }
    setRecording(!recording);
  }

  function pressMenu() {
    setHelpOpen(false);
    if (picking) return setPicking(null);
    if (deleting !== null) return setDeleting(null);
    if (fn !== null) return setFn(null);
    setMagnified(false);
    setView((v) => (v === "menu" ? "live" : "menu"));
  }

  function moveMenu(direction: Direction) {
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

  function move(direction: Direction) {
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
    if (deleting !== null) {
      if (direction === "up" || direction === "down") setDeleting(deleting === 0 ? 1 : 0);
      if (direction === "center") confirmDelete(deleting);
      return;
    }
    if (fn !== null) {
      const cols = 6;
      if (direction === "left") setFn((fn + FN_ITEMS.length - 1) % FN_ITEMS.length);
      if (direction === "right") setFn((fn + 1) % FN_ITEMS.length);
      if (direction === "up" || direction === "down") setFn((fn + cols) % FN_ITEMS.length);
      if (direction === "center") openPicker(fx3Items[FN_ITEMS[fn]]);
      return;
    }
    if (view === "playback") {
      if (direction === "left") setPlayIndex((i) => Math.max(i - 1, 0));
      if (direction === "right") setPlayIndex((i) => Math.min(i + 1, Math.max(clips.length - 1, 0)));
      return;
    }
    if (view === "menu") return moveMenu(direction);

    // Shooting screen: DISP on top, zebras on the left.
    if (direction === "up") setShowInfo((v) => !v);
    else if (direction === "left") choose(fx3Items.zebra, state.zebra === "On" ? "Off" : "On");
    else if (direction === "center" && magnified) setMagnified(false);
    else if (direction !== "center") setNotice("Nothing is assigned to that side of the wheel in this simulator.");
  }

  function confirmDelete(choice: number) {
    if (choice === 0) {
      setClips((list) => list.filter((_, i) => i !== playIndex));
      setPlayIndex((i) => Math.max(Math.min(i, clips.length - 2), 0));
    }
    setDeleting(null);
  }

  /** Turning a dial or the wheel: `by` is -1 (left) or +1 (right). */
  function turn(dial: "front" | "rear" | "wheel", by: number) {
    // Trackpads fire many scroll events; one step per short window.
    const now = Date.now();
    if (now - lastDial.current < 110) return;
    lastDial.current = now;

    if (picking || fn !== null || deleting !== null) return move(by > 0 ? (fn !== null ? "right" : "down") : fn !== null ? "left" : "up");
    if (view === "playback") return move(by > 0 ? "right" : "left");
    if (view === "menu") {
      if (dial === "front") {
        return setNav({ col: "tabs", tab: (nav.tab + by + TABS.length) % TABS.length, group: 0, item: 0 });
      }
      return moveMenu(by > 0 ? "down" : "up");
    }
    if (dial === "front") return stepSetting(fx3Items.aperture, by);
    if (dial === "rear") {
      // The speed list runs fast to slow, so turning right means faster.
      return state.shutterMode === "Angle"
        ? stepSetting(fx3Items.shutterAngle, -by)
        : stepSetting(fx3Items.shutterSpeed, -by);
    }
    return stepSetting(isCineEi(state) ? fx3Items.exposureIndex : fx3Items.iso, by);
  }

  function press(control: Fx3Control) {
    if (control === "power") {
      if (power) {
        if (recording) toggleRecording();
        setPicking(null);
        setFn(null);
        setView("live");
        setMagnified(false);
      }
      return setPower(!power);
    }
    if (!power) return;

    switch (control) {
      case "menu":
        return pressMenu();
      case "up":
      case "down":
      case "left":
      case "right":
      case "center":
        return move(control);
      case "wheelL":
      case "wheelR":
        return turn("wheel", control === "wheelR" ? 1 : -1);
      case "rearDialL":
      case "rearDialR":
        return turn("rear", control === "rearDialR" ? 1 : -1);
      case "frontDialL":
      case "frontDialR":
        return turn("front", control === "frontDialR" ? 1 : -1);
      case "rec":
        return toggleRecording();
      case "mode":
        return openPicker(fx3Items.exposureMode);
      case "c1":
        return openPicker(fx3Items.aperture);
      case "c2":
        return openPicker(fx3Items.whiteBalance);
      case "c3":
        return openPicker(isCineEi(state) ? fx3Items.exposureIndex : fx3Items.iso);
      case "c5":
        if (view !== "live") return;
        setFn(null);
        return setMagnified((m) => !m);
      case "fn":
        if (view !== "live" || picking) return;
        setMagnified(false);
        return setFn((f) => (f === null ? 0 : null));
      case "playback":
        setPicking(null);
        setFn(null);
        setMagnified(false);
        setDeleting(null);
        if (view === "playback") return setView("live");
        setPlayIndex(Math.max(clips.length - 1, 0));
        return setView("playback");
      case "c4":
        if (view === "playback") return clips.length ? setDeleting(1) : undefined;
        return setNotice("C4 has no function assigned in this simulator. In playback it deletes.");
      case "shutter":
        if (state.focusMode === "Manual Focus") return setNotice("Manual Focus — turn the focus ring on the lens.");
        return setFocusFlash(true);
      case "zoom":
        return setNotice("The zoom lever works with power-zoom lenses.");
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const keys: Record<string, Direction> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      Enter: "center",
      " ": "center",
    };
    if (keys[e.key]) {
      e.preventDefault();
      press(keys[e.key]);
    } else if (e.key === "Backspace" || e.key.toLowerCase() === "m") {
      e.preventDefault();
      press("menu");
    } else if (e.key.toLowerCase() === "r") {
      press("rec");
    }
  }

  const helpItem = picking?.item ?? highlighted ?? (fn !== null ? fx3Items[FN_ITEMS[fn]] : undefined);

  const screen = (
    <div style={SCREEN_FONT} className="@container relative aspect-[3/2] w-full overflow-hidden bg-black select-none">
      {!power ? null : view === "playback" ? (
        <PlaybackScreen
          clips={clips}
          index={Math.min(playIndex, Math.max(clips.length - 1, 0))}
          deleting={deleting !== null}
          deleteChoice={deleting ?? 1}
          onDeleteChoice={confirmDelete}
        />
      ) : view === "live" ? (
        <>
          <LiveScreen
            state={state}
            recording={recording}
            seconds={seconds}
            showInfo={showInfo && fn === null}
            magnified={magnified}
            focusFlash={focusFlash}
            onPick={openPicker}
          />
          {fn !== null ? (
            <FnMenu state={state} cursor={fn} onSelect={(i) => (i === fn ? openPicker(fx3Items[FN_ITEMS[i]]) : setFn(i))} />
          ) : null}
        </>
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

      {power && picking ? (
        <SettingScreen
          picking={picking}
          state={state}
          recording={recording}
          onChoose={(v) => choose(picking.item, v)}
          onHelp={() => setHelpOpen((h) => !h)}
          onBack={() => setPicking(null)}
        />
      ) : null}

      {power && helpOpen && helpItem ? (
        <button
          type="button"
          onClick={() => setHelpOpen(false)}
          className="absolute inset-x-[8cqw] top-[12cqw] z-30 rounded-[0.6cqw] border border-white/40 bg-[#1c1c1c] p-[2.4cqw] text-left text-[2.2cqw] leading-snug text-white shadow-xl"
        >
          <span className="mb-[1cqw] block text-[2.4cqw] font-bold">{helpItem.label}</span>
          {helpItem.help}
        </button>
      ) : null}

      {power && notice ? (
        <div className="pointer-events-none absolute inset-x-[6cqw] bottom-[12cqw] z-20 rounded-[0.6cqw] border border-white/30 bg-[#262626]/95 px-[2cqw] py-[1.4cqw] text-center text-[2.2cqw] text-white">
          {notice}
        </div>
      ) : null}
    </div>
  );

  const bodyProps = {
    power,
    recording,
    guide,
    onPress: press,
    onPart: (p: Fx3Part | null) => setPart(p),
  };

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className="flex size-full flex-col items-center gap-3 overflow-y-auto bg-neutral-900 p-3 text-white outline-none sm:gap-4 sm:p-6"
    >
      <div style={CAMERA_WIDTH} className="flex w-full flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-white/60 sm:text-sm">
          {guide ? "Guide: hover over or tap any part of the camera." : "Use the buttons and dials like the real camera."}
        </p>
        <button
          type="button"
          onClick={() => {
            setGuide((g) => !g);
            setPart(null);
          }}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold tracking-wide transition-colors",
            guide ? "border-[#e8731d] bg-[#e8731d] text-white" : "border-neutral-700 bg-neutral-800 hover:bg-neutral-700"
          )}
        >
          <BookOpen className="size-3.5" /> {guide ? "Exit guide" : "Guide"}
        </button>
      </div>

      <div style={CAMERA_WIDTH} className="flex w-full flex-col gap-3">
        <Fx3Top {...bodyProps} />
        <Fx3Rear {...bodyProps} screen={screen} />
      </div>

      <div style={CAMERA_WIDTH} className="min-h-[3.5rem] w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm">
        {guide && part ? (
          <p>
            <span className="font-semibold text-[#ff9a4d]">{partGuide[part].name}</span>{" "}
            <span className="text-white/75">— {partGuide[part].text}</span>
          </p>
        ) : (
          <p className="text-white/55">
            {guide
              ? "Hover over or tap a button or dial to see what it does."
              : "Tip: press MENU, steer with the control wheel, press its centre to select. Scroll over a dial to turn it. Keyboard: arrows, Enter, M for MENU, R to record."}
          </p>
        )}
      </div>

      <div className="flex max-w-xl flex-col items-center gap-2 pb-2 text-center text-[0.6875rem] text-white/50">
        <button
          type="button"
          onClick={() => {
            setState(fx3StartState);
            setRecording(false);
            setPicking(null);
            setFn(null);
            setClips([]);
            setView("live");
            setPower(true);
            setNotice("Settings reset to the starting setup.");
          }}
          className="inline-flex items-center gap-1 underline-offset-2 hover:text-white hover:underline"
        >
          <RotateCcw className="size-3" /> Reset camera
        </button>
        <p>
          Practice simulator by OUTTA RENTALS, drawn by OUTTA. Controls, menu names and options follow Sony&rsquo;s FX3
          Help Guide; not affiliated with Sony. Some menu items are left out.
        </p>
      </div>
    </div>
  );
}

export default Fx3Simulator;
