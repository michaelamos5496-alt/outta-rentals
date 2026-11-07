"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * OUTTA's own illustration of the FX3's rear panel and top plate. Controls
 * sit where Sony's Help Guide parts diagrams place them; the drawing itself
 * is ours. Every control reports presses through `onPress`.
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
  | "recLamp"
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
  | "shoe";

export const partGuide: Record<Fx3Part, { name: string; text: string }> = {
  power: { name: "Power switch", text: "Turns the camera on and off." },
  mode: {
    name: "MODE button",
    text: "Chooses the shooting mode. In this simulator (Movie mode) it opens Exposure Mode: P, A, S or M.",
  },
  recLamp: { name: "Recording lamp", text: "Lights red while the camera is recording." },
  menu: { name: "MENU button", text: "Opens the menu. Press it again to go back a step or close the menu." },
  rearDial: {
    name: "Rear dial",
    text: "In Manual it changes the shutter speed (or angle). In menus it scrolls. Click either side, or scroll over it.",
  },
  c5: { name: "C5 / FOCUS MAG", text: "Custom button 5, set to Focus Magnifier — zooms into the image to check focus." },
  fn: { name: "Fn button", text: "Opens the Function menu: twelve quick settings over the shooting screen." },
  wheel: {
    name: "Control wheel",
    text: "Press top, bottom, left or right to move and the centre to select. Top is DISP (show/hide info), left toggles zebras. Turning it (scroll, or the ‹ › marks) changes ISO in Manual.",
  },
  playback: { name: "Playback button", text: "Shows the clips you have recorded. Press again to go back to shooting." },
  c4: {
    name: "C4 / Delete",
    text: "Custom button 4 while shooting (set by the user). In playback it deletes the clip on screen.",
  },
  accessLamp: { name: "Access lamp", text: "Lights while the memory card is being written to. Don't remove the card while it's on." },
  rec: { name: "REC button", text: "Starts and stops movie recording. It lights red while recording." },
  c1: { name: "C1 / IRIS", text: "Custom button 1, set to Iris — opens the aperture setting." },
  c2: { name: "C2 / WB", text: "Custom button 2, set to White Balance." },
  c3: { name: "C3 / ISO", text: "Custom button 3, set to ISO (or EI in Cine EI)." },
  shutter: {
    name: "Shutter button and W/T zoom lever",
    text: "Half-press to focus. The zoom lever around it controls power-zoom lenses.",
  },
  frontDial: {
    name: "Front dial",
    text: "In Manual it changes the aperture. In menus it switches tabs. Click either side, or scroll over it.",
  },
  shoe: { name: "Multi Interface Shoe", text: "Mounts accessories — the XLR handle unit, microphones, lights or a monitor." },
};

interface BodyProps {
  power: boolean;
  recording: boolean;
  guide: boolean;
  onPress: (control: Fx3Control) => void;
  onPart: (part: Fx3Part | null) => void;
}

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
      className={cn(
        "absolute transition-transform active:scale-95",
        guide && "ring-[0.3cqw] ring-[#e8731d]/70 ring-offset-0",
        className
      )}
    >
      {children}
    </button>
  );
}

const buttonFace =
  "rounded-full border-[0.25cqw] border-[#111] bg-[radial-gradient(circle_at_35%_30%,#4a4d52,#26282b_70%)] shadow-[0_0.3cqw_0.6cqw_rgba(0,0,0,0.6)]";

function Print({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("pointer-events-none absolute text-[1.35cqw] font-semibold tracking-wide text-white/80", className)}>
      {children}
    </span>
  );
}

