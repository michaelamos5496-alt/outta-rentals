"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * OUTTA's own illustration of the FX3's rear panel and top plate. Controls
 * sit where they are on the camera (checked against photos of the body and
 * Sony's Help Guide parts diagrams); the drawing itself is ours and carries
 * no Sony branding. Every control reports presses through `onPress`.
 */

export type Fx3Control =
  | "power"
  | "mode"
  | "menu"
  | "rearDialL"
  | "rearDialR"
  | "c5"
  | "fn"
  | "up"
  | "down"
  | "left"
  | "right"
  | "center"
  | "wheelL"
  | "wheelR"
  | "playback"
  | "c4"
  | "rec"
  | "c1"
  | "c2"
  | "c3"
  | "shutter"
  | "zoom"
  | "frontDialL"
  | "frontDialR";

export type Fx3Part =
  | "power"
  | "mode"
  | "menu"
  | "rearDial"
  | "c5"
  | "fn"
  | "wheel"
  | "playback"
  | "c4"
  | "accessLamp"
  | "rec"
  | "c1"
  | "c2"
  | "c3"
  | "shutter"
  | "frontDial"
  | "shoe"
  | "monitor";

export const partGuide: Record<Fx3Part, { name: string; text: string }> = {
  power: { name: "Power switch", text: "Slide to ⏻ to turn the camera on, back to I to turn it off." },
  mode: {
    name: "MODE button",
    text: "Chooses the shooting mode. In this simulator (Movie mode) it opens Exposure Mode: P, A, S or M.",
  },
  menu: { name: "MENU button", text: "Opens the menu. Press it again to go back a step or close the menu." },
  rearDial: {
    name: "Rear dial",
    text: "In Manual it changes the shutter speed (or angle). In menus it scrolls. Click either side, or scroll over it.",
  },
  c5: { name: "5 button / FOCUS MAG", text: "Custom button 5, set to Focus Magnifier — zooms into the image to check focus." },
  fn: { name: "Fn button", text: "Opens the Function menu: twelve quick settings over the shooting screen." },
  wheel: {
    name: "Control wheel",
    text: "Press a side to move and the centre to select. On the shooting screen: DISP (top) shows/hides info, PEAKING (right) toggles focus peaking, SHUTTER (bottom) opens the shutter setting, ZEBRA (left) toggles zebras. Turning it (scroll, or ↺ ↻) changes ISO in Manual.",
  },
  playback: { name: "Playback button", text: "Shows the clips you have recorded. Press again to go back to shooting." },
  c4: {
    name: "4 button / Delete",
    text: "Custom button 4 while shooting (set by the user). In playback it deletes the clip on screen.",
  },
  accessLamp: { name: "Access lamp", text: "Lights while the memory card is being written to. Don't remove the card while it's on." },
  rec: { name: "REC button", text: "Starts and stops movie recording. It lights red while recording." },
  c1: { name: "1 button / IRIS", text: "Custom button 1, set to Iris — opens the aperture setting." },
  c2: { name: "2 button / WB", text: "Custom button 2, set to White Balance." },
  c3: { name: "3 button / ISO", text: "Custom button 3, set to ISO (or EI in Cine EI)." },
  shutter: {
    name: "Shutter button and W/T zoom lever",
    text: "Half-press to focus. The W/T lever around it controls power-zoom lenses.",
  },
  frontDial: {
    name: "Front dial",
    text: "On the front of the grip. In Manual it changes the aperture; in menus it switches tabs. Click either side, or scroll over it.",
  },
  shoe: { name: "Multi Interface Shoe", text: "Mounts accessories — the XLR handle unit, microphones, lights or a monitor." },
  monitor: {
    name: "Monitor / touch panel",
    text: "Vari-angle touchscreen: it swings out from the left side and rotates. In this simulator you can tap settings on it.",
  },
};

interface BodyProps {
  power: boolean;
  recording: boolean;
  guide: boolean;
  onPress: (control: Fx3Control) => void;
  onPart: (part: Fx3Part | null) => void;
}

const guideRing = "ring-[0.3cqw] ring-[#e8731d]/80";

/** One tappable control. In Guide mode it explains itself instead. */
function Control({
  part,
  control,
  label,
  className,
  props,
  children,
}: {
  part: Fx3Part;
  control?: Fx3Control;
  label?: string;
  className?: string;
  props: BodyProps;
  children?: React.ReactNode;
}) {
  const { guide, onPress, onPart } = props;
  return (
    <button
      type="button"
      aria-label={label ?? partGuide[part].name}
      title={partGuide[part].name}
      onClick={() => (guide || !control ? onPart(part) : onPress(control))}
      onMouseEnter={guide ? () => onPart(part) : undefined}
      className={cn("absolute flex items-center justify-center transition-transform active:scale-95", guide && guideRing, className)}
    >
      {children}
    </button>
  );
}

const roundButton =
  "rounded-full border-[0.25cqw] border-[#0c0c0d] bg-[radial-gradient(circle_at_35%_30%,#45484d,#202124_70%)] shadow-[0_0.3cqw_0.6cqw_rgba(0,0,0,0.6)] text-white/90 font-semibold";
const ovalButton =
  "rounded-full border-[0.25cqw] border-[#0c0c0d] bg-[linear-gradient(180deg,#3d4045,#1f2023)] shadow-[0_0.3cqw_0.6cqw_rgba(0,0,0,0.6)] text-white/90 font-semibold";

function Print({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("pointer-events-none absolute text-[1.35cqw] font-semibold tracking-wide whitespace-nowrap text-white/80", className)}>
      {children}
    </span>
  );
}

