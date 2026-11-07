/**
 * Sony FX3 menu model for OUTTA's own FX3 simulator — the key movie settings
 * renters change, laid out in the camera's real tabs and groups. Menu names,
 * options and the format / frame rate / record setting tables come from
 * Sony's ILME-FX3 Help Guide (Ver.2 or later):
 * https://helpguide.sony.net/ilc/2210/v1/en/
 */

export type Fx3System = "NTSC" | "PAL";

export interface Fx3State {
  system: Fx3System;
  exposureMode: string;
  fileFormat: string;
  recFrameRate: string;
  recordSetting: string;
  logShooting: string;
  colorGamut: string;
  proxyRecording: string;
  proxyFormat: string;
  proxySetting: string;
  audioLevel: string;
  windNoise: string;
  steadyShot: string;
  shutterMode: string;
  shutterSpeed: string;
  shutterAngle: string;
  aperture: string;
  iso: string;
  baseIso: string;
  exposureIndex: string;
  whiteBalance: string;
  colorTemp: string;
  pictureProfile: string;
  zebra: string;
  zebraLevel: string;
  focusMode: string;
  focusArea: string;
  faceEye: string;
  faceEyeSubject: string;
  afTransition: string;
  afShift: string;
  gammaAssist: string;
}

export const fx3StartState: Fx3State = {
  system: "NTSC",
  exposureMode: "Manual Exposure",
  fileFormat: "XAVC HS 4K",
  recFrameRate: "23.98p",
  recordSetting: "100M 4:2:2 10bit",
  logShooting: "Off",
  colorGamut: "S-Gamut3.Cine",
  proxyRecording: "Off",
  proxyFormat: "XAVC HS HD",
  proxySetting: "16M 4:2:0 10bit",
  audioLevel: "26",
  windNoise: "Off",
  steadyShot: "Standard",
  shutterMode: "Speed",
  shutterSpeed: "1/50",
  shutterAngle: "180°",
  aperture: "F2.8",
  iso: "800",
  baseIso: "ISO 800",
  exposureIndex: "800EI",
  whiteBalance: "C.Temp./Filter",
  colorTemp: "5600K",
  pictureProfile: "PP11",
  zebra: "Off",
  zebraLevel: "100+",
  focusMode: "Continuous AF",
  focusArea: "Wide",
  faceEye: "On",
  faceEyeSubject: "Human",
  afTransition: "5",
  afShift: "5",
  gammaAssist: "Off",
};

const FILE_FORMATS = ["XAVC HS 4K", "XAVC S 4K", "XAVC S HD", "XAVC S-I 4K", "XAVC S-I DCI 4K", "XAVC S-I HD"];

export const resolutionOf: Record<string, string> = {
  "XAVC HS 4K": "3840×2160",
  "XAVC S 4K": "3840×2160",
  "XAVC S HD": "1920×1080",
  "XAVC S-I 4K": "3840×2160",
  "XAVC S-I DCI 4K": "4096×2160",
  "XAVC S-I HD": "1920×1080",
};

// Frame-rate "bands" shared by NTSC and PAL rates in Sony's tables.
type Band = "high" | "60" | "30" | "24" | "24.00";
const bandRates: Record<Band, Record<Fx3System, string | null>> = {
  high: { NTSC: "119.88p", PAL: "100p" },
  "60": { NTSC: "59.94p", PAL: "50p" },
  "30": { NTSC: "29.97p", PAL: "25p" },
  // 23.98p exists only in NTSC.
  "24": { NTSC: "23.98p", PAL: null },
  "24.00": { NTSC: "24.00p", PAL: "24.00p" },
};