/** A ridged dial seen edge-on, turned by clicking either half or scrolling. */
function Dial({
  part,
  left,
  right,
  className,
  props,
}: {
  part: Fx3Part;
  left: Fx3Control;
  right: Fx3Control;
  className: string;
  props: BodyProps;
}) {
  const { guide, onPress, onPart } = props;
  return (
    <div
      title={partGuide[part].name}
      onMouseEnter={guide ? () => onPart(part) : undefined}
      onWheel={(e) => {
        if (guide) return;
        onPress(e.deltaY > 0 || e.deltaX > 0 ? right : left);
      }}
      className={cn(
        "absolute flex overflow-hidden rounded-[0.6cqw] border-[0.25cqw] border-[#111] shadow-[0_0.3cqw_0.6cqw_rgba(0,0,0,0.6)]",
        guide && "ring-[0.3cqw] ring-[#e8731d]/70",
        className
      )}
      style={{ backgroundImage: "repeating-linear-gradient(90deg,#3c3f43 0 0.5cqw,#1d1f21 0.5cqw 1cqw)" }}
    >
      {[left, right].map((control, i) => (
        <button
          key={control}
          type="button"
          aria-label={`${partGuide[part].name}: turn ${i === 0 ? "left" : "right"}`}
          onClick={() => (guide ? onPart(part) : onPress(control))}
          className="flex flex-1 items-center justify-center text-[1.6cqw] text-white/0 hover:text-white/80 active:bg-white/10"
        >
          {i === 0 ? "‹" : "›"}
        </button>
      ))}
    </div>
  );
}