/** A knurled dial, turned by clicking either half or scrolling over it. */
function Dial({
  part,
  left,
  right,
  className,
  round,
  props,
}: {
  part: Fx3Part;
  left: Fx3Control;
  right: Fx3Control;
  className: string;
  round?: boolean;
  props: BodyProps;
}) {
  const { guide, onPress, onPart } = props;
  return (
    <div
      title={partGuide[part].name}
      onMouseEnter={guide ? () => onPart(part) : undefined}
      onWheel={(e) => {
        if (!guide) onPress(e.deltaY > 0 || e.deltaX > 0 ? right : left);
      }}
      className={cn(
        "absolute flex overflow-hidden border-[0.25cqw] border-[#0c0c0d] shadow-[0_0.3cqw_0.6cqw_rgba(0,0,0,0.6)]",
        round ? "rounded-full" : "rounded-[0.8cqw]",
        guide && guideRing,
        className
      )}
      style={{
        backgroundImage: round
          ? "radial-gradient(circle, #2a2c2f 0 38%, transparent 39%), repeating-conic-gradient(#45484d 0 7deg, #1c1d1f 7deg 14deg)"
          : "linear-gradient(180deg,rgba(255,255,255,0.12),rgba(0,0,0,0.35)), repeating-linear-gradient(90deg,#3c3f43 0 0.45cqw,#17181a 0.45cqw 0.9cqw)",
      }}
    >
      {[left, right].map((control, i) => (
        <button
          key={control}
          type="button"
          aria-label={`${partGuide[part].name}: turn ${i === 0 ? "left" : "right"}`}
          onClick={() => (guide ? onPart(part) : onPress(control))}
          className="flex flex-1 items-center justify-center text-[1.8cqw] font-bold text-white/0 hover:text-white/90 active:bg-white/10"
        >
          {i === 0 ? "‹" : "›"}
        </button>
      ))}
    </div>
  );
}

const pebbled = {
  backgroundImage: "radial-gradient(#0d0d0e 0.22cqw, transparent 0.28cqw)",
  backgroundSize: "0.8cqw 0.8cqw",
};

