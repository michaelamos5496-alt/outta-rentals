/**
 * RED KOMODO 6K model for OUTTA's KOMODO simulator: the touchscreen's quick
 * settings and the Image / LUT and Project Settings menus. Values come from
 * RED's KOMODO Operation Guide v1.3 and its Technical Specifications:
 * https://docs.red.com/955-0190_v1.3/955-0190_v1.3_REV-1.3_RED_PS_KOMODO_Operation_Guide/
 */

export interface KomodoState {
  format: string;
  timeBase: string;
  recFps: string;
  fileFormat: string;
  r3dQuality: string;
  proresRes: string;
  proresCodec: string;
  preRecord: string;
  iso: string;
  iris: string;
  shutter: string;
  colorTemp: string;
  tint: string;
}

export const komodoStartState: KomodoState = {
  format: "6K 17:9",
  timeBase: "23.98",
  recFps: "23.98",
  fileFormat: "R3D",
  r3dQuality: "MQ",
  proresRes: "4K",
  proresCodec: "ProRes 422 HQ",
  preRecord: "Off",
  iso: "800",
  iris: "4",
  shutter: "180",
  colorTemp: "5600",
  tint: "0",
};

// Sensor area and REDCODE RAW maximum frame rate per format. RED's spec
// sheet doesn't list 6K 16:9 separately; it shares 6K 17:9's full height,
// so it's given the same 40 fps.
export const KOMODO_FORMATS: Record<string, { width: number; height: number; maxFps: number }> = {
  "6K 17:9": { width: 6144, height: 3240, maxFps: 40 },
  "6K 2.4:1": { width: 6144, height: 2592, maxFps: 50 },
  "6K 16:9": { width: 5760, height: 3240, maxFps: 40 },
  "5K 17:9": { width: 5120, height: 2700, maxFps: 48 },
  "4K 17:9": { width: 4096, height: 2160, maxFps: 60 },
  "2K 17:9": { width: 2048, height: 1080, maxFps: 120 },
};

const TIME_BASES = ["23.98", "24", "25", "29.97", "30", "50", "59.94", "60"];

const REC_FPS = [
  "12", "15", "23.98", "24", "25", "29.97", "30", "40", "47.95", "48", "50", "59.94", "60", "72", "96", "100",
  "110", "119.88", "120",
];

const ISO_VALUES = [
  "250", "320", "400", "500", "640", "800", "1000", "1250", "1600", "2000", "2500", "3200", "4000", "5000", "6400",
  "8000", "10000", "12800",
];

export const IRIS_VALUES = [
  "1.4", "1.6", "1.8", "2", "2.2", "2.5", "2.8", "3.2", "3.5", "4", "4.5", "5", "5.6", "6.3", "7.1", "8", "9", "10",
  "11", "13", "14", "16", "18", "20", "22",
];

// Common angles from RED's shutter conversion table, smallest to largest.
const SHUTTER_ANGLES = [
  "1", "4", "8.6", "11.2", "22.5", "45", "72", "90", "105", "120", "135", "144", "172.8", "180", "225", "240",
  "270", "288", "360",
];

const COLOR_TEMPS = Array.from({ length: (10000 - 1700) / 100 + 1 }, (_, i) => String(1700 + i * 100));
const TINTS = Array.from({ length: 201 }, (_, i) => String(i - 100));

export const isProRes = (s: KomodoState) => s.fileFormat === "ProRes";

/** Highest recording frame rate the current format and codec allow. */
export function maxFpsFor(s: KomodoState) {
  const formatMax = KOMODO_FORMATS[s.format].maxFps;
  if (!isProRes(s)) return formatMax;
  // ProRes: 4K up to 60 fps, 2K up to 120 fps.
  return Math.min(formatMax, s.proresRes === "4K" ? 60 : 120);
}

export function recFpsOptions(s: KomodoState) {
  const max = maxFpsFor(s);
  return REC_FPS.filter((f) => parseFloat(f) <= max + 0.01);
}

