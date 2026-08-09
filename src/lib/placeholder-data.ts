import type { LucideIcon } from "lucide-react";
import {
  Aperture,
  Camera,
  Clapperboard,
  Drone,
  Mic2,
  MonitorPlay,
  Spotlight,
  Wrench,
} from "lucide-react";

/**
 * Illustrative placeholder content for the Phase 2 homepage.
 *
 * Nothing here is real inventory, a real client, or a real testimonial —
 * it exists to demonstrate layout and tone until the catalogue, work
 * showcase and reviews are wired up to real data in a later phase.
 */

export interface EquipmentCategoryTeaser {
  name: string;
  slug: string;
  icon: LucideIcon;
}

export const equipmentCategories: EquipmentCategoryTeaser[] = [
  { name: "Cameras", slug: "cameras", icon: Camera },
  { name: "Lenses", slug: "lenses", icon: Aperture },
  { name: "Lighting", slug: "lighting", icon: Spotlight },
  { name: "Grip", slug: "grip", icon: Wrench },
  { name: "Audio", slug: "audio", icon: Mic2 },
  { name: "Monitors", slug: "monitors", icon: MonitorPlay },
  { name: "Drones", slug: "drones", icon: Drone },
  { name: "Accessories", slug: "accessories", icon: Clapperboard },
];

export interface FeaturedProductTeaser {
  brand: string;
  name: string;
  category: string;
  description: string;
  dayRate: string;
  availability: "Available" | "Limited" | "On request";
  icon: LucideIcon;
}

export const featuredProducts: FeaturedProductTeaser[] = [
  {
    brand: "ARRI-class",
    name: "6K Cinema Camera Body",
    category: "Cameras",
    description: "Full-frame sensor, dual native ISO, ready for anamorphic.",
    dayRate: "$220",
    availability: "Available",
    icon: Camera,
  },
  {
    brand: "Zeiss-class",
    name: "Cine Prime 35mm T1.5",
    category: "Lenses",
    description: "Consistent color and geometry across the full prime set.",
    dayRate: "$85",
    availability: "Available",
    icon: Aperture,
  },
  {
    brand: "ARRI-class",
    name: "1200W LED Fresnel Kit",
    category: "Lighting",
    description: "Daylight-balanced key light with barn doors and stand.",
    dayRate: "$140",
    availability: "Limited",
    icon: Spotlight,
  },
  {
    brand: "O'Connor-class",
    name: "Fluid Head Tripod System",
    category: "Grip",
    description: "Smooth pan and tilt for handheld-free precision moves.",
    dayRate: "$60",
    availability: "Available",
    icon: Wrench,
  },
  {
    brand: "Sennheiser-class",
    name: "Wireless Lavalier Kit",
    category: "Audio",
    description: "Dual-channel receiver with two bodypack transmitters.",
    dayRate: "$45",
    availability: "Available",
    icon: Mic2,
  },
  {
    brand: "SmallHD-class",
    name: "7\" On-Camera Monitor",
    category: "Monitors",
    description: "Daylight-visible, waveform and false-color built in.",
    dayRate: "$35",
    availability: "On request",
    icon: MonitorPlay,
  },
  {
    brand: "DJI-class",
    name: "Cinema Drone Platform",
    category: "Drones",
    description: "Gimbal-stabilized aerial capture with dual operators.",
    dayRate: "$180",
    availability: "Limited",
    icon: Drone,
  },
  {
    brand: "OUTTA Essentials",
    name: "Production Sound Kit",
    category: "Accessories",
    description: "Boom, blimp, cabling and a field mixer, matched and tested.",
    dayRate: "$50",
    availability: "Available",
    icon: Clapperboard,
  },
];

export interface KitPreset {
  name: string;
  description: string;
  icon: LucideIcon;
}

export const kitPresets: KitPreset[] = [
  {
    name: "Commercial",
    description: "Fast-turnaround kits built for brand and agency shoots.",
    icon: Clapperboard,
  },
  {
    name: "Documentary",
    description: "Lightweight, run-and-gun setups for long shooting days.",
    icon: Camera,
  },
  {
    name: "Music Video",
    description: "Bold lighting and specialty glass for high-concept looks.",
    icon: Spotlight,
  },
  {
    name: "Wedding",
    description: "Discreet, reliable gear for once-only moments.",
    icon: Aperture,
  },
  {
    name: "Feature Film",
    description: "Full production packages built around your shot list.",
    icon: Clapperboard,
  },
  {
    name: "Interview",
    description: "Clean two-camera setups with matched lighting.",
    icon: MonitorPlay,
  },
  {
    name: "Content",
    description: "Fast, flexible kits for creators and social teams.",
    icon: Camera,
  },
  {
    name: "Live Production",
    description: "Multi-camera and audio kits built for live events.",
    icon: Mic2,
  },
];

export interface WhyOuttaPoint {
  index: string;
  title: string;
  description: string;
}

export const whyOutta: WhyOuttaPoint[] = [
  {
    index: "01",
    title: "Production Ready",
    description: "Equipment prepared for the realities of set.",
  },
  {
    index: "02",
    title: "Production First",
    description: "We understand what productions actually need.",
  },
  {
    index: "03",
    title: "Fast Response",
    description: "Get answers without unnecessary friction.",
  },
  {
    index: "04",
    title: "Flexible Packages",
    description: "Build the exact kit required.",
  },
  {
    index: "05",
    title: "Local Expertise",
    description: "International production standards with local knowledge.",
  },
];

export interface WorkShowcaseItem {
  title: string;
  productionType: string;
  description: string;
}

export const workShowcase: WorkShowcaseItem[] = [
  {
    title: "Sample Project 01",
    productionType: "Commercial",
    description: "A brand campaign shot over three days with a full lighting package.",
  },
  {
    title: "Sample Project 02",
    productionType: "Documentary",
    description: "A long-form documentary supported with a lightweight travel kit.",
  },
  {
    title: "Sample Project 03",
    productionType: "Music Video",
    description: "A single-location shoot built around specialty lenses and haze.",
  },
  {
    title: "Sample Project 04",
    productionType: "Feature Film",
    description: "A full crew production supplied with camera, grip and lighting.",
  },
];

export interface ServiceItem {
  name: string;
  description: string;
}

export const services: ServiceItem[] = [
  {
    name: "Equipment Rental",
    description: "The full catalogue, from single bodies to complete packages.",
  },
  {
    name: "Production Support",
    description: "Guidance on what to bring, before you commit to a kit.",
  },
  {
    name: "Delivery & Collection",
    description: "Gear delivered to set and collected when you wrap.",
  },
  {
    name: "Prep & Testing",
    description: "Every kit checked and configured before it leaves the depot.",
  },
  {
    name: "Technical Support",
    description: "A line to someone who knows the gear, while you're shooting.",
  },
  {
    name: "Crew Support",
    description: "Access to technicians and operators when a kit needs one.",
  },
  {
    name: "Custom Packages",
    description: "Kits assembled around a specific shot list or brief.",
  },
];

export interface TestimonialItem {
  quote: string;
  role: string;
}

export const testimonials: TestimonialItem[] = [
  {
    quote:
      "Placeholder testimonial — real feedback from productions will replace this once OUTTA is live.",
    role: "Director of Photography, Independent Feature",
  },
  {
    quote:
      "Placeholder testimonial — real feedback from productions will replace this once OUTTA is live.",
    role: "Producer, Commercial Agency",
  },
  {
    quote:
      "Placeholder testimonial — real feedback from productions will replace this once OUTTA is live.",
    role: "Creative Director, Content Studio",
  },
];
