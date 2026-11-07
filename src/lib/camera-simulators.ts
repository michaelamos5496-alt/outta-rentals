/**
 * ARRI's interactive camera-menu simulators, for the ARRI bodies OUTTA
 * rents. The apps are hosted by ARRI on tools.arri.com (which allows
 * framing); OUTTA only wraps them in its own branded viewer. If ARRI moves
 * one, update its `url` here — the arri.com page links to the current one.
 */
export interface CameraSimulator {
  productSlug: string;
  cameraName: string;
  url: string;
  arriPage: string;
}

export const cameraSimulators: CameraSimulator[] = [
  {
    productSlug: "arri-alexa-mini-lf",
    cameraName: "ALEXA Mini LF",
    url: "https://tools.arri.com/fileadmin/adapps/simulators/mini-lf/",
    arriPage: "https://www.arri.com/en/learn/camera-systems/camera-simulators/alexa-mini-lf-simulator",
  },
  {
    productSlug: "arri-alexa-mini",
    cameraName: "ALEXA Mini",
    url: "https://tools.arri.com/fileadmin/adapps/alexa_mini_simulator/index.html",
    arriPage: "https://www.arri.com/en/learn/camera-systems/camera-simulators/alexa-mini-simulator",
  },
];

export function getCameraSimulator(productSlug: string): CameraSimulator | undefined {
  return cameraSimulators.find((s) => s.productSlug === productSlug);
}
