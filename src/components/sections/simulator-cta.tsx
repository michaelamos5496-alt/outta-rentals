"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, MonitorPlay, Play } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { cameraSimulators } from "@/lib/camera-simulators";
import { getProductImage } from "@/lib/editorial-images";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

// Dark block between the green-tinted packages/brand stripe and the green
// final CTA, so it reads as its own moment. Each camera tile jumps straight
// to that simulator's section on /camera-simulators.
function SimulatorCta() {
  return (
    <Section spacing="none" bleed className="relative overflow-hidden bg-[#0e0f10] py-20 text-white sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] size-[36rem] rounded-full bg-brand/25 blur-3xl"
      />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.08)}
        className="relative mx-auto grid w-full max-w-(--container-content) items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:px-12"
      >
        <div>
          <motion.p variants={slideUp()} className="text-label inline-flex items-center gap-2 !text-[#7fdc7f]">
            <MonitorPlay className="size-4" /> Camera Simulators
          </motion.p>
          <motion.h2 variants={slideUp(0.04)} className="text-h1 mt-4 text-balance text-white">
            Know the camera before it&rsquo;s in your hands.
          </motion.h2>
          <motion.p variants={slideUp(0.08)} className="text-body mt-5 max-w-md !text-white/70">
            Practise the menus, buttons and settings of the ALEXA Mini, Mini LF and RED KOMODO right here —
            set your frame rate, format and look before you collect.
          </motion.p>
          <motion.div variants={slideUp(0.12)} className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="uppercase tracking-wide">
              <Link href="/camera-simulators">
                <Play className="fill-current" /> Try the Simulators
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white uppercase tracking-wide hover:bg-white/10 hover:text-white"
            >
              <Link href="/equipment/cameras">Rent a Camera</Link>
            </Button>
          </motion.div>
        </div>

        <motion.ul variants={staggerContainer(0.08, 0.1)} className="grid grid-cols-3 gap-3 sm:gap-4">
          {cameraSimulators.map((simulator) => {
            const image = getProductImage(simulator.productSlugs[0]);
            return (
              <motion.li key={simulator.id} variants={slideUp()}>
                <Link
                  href={`/camera-simulators#${simulator.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:border-brand"
                >
                  <span className="relative flex aspect-square items-center justify-center bg-white p-3 sm:p-5">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- small static product shots
                      <img
                        src={image}
                        alt=""
                        loading="lazy"
                        className="size-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                    <span className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform group-hover:scale-110 sm:size-10">
                      <Play className="ml-0.5 size-3.5 fill-current sm:size-4" />
                    </span>
                  </span>
                  <span className="flex flex-1 items-center justify-between gap-1 px-3 py-3 sm:px-4">
                    <span className="text-xs leading-tight font-semibold sm:text-sm">{simulator.cameraName}</span>
                    <ArrowUpRight className="size-4 shrink-0 text-white/50 transition-colors group-hover:text-white" />
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </motion.div>
    </Section>
  );
}

export { SimulatorCta };
