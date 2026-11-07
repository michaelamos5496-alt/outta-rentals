import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { CameraSimulatorCard } from "@/components/catalogue/camera-simulator";
import { cameraSimulators } from "@/lib/camera-simulators";

export const metadata: Metadata = {
  title: "Camera Simulators",
  description:
    "Learn the ARRI ALEXA menus before your shoot — interactive camera simulators for the ARRI bodies you can rent from OUTTA RENTALS.",
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

      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {cameraSimulators.map((simulator) => (
          <div key={simulator.id} className="flex flex-col gap-2">
            <CameraSimulatorCard simulator={simulator} className="flex-1" />
            <Link
              href={`/equipment/${simulator.productSlugs[0]}`}
              className="text-small inline-flex items-center gap-1 self-end hover:text-foreground"
            >
              Rent the {simulator.cameraName} <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}