// Record Setting per format and band. A pair is [NTSC, PAL] where the
// bit rate differs between the two (XAVC S-I).
type Setting = string | [string, string];
const recordSettings: Record<string, Partial<Record<Band, Setting[]>>> = {
  "XAVC HS 4K": {
    high: ["280M 4:2:2 10bit", "200M 4:2:0 10bit"],
    "60": ["200M 4:2:2 10bit", "150M 4:2:0 10bit", "100M 4:2:2 10bit", "75M 4:2:0 10bit", "45M 4:2:0 10bit"],
    "24": ["100M 4:2:2 10bit", "100M 4:2:0 10bit", "50M 4:2:2 10bit", "50M 4:2:0 10bit", "30M 4:2:0 10bit"],
  },
  "XAVC S 4K": {
    high: ["280M 4:2:2 10bit", "200M 4:2:0 8bit"],
    "60": ["200M 4:2:2 10bit", "150M 4:2:0 8bit"],
    "30": ["140M 4:2:2 10bit", "100M 4:2:0 8bit", "60M 4:2:0 8bit"],
    "24": ["100M 4:2:2 10bit", "100M 4:2:0 8bit", "60M 4:2:0 8bit"],
  },
  "XAVC S HD": {
    high: ["100M 4:2:0 8bit", "60M 4:2:0 8bit"],
    "60": ["50M 4:2:2 10bit", "50M 4:2:0 8bit", "25M 4:2:0 8bit"],
    "30": ["50M 4:2:2 10bit", "50M 4:2:0 8bit", "16M 4:2:0 8bit"],
    "24": ["50M 4:2:2 10bit", "50M 4:2:0 8bit"],
  },
  "XAVC S-I 4K": {
    "60": [["600M 4:2:2 10bit", "500M 4:2:2 10bit"]],
    "30": [["300M 4:2:2 10bit", "250M 4:2:2 10bit"]],
    "24": ["240M 4:2:2 10bit"],
  },
  "XAVC S-I DCI 4K": {
    "60": [["600M 4:2:2 10bit", "500M 4:2:2 10bit"]],
    "30": [["300M 4:2:2 10bit", "250M 4:2:2 10bit"]],
    "24": ["240M 4:2:2 10bit"],
    "24.00": ["240M 4:2:2 10bit"],
  },
  "XAVC S-I HD": {
    "60": [["222M 4:2:2 10bit", "185M 4:2:2 10bit"]],
    "30": [["111M 4:2:2 10bit", "93M 4:2:2 10bit"]],
    "24": ["89M 4:2:2 10bit"],
  },
};

const BAND_ORDER: Band[] = ["high", "60", "30", "24", "24.00"];

function bandOf(rate: string, system: Fx3System): Band | undefined {
  return BAND_ORDER.find((b) => bandRates[b][system] === rate);
}

export function frameRatesFor(format: string, system: Fx3System): string[] {
  const table = recordSettings[format] ?? {};
  return BAND_ORDER.filter((b) => table[b]).flatMap((b) => bandRates[b][system] ?? []);
}

function recordSettingsFor(format: string, rate: string, system: Fx3System): string[] {
  const band = bandOf(rate, system);
  const list = band ? recordSettings[format]?.[band] ?? [] : [];
  return list.map((s) => (typeof s === "string" ? s : s[system === "NTSC" ? 0 : 1]));
}

export function isHighFrameRate(s: Fx3State) {
  return s.recFrameRate === "119.88p" || s.recFrameRate === "100p";
}

/** Numeric frames per second for a "23.98p"-style label. */
function fpsOf(rate: string) {
  return parseFloat(rate);
}

const SHUTTER_SPEEDS = [
  8000, 6400, 5000, 4000, 3200, 2500, 2000, 1600, 1250, 1000, 800, 640, 500, 400, 320, 250, 200, 160,
  125, 100, 80, 60, 50, 40, 30, 25,
];

// A movie frame can't be exposed for longer than the frame lasts, so the
// slowest speed offered follows the frame rate.
function shutterSpeedsFor(rate: string): string[] {
  const fps = fpsOf(rate);
  return SHUTTER_SPEEDS.filter((d) => d >= fps - 0.5).map((d) => `1/${d}`);
}

const SHUTTER_ANGLES = ["360°", "270°", "216°", "180°", "172.8°", "144°", "90°", "45°", "22.5°", "11.25°", "5.6°"];

