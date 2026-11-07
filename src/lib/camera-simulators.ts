/**
 * Interactive camera-menu simulators for bodies OUTTA rents. ARRI's apps are
 * hosted by ARRI on tools.arri.com (which allows framing); OUTTA only wraps
 * them in its own branded viewer. If ARRI moves one, update its `url` here —
 * the arri.com page links to the current one. The FX3 has no official
 * simulator, so it uses OUTTA's own (src/components/catalogue/fx3-simulator).
 */
export type CameraSimulator = {
  id: string;
  /** Every catalogue listing of this body shows the simulator. */
  productSlugs: string[];
  cameraName: string;
} & (
  | { kind: "arri"; url: string; arriPage: string }
  | { kind: "fx3" }
);

export const cameraSimulators: CameraSimulator[] = [
  {
    id: "alexa-mini-lf",
    kind: "arri",
    productSlugs: ["arri-alexa-mini-lf"],
    cameraName: "ALEXA Mini LF",
    url: "https://tools.arri.com/fileadmin/adapps/simulators/mini-lf/",
    arriPage: "https://www.arri.com/en/learn/camera-systems/camera-simulators/alexa-mini-lf-simulator",
  },
  {
    id: "alexa-mini",
    kind: "arri",
    productSlugs: ["arri-alexa-mini"],
    cameraName: "ALEXA Mini",
    url: "https://tools.arri.com/fileadmin/adapps/alexa_mini_simulator/index.html",
    arriPage: "https://www.arri.com/en/learn/camera-systems/camera-simulators/alexa-mini-simulator",
  },
  {
    id: "sony-fx3",
    kind: "fx3",
    productSlugs: ["sony-fx3", "sony-fx3-body-only"],
    cameraName: "Sony FX3",
  },
];

export function getCameraSimulator(productSlug: string): CameraSimulator | undefined {
  return cameraSimulators.find((s) => s.productSlugs.includes(productSlug));
}