/** Recording at a rate other than the project time base plays back off-speed, with no audio. */
export const isOffSpeed = (s: KomodoState) => s.recFps !== s.timeBase;

/**
 * Keeps dependent settings valid after a change, the way the camera does —
 * e.g. a smaller format raises the frame-rate ceiling, ProRes 4K needs a 4K
 * or larger format.
 */
export function normalizeKomodo(s: KomodoState, changed?: keyof KomodoState): KomodoState {
  const next = { ...s };
  // Choosing a time base sets the recording frame rate to match (when possible).
  if (changed === "timeBase") next.recFps = next.timeBase;
  if (isProRes(next) && next.format === "2K 17:9") next.proresRes = "2K";
  const options = recFpsOptions(next);
  if (!options.includes(next.recFps)) {
    next.recFps = options.includes(next.timeBase)
      ? next.timeBase
      : [...options].reverse().find((f) => parseFloat(f) <= parseFloat(next.timeBase)) ?? options[options.length - 1];
  }
  return next;
}

/**
 * Approximate recording time left on a 512 GB card, from RED's figures
 * (6K 17:9 at 23.98: HQ ~30 min, MQ ~48, LQ ~77) and Apple's ProRes data
 * rates (4K 24p: 422 HQ 754 Mb/s, 422 503 Mb/s), scaled by pixels and fps.
 */
export function cardMinutes(s: KomodoState) {
  const fps = parseFloat(s.recFps);
  if (isProRes(s)) {
    const mbps = s.proresCodec === "ProRes 422 HQ" ? 754 : 503;
    const scale = (s.proresRes === "4K" ? 1 : 0.25) * (fps / 24);
    return (512e9 * 8) / (mbps * 1e6 * scale) / 60;
  }
  const base = { HQ: 30, MQ: 48, LQ: 77 }[s.r3dQuality] ?? 48;
  const { width, height } = KOMODO_FORMATS[s.format];
  return base * ((6144 * 3240) / (width * height)) * (23.98 / fps);
}

export interface KomodoItem {
  id: keyof KomodoState;
  label: string;
  options: (s: KomodoState) => string[];
  /** How a value reads on screen, e.g. "180" → "180°". */
  show?: (v: string) => string;
  hidden?: (s: KomodoState) => boolean;
  /** Project settings can't change mid-take; exposure settings can. */
  lockedWhileRecording?: boolean;
  help: string;
}