const APERTURES = ["F1.4", "F1.8", "F2", "F2.8", "F4", "F5.6", "F8", "F11", "F16", "F22"];

// 1/3-stop ISO values. Movies go from ISO 80 up to 409600.
const ISO_VALUES = [
  80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400,
  8000, 10000, 12800, 16000, 20000, 25600, 32000, 40000, 51200, 64000, 80000, 102400, 128000, 160000, 204800,
  256000, 320000, 409600,
];

function eiRange(min: number, max: number) {
  return ISO_VALUES.filter((v) => v >= min && v <= max).map((v) => `${v}EI`);
}

function exposureIndexFor(s: Fx3State): string[] {
  if (s.logShooting === "Cine EI Quick") return eiRange(200, 51200);
  return s.baseIso === "ISO 12800" ? eiRange(3200, 51200) : eiRange(200, 3200);
}

const COLOR_TEMPS = Array.from({ length: (9900 - 2500) / 100 + 1 }, (_, i) => `${2500 + i * 100}K`);

const AUDIO_LEVELS = Array.from({ length: 32 }, (_, i) => String(i));

export const isLog = (s: Fx3State) => s.logShooting !== "Off";
export const isCineEi = (s: Fx3State) => s.logShooting === "Cine EI" || s.logShooting === "Cine EI Quick";

/**
 * Brings dependent settings back into range after a change — e.g. switching
 * File Format can remove the chosen frame rate, which in turn changes the
 * Record Setting list. Mirrors what the camera does on its own.
 */
export function normalizeFx3(s: Fx3State): Fx3State {
  const next = { ...s };
  const rates = frameRatesFor(next.fileFormat, next.system);
  if (!rates.includes(next.recFrameRate)) {
    // Keep the same rate family (e.g. 59.94p → 50p) where it exists, otherwise
    // fall back to the most cinematic normal-speed rate, never slow motion.
    const band = bandOf(next.recFrameRate, "NTSC") ?? bandOf(next.recFrameRate, "PAL");
    const preference: Band[] = [...(band ? [band] : []), "24", "30", "60", "24.00", "high"];
    next.recFrameRate =
      preference.map((b) => bandRates[b][next.system]).find((r): r is string => !!r && rates.includes(r)) ??
      rates[0];
  }
  const settings = recordSettingsFor(next.fileFormat, next.recFrameRate, next.system);
  if (!settings.includes(next.recordSetting)) next.recordSetting = settings[0];
  const speeds = shutterSpeedsFor(next.recFrameRate);
  if (!speeds.includes(next.shutterSpeed)) next.shutterSpeed = speeds[speeds.length - 1];
  if (isHighFrameRate(next) && next.steadyShot === "Active") next.steadyShot = "Standard";
  const eis = exposureIndexFor(next);
  if (!eis.includes(next.exposureIndex)) next.exposureIndex = next.baseIso === "ISO 12800" ? "12800EI" : "800EI";
  const proxySettings = next.proxyFormat === "XAVC S HD" ? ["6M 4:2:0 8bit"] : ["16M 4:2:0 10bit", "9M 4:2:0 10bit"];
  if (!proxySettings.includes(next.proxySetting)) next.proxySetting = proxySettings[0];
  if (isLog(next)) next.gammaAssist = "Off";
  return next;
}

export interface Fx3Item {
  id: keyof Fx3State;
  label: string;
  options: (s: Fx3State) => string[];
  /** Why the item can't be changed right now, or null when it can. */
  disabled?: (s: Fx3State, recording: boolean) => string | null;
  /** Hidden entirely in the current setup (e.g. EI items with Log off). */
  hidden?: (s: Fx3State) => boolean;
  /** How the option is shown in lists (defaults to the raw value). */
  describe?: Record<string, string>;
  help: string;
}

const lockedWhileRecording = (_: Fx3State, recording: boolean) =>
  recording ? "Stop recording to change this setting." : null;

