"use client";

import * as React from "react";
import { Roboto_Condensed } from "next/font/google";
import { Check, ChevronLeft, ChevronRight, Lock, Unlock, Wifi, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  KOMODO_FORMATS,
  cardMinutes,
  exposureStops,
  isOffSpeed,
  isProRes,
  komodoItems,
  komodoMenus,
  komodoQuick,
  komodoStartState,
  normalizeKomodo,
  type KomodoItem,
  type KomodoState,
} from "@/lib/simulators/komodo";

/**
 * OUTTA's RED KOMODO simulator: the camera's top control panel — the 2.9"
 * square touchscreen beside MENU/BACK, ▲/▼ (LOCK), SEL/FN and ▶ — laid out
 * from RED's Operation Guide images. The panel is drawn at a fixed design
 * size and scaled to fit, so its proportions stay exact on every screen and
 * it needs no newer CSS. The preview is OUTTA's own footage, brightened or
 * darkened by ISO, iris and shutter and tinted by white balance.
 */

const PANEL = { width: 1036, height: 886 };
const SCREEN = { left: 144, top: 95, size: 628 };
// RED's touchscreen uses a bold condensed face; Roboto Condensed is close.
const condensed = Roboto_Condensed({ subsets: ["latin"], weight: ["700", "900"], display: "swap" });
const UI_FONT = { fontFamily: `${condensed.style.fontFamily}, "Arial Narrow", Arial, sans-serif` };
const ROW = 88;
const ROWS = 6;