/** The rear panel, with `screen` set into the monitor. */
function Fx3Rear({ screen, ...props }: BodyProps & { screen: React.ReactNode }) {
  const { recording, power, guide, onPress, onPart } = props;
  const wheelSide = "absolute flex items-center justify-center active:bg-white/5";
  return (
    <div className="@container relative aspect-[5/3] w-full rounded-[3cqw] border-[0.4cqw] border-[#0a0a0b] bg-[linear-gradient(170deg,#303235_0%,#1f2023_50%,#18191b_100%)] shadow-[inset_0_0.4cqw_0.8cqw_rgba(255,255,255,0.07),0_2cqw_4cqw_rgba(0,0,0,0.6)]">
      {/* Textured grip down the right edge. */}
      <div aria-hidden className="absolute top-[12%] right-0 bottom-[3%] w-[12%] rounded-r-[2.6cqw] rounded-l-[4cqw] bg-[#1b1c1e] opacity-90" style={pebbled} />

      {/* Vari-angle hinge on the left, then the monitor. */}
      <div
        aria-hidden
        className="absolute top-[30%] left-0 h-[52%] w-[2.6%] rounded-l-[0.8cqw] bg-[linear-gradient(90deg,#141516,#26282b)]"
      />
      <div
        title={partGuide.monitor.name}
        onMouseEnter={guide ? () => onPart("monitor") : undefined}
        className={cn(
          "absolute top-[21%] left-[3.2%] w-[60%] rounded-[1.2cqw] border-[0.9cqw] border-[#0b0b0c] bg-black shadow-[0_0_0_0.3cqw_#2a2c2f,0_1cqw_2cqw_rgba(0,0,0,0.6)]",
          guide && guideRing
        )}
      >
        {screen}
      </div>

      {/* Top edge: power switch, MODE, grille, MENU. */}
      <Print className="top-[2.6%] left-[7.4%] text-[1.5cqw]">I</Print>
      <Print className="top-[2.4%] left-[15.4%] text-[1.6cqw]">⏻</Print>
      <Control
        part="power"
        label={power ? "Power off" : "Power on"}
        control="power"
        props={props}
        className="top-[8.5%] left-[6.4%] h-[3.6cqw] w-[11.5cqw] justify-start rounded-[0.8cqw] border-[0.25cqw] border-[#0c0c0d] bg-[#121314] px-[0.5cqw]"
      >
        <span
          className={cn(
            "h-[2.4cqw] w-[4.2cqw] rounded-[0.5cqw] bg-[linear-gradient(180deg,#d9dadc,#9a9ca0)] transition-transform",
            power ? "translate-x-[5.8cqw]" : "translate-x-0"
          )}
        />
      </Control>

      <Control part="mode" control="mode" props={props} className={cn(ovalButton, "top-[8%] left-[21%] h-[4.4cqw] w-[9cqw] text-[1.5cqw]")}>
        MODE
      </Control>
      <div
        aria-hidden
        className="absolute top-[10.6%] left-[34%] h-[1.6cqw] w-[13cqw] rounded-full bg-[#141516]"
        style={{ backgroundImage: "repeating-linear-gradient(90deg,#0a0a0b 0 0.5cqw,#2b2d30 0.5cqw 0.9cqw)" }}
      />
      <Control part="menu" control="menu" props={props} className={cn(ovalButton, "top-[8%] left-[50%] h-[4.4cqw] w-[9cqw] text-[1.5cqw]")}>
        MENU
      </Control>

      <Dial part="rearDial" left="rearDialL" right="rearDialR" props={props} className="top-[8%] left-[64.5%] h-[5.6cqw] w-[14cqw]" />

      {/* Right column: 5 / FOCUS MAG, Fn, control wheel. */}
      <Print className="top-[21.5%] left-[72.6%] text-[1.3cqw]">FOCUS MAG</Print>
      <Control part="c5" control="c5" props={props} className={cn(roundButton, "top-[26%] left-[74.4%] size-[5cqw] text-[2cqw]")}>
        5
      </Control>
      <Control part="fn" control="fn" props={props} className={cn(roundButton, "top-[39%] left-[74.4%] size-[5cqw] text-[1.8cqw]")}>
        Fn
      </Control>

      <div
        onMouseEnter={guide ? () => onPart("wheel") : undefined}
        onWheel={(e) => {
          if (!guide) onPress(e.deltaY > 0 ? "wheelR" : "wheelL");
        }}
        className={cn(
          "absolute top-[50%] left-[68.4%] size-[17cqw] rounded-full border-[0.4cqw] border-[#0b0b0c] bg-[radial-gradient(circle_at_40%_35%,#3a3d41,#1b1c1f_72%)] shadow-[0_0.4cqw_1cqw_rgba(0,0,0,0.7)]",
          guide && guideRing
        )}
      >
        {(
          [
            ["up", "DISP", "inset-x-[4.5cqw] top-0 h-[4.6cqw] items-start pt-[0.5cqw]", ""],
            ["down", "SHUTTER", "inset-x-[4cqw] bottom-0 h-[4.6cqw] items-end pb-[0.5cqw]", ""],
            ["left", "ZEBRA", "inset-y-[4cqw] left-0 w-[4.6cqw] justify-start pl-[0.3cqw]", "-rotate-90"],
            ["right", "PEAKING", "inset-y-[4cqw] right-0 w-[4.6cqw] justify-end pr-[0.3cqw]", "rotate-90"],
          ] as const
        ).map(([control, label, pos, rotate]) => (
          <button
            key={control}
            type="button"
            aria-label={`Control wheel ${control} (${label})`}
            onClick={() => (guide ? onPart("wheel") : onPress(control))}
            className={cn(wheelSide, pos)}
          >
            <span className={cn("text-[1.15cqw] font-semibold tracking-wide whitespace-nowrap text-white/85", rotate)}>{label}</span>
          </button>
        ))}
        <button
          type="button"
          aria-label="Control wheel centre"
          onClick={() => (guide ? onPart("wheel") : onPress("center"))}
          className="absolute inset-[4.6cqw] rounded-full border-[0.25cqw] border-[#0c0c0d] bg-[radial-gradient(circle_at_35%_30%,#4e5156,#26282b_70%)] active:scale-95"
        />
      </div>
      {(["wheelL", "wheelR"] as const).map((control, i) => (
        <button
          key={control}
          type="button"
          aria-label={`Turn control wheel ${i === 0 ? "left" : "right"}`}
          title="Turn the control wheel"
          onClick={() => (guide ? onPart("wheel") : onPress(control))}
          className={cn(
            "absolute top-[78%] text-[1.8cqw] text-white/35 hover:text-white",
            i === 0 ? "left-[66.2%]" : "left-[85.6%]"
          )}
        >
          {i === 0 ? "↺" : "↻"}
        </button>
      ))}

      {/* Playback, 4 / Delete, access lamp. */}
      <Control part="playback" control="playback" props={props} className={cn(roundButton, "top-[83%] left-[71.6%] size-[4.4cqw]")}>
        <span className="pointer-events-none flex h-[2cqw] w-[2.4cqw] items-center justify-center rounded-[0.2cqw] border-[0.2cqw] border-white/85 text-[1.1cqw]">
          ▶
        </span>
      </Control>
      <Control part="c4" control="c4" props={props} className={cn(roundButton, "top-[83%] left-[80.6%] size-[4.4cqw] text-[1.8cqw]")}>
        4
      </Control>
      <Trash2 aria-hidden className="pointer-events-none absolute top-[92.6%] left-[82.4%] size-[1.7cqw] text-white/70" />
      <span
        aria-hidden
        onMouseEnter={guide ? () => onPart("accessLamp") : undefined}
        onClick={guide ? () => onPart("accessLamp") : undefined}
        className={cn("absolute top-[88%] left-[66.6%] h-[1.6cqw] w-[0.6cqw] rounded-full", recording ? "bg-[#ff8a1f] shadow-[0_0_1cqw_#ff8a1f]" : "bg-[#2c2420]")}
      />
    </div>
  );
}