const autoExposure = (field: "shutter" | "aperture") => (s: Fx3State) => {
  if (s.exposureMode === "Program Auto") return "Set automatically in Program Auto.";
  if (field === "shutter" && s.exposureMode === "Aperture Priority") return "Set automatically in Aperture Priority.";
  if (field === "aperture" && s.exposureMode === "Shutter Priority") return "Set automatically in Shutter Priority.";
  return null;
};

export const fx3Items: Record<string, Fx3Item> = {
  fileFormat: {
    id: "fileFormat",
    label: "File Format",
    options: () => FILE_FORMATS,
    disabled: lockedWhileRecording,
    describe: {
      "XAVC HS 4K": "XAVC HS 4K — HEVC, 4K, Long GOP",
      "XAVC S 4K": "XAVC S 4K — 4K, Long GOP",
      "XAVC S HD": "XAVC S HD — HD, Long GOP",
      "XAVC S-I 4K": "XAVC S-I 4K — 4K, All-Intra",
      "XAVC S-I DCI 4K": "XAVC S-I DCI 4K — 4096×2160, All-Intra",
      "XAVC S-I HD": "XAVC S-I HD — HD, All-Intra",
    },
    help:
      "The movie codec and resolution. XAVC HS uses the efficient HEVC codec. XAVC S-I is All-Intra — bigger files but the easiest to edit. Long GOP formats save space.",
  },
  recFrameRate: {
    id: "recFrameRate",
    label: "Rec Frame Rate",
    options: (s) => frameRatesFor(s.fileFormat, s.system),
    disabled: lockedWhileRecording,
    help:
      "Frames recorded per second. 23.98p/24p looks cinematic, 50p/59.94p is smoother, and 100p/119.88p can be slowed down in the edit. The list depends on File Format and NTSC/PAL.",
  },
  recordSetting: {
    id: "recordSetting",
    label: "Record Setting",
    options: (s) => recordSettingsFor(s.fileFormat, s.recFrameRate, s.system),
    disabled: lockedWhileRecording,
    help:
      "Bit rate, colour sampling and bit depth. Higher bit rates hold more detail; 4:2:2 10bit gives the most room for grading and green screen.",
  },
  logShooting: {
    id: "logShooting",
    label: "Log Shooting",
    options: () => ["Off", "Flexible ISO", "Cine EI Quick", "Cine EI"],
    disabled: lockedWhileRecording,
    describe: {
      Off: "Off — use a Picture Profile",
      "Flexible ISO": "Flexible ISO — S-Log3, ISO adjustable",
      "Cine EI Quick": "Cine EI Quick — S-Log3, Base ISO follows EI",
      "Cine EI": "Cine EI — S-Log3, fixed dual Base ISO",
    },
    help:
      "Records S-Log3 for maximum dynamic range and grading. Flexible ISO lets you change ISO normally. Cine EI records at a Base ISO (800 or 12800) and EI only changes the monitor look.",
  },
  colorGamut: {
    id: "colorGamut",
    label: "Color Gamut",
    options: () => ["S-Gamut3.Cine", "S-Gamut3"],
    hidden: (s) => !isLog(s),
    help: "The colour space recorded with S-Log3. S-Gamut3.Cine is the usual choice for film-style grading.",
  },
  proxyRecording: {
    id: "proxyRecording",
    label: "Proxy Recording",
    options: () => ["On", "Off"],
    disabled: lockedWhileRecording,
    help: "Records a small low-bit-rate copy alongside each clip — quick to share or edit with, then relink to the full files.",
  },
  proxyFormat: {
    id: "proxyFormat",
    label: "Proxy File Format",
    options: () => ["XAVC HS HD", "XAVC S HD"],
    hidden: (s) => s.proxyRecording === "Off",
    disabled: lockedWhileRecording,
    describe: { "XAVC HS HD": "XAVC HS HD — 1920×1080", "XAVC S HD": "XAVC S HD — 1280×720" },
    help: "Proxy codec. XAVC HS HD records 1080 proxies; XAVC S HD records 720.",
  },
  proxySetting: {
    id: "proxySetting",
    label: "Proxy Rec. Settings",
    options: (s) => (s.proxyFormat === "XAVC S HD" ? ["6M 4:2:0 8bit"] : ["16M 4:2:0 10bit", "9M 4:2:0 10bit"]),
    hidden: (s) => s.proxyRecording === "Off",
    disabled: lockedWhileRecording,
    help: "Bit rate of the proxy files.",
  },
  exposureMode: {
    id: "exposureMode",
    label: "Exposure Mode",
    options: () => ["Program Auto", "Aperture Priority", "Shutter Priority", "Manual Exposure"],
    help: "How much of the exposure the camera controls. Most shoots use Manual Exposure so nothing shifts mid-shot.",
  },
  audioLevel: {
    id: "audioLevel",
    label: "Audio Rec Level",
    options: () => AUDIO_LEVELS,
    help: "Recording level for the built-in or connected microphone. Turn it down for loud scenes and up for quiet ones, and monitor with headphones.",
  },
  windNoise: {
    id: "windNoise",
    label: "Wind Noise Reduct.",
    options: () => ["On", "Off"],
    help: "Cuts low-frequency rumble from the built-in microphone. Has no effect on an external microphone.",
  },
  steadyShot: {
    id: "steadyShot",
    label: "SteadyShot",
    options: () => ["Active", "Standard", "Off"],
    describe: {
      Active: "Active — strongest, crops the frame",
      Standard: "Standard",
      Off: "Off — use on a tripod or gimbal",
    },
    help: "In-body stabilisation. Active is strongest but narrows the angle of view and isn't available at 100p/119.88p. Turn it off on a tripod.",
  },
  shutterMode: {
    id: "shutterMode",
    label: "Shutter Mode",
    options: () => ["Speed", "Angle"],
    help: "Show exposure time as a shutter speed (1/50) or a shutter angle (180°). Angle stays correct when you change frame rate.",
  },
  shutterSpeed: {
    id: "shutterSpeed",
    label: "Shutter Speed",
    options: (s) => shutterSpeedsFor(s.recFrameRate),
    hidden: (s) => s.shutterMode === "Angle",
    disabled: autoExposure("shutter"),
    help: "Rule of thumb: double your frame rate — 1/50 at 24p or 25p, 1/100 at 50p — for natural motion blur.",
  },
  shutterAngle: {
    id: "shutterAngle",
    label: "Shutter Angle",
    options: () => SHUTTER_ANGLES,
    hidden: (s) => s.shutterMode === "Speed",
    disabled: autoExposure("shutter"),
    help: "180° is the classic film look at any frame rate. Smaller angles give crisper, staccato motion.",
  },
  aperture: {
    id: "aperture",
    label: "Aperture",
    options: () => APERTURES,
    disabled: autoExposure("aperture"),
    help: "Lens opening. Lower F-numbers let in more light and blur the background more. The real range depends on the lens fitted.",
  },
  iso: {
    id: "iso",
    label: "ISO",
    options: () => ["ISO AUTO", ...ISO_VALUES.map(String)],
    hidden: isCineEi,
    help: "Sensor sensitivity. The FX3 has dual base ISO — it is cleanest at 800 and again from 12800 in S-Log3 (640 and 12800 in other modes).",
  },
  baseIso: {
    id: "baseIso",
    label: "Base ISO",
    options: () => ["ISO 800", "ISO 12800"],
    hidden: (s) => s.logShooting !== "Cine EI",
    help: "In Cine EI, the camera records at one of two Base ISOs. Use ISO 800 in normal light and ISO 12800 in low light.",
  },
  exposureIndex: {
    id: "exposureIndex",
    label: "Exposure Index",
    options: exposureIndexFor,
    hidden: (s) => !isCineEi(s),
    help: "Changes how bright the monitor image looks (via the display LUT) within ±2 stops of the Base ISO. The recording stays at the Base ISO.",
  },
  whiteBalance: {
    id: "whiteBalance",
    label: "White Balance",
    options: () => [
      "Auto",
      "Daylight",
      "Shade",
      "Cloudy",
      "Incandescent",
      "Fluor.: Warm White",
      "Fluor.: Cool White",
      "Fluor.: Day White",
      "Fluor.: Daylight",
      "Underwater Auto",
      "C.Temp./Filter",
      "Custom 1",
      "Custom 2",
      "Custom 3",
    ],
    help: "Makes white look white under your light. Set a fixed Kelvin value with C.Temp./Filter so colour doesn't shift between shots.",
  },
  colorTemp: {
    id: "colorTemp",
    label: "Color Temp.",
    options: () => COLOR_TEMPS,
    hidden: (s) => s.whiteBalance !== "C.Temp./Filter",
    help: "About 5600K for daylight and LED daylight panels, 3200K for tungsten.",
  },
  pictureProfile: {
    id: "pictureProfile",
    label: "Picture Profile",
    options: () => ["Off", "PP1", "PP2", "PP3", "PP4", "PP5", "PP6", "PP10", "PP11"],
    disabled: (s) => (isLog(s) ? "Log Shooting is on, so the image is recorded in S-Log3." : null),
    describe: {
      Off: "Off",
      PP1: "PP1 — Movie gamma",
      PP2: "PP2 — Still gamma",
      PP3: "PP3 — ITU709, natural colour",
      PP4: "PP4 — ITU709 standard",
      PP5: "PP5 — Cine1",
      PP6: "PP6 — Cine2",
      PP10: "PP10 — HLG2 for HDR",
      PP11: "PP11 — S-Cinetone",
    },
    help: "Preset looks. PP11 S-Cinetone gives a finished cinematic look with no grading. For grading, turn on Log Shooting instead.",
  },
  zebra: {
    id: "zebra",
    label: "Zebra Display",
    options: () => ["On", "Off"],
    help: "Stripes over parts of the image at or above the Zebra Level — a quick check for blown highlights.",
  },
  zebraLevel: {
    id: "zebraLevel",
    label: "Zebra Level",
    options: () => ["70", "75", "80", "85", "90", "95", "100", "100+"],
    hidden: (s) => s.zebra === "Off",
    help: "100+ flags clipped highlights. Around 70 is a common check for skin tones.",
  },
  focusMode: {
    id: "focusMode",
    label: "Focus Mode",
    options: () => ["Continuous AF", "Manual Focus"],
    help: "Continuous AF keeps tracking focus while you record. Manual Focus leaves it to you or your focus puller.",
  },
  focusArea: {
    id: "focusArea",
    label: "Focus Area",
    options: () => ["Wide", "Zone", "Center Fix", "Spot: S", "Spot: M", "Spot: L", "Expand Spot"],
    hidden: (s) => s.focusMode === "Manual Focus",
    help: "Where the camera looks for focus. Wide covers the frame; Spot targets one point you place.",
  },
  faceEye: {
    id: "faceEye",
    label: "Face/Eye Prior. in AF",
    options: () => ["On", "Off"],
    hidden: (s) => s.focusMode === "Manual Focus",
    help: "Prioritises faces and eyes inside the focus area.",
  },
  faceEyeSubject: {
    id: "faceEyeSubject",
    label: "Face/Eye Subject",
    options: () => ["Human", "Animal"],
    hidden: (s) => s.focusMode === "Manual Focus" || s.faceEye === "Off",
    help: "Whether Face/Eye AF looks for people or animals.",
  },
  afTransition: {
    id: "afTransition",
    label: "AF Transition Speed",
    options: () => ["7", "6", "5", "4", "3", "2", "1"],
    hidden: (s) => s.focusMode === "Manual Focus",
    describe: { "7": "7 (Fast)", "1": "1 (Slow)" },
    help: "How fast focus moves to a new subject. Slower values give smooth, cinematic focus pulls.",
  },
  afShift: {
    id: "afShift",
    label: "AF Subj. Shift Sensitivity",
    options: () => ["5", "4", "3", "2", "1"],
    hidden: (s) => s.focusMode === "Manual Focus",
    describe: { "5": "5 (Responsive)", "1": "1 (Locked on)" },
    help: "How readily focus jumps to another subject. Lower values stay locked on your subject.",
  },
  gammaAssist: {
    id: "gammaAssist",
    label: "Gamma Display Assist",
    options: () => ["On", "Off"],
    disabled: (s) => (isLog(s) ? "Not available while Log Shooting is on." : null),
    help: "Shows HLG footage with normal contrast on the screen so it's easier to judge.",
  },
  system: {
    id: "system",
    label: "NTSC/PAL Selector",
    options: () => ["NTSC", "PAL"],
    disabled: lockedWhileRecording,
    describe: { NTSC: "NTSC — 23.98p / 29.97p / 59.94p", PAL: "PAL — 25p / 50p / 100p" },
    help: "Sets the frame-rate family. Ghana and Europe use PAL (50Hz mains), which keeps lights from flickering at 25p and 50p.",
  },
};

