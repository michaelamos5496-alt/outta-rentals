"use client";

import { motion } from "framer-motion";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { slideUp, viewportOnce } from "@/lib/motion";
import { workProjects } from "@/lib/content/work";

export default function WorkPage() {
  return (
    <>
      <Section spacing="compact" className="pt-16 sm:pt-20">
        <Heading level="display" eyebrow="Work">
          Built for the set.
        </Heading>
        <p className="text-body mt-6 max-w-xl">
          A sample of the kinds of productions OUTTA equipment supports.
          Placeholder projects for illustration — no real clients are
          represented.
        </p>
      </Section>

      <div className="border-t border-border">
        {workProjects.map((project, i) => (
          <motion.article
            key={project.slug}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={slideUp()}
            className="border-b border-border"
          >
            <Section spacing="compact">
              <div
                className={`grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-16 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="overflow-hidden rounded-xl">
                  <MediaPlaceholder
                    icon={project.icon}
                    meta="16:9 · SAMPLE"
                    className="aspect-video w-full"
                  />
                </div>
                <div>
                  <Badge variant="technical">{project.productionType}</Badge>
                  <h2 className="text-h2 mt-3">{project.title}</h2>
                  <p className="text-body mt-3">{project.description}</p>

                  <p className="text-label mt-6 mb-2">Equipment used</p>
                  <div className="flex flex-wrap gap-2">
                    {project.equipmentUsed.map((item) => (
                      <Badge key={item} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-label mt-6 mb-2">Story</p>
                  <p className="text-body">{project.story}</p>
                </div>
              </div>
            </Section>
          </motion.article>
        ))}
      </div>
    </>
  );
}