type View = "home" | "menu" | "status" | "playback";
type Rec = "off" | "pre" | "on";
interface MenuNav {
  level: "root" | "sub" | "options";
  menu: number;
  item: number;
  option: number;
}
interface Clip {
  name: string;
  seconds: number;
  summary: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const hms = (total: number) => `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
const show = (item: KomodoItem, v: string) => item.show?.(v) ?? v;

function visibleItems(menu: number, s: KomodoState) {
  return (komodoMenus[menu].items ?? []).map((id) => komodoItems[id]).filter((it) => !it.hidden?.(s));
}

function KomodoSimulator() {
  const [state, setState] = React.useState<KomodoState>(komodoStartState);
  const [view, setView] = React.useState<View>("home");
  const [nav, setNav] = React.useState<MenuNav>({ level: "root", menu: 0, item: 0, option: 0 });
  const [quick, setQuick] = React.useState<keyof KomodoState | null>(null);
  const [rec, setRec] = React.useState<Rec>("off");
  const [seconds, setSeconds] = React.useState(0);
  const [clips, setClips] = React.useState<Clip[]>([]);
  const [locked, setLocked] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [showHistogram, setShowHistogram] = React.useState(false);
  const [clock, setClock] = React.useState("00:00:00");
  const lastArrow = React.useRef<{ key: "up" | "down"; at: number } | null>(null);

  React.useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (rec !== "on") return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [rec]);

  React.useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  function choose(item: KomodoItem, value: string) {
    if (item.lockedWhileRecording && rec !== "off") return setNotice("Stop recording to change Project Settings.");
    const next = normalizeKomodo({ ...state, [item.id]: value }, item.id);
    const knockOn = (Object.keys(next) as (keyof KomodoState)[])
      .filter((k) => k !== item.id && next[k] !== state[k])
      .map((k) => `${komodoItems[k].label}: ${show(komodoItems[k], next[k])}`);
    setState(next);
    if (item.id === "fileFormat" && value !== state.fileFormat) {
      setNotice("File Format changed — the camera reboots to apply it.");
    } else if (knockOn.length) {
      setNotice(`Also changed — ${knockOn.join(", ")}`);
    }
  }

  function step(id: keyof KomodoState, by: number) {
    const item = komodoItems[id];
    const options = item.options(state);
    const index = options.indexOf(state[id]);
    const next = Math.min(Math.max(index + by, 0), options.length - 1);
    if (next !== index) choose(item, options[next]);
  }

  function pressRecord() {
    if (locked) return setNotice("Screen locked — press ▲ and ▼ together to unlock.");
    if (rec === "off") {
      setSeconds(0);
      return setRec(state.preRecord === "On" ? "pre" : "on");
    }
    if (rec === "pre") return setRec("on");
    const n = clips.length + 1;
    setClips((list) => [
      ...list,
      {
        name: `A001_C${String(n).padStart(3, "0")}`,
        seconds,
        summary: `${state.format} / ${isProRes(state) ? `${state.proresCodec} ${state.proresRes}` : `R3D ${state.r3dQuality}`} · ${state.recFps} FPS`,
      },
    ]);
    setRec("off");
  }

  function pressMenu() {
    if (locked) return;
    setQuick(null);
    if (view === "menu") {
      if (nav.level === "options") return setNav({ ...nav, level: "sub" });
      if (nav.level === "sub") return setNav({ ...nav, level: "root", item: 0 });
      return setView("home");
    }
    setNav({ level: "root", menu: nav.menu, item: 0, option: 0 });
    setView("menu");
  }

  function pressArrow(key: "up" | "down") {
    // Pressing ▲ and ▼ together locks or unlocks the touchscreen and buttons.
    const now = Date.now();
    if (lastArrow.current && lastArrow.current.key !== key && now - lastArrow.current.at < 450) {
      lastArrow.current = null;
      setLocked((l) => !l);
      return setNotice(locked ? "Unlocked." : "Locked — the touchscreen and buttons are disabled.");
    }
    lastArrow.current = { key, at: now };
    if (locked) return;
    const by = key === "up" ? -1 : 1;
    if (quick) return step(quick, -by);
    if (view !== "menu") return;
    const items = visibleItems(nav.menu, state);
    if (nav.level === "root") {
      setNav({ ...nav, menu: Math.min(Math.max(nav.menu + by, 0), komodoMenus.length - 1) });
    } else if (nav.level === "sub") {
      setNav({ ...nav, item: Math.min(Math.max(nav.item + by, 0), Math.max(items.length - 1, 0)) });
    } else {
      const options = items[nav.item]?.options(state) ?? [];
      setNav({ ...nav, option: Math.min(Math.max(nav.option + by, 0), options.length - 1) });
    }
  }

  function pressSelect() {
    if (locked) return;
    if (quick) return setQuick(null);
    if (view !== "menu") return;
    const items = visibleItems(nav.menu, state);
    if (nav.level === "root") return setNav({ ...nav, level: "sub", item: 0 });
    if (nav.level === "sub") {
      const item = items[nav.item];
      if (!item) return;
      return setNav({ ...nav, level: "options", option: Math.max(item.options(state).indexOf(state[item.id]), 0) });
    }
    const item = items[nav.item];
    if (item) {
      choose(item, item.options(state)[nav.option]);
      setNav({ ...nav, level: "sub" });
    }
  }

  function pressPlay() {
    if (locked) return;
    if (rec !== "off") return setNotice("Stop recording to play back.");
    setQuick(null);
    setView((v) => (v === "playback" ? "home" : "playback"));
  }

  function touch(action: () => void) {
    if (locked) return setNotice("Screen locked — press ▲ and ▼ together to unlock.");
    action();
  }

  const screen = (
    <div style={UI_FONT} className="relative size-full overflow-hidden bg-black text-white select-none">
      <StatusBar
        state={state}
        view={view}
        locked={locked}
        onToggle={() =>
          touch(() => {
            setQuick(null);
            if (view === "home") {
              setNav({ level: "root", menu: nav.menu, item: 0, option: 0 });
              setView("menu");
            } else setView("home");
          })
        }
        onStatus={() => touch(() => setView(view === "status" ? "home" : "status"))}
      />
      {view === "home" ? (
        <HomeScreen
          state={state}
          rec={rec}
          seconds={seconds}
          clock={clock}
          clipName={`A001_C${String(clips.length + 1).padStart(3, "0")}`}
          quick={quick}
          showHistogram={showHistogram}
          onQuick={(id) => touch(() => setQuick((q) => (q === id ? null : id)))}
          onStep={(by) => quick && touch(() => step(quick, by))}
          onRecord={pressRecord}
          onMedia={() => touch(() => setShowHistogram((h) => !h))}
        />
      ) : view === "menu" ? (
        <MenuScreen
          state={state}
          nav={nav}
          onRow={(n, open) =>
            touch(() => {
              setNav(n);
              if (!open) return;
              const items = visibleItems(n.menu, state);
              if (n.level === "root") setNav({ ...n, level: "sub", item: 0 });
              else if (n.level === "sub" && items[n.item]) {
                setNav({ ...n, level: "options", option: Math.max(items[n.item].options(state).indexOf(state[items[n.item].id]), 0) });
              } else if (n.level === "options" && items[n.item]) {
                choose(items[n.item], items[n.item].options(state)[n.option]);
                setNav({ ...n, level: "sub" });
              }
            })
          }
          onBack={pressMenu}
        />
      ) : view === "status" ? (
        <StatusPage state={state} clipCount={clips.length} />
      ) : (
        <PlaybackScreen clips={clips} />
      )}

      {notice ? (
        <div className="pointer-events-none absolute inset-x-[40px] top-[300px] z-30 rounded-[6px] border border-white/30 bg-[#1e1e1e]/95 px-[16px] py-[12px] text-center text-[19px] font-bold">
          {notice}
        </div>
      ) : null}
    </div>
  );

  return <Scaler>{<Panel screen={screen} onMenu={pressMenu} onArrow={pressArrow} onSelect={pressSelect} onPlay={pressPlay} onLock={() => { setLocked((l) => !l); setNotice(locked ? "Unlocked." : "Locked — the touchscreen and buttons are disabled."); }} />}</Scaler>;
}

/** Scales the fixed-size panel to fit the space available. */
function Scaler({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min((width - 24) / PANEL.width, (height - 72) / PANEL.height, 1.4));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex size-full flex-col items-center justify-center gap-3 overflow-hidden bg-neutral-900 p-3">
      {scale > 0 ? (
        <div style={{ width: PANEL.width * scale, height: PANEL.height * scale }}>
          <div style={{ width: PANEL.width, height: PANEL.height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            {children}
          </div>
        </div>
      ) : null}
      <p className="max-w-xl text-center text-[0.6875rem] text-white/50">
        Practice simulator by OUTTA RENTALS, laid out from RED&rsquo;s KOMODO Operation Guide; not affiliated with RED.
        Tap the screen like the camera&rsquo;s touchscreen, or use the buttons. Some menus are left out.
      </p>
    </div>
  );
}

function Panel({
  screen,
  onMenu,
  onArrow,
  onSelect,
  onPlay,
  onLock,
}: {
  screen: React.ReactNode;
  onMenu: () => void;
  onArrow: (key: "up" | "down") => void;
  onSelect: () => void;
  onPlay: () => void;
  onLock: () => void;
}) {
  const plate = {
    backgroundColor: "#1d1d1e",
    backgroundImage:
      "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1.4px), radial-gradient(rgba(0,0,0,0.5) 1px, transparent 1.4px)",
    backgroundSize: "5px 5px, 7px 7px",
    backgroundPosition: "0 0, 2px 3px",
  };
  const key =
    "absolute flex items-center justify-center rounded-[10px] border-2 border-[#0c0c0c] bg-[linear-gradient(180deg,#2c2c2d,#141415)] text-white shadow-[0_4px_8px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] active:translate-y-[2px] active:shadow-[0_1px_3px_rgba(0,0,0,0.7)]";
  const print = "pointer-events-none absolute text-center font-bold text-[#d8d8d8]";

  return (
    <div style={{ ...plate, ...UI_FONT }} className="relative size-full rounded-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      {[
        [18, 18],
        [978, 18],
        [18, 828],
        [978, 828],
      ].map(([x, y]) => (
        <span
          key={`${x}-${y}`}
          aria-hidden
          style={{ left: x, top: y }}
          className="absolute size-[40px] rounded-full bg-[radial-gradient(circle,#0b0b0b_0_30%,#2a2a2b_32%,#141415_70%)] shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)]"
        />
      ))}

      {/* Black bezel and the touchscreen. */}
      <div className="absolute rounded-[26px] bg-black shadow-[inset_0_0_0_2px_#0a0a0a]" style={{ left: 92, top: 37, width: 733, height: 812 }} />
      <div className="absolute" style={{ left: SCREEN.left, top: SCREEN.top, width: SCREEN.size, height: SCREEN.size }}>
        {screen}
      </div>

      {/* Buttons beside the screen. */}
      <button type="button" title="MENU — open the menu / go BACK" aria-label="MENU" onClick={onMenu} className={key} style={{ left: 872, top: 127, width: 103, height: 58 }}>
        <span className="text-[30px] font-black tracking-tight">MENU</span>
      </button>
      <span className={print} style={{ left: 872, top: 190, width: 103, fontSize: 27 }}>
        BACK
      </span>

      <div aria-hidden className="absolute rounded-[20px] border-2 border-[#9a9a9a]" style={{ left: 840, top: 228, width: 178, height: 284 }} />
      <button type="button" title="Up" aria-label="Up" onClick={() => onArrow("up")} className={key} style={{ left: 877, top: 270, width: 94, height: 60 }}>
        <svg viewBox="0 0 40 30" className="h-[34px] w-[46px]"><path d="M20 3 L37 27 L20 19 L3 27 Z" fill="white" /></svg>
      </button>
      <button
        type="button"
        title="LOCK — press ▲ and ▼ together"
        aria-label="Lock"
        onClick={onLock}
        className="absolute flex items-center justify-center bg-transparent"
        style={{ left: 842, top: 350, width: 174, height: 40 }}
      >
        <span className="h-[2px] flex-1 bg-[#9a9a9a]" />
        <span className="px-[8px] text-[27px] font-bold text-[#d8d8d8]">LOCK</span>
        <span className="h-[2px] flex-1 bg-[#9a9a9a]" />
      </button>
      <button type="button" title="Down" aria-label="Down" onClick={() => onArrow("down")} className={key} style={{ left: 877, top: 412, width: 94, height: 60 }}>
        <svg viewBox="0 0 40 30" className="h-[34px] w-[46px]"><path d="M20 27 L37 3 L20 11 L3 3 Z" fill="white" /></svg>
      </button>

      <button type="button" title="SEL — select" aria-label="SEL" onClick={onSelect} className={key} style={{ left: 875, top: 557, width: 100, height: 58 }}>
        <span className="text-[30px] font-black">SEL</span>
      </button>
      <span className={print} style={{ left: 875, top: 622, width: 100, fontSize: 27 }}>
        FN
      </span>

      <button type="button" title="Playback" aria-label="Playback" onClick={onPlay} className={key} style={{ left: 885, top: 700, width: 82, height: 60 }}>
        <svg viewBox="0 0 30 30" className="size-[30px]"><path d="M6 3 L27 15 L6 27 Z" fill="white" /></svg>
      </button>
    </div>
  );
}

const bevel =
  "bg-[linear-gradient(180deg,#5c5c5d_0%,#3b3b3c_45%,#262627_100%)] shadow-[inset_0_2px_0_rgba(255,255,255,0.18),0_2px_4px_rgba(0,0,0,0.8)]";

function StatusBar({
  state,
  view,
  locked,
  onToggle,
  onStatus,
}: {
  state: KomodoState;
  view: View;
  locked: boolean;
  onToggle: () => void;
  onStatus: () => void;
}) {
  const minutes = Math.floor(cardMinutes(state));
  return (
    <div className="absolute inset-x-0 top-0 flex h-[48px] items-center bg-[linear-gradient(180deg,#2e2e2e,#1b1b1b)] shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
      <button type="button" onClick={onToggle} className="flex h-full w-[143px] items-center gap-[6px] border-r-2 border-[#111] pl-[8px]">
        <span className="text-[30px] leading-none font-black tracking-[0.04em] italic">{view === "home" ? "MENU" : "HOME"}</span>
        <svg viewBox="0 0 20 24" className="h-[26px] w-[20px]">
          <path d={view === "home" ? "M2 2 L18 12 L2 22" : "M18 2 L2 12 L18 22"} fill="none" stroke="white" strokeWidth="2.2" />
        </svg>
      </button>
      <button type="button" onClick={onStatus} className="flex h-full flex-1 items-center justify-between px-[8px]">
        <span className="flex items-center gap-[4px]">
          <span className="flex h-[36px] w-[42px] items-center justify-center border-[3px] border-[#20d020] text-[21px] font-black text-[#20d020]">
            CF
          </span>
          <span className="text-[25px] font-black text-[#20d020]">
            {Math.floor(minutes / 60)}:{pad(minutes % 60)}
          </span>
        </span>
        <span className="flex flex-col text-[19px] leading-[19px] font-black">
          <span className="text-[#20d020]">T/E</span>
          <span className="text-[#8a8a8a]">TC</span>
        </span>
        <span className="flex flex-col text-[19px] leading-[19px] font-black text-[#8a8a8a]">
          <span>GEN</span>
          <span>SYNC</span>
        </span>
        <span className="flex flex-col text-[21px] leading-[18px] font-black">
          <span>3D</span>
          <span>LUT</span>
        </span>
        <span className="flex items-center gap-[5px]">
          <span className="flex h-[32px] w-[38px] items-center justify-center rounded-[4px] border-[3px] border-[#20d020]">
            <Check className="size-[22px] text-[#20d020]" strokeWidth={4} />
          </span>
          {locked ? <Lock className="size-[28px] text-white" strokeWidth={3} /> : <Unlock className="size-[28px] text-[#6a6a6a]" strokeWidth={3} />}
          <Wifi className="size-[30px]" strokeWidth={3} />
          <Zap className="size-[24px] fill-[#20d020] text-[#20d020]" />
          {[0, 1].map((i) => (
            <span key={i} className="flex h-[38px] w-[17px] flex-col items-center">
              <span className="h-[3px] w-[7px] bg-white" />
              <span className="flex-1 self-stretch rounded-[2px] border-2 border-white bg-[#20d020]" />
            </span>
          ))}
        </span>
      </button>
    </div>
  );
}

function HomeScreen({
  state,
  rec,
  seconds,
  clock,
  clipName,
  quick,
  showHistogram,
  onQuick,
  onStep,
  onRecord,
  onMedia,
}: {
  state: KomodoState;
  rec: Rec;
  seconds: number;
  clock: string;
  clipName: string;
  quick: keyof KomodoState | null;
  showHistogram: boolean;
  onQuick: (id: keyof KomodoState) => void;
  onStep: (by: number) => void;
  onRecord: () => void;
  onMedia: () => void;
}) {
  const { width, height } = KOMODO_FORMATS[state.format];
  const frameW = 561;
  const frameH = Math.min(292, Math.round((frameW * height) / width));
  const stops = exposureStops(state);
  const kelvin = parseFloat(state.colorTemp);
  // A camera set warmer than the ~5600K light renders it orange, cooler renders it blue.
  const warm = Math.log2(kelvin / 5600);
  const tint = parseFloat(state.tint) / 100;

  return (
    <>
      <div className="absolute flex items-center justify-center" style={{ left: 0, top: 54, width: 628, height: 306 }}>
        <div className="relative overflow-hidden border-2 border-white" style={{ width: frameW, height: frameH }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/video/hero-poster.jpg"
            alt=""
            draggable={false}
            className="size-full object-cover"
            style={{ filter: `brightness(${Math.min(Math.max(Math.pow(2, stops * 0.6), 0.08), 3.2)})` }}
          />
          <span
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundColor: warm >= 0 ? "#ff8a2a" : "#3a7bff", opacity: Math.min(Math.abs(warm) * 0.55, 0.55), mixBlendMode: "soft-light" }}
          />
          {tint !== 0 ? (
            <span aria-hidden className="absolute inset-0" style={{ backgroundColor: tint > 0 ? "#ff3cc8" : "#3cff6a", opacity: Math.abs(tint) * 0.4, mixBlendMode: "soft-light" }} />
          ) : null}
          <span aria-hidden className="absolute top-1/2 left-1/2 h-[64px] w-[52px] -translate-x-1/2 -translate-y-1/2 border-2 border-[#20d020]" />
        </div>
      </div>

      {quick ? (
        <Ruler item={komodoItems[quick]} state={state} onStep={onStep} />
      ) : (
        <div className="absolute flex gap-[4px]" style={{ left: 0, top: 367, width: 628, height: 171 }}>
          <RgbMeter stops={stops} />
          <button type="button" onClick={onMedia} className="relative h-full w-[283px] rounded-[2px] bg-[#262626] px-[22px] pt-[6px] text-left shadow-[inset_0_0_12px_rgba(0,0,0,0.7)]">
            {showHistogram ? (
              <Histogram stops={stops} />
            ) : (
              <>
                <p className="text-[40px] leading-[46px] font-black">{clock}</p>
                <p className="text-[21px] leading-[25px] font-black">
                  <span className="text-[#9a9a9a]">CLIP: </span>
                  {clipName}
                </p>
                <p className="text-[21px] leading-[25px] font-black">
                  <span className="text-[#9a9a9a]">DUR: </span>
                  {hms(rec === "on" ? seconds : 0)}
                </p>
                <p className="truncate text-[21px] leading-[25px] font-black">
                  {state.format} / {isProRes(state) ? `${state.proresCodec.replace("ProRes ", "PR ")} ${state.proresRes}` : `R3D ${state.r3dQuality}`}
                </p>
                <p className={cn("text-[21px] leading-[25px] font-black", isOffSpeed(state) && "text-[#ffd400]")}>
                  {state.recFps} FPS
                </p>
              </>
            )}
            <span className="absolute bottom-[7px] left-1/2 flex -translate-x-1/2 gap-[8px]">
              <span className={cn("h-[6px] w-[20px] rounded-full", showHistogram ? "bg-[#d8d8d8]" : "bg-[#d40000]")} />
              <span className={cn("h-[6px] w-[20px] rounded-full", showHistogram ? "bg-[#d40000]" : "bg-[#d8d8d8]")} />
            </span>
          </button>
          <AudioMeters active={!isOffSpeed(state)} />
          <RecButton rec={rec} onPress={onRecord} />
        </div>
      )}

      <div className="absolute flex justify-between" style={{ left: 10, top: 545, width: 608, height: 78 }}>
        {komodoQuick.map(({ id, label }) => {
          const value = state[id];
          const selected = quick === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onQuick(id)}
              className={cn(
                "flex w-[114px] flex-col items-center justify-center rounded-[3px] border-2",
                selected ? "border-[#e00000] bg-[linear-gradient(180deg,#1c1c1c,#2e2e2e)]" : `border-[#111] ${bevel}`
              )}
            >
              <span className={cn("text-[28px] leading-[30px] font-black", id === "recFps" && isOffSpeed(state) && "text-[#ffd400]")}>
                {id === "iris" ? (
                  <>
                    <i className="text-[18px] not-italic align-top">f/</i>
                    {value}
                  </>
                ) : id === "shutter" ? (
                  `${value}°`
                ) : id === "colorTemp" ? (
                  <>
                    {value}
                    <span className="text-[18px]">K</span>
                  </>
                ) : (
                  value
                )}
              </span>
              <span className="text-[14px] leading-[15px] font-black">{label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function RgbMeter({ stops }: { stops: number }) {
  const over = stops > 1.6;
  const under = stops < -1.6;
  const level = Math.min(Math.max(0.5 + stops * 0.18, 0.05), 1);
  const channels = [
    { label: "R", color: "#ff2020" },
    { label: "G", color: "#b4ff20" },
    { label: "B", color: "#2060ff" },
  ];
  return (
    <div className="flex h-full w-[89px] justify-around rounded-[2px] bg-[#1e1e1e] px-[4px] py-[6px]">
      {channels.map((c, i) => (
        <div key={c.label} className="flex flex-col items-center gap-[3px]">
          <span className="size-[20px] rounded-full border-2 border-[#0a0a0a] shadow-[inset_0_2px_3px_rgba(0,0,0,0.9)]" style={{ backgroundColor: over ? c.color : "#151515" }} />
          <span className="text-[15px] leading-none font-black" style={{ color: c.color }}>
            {c.label}
          </span>
          <span className="relative w-[12px] flex-1 overflow-hidden rounded-full border-2 border-[#0a0a0a] bg-[#070707]">
            <span className="absolute inset-x-0 bottom-0" style={{ height: `${Math.min(level * (1 - i * 0.06), 1) * 100}%`, backgroundColor: c.color, opacity: 0.55 }} />
          </span>
          <span className="size-[20px] rounded-full border-2 border-[#0a0a0a] shadow-[inset_0_2px_3px_rgba(0,0,0,0.9)]" style={{ backgroundColor: under ? c.color : "#151515" }} />
        </div>
      ))}
    </div>
  );
}

function Histogram({ stops }: { stops: number }) {
  const shift = Math.min(Math.max(stops * 9, -40), 40);
  const bars = Array.from({ length: 48 }, (_, i) => {
    const x = (i / 47) * 100 - 50 - shift;
    return Math.max(4, 90 * Math.exp(-(x * x) / 520) + 18 * Math.exp(-((x + 28) * (x + 28)) / 60));
  });
  return (
    <div className="flex h-[150px] items-end gap-[1px] pt-[6px]">
      {bars.map((h, i) => (
        <span key={i} className="flex-1 bg-[linear-gradient(180deg,#ffffff,#9a9a9a)]" style={{ height: `${Math.min(h, 100)}%` }} />
      ))}
    </div>
  );
}

function AudioMeters({ active }: { active: boolean }) {
  const [levels, setLevels] = React.useState([0.55, 0.6]);
  React.useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setLevels((l) => l.map((v) => Math.min(Math.max(v + (Math.random() - 0.5) * 0.18, 0.3), 0.92)));
    }, 140);
    return () => clearInterval(timer);
  }, [active]);
  const scale = [
    ["0", 0],
    ["-5", 0.12],
    ["-10", 0.24],
    ["-20", 0.42],
    ["-50", 1],
  ] as const;
  return (
    <div className="relative h-full w-[76px] rounded-[2px] bg-[#1e1e1e] px-[3px] pt-[3px]">
      <div className="flex justify-between px-[4px] text-[16px] leading-[18px] font-black">
        <span>1</span>
        <span className="text-[#ff2020]">2</span>
        <span className="text-[#6a6a6a]">3</span>
        <span className="text-[#6a6a6a]">4</span>
      </div>
      <div className="absolute inset-x-[3px] top-[26px] bottom-[6px] flex gap-[3px]">
        {[0, 1, 2, 3].map((ch) => {
          const on = active && ch < 2;
          const level = on ? levels[ch] : 0;
          return (
            <span key={ch} className="relative flex-1 bg-[repeating-linear-gradient(180deg,#3a3a3a_0_2px,#1e1e1e_2px_4px)]">
              <span
                className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,#9be01a_0%,#e6e01a_70%,#ff7a1a_86%,#ff2020_100%)] [mask-image:repeating-linear-gradient(180deg,#000_0_2px,transparent_2px_4px)]"
                style={{ height: `${level * 100}%` }}
              />
            </span>
          );
        })}
      </div>
      {scale.map(([label, at]) => (
        <span key={label} className="pointer-events-none absolute right-[-2px] h-[1px] w-full bg-white/70" style={{ top: 26 + at * 133 }}>
          <span className="absolute top-[-8px] right-[24px] text-[11px] font-black">{label}</span>
        </span>
      ))}
    </div>
  );
}

