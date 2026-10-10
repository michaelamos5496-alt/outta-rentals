export interface ServicePageContent {
  slug: string;
  /** Matches the footer link label. */
  name: string;
  eyebrow: string;
  title: string;
  intro: string;
  /** Short "how it works" steps. */
  steps: { heading: string; body: string }[];
  /** What the service covers. */
  covers: string[];
  whatsapp: { label: string; heading: string; closingLine: string };
}

export const servicePages: ServicePageContent[] = [
  {
    slug: "production-support",
    name: "Production Support",
    eyebrow: "Services",
    title: "Guidance before you commit to a kit.",
    intro:
      "Not sure what you need for a given setup? OUTTA's team can talk through a shot list or brief and suggest equipment that actually fits the shoot — before you spend on gear you won't use.",
    steps: [
      {
        heading: "Tell us about the shoot",
        body: "Share the brief, the locations and the look you're after — a shot list helps, but a rough idea is enough to start.",
      },
      {
        heading: "We recommend the kit",
        body: "OUTTA suggests the camera, lenses, lighting, grip and monitoring that fit your shoot, considered together rather than line by line.",
      },
      {
        heading: "Adjust it until it's right",
        body: "Add, swap or remove anything. When you're happy, the kit goes into your cart and you check out via WhatsApp.",
      },
    ],
    covers: [
      "Equipment recommendations for your brief or shot list",
      "Help choosing between similar cameras, lenses and lights",
      "Checking that everything in a kit works together",
      "Advice on a package that fits your crew size and budget",
    ],
    whatsapp: {
      label: "Talk to OUTTA",
      heading: "OUTTA RENTALS — PRODUCTION SUPPORT ENQUIRY",
      closingLine: "I'd like some help planning the equipment for my shoot.",
    },
  },
  {
    slug: "delivery-collection",
    name: "Delivery & Collection",
    eyebrow: "Services",
    title: "Gear delivered to set, collected when you wrap.",
    intro:
      "Skip the depot run. OUTTA can deliver equipment directly to your shoot location and collect it when you're done, so the crew's time goes toward the work, not logistics.",
    steps: [
      {
        heading: "Choose your kit and dates",
        body: "Build your cart and set your pickup and return dates and times — we're open 7:00 AM to 9:00 PM daily.",
      },
      {
        heading: "Tell us where and when",
        body: "Add the delivery location when you check out via WhatsApp, and OUTTA confirms the arrangement with you.",
      },
      {
        heading: "We deliver and collect",
        body: "Your kit arrives at the agreed place, and OUTTA collects it when you wrap.",
      },
    ],
    covers: [
      "Delivery of your kit to your shoot location",
      "Collection of the equipment when the rental ends",
      "Self-pickup from OUTTA if you'd rather collect it yourself",
      "Delivery details confirmed with you before the shoot",
    ],
    whatsapp: {
      label: "Ask About Delivery",
      heading: "OUTTA RENTALS — DELIVERY ENQUIRY",
      closingLine: "I'd like to ask about delivery and collection for my rental.",
    },
  },
];

export function getServicePage(slug: string): ServicePageContent | undefined {
  return servicePages.find((p) => p.slug === slug);
}
