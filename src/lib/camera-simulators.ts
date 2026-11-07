/**
 * Interactive camera-menu simulators for bodies OUTTA rents. ARRI's apps are
 * hosted by ARRI on tools.arri.com (which allows framing); OUTTA only wraps
 * them in its own branded viewer. If ARRI moves one, update its `url` here —
 * the arri.com page links to the current one. RED has no official KOMODO
 * simulator, so it uses OUTTA's own (src/components/catalogue/komodo-simulator).
 */
export interface ArriSimulator {
  kind: "arri";
  id: string;
  /** Every catalogue listing of this body shows the simulator. */
  productSlugs: string[];
  cameraName: string;
  url: string;
  arriPage: string;
  /**
   * The app's fixed-size canvas (its `.sizer` element) and the largest scale
   * its own autofit allows — used to size the frame to the app's shape.
   */
  canvas: { width: number; height: number; maxScale: number };
}

export interface KomodoSimulator {
  kind: "komodo";
  id: string;
  productSlugs: string[];
  cameraName: string;
  /** RED's operation guide, linked from the viewer footer. */
  guideUrl: string;
}

export type CameraSimulator = ArriSimulator | KomodoSimulator;

export const cameraSimulators: CameraSimulator[] = [
  {
    kind: "arri",
    id: "alexa-mini-lf",
    productSlugs: ["arri-alexa-mini-lf"],
    cameraName: "ALEXA Mini LF",
    url: "https://tools.arri.com/fileadmin/adapps/simulators/mini-lf/",
    arriPage: "https://www.arri.com/en/learn/camera-systems/camera-simulators/alexa-mini-lf-simulator",
    canvas: { width: 2880, height: 1850, maxScale: 0.58 },
  },
  {
    kind: "arri",
    id: "alexa-mini",
    productSlugs: ["arri-alexa-mini"],
    cameraName: "ALEXA Mini",
    url: "https://tools.arri.com/fileadmin/adapps/alexa_mini_simulator/index.html",
    arriPage: "https://www.arri.com/en/learn/camera-systems/camera-simulators/alexa-mini-simulator",
    canvas: { width: 2048, height: 1547, maxScale: 1 },
  },
  {
    kind: "komodo",
    id: "red-komodo",
    productSlugs: ["red-komodo"],
    cameraName: "RED KOMODO",
    guideUrl:
      "https://docs.red.com/955-0190_v1.3/955-0190_v1.3_REV-1.3_RED_PS_KOMODO_Operation_Guide/Content/3_Components/Camera_LCD_Touchscreen.htm",
  },
];

export function getCameraSimulator(productSlug: string): CameraSimulator | undefined {
  return cameraSimulators.find((s) => s.productSlugs.includes(productSlug));
}