function RecButton({ rec, onPress }: { rec: Rec; onPress: () => void }) {
  const on = rec === "on";
  const pre = rec === "pre";
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={on ? "Stop recording" : "Start recording"}
      className={cn("relative flex h-full flex-1 items-stretch gap-[4px] rounded-[2px] p-[4px]", on ? "bg-[#d80000]" : "bg-[#1e1e1e]")}
    >
      <span
        className={cn(
          "flex flex-1 flex-col items-center justify-center rounded-[2px] border-2",
          on
            ? "border-[#7a0000] bg-[#e00000] shadow-[inset_0_0_18px_rgba(0,0,0,0.75)]"
            : pre
              ? "animate-pulse border-[#2a0000] bg-[linear-gradient(180deg,#b01818,#701010)]"
              : "border-[#2a0000] bg-[linear-gradient(180deg,#8f1616,#6a0f0f)] shadow-[inset_0_3px_0_rgba(255,255,255,0.2)]"
        )}
      >
        <span className="text-[78px] leading-[70px] font-black">A</span>
        <span className="text-[30px] leading-[32px] font-black">CAM</span>
      </span>
      <span className="flex w-[22px] flex-col items-center">
        <span className={cn("size-[18px] rounded-full", on ? "bg-[radial-gradient(circle_at_35%_30%,#ff9a9a,#e00000_60%)] shadow-[0_0_8px_#ff3030]" : "bg-[radial-gradient(circle_at_35%_30%,#a33,#500_60%)]")} />
        <span className="mt-[6px] text-[14px] leading-none font-black whitespace-nowrap [writing-mode:vertical-rl] rotate-180">
          {on ? "PRESS TO STOP" : pre ? "PRE-RECORDING" : "PRESS TO RECORD"}
        </span>
      </span>
    </button>
  );
}