/** The top plate seen from above, front (lens side) at the top like a top-down photo. */
function Fx3Top(props: BodyProps) {
  const { recording } = props;
  return (
    <div className="@container relative mt-[4%] aspect-[5/1.75] w-full">
      {/* Lens mount rim and grip rise above the body's front edge. */}
      <div aria-hidden className="absolute top-0 left-[18%] h-[22%] w-[42%] rounded-t-[40%] bg-[linear-gradient(180deg,#0e0e0f,#1d1e20)]" />
      <div aria-hidden className="absolute top-0 left-[78%] h-[40%] w-[20%] rounded-t-[3cqw] rounded-tr-[5cqw] bg-[#17181a]" style={pebbled} />

      <div className="absolute inset-x-0 top-[18%] bottom-0 rounded-[2.6cqw] border-[0.4cqw] border-[#0a0a0b] bg-[linear-gradient(180deg,#5a5c60_0%,#45474b_55%,#2a2b2e_100%)] shadow-[0_1cqw_2cqw_rgba(0,0,0,0.5)]" />
      {/* Darker rear lip along the bottom edge. */}
      <div aria-hidden className="absolute inset-x-[1%] bottom-[1%] h-[16%] rounded-b-[2.4cqw] bg-[#141516]" />

      {/* Three 1/4" accessory holes. */}
      {["left-[6%]", "left-[16%]", "left-[54%]"].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={cn(
            "absolute top-[40%] size-[5cqw] rounded-full border-[0.35cqw] border-[#2b2c2f] bg-[radial-gradient(circle,#0f0f10_0_30%,#8f9196_32%,#6d6f73_70%)]",
            pos
          )}
        />
      ))}

      <Control
        part="shoe"
        props={props}
        className="top-[42%] left-[32.5%] h-[13cqw] w-[11cqw] rounded-[0.6cqw] border-[0.35cqw] border-[#0c0c0d] bg-[linear-gradient(180deg,#26282b,#111214)]"
      >
        <span className="pointer-events-none size-[2cqw] rounded-full bg-[#b8babd]" />
      </Control>

      <Control
        part="rec"
        control="rec"
        props={props}
        className={cn(
          "top-[56%] left-[63%] size-[6cqw] rounded-full border-[0.5cqw] border-[#111]",
          recording ? "bg-red-600 shadow-[0_0_2cqw_#ef4444]" : "bg-[radial-gradient(circle_at_40%_35%,#3a1414,#1a0909_75%)]"
        )}
      >
        <span className={cn("pointer-events-none text-[1.4cqw] font-bold", recording ? "text-white" : "text-[#e23b3b]")}>REC</span>
      </Control>

      {/* The rear dial seen from above, next to REC. */}
      <Dial part="rearDial" left="rearDialL" right="rearDialR" round props={props} className="top-[55%] left-[72%] size-[6.6cqw]" />

      <Control part="c2" control="c2" props={props} className={cn(roundButton, "top-[34%] left-[64%] size-[4.4cqw] text-[1.8cqw]")}>
        2
      </Control>
      <Print className="top-[36%] left-[69.4%] text-[1.4cqw] text-black/75">WB</Print>
      <Control part="c3" control="c3" props={props} className={cn(roundButton, "top-[34%] left-[73.4%] size-[4.4cqw] text-[1.8cqw]")}>
        3
      </Control>
      <Print className="top-[36%] left-[78.8%] text-[1.4cqw] text-black/75">ISO</Print>

      {/* Grip: 1 / IRIS, shutter button inside the W/T lever, front dial on the front edge. */}
      <Control part="c1" control="c1" props={props} className={cn(roundButton, "top-[19%] left-[79.6%] size-[4cqw] text-[1.7cqw]")}>
        1
      </Control>
      <Print className="top-[22%] left-[84.4%] text-[1.3cqw]">IRIS</Print>
      <Control
        part="shutter"
        control="zoom"
        label="W/T zoom lever"
        props={props}
        className="top-[-2%] left-[83.4%] size-[9cqw] rounded-full border-[0.3cqw] border-[#0c0c0d] bg-[radial-gradient(circle,#1e1f22_0_55%,#34363a_57%,#1a1b1d_100%)]"
      />
      <Print className="top-[-1%] left-[83%] text-[1.1cqw]">W</Print>
      <Print className="top-[-1%] left-[93.6%] text-[1.1cqw]">T</Print>
      <Control
        part="shutter"
        control="shutter"
        label="Shutter button"
        props={props}
        className="top-[3.6%] left-[85.4%] size-[5cqw] rounded-full border-[0.3cqw] border-[#0c0c0d] bg-[radial-gradient(circle_at_35%_30%,#55585d,#232427_70%)]"
      />
      <Dial part="frontDial" left="frontDialL" right="frontDialR" props={props} className="top-[-9%] left-[84.4%] h-[2.4cqw] w-[7cqw]" />
    </div>
  );
}

export { Fx3Rear, Fx3Top };