export const komodoItems: Record<keyof KomodoState, KomodoItem> = {
  iso: {
    id: "iso",
    label: "ISO",
    options: () => ISO_VALUES,
    help: "ISO 250 to 12,800, default 800. In R3D it's metadata you can change later; RED recommends 800 and exposing with iris, light and ND.",
  },
  iris: {
    id: "iris",
    label: "Iris",
    options: () => IRIS_VALUES,
    show: (v) => `f/${v}`,
    help: "Aperture of an electronically connected (EF) lens. The real range depends on the lens.",
  },
  shutter: {
    id: "shutter",
    label: "Shutter",
    options: () => SHUTTER_ANGLES,
    show: (v) => `${v}°`,
    help: "Shutter angle, default 180°. Smaller angles give crisper motion; it can be changed while recording.",
  },
  colorTemp: {
    id: "colorTemp",
    label: "Color Temperature",
    options: () => COLOR_TEMPS,
    show: (v) => `${v}K`,
    help: "White balance in Kelvin — about 5600K for daylight, 3200K for tungsten. Metadata in R3D.",
  },
  tint: {
    id: "tint",
    label: "Tint",
    options: () => TINTS,
    help: "Magenta–green correction on top of the colour temperature.",
  },
  format: {
    id: "format",
    label: "Format",
    options: () => Object.keys(KOMODO_FORMATS),
    lockedWhileRecording: true,
    help: "How much of the sensor is used. Smaller formats crop in and allow higher frame rates: 6K 17:9 up to 40 fps, 4K up to 60, 2K up to 120.",
  },
  recFps: {
    id: "recFps",
    label: "Recording Frame Rate",
    options: recFpsOptions,
    show: (v) => `${v} FPS`,
    lockedWhileRecording: true,
    help: "Frames recorded per second. Set different from the Project Time Base, it plays back in slow or fast motion and records no audio (shown in yellow).",
  },
  timeBase: {
    id: "timeBase",
    label: "Project Time Base",
    options: () => TIME_BASES,
    lockedWhileRecording: true,
    help: "The playback rate of the project. Choosing it also sets the Recording Frame Rate to match.",
  },
  fileFormat: {
    id: "fileFormat",
    label: "File Format",
    options: () => ["R3D", "ProRes"],
    lockedWhileRecording: true,
    help: "R3D records REDCODE RAW (ISO and white balance stay adjustable in post). ProRes bakes the look in. The camera reboots to switch.",
  },
  r3dQuality: {
    id: "r3dQuality",
    label: "R3D Quality",
    options: () => ["HQ", "MQ", "LQ"],
    hidden: isProRes,
    lockedWhileRecording: true,
    help: "Data rate. HQ for VFX and high-complexity scenes, MQ (default) for cinema and high-end TV, LQ for TV, online, documentary and interviews.",
  },
  proresRes: {
    id: "proresRes",
    label: "ProRes Resolution",
    options: (s) => (s.format === "2K 17:9" ? ["2K"] : ["4K", "2K"]),
    hidden: (s) => !isProRes(s),
    lockedWhileRecording: true,
    help: "4K ProRes needs a 4K or larger Format; smaller formats record 2K.",
  },
  proresCodec: {
    id: "proresCodec",
    label: "ProRes Codec",
    options: () => ["ProRes 422 HQ", "ProRes 422"],
    hidden: (s) => !isProRes(s),
    lockedWhileRecording: true,
    help: "ProRes 422 HQ (about 754 Mb/s at 4K 24p) or ProRes 422 (about 503 Mb/s).",
  },
  preRecord: {
    id: "preRecord",
    label: "Pre-Record",
    options: () => ["Off", "On"],
    lockedWhileRecording: true,
    help: "When on, the first tap starts pre-recording a buffer; the next tap starts recording and keeps the buffer.",
  },
};

export interface KomodoMenu {
  title: string;
  items?: (keyof KomodoState)[];
}

export const komodoMenus: KomodoMenu[] = [
  { title: "Image / LUT", items: ["iso", "shutter", "colorTemp", "tint"] },
  {
    title: "Project Settings",
    items: ["format", "recFps", "timeBase", "fileFormat", "r3dQuality", "proresRes", "proresCodec", "preRecord"],
  },
  { title: "Audio / TC" },
  { title: "Monitoring" },
  { title: "Media" },
  { title: "Presets" },
  { title: "Autofocus - BETA" },
  { title: "Communication" },
  { title: "System Settings" },
  { title: "Language" },
  { title: "Maintenance" },
];

/** Quick-settings buttons along the bottom of the home screen. */
export const komodoQuick: { id: keyof KomodoState; label: string }[] = [
  { id: "recFps", label: "FPS" },
  { id: "iso", label: "ISO" },
  { id: "iris", label: "IRIS" },
  { id: "shutter", label: "SHUTTER" },
  { id: "colorTemp", label: "WB" },
];

/**
 * Stops of exposure relative to the starting setup (ISO 800, f/4, 180°),
 * used to brighten or darken the preview image.
 */
export function exposureStops(s: KomodoState) {
  const iso = Math.log2(parseFloat(s.iso) / 800);
  const iris = 2 * Math.log2(4 / parseFloat(s.iris));
  const shutter = Math.log2(parseFloat(s.shutter) / 180);
  return iso + iris + shutter;
}