/** The sliding scale shown when a quick setting is open — swipe or tap a neighbour. */
function Ruler({ item, state, onStep }: { item: KomodoItem; state: KomodoState; onStep: (by: number) => void }) {
  const options = item.options(state);
  const index = options.indexOf(state[item.id]);
  const drag = React.useRef<{ x: number; moved: number } | null>(null);
  const label = (v: string | undefined) =>
    v === undefined ? "" : item.id === "iris" ? (
      <>
        <i className="align-top text-[0.6em] not-italic">f/</i>
        {v}
      </>
    ) : (
      show(item, v).replace(" FPS", "")
    );
  const octagon = "polygon(14% 0, 86% 0, 100% 22%, 100% 78%, 86% 100%, 14% 100%, 0 78%, 0 22%)";

  return (
    <div
      className="absolute touch-none overflow-hidden"
      style={{
        left: 0,
        top: 367,
        width: 628,
        height: 171,
        backgroundColor: "#e4e4e4",
        backgroundImage:
          "radial-gradient(circle at 50% 50%, transparent 1.6px, rgba(0,0,0,0.06) 1.8px, transparent 2.4px), linear-gradient(90deg, rgba(0,0,0,0.25), transparent 18%, transparent 82%, rgba(0,0,0,0.25))",
        backgroundSize: "6px 6px, 100% 100%",
      }}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, moved: 0 };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        if (Math.abs(dx) > 40) {
          // Swiping left brings the next (higher) value under the marker.
          onStep(dx < 0 ? 1 : -1);
          drag.current = { x: e.clientX, moved: drag.current.moved + 1 };
        }
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onWheel={(e) => onStep(e.deltaY > 0 || e.deltaX > 0 ? 1 : -1)}
    >
      {["top-[8px]", "bottom-[8px]"].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={cn("absolute inset-x-0 h-[26px]", pos)}
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg,#111 0 2px,transparent 2px 13px), repeating-linear-gradient(90deg,#111 0 3px,transparent 3px 52px)",
            backgroundSize: "100% 40%, 100% 100%",
            backgroundRepeat: "no-repeat, no-repeat",
            backgroundPosition: pos.startsWith("top") ? "0 0, 0 0" : "0 100%, 0 0",
          }}
        />
      ))}
      <button type="button" onClick={() => onStep(-1)} className="absolute top-[52px] left-[40px] h-[66px] w-[140px] text-[34px] text-[#222]">
        {label(options[index - 1])}
      </button>
      <button type="button" onClick={() => onStep(1)} className="absolute top-[52px] right-[40px] h-[66px] w-[140px] text-[34px] text-[#222]">
        {label(options[index + 1])}
      </button>
      <div className="absolute top-[22px] left-1/2 h-[128px] w-[196px] -translate-x-1/2 bg-[#141414] p-[6px]" style={{ clipPath: octagon }}>
        <div
          className="flex size-full items-center justify-center bg-[radial-gradient(circle,#ffffff_55%,#e2e2e2)] text-[44px] font-black text-[#111]"
          style={{ clipPath: octagon }}
        >
          {label(state[item.id])}
        </div>
      </div>
      {[
        ["top-[-2px]", "M2 2 L38 2 L20 30 Z"],
        ["bottom-[-2px]", "M2 30 L38 30 L20 2 Z"],
      ].map(([pos, d]) => (
        <svg key={pos} aria-hidden viewBox="0 0 40 32" className={cn("absolute left-1/2 h-[34px] w-[44px] -translate-x-1/2", pos)}>
          <path d={d} fill="#e4e4e4" stroke="#d20000" strokeWidth="4" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
}

function MenuScreen({
  state,
  nav,
  onRow,
  onBack,
}: {
  state: KomodoState;
  nav: MenuNav;
  onRow: (nav: MenuNav, open: boolean) => void;
  onBack: () => void;
}) {
  const items = visibleItems(nav.menu, state);
  const item = items[nav.item];
  let title = "MENU";
  let rows: { key: string; label: string; value?: string; check?: boolean; selected: boolean; nav: MenuNav }[] = [];
  let cursor = 0;
  let message: string | null = null;

  if (nav.level === "root") {
    cursor = nav.menu;
    rows = komodoMenus.map((m, i) => ({ key: m.title, label: m.title, selected: i === nav.menu, nav: { ...nav, menu: i } }));
  } else if (nav.level === "sub") {
    title = komodoMenus[nav.menu].title.toUpperCase();
    cursor = nav.item;
    if (!items.length) message = `${komodoMenus[nav.menu].title} isn't part of this practice simulator.`;
    rows = items.map((it, i) => ({
      key: it.id,
      label: it.label,
      value: show(it, state[it.id]),
      selected: i === nav.item,
      nav: { ...nav, item: i },
    }));
  } else if (item) {
    title = item.label.toUpperCase();
    cursor = nav.option;
    rows = item.options(state).map((o, i) => ({
      key: o,
      label: show(item, o),
      check: o === state[item.id],
      selected: i === nav.option,
      nav: { ...nav, option: i },
    }));
  }

  const page = Math.floor(cursor / ROWS);
  const shown = rows.slice(page * ROWS, page * ROWS + ROWS);
  const pages = Math.max(Math.ceil(rows.length / ROWS), 1);

  return (
    <div className="absolute inset-x-0 top-[48px] bottom-0">
      <div className="flex h-[50px] items-center justify-between bg-[linear-gradient(180deg,#8e8e8e,#cfcfcf)] px-[16px] text-[20px] font-black text-black">
        <button type="button" onClick={onBack} className="flex items-center gap-[4px]">
          {nav.level !== "root" ? <ChevronLeft className="size-[20px]" strokeWidth={3.5} /> : null}
          {title}
        </button>
        {pages > 1 ? (
          <span className="text-[16px]">
            {page + 1}/{pages}
          </span>
        ) : null}
      </div>
      {message ? (
        <p className="px-[30px] pt-[60px] text-center text-[22px] font-bold text-[#bdbdbd]">{message}</p>
      ) : (
        shown.map((row) => (
          <button
            key={row.key}
            type="button"
            onClick={() => onRow(row.nav, row.selected)}
            className="relative flex w-full items-center gap-[12px] border-b-2 border-[#111] bg-[#262626] pr-[8px] pl-[30px] text-left"
            style={{ height: ROW }}
          >
            {row.selected ? <span className="absolute inset-y-0 left-0 w-[20px] bg-[linear-gradient(90deg,#b00000,#e00000)]" /> : null}
            <span className="min-w-0 flex-1 truncate text-[30px] font-black">{row.label}</span>
            {row.value ? <span className="max-w-[45%] truncate text-[22px] font-bold text-[#a8a8a8]">{row.value}</span> : null}
            {row.check ? <Check className="size-[30px] text-[#20d020]" strokeWidth={4} /> : null}
            {nav.level !== "options" ? (
              <span className={cn("flex h-[38px] w-[36px] items-center justify-center rounded-[3px] border-2 border-[#111]", bevel)}>
                <ChevronRight className="size-[26px]" strokeWidth={4} />
              </span>
            ) : null}
          </button>
        ))
      )}
      {nav.level === "options" && item ? (
        <p className="absolute inset-x-0 bottom-0 bg-black/80 px-[14px] py-[8px] text-[15px] leading-snug text-[#cfcfcf]">{item.help}</p>
      ) : null}
    </div>
  );
}

function StatusPage({ state, clipCount }: { state: KomodoState; clipCount: number }) {
  const minutes = Math.floor(cardMinutes(state));
  const used = Math.min(clipCount * 2, 60);
  const label = "text-[#8a8a8a]";
  return (
    <div className="absolute inset-x-0 top-[48px] bottom-0 flex flex-col text-[22px] leading-[28px] font-black">
      <section className="flex flex-1 items-center gap-[18px] border-b-2 border-[#111] bg-[#262626] px-[18px]">
        <span className="flex h-[70px] w-[80px] shrink-0 items-end justify-center border-[5px] border-white">
          <span className="mb-[8px] text-[16px]">CF</span>
        </span>
        <div>
          <p><span className={label}>CLIP COUNT: </span>{clipCount}</p>
          <p><span className={label}>CAPACITY: </span>476 GiB</p>
          <p><span className={label}>AVAILABLE: </span><span className="text-[#20d020]">{100 - used}%</span></p>
          <p><span className={label}>TIME REMAINING: </span><span className="text-[#20d020]">{Math.floor(minutes / 60)}:{pad(minutes % 60)}</span></p>
        </div>
      </section>
      <section className="flex flex-1 items-center gap-[18px] border-b-2 border-[#111] bg-[#262626] px-[18px]">
        <span className="flex h-[76px] w-[44px] shrink-0 flex-col items-center"><span className="h-[6px] w-[20px] bg-white" /><span className="flex-1 self-stretch rounded-[4px] border-[5px] border-white" /></span>
        <div className="grid flex-1 grid-cols-[1.2fr_1fr_1fr] gap-x-[10px]">
          <span className={label}>SOURCE</span><span className={label}>V</span><span className={label}>%</span>
          <span>BAT-1</span><span>7.4V</span><span className="text-[#20d020]">96%</span>
          <span>BAT-2</span><span>7.5V</span><span className="text-[#20d020]">96%</span>
        </div>
      </section>
      <section className="flex flex-1 items-center gap-[18px] bg-[#262626] px-[18px]">
        <span className="flex h-[58px] w-[70px] shrink-0 items-center justify-center rounded-[6px] border-[5px] border-white"><Check className="size-[34px]" strokeWidth={4} /></span>
        <div>
          <p><span className={label}>CAMERA STATUS: </span><span className="text-[#20d020]">Good</span></p>
          <p><span className={label}>CAMERA TYPE: </span>KOMODO 6K</p>
          <p><span className={label}>FORMAT: </span>{state.format} {isProRes(state) ? "ProRes" : `R3D ${state.r3dQuality}`}</p>
        </div>
      </section>
    </div>
  );
}

function PlaybackScreen({ clips }: { clips: Clip[] }) {
  const clip = clips[clips.length - 1];
  return (
    <div className="absolute inset-x-0 top-[48px] bottom-0 flex flex-col items-center justify-center gap-[16px] bg-black">
      {clip ? (
        <>
          <div className="relative h-[290px] w-[561px] overflow-hidden border-2 border-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/video/hero-poster.jpg" alt="" draggable={false} className="size-full object-cover" />
            <span className="absolute top-[10px] left-[12px] rounded-[3px] bg-black/70 px-[8px] text-[20px] font-black">▶ PLAYBACK</span>
          </div>
          <p className="text-[28px] font-black">{clip.name}</p>
          <p className="text-[22px] font-bold text-[#bdbdbd]">
            {hms(clip.seconds)} · {clip.summary}
          </p>
          <p className="text-[16px] text-[#8a8a8a]">Press ▶ again to return</p>
        </>
      ) : (
        <p className="text-[26px] font-black text-[#bdbdbd]">No clips on media.</p>
      )}
    </div>
  );
}

export default KomodoSimulator;
