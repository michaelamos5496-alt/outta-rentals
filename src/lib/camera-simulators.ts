/**
 * Interactive camera-menu simulators for bodies OUTTA rents. ARRI's apps are
 * hosted by ARRI on tools.arri.com (which allows framing); OUTTA only wraps
 * them in its own branded viewer. If ARRI moves one, update its `url` here —
 * the arri.com page links to the current one.
 */
export interface CameraSimulator {
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

export const cameraSimulators: CameraSimulator[] = [
  {
    id: "alexa-mini-lf",
    productSlugs: ["arri-alexa-mini-lf"],
    cameraName: "ALEXA Mini LF",
    url: "https://tools.arri.com/fileadmin/adapps/simulators/mini-lf/",
    arriPage: "https://www.arri.com/en/learn/camera-systems/camera-simulators/alexa-mini-lf-simulator",
    canvas: { width: 2880, height: 1850, maxScale: 0.58 },
  },
  {
    id: "alexa-mini",
    productSlugs: ["arri-alexa-mini"],
    cameraName: "ALEXA Mini",
    url: "https://tools.arri.com/fileadmin/adapps/alexa_mini_simulator/index.html",
    arriPage: "https://www.arri.com/en/learn/camera-systems/camera-simulators/alexa-mini-simulator",
    canvas: { width: 2048, height: 1547, maxScale: 1 },
  },
];

export function getCameraSimulator(productSlug: string): CameraSimulator | undefined {
  return cameraSimulators.find((s) => s.productSlugs.includes(productSlug));
}
