"use client";

import { motion } from "framer-motion";
import { Camera, Package, ShieldCheck, Truck } from "lucide-react";

import { fadeIn, slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Divider } from "@/components/ui/divider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingGrid, LoadingState, EmptyState, ErrorState } from "@/components/ui/state";

const sampleProducts = [
  {
    name: "Cine Prime 35mm T1.5",
    category: "Lenses",
    day: "$85",
    icon: Camera,
  },
  {
    name: "6K Cinema Camera Body",
    category: "Cameras",
    day: "$220",
    icon: Camera,
  },
  {
    name: "1200W LED Fresnel Kit",
    category: "Lighting",
    day: "$140",
    icon: Camera,
  },
];

const colorSwatches = [
  { name: "Background", className: "bg-background border border-border" },
  { name: "Card", className: "bg-card" },
  { name: "Muted", className: "bg-muted" },
  { name: "Border", className: "bg-border" },
  { name: "Foreground", className: "bg-foreground" },
  { name: "Brand", className: "bg-brand" },
];

export default function Home() {
  return (
    <>
      {/* ------------------------------------------------------------ */}
      {/* Foundation intro                                              */}
      {/* ------------------------------------------------------------ */}
      <Section spacing="none" className="pt-24 pb-20 sm:pt-32 sm:pb-28">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.08)}>
          <motion.p variants={fadeIn()} className="text-label text-brand">
            Phase 1 — Foundation &amp; Design System
          </motion.p>
          <motion.h1
            variants={slideUp(0.05)}
            className="text-display mt-4 max-w-4xl text-balance"
          >
            Production equipment,
            <br />
            engineered as a system.
          </motion.h1>
          <motion.p variants={slideUp(0.1)} className="text-body mt-6 max-w-xl">
            This page demonstrates the OUTTA RENTALS component library and visual
            language — the foundation every later phase (catalogue, kit builder,
            quote flow, admin) will be built on top of.
          </motion.p>
          <motion.div variants={slideUp(0.15)} className="mt-8 flex flex-wrap gap-3">
            <Button size="lg">Browse Equipment</Button>
            <Button size="lg" variant="outline">
              Request a Quote
            </Button>
          </motion.div>
        </motion.div>
      </Section>

      <Divider />

      {/* ------------------------------------------------------------ */}
      {/* Typography                                                    */}
      {/* ------------------------------------------------------------ */}
      <Section>
        <Heading level="h2" eyebrow="Typography">
          Editorial hierarchy
        </Heading>
        <div className="mt-10 flex flex-col gap-8">
          <div>
            <p className="text-meta mb-2">Display</p>
            <p className="text-display">Cinematic by design</p>
          </div>
          <div>
            <p className="text-meta mb-2">H1</p>
            <p className="text-h1">Built for production crews</p>
          </div>
          <div>
            <p className="text-meta mb-2">H2</p>
            <p className="text-h2">Equipment that performs</p>
          </div>
          <div>
            <p className="text-meta mb-2">H3</p>
            <p className="text-h3">Precision, every rental</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-meta mb-2">Body</p>
              <p className="text-body">
                Every kit is inspected, tested and packed by our technical team
                before it leaves the depot.
              </p>
            </div>
            <div>
              <p className="text-meta mb-2">Small</p>
              <p className="text-small">
                Rates shown are indicative and confirmed at quote stage.
              </p>
            </div>
            <div>
              <p className="text-meta mb-2">Label / Technical metadata</p>
              <p className="text-label">Sensor · Full Frame</p>
              <p className="text-meta mt-2">SKU · OUTTA-CAM-0142</p>
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* ------------------------------------------------------------ */}
      {/* Color system                                                  */}
      {/* ------------------------------------------------------------ */}
      <Section>
        <Heading level="h2" eyebrow="Color">
          Monochrome foundation, one accent
        </Heading>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {colorSwatches.map((swatch) => (
            <div key={swatch.name} className="flex flex-col gap-3">
              <div className={`aspect-square w-full rounded-xl ${swatch.className}`} />
              <p className="text-label">{swatch.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ------------------------------------------------------------ */}
      {/* Buttons & badges                                              */}
      {/* ------------------------------------------------------------ */}
      <Section>
        <Heading level="h2" eyebrow="Components">
          Buttons &amp; badges
        </Heading>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="brand">Brand</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="technical">SKU · 0142</Badge>
        </div>
      </Section>

      <Divider />

      {/* ------------------------------------------------------------ */}
      {/* Form elements                                                 */}
      {/* ------------------------------------------------------------ */}
      <Section>
        <Heading level="h2" eyebrow="Inputs">
          Form elements
        </Heading>
        <div className="mt-10 grid max-w-2xl gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input id="project-name" placeholder="Feature film, Lagos" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="rental-period">Rental period</Label>
            <Select>
              <SelectTrigger id="rental-period" className="w-full">
                <SelectValue placeholder="Select a period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="weekend">Weekend</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="search-demo">Search</Label>
            <SearchInput id="search-demo" />
          </div>
        </div>
      </Section>

      <Divider />

      {/* ------------------------------------------------------------ */}
      {/* Cards                                                         */}
      {/* ------------------------------------------------------------ */}
      <Section>
        <Heading level="h2" eyebrow="Catalogue preview">
          Sample equipment cards
        </Heading>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.1)}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {sampleProducts.map((product) => (
            <motion.div key={product.name} variants={slideUp()}>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-4 flex aspect-4/3 items-center justify-center rounded-lg bg-muted">
                    <product.icon className="size-8 text-muted-foreground" />
                  </div>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="technical">From {product.day}/day</Badge>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm" className="w-full">
                    View details
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Divider />

      {/* ------------------------------------------------------------ */}
      {/* States                                                        */}
      {/* ------------------------------------------------------------ */}
      <Section>
        <Heading level="h2" eyebrow="System states">
          Loading, empty &amp; error
        </Heading>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border p-2">
            <LoadingState />
          </div>
          <div>
            <EmptyState
              icon={Package}
              title="No equipment found"
              description="Try adjusting your filters or search terms."
              action={<Button variant="outline">Clear filters</Button>}
            />
          </div>
          <div>
            <ErrorState onRetry={() => {}} />
          </div>
        </div>
        <div className="mt-6">
          <p className="text-meta mb-4">Loading grid (catalogue skeleton)</p>
          <LoadingGrid count={3} />
        </div>
      </Section>

      <Divider />

      {/* ------------------------------------------------------------ */}
      {/* Trust strip                                                   */}
      {/* ------------------------------------------------------------ */}
      <Section spacing="compact">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, label: "Inspected & insured gear" },
            { icon: Truck, label: "Delivery across major cities" },
            { icon: Package, label: "Build-a-kit, arriving Phase 2" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="size-5 text-brand" />
              <p className="text-small">{item.label}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
