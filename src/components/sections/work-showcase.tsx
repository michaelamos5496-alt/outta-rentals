"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AutoplayVideo } from "@/components/ui/autoplay-video";
import { workShowcase } from "@/lib/placeholder-data";
import { themeImages } from "@/lib/editorial-images";

function slugifyProductionType(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function slugifyTitle(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function WorkShowcase() {
  return (
    <Section className="border-t border-border">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <Heading level="h2" eyebrow="Work">
          Built for the set.
        </Heading>
        <p className="text-small max-w-sm">
          Placeholder projects for illustration — real productions will
          replace these once OUTTA is live.
        </p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.08)}
        className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
      >
        {workShowcase.map((project) => {
          const slug = slugifyProductionType(project.productionType);
          return (
          <motion.article key={project.title} variants={slideUp()} className="group/project">
            <div className="overflow-hidden rounded-xl">
              <AutoplayVideo
                src="/video/about.mp4"
                poster={themeImages[slug]}
                alt={project.title}
                className="aspect-video w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/project:scale-105"
              />
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{project.title}</h3>
                <p className="text-small mt-1">{project.description}</p>
              </div>
              <Badge variant="technical" className="shrink-0">
                {project.productionType}
              </Badge>
            </div>
            <Button asChild variant="link" className="mt-2 h-auto p-0">
              <Link href={`/work#${slugifyTitle(project.title)}`}>
                View Project <ArrowRight />
              </Link>
            </Button>
          </motion.article>
          );
        })}
      </motion.div>
    </Section>
  );
}

export { WorkShowcase };