export interface Fx3Group {
  title: string;
  items: (keyof typeof fx3Items)[];
}

export interface Fx3Tab {
  id: string;
  label: string;
  groups: Fx3Group[];
}

export const fx3Tabs: Fx3Tab[] = [
  {
    id: "main",
    label: "Main",
    groups: [
      {
        title: "Main",
        items: [
          "recFrameRate",
          "shutterSpeed",
          "shutterAngle",
          "aperture",
          "iso",
          "exposureIndex",
          "whiteBalance",
          "pictureProfile",
          "fileFormat",
          "recordSetting",
          "proxyRecording",
          "audioLevel",
          "focusMode",
          "focusArea",
        ],
      },
    ],
  },
  {
    id: "shooting",
    label: "Shooting",
    groups: [
      {
        title: "Image Quality/Rec",
        items: [
          "fileFormat",
          "recFrameRate",
          "recordSetting",
          "logShooting",
          "colorGamut",
          "proxyRecording",
          "proxyFormat",
          "proxySetting",
        ],
      },
      { title: "Shooting Mode", items: ["exposureMode"] },
      { title: "Audio Recording", items: ["audioLevel", "windNoise"] },
      { title: "Image Stabilization", items: ["steadyShot"] },
    ],
  },
  {
    id: "exposure",
    label: "Exposure/Color",
    groups: [
      { title: "Exposure", items: ["shutterMode", "iso", "baseIso", "exposureIndex"] },
      { title: "White Balance", items: ["whiteBalance", "colorTemp"] },
      { title: "Color/Tone", items: ["pictureProfile"] },
      { title: "Zebra Display", items: ["zebra", "zebraLevel"] },
    ],
  },
  {
    id: "focus",
    label: "Focus",
    groups: [
      { title: "AF/MF", items: ["focusMode", "afTransition", "afShift"] },
      { title: "Focus Area", items: ["focusArea"] },
      { title: "Face/Eye AF", items: ["faceEye", "faceEyeSubject"] },
    ],
  },
  {
    id: "setup",
    label: "Setup",
    groups: [
      { title: "Display Option", items: ["gammaAssist"] },
      { title: "Setup Option", items: ["system"] },
    ],
  },
];

/** Options for an item, with SteadyShot's Active removed at high frame rates. */
export function optionsFor(item: Fx3Item, s: Fx3State): string[] {
  const options = item.options(s);
  if (item.id === "steadyShot" && isHighFrameRate(s)) return options.filter((o) => o !== "Active");
  return options;
}

/** What the camera shows for ISO / EI in the footer. */
export function exposureReadout(s: Fx3State) {
  if (s.logShooting === "Cine EI") return `${s.exposureIndex} ${s.baseIso === "ISO 12800" ? "H" : "L"}`;
  if (s.logShooting === "Cine EI Quick") return s.exposureIndex;
  return s.iso === "ISO AUTO" ? "ISO AUTO" : `ISO ${s.iso}`;
}