/** The rear panel, with `screen` set into the monitor. */
function Fx3Rear({ screen, ...props }: BodyProps & { screen: React.ReactNode }) {
  const { recording, power, guide, onPress, onPart } = props;
  const wheelArrow =
    "absolute flex items-center justify-center text-[1.4cqw] text-white/55 hover:text-white active:text-[#e8731d]";
  return (
    <div
      className="@container relative aspect-[5/3] w-full rounded-[3.5cqw] border-[0.4cqw] border-[#0b0b0c] bg-[linear-gradient(160deg,#36383c_0%,#232427_45%,#1a1b1d_100%)] shadow-[inset_0_0.4cqw_0.8cqw_rgba(255,255,255,0.08),0_2cqw_4cqw_rgba(0,0,0,0.6)]"
    >
      {/* Grip texture on the right edge. */}
      <div
        aria-hidden
        className="absolute top-[8%] right-0 bottom-[8%] w-[3.4%] rounded-r-[3cqw] opacity-70"
        style={{ backgroundImage: "radial-gradient(#0e0e0f 0.25cqw, transparent 0.3cqw)", backgroundSize: "1cqw 1cqw" }}
      />

      {/* Monitor. */}
      <div className="absolute top-[14%] left-[3.5%] w-[60%] rounded-[1cqw] border-[0.6cqw] border-[#0d0d0e] bg-black shadow-[0_0_0_0.3cqw_#2c2e31]">
        <div className="relative">{screen}</div>
      </div>

      {/* Top edge: power, MODE, recording lamp, MENU. */}
      <Control
        part="power"
        control="power"
        label={power ? "Power off" : "Power on"}
        props={props}
        className="top-[3%] left-[5%] flex h-[4.4cqw] w-[11cqw] items-center rounded-full border-[0.25cqw] border-[#111] bg-[#141516] px-[0.5cqw]"
      >
        <span
          className={cn(
            "h-[3cqw] w-[4.6cqw] rounded-full bg-[#5b5e63] transition-transform",
            power ? "translate-x-[5cqw]" : "translate-x-0"
          )}
        />
      </Control>
      <Print className="top-[10.4%] left-[5.6%]">OFF</Print>
      <Print className="top-[10.4%] left-[13.6%]">ON</Print>

      <Control part="mode" control="mode" props={props} className={cn(buttonFace, "top-[3%] left-[22%] size-[4.6cqw]")} />
      <Print className="top-[10.4%] left-[22%]">MODE</Print>

      <span
        aria-hidden
        className={cn(
          "absolute top-[5%] left-[33.5%] size-[1.4cqw] rounded-full",
          recording ? "bg-red-500 shadow-[0_0_1.6cqw_#ef4444]" : "bg-[#3a1d1d]"
        )}
        onMouseEnter={guide ? () => onPart("recLamp") : undefined}
        onClick={guide ? () => onPart("recLamp") : undefined}
      />

      <Control part="menu" control="menu" props={props} className={cn(buttonFace, "top-[3%] left-[44%] h-[4.2cqw] w-[6.4cqw]")} />
      <Print className="top-[10.4%] left-[44.6%]">MENU</Print>

      {/* Right column. */}
      <Dial part="rearDial" left="rearDialL" right="rearDialR" props={props} className="top-[2.5%] left-[74%] h-[6cqw] w-[21cqw]" />

      <Control part="c5" control="c5" props={props} className={cn(buttonFace, "top-[17%] left-[77%] size-[5cqw]")} />
      <Print className="top-[19.5%] left-[86.5%] leading-tight">
        C5
        <br />
        <span className="text-[1.1cqw]">FOCUS MAG</span>
      </Print>

      <Control part="fn" control="fn" props={props} className={cn(buttonFace, "top-[29%] left-[77%] size-[5cqw]")} />
      <Print className="top-[31.6%] left-[86.5%]">Fn</Print>

      {/* Control wheel with DISP on top. */}
      <div
        className={cn(
          "absolute top-[42%] left-[70%] size-[20cqw] rounded-full border-[0.4cqw] border-[#0f0f10] bg-[radial-gradient(circle_at_40%_35%,#3d4044,#1e1f22_70%)] shadow-[0_0.4cqw_1cqw_rgba(0,0,0,0.7)]",
          guide && "ring-[0.3cqw] ring-[#e8731d]/70"
        )}
        onMouseEnter={guide ? () => onPart("wheel") : undefined}
        onWheel={(e) => {
          if (!guide) onPress(e.deltaY > 0 ? "wheelR" : "wheelL");
        }}
      >
        <span className="pointer-events-none absolute top-[0.6cqw] left-1/2 -translate-x-1/2 text-[1.2cqw] font-semibold text-white/80">
          DISP
        </span>
        {(
          [
            ["up", "▲", "inset-x-[6cqw] top-[1.6cqw] h-[5cqw]"],
            ["down", "▼", "inset-x-[6cqw] bottom-0 h-[5cqw]"],
            ["left", "◀", "inset-y-[6cqw] left-0 w-[5cqw]"],
            ["right", "▶", "inset-y-[6cqw] right-0 w-[5cqw]"],
          ] as const
        ).map(([control, glyph, pos]) => (
          <button
            key={control}
            type="button"
            aria-label={`Control wheel ${control}`}
            onClick={() => (guide ? onPart("wheel") : onPress(control))}
            className={cn(wheelArrow, pos)}
          >
            {glyph}
          </button>
        ))}
        {(["wheelL", "wheelR"] as const).map((control, i) => (
          <button
            key={control}
            type="button"
            aria-label={`Turn control wheel ${i === 0 ? "left" : "right"}`}
            onClick={() => (guide ? onPart("wheel") : onPress(control))}
            className={cn(
              "absolute bottom-[1.4cqw] text-[1.6cqw] text-white/40 hover:text-white",
              i === 0 ? "left-[2.4cqw]" : "right-[2.4cqw]"
            )}
          >
            {i === 0 ? "↺" : "↻"}
          </button>
        ))}
        <button
          type="button"
          aria-label="Control wheel centre"
          onClick={() => (guide ? onPart("wheel") : onPress("center"))}
          className="absolute inset-[6.2cqw] rounded-full border-[0.25cqw] border-[#111] bg-[radial-gradient(circle_at_35%_30%,#505358,#2a2c2f_70%)] active:scale-95"
        />
      </div>

      {/* Below the wheel: playback, C4/delete, access lamp, speaker. */}
      <Control part="playback" control="playback" props={props} className={cn(buttonFace, "top-[84%] left-[71%] size-[4.6cqw]")}>
        <span className="pointer-events-none text-[1.6cqw] text-white/80">▶</span>
      </Control>
      <Control part="c4" control="c4" props={props} className={cn(buttonFace, "top-[84%] left-[84%] size-[4.6cqw]")}>
        <span className="pointer-events-none text-[1.4cqw] font-semibold text-white/80">C4</span>
      </Control>
      <span
        aria-hidden
        className={cn("absolute top-[79%] left-[95%] size-[1cqw] rounded-full", recording ? "bg-[#ff8a1f]" : "bg-[#3a2a1a]")}
        onMouseEnter={guide ? () => onPart("accessLamp") : undefined}
        onClick={guide ? () => onPart("accessLamp") : undefined}
      />
      <div
        aria-hidden
        className="absolute top-[86%] left-[64.5%] h-[4cqw] w-[4cqw] opacity-80"
        style={{ backgroundImage: "radial-gradient(#0b0b0c 0.3cqw, transparent 0.35cqw)", backgroundSize: "1cqw 1cqw" }}
      />

    </div>
  );
}

