import type { Metadata } from "next";
import Link from "next/link";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { CameraSimulatorSection } from "@/components/catalogue/camera-simulator";
import { cameraSimulators } from "@/lib/camera-simulators";

export const metadata: Metadata = {
  title: "Camera Simulators",
  description:
    "Learn the ARRI ALEXA and RED KOMODO menus before your shoot — interactive camera simulators for the cameras you can rent from OUTTA RENTALS.",
  alternates: { canonical: "/camera-simulators" },
};

export default function CameraSimulatorsPage() {
  return (
    <Section spacing="compact" className="pt-16 sm:pt-20">
      <div className="flex flex-col items-center gap-6 text-center">
        <Heading level="h1" eyebrow="Camera Simulators">
          Know the camera before you rent it.
        </Heading>
        <p className="text-body max-w-xl">
          Step through the real menus, settings and buttons of the cameras in
          our kit — set up your looks, frame rates and formats before you
          collect.
        </p>
      </div>

      <nav aria-label="Simulators" className="mt-8 flex flex-wrap justify-center gap-2">
        {cameraSimulators.map((simulator) => (
          <Link
            key={simulator.id}
            href={`#${simulator.id}`}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
          >
            {simulator.cameraName}
          </Link>
        ))}
      </nav>

      <div className="mt-12 flex flex-col gap-16 sm:gap-20">
        {cameraSimulators.map((simulator) => (
          <CameraSimulatorSection key={simulator.id} simulator={simulator} showRentLink />
        ))}
      </div>
    </Section>
  );
}