/** The top plate seen from above — the bottom edge is the front of the camera. */
function Fx3Top(props: BodyProps) {
  const { recording } = props;
  return (
    <div className="@container relative aspect-[5/1.15] w-full rounded-[3cqw] border-[0.4cqw] border-[#0b0b0c] bg-[linear-gradient(180deg,#2e3034_0%,#1d1e20_100%)] shadow-[0_1cqw_2cqw_rgba(0,0,0,0.5)]">
      <Print className="top-[8%] left-[2.5%] text-white/40">TOP</Print>

      {/* Accessory thread holes and microphone grilles. */}
      {["left-[14%]", "left-[30%]", "left-[60%]"].map((pos) => (
        <span key={pos} aria-hidden className={cn("absolute top-[38%] size-[2.2cqw] rounded-full border-[0.3cqw] border-[#0c0c0d] bg-[#151617]", pos)} />
      ))}
      {["left-[22%]", "left-[52%]"].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={cn("absolute top-[30%] h-[4cqw] w-[4cqw] opacity-80", pos)}
          style={{ backgroundImage: "radial-gradient(#0b0b0c 0.3cqw, transparent 0.35cqw)", backgroundSize: "1cqw 1cqw" }}
        />
      ))}

      <Control
        part="shoe"
        props={props}
        className="top-[22%] left-[36%] h-[11cqw] w-[13cqw] rounded-[0.6cqw] border-[0.3cqw] border-[#0c0c0d] bg-[linear-gradient(180deg,#45484d,#2a2c2f)]"
      />

      <Control
        part="rec"
        control="rec"
        props={props}
        className={cn(
          "top-[26%] left-[66%] flex size-[6cqw] items-center justify-center rounded-full border-[0.5cqw]",
          recording ? "border-red-500 bg-red-600 shadow-[0_0_2cqw_#ef4444]" : "border-[#7a1c1c] bg-[#b91c1c]"
        )}
      >
        <span className="pointer-events-none text-[1.3cqw] font-bold text-white">REC</span>
      </Control>

      <Control part="c3" control="c3" props={props} className={cn(buttonFace, "top-[16%] left-[75%] size-[4.2cqw]")} />
      <Print className="top-[6%] left-[75%]">C3/ISO</Print>
      <Control part="c2" control="c2" props={props} className={cn(buttonFace, "top-[54%] left-[75%] size-[4.2cqw]")} />
      <Print className="top-[86%] left-[75%]">C2/WB</Print>

      {/* Shutter button inside the W/T zoom ring, C1 in front, front dial on the grip. */}
      <Control
        part="shutter"
        control="zoom"
        label="W/T zoom lever"
        props={props}
        className="top-[16%] left-[83%] size-[10cqw] rounded-full border-[0.3cqw] border-[#0c0c0d] bg-[repeating-conic-gradient(#3a3d41_0_6deg,#232427_6deg_12deg)]"
      />
      <Control
        part="shutter"
        control="shutter"
        label="Shutter button"
        props={props}
        className="top-[16%] left-[83%] m-[2.4cqw] size-[5.2cqw] rounded-full border-[0.3cqw] border-[#0c0c0d] bg-[radial-gradient(circle_at_35%_30%,#62666c,#2f3135_70%)]"
      />
      <Control part="c1" control="c1" props={props} className={cn(buttonFace, "top-[66%] left-[79.5%] size-[3.6cqw]")} />
      <Print className="top-[86%] left-[84%]">C1/IRIS</Print>
      <Dial part="frontDial" left="frontDialL" right="frontDialR" props={props} className="top-[80%] left-[91%] h-[3.4cqw] w-[7.4cqw]" />
    </div>
  );
}

export { Fx3Rear, Fx3Top };
