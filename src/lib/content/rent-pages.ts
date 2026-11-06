export interface RentPage {
  slug: string;
  /** Search phrase this page targets — used for the H1 and <title>. */
  title: string;
  metaDescription: string;
  intro: string;
  /** Equipment category route this page funnels into (/equipment/<slug>). */
  categoryHref: string;
  categoryLabel: string;
  points: string[];
  faqs: { q: string; a: string }[];
}

const sharedFaqs = (what: string): RentPage["faqs"] => [
  {
    q: `Where can I rent ${what} in Accra?`,
    a: `OUTTA RENTALS is based at 53 Mantse Boi Street, Accra. Browse the catalogue online, send a quote request or message us on WhatsApp, and collect from us or have it delivered.`,
  },
  {
    q: "Do you deliver rental equipment in Accra?",
    a: "Yes. We offer delivery and collection around Accra — ask for it when you request your quote.",
  },
  {
    q: "How is the rental period counted?",
    a: "Rental days are counted per 24 hours from pickup to return.",
  },
  {
    q: "How do I book?",
    a: "Add the gear you need to your kit, request a quote, and we'll confirm availability and next steps with you.",
  },
];

export const rentPages: RentPage[] = [
  {
    slug: "camera-rental-accra",
    title: "Camera Rental in Accra",
    metaDescription:
      "Rent cinema and mirrorless cameras in Accra, Ghana. OUTTA RENTALS offers camera bodies, rigs and accessories with delivery and collection around the city.",
    intro:
      "Looking for a camera rental company in Accra? OUTTA RENTALS hires out cinema and mirrorless camera bodies for shoots of every size — from music videos and commercials to short films and documentaries.",
    categoryHref: "/equipment/cameras",
    categoryLabel: "Browse cameras",
    points: [
      "Cinema and mirrorless camera bodies",
      "Monitors, matte boxes and camera accessories to build out your rig",
      "Delivery and collection around Accra",
      "Quote request or WhatsApp booking — no account needed",
    ],
    faqs: sharedFaqs("a camera"),
  },
  {
    slug: "cine-lens-rental-accra",
    title: "Cine Lens Rental in Accra",
    metaDescription:
      "Rent cine primes, zooms and photo lenses in Accra, Ghana from OUTTA RENTALS. Delivery and collection available.",
    intro:
      "OUTTA RENTALS hires out cine primes, cine zooms and photo lenses in Accra, so you can pick the look for your project without buying the glass.",
    categoryHref: "/equipment/lenses",
    categoryLabel: "Browse lenses",
    points: [
      "Cine lenses and photo lenses",
      "Filters and matte boxes to match",
      "Delivery and collection around Accra",
      "Fast quote by form or WhatsApp",
    ],
    faqs: sharedFaqs("cine lenses"),
  },
  {
    slug: "lighting-rental-accra",
    title: "Film Lighting Rental in Accra",
    metaDescription:
      "Rent LED film lights, modifiers and stands in Accra, Ghana. OUTTA RENTALS supplies lighting for film, video and photo shoots.",
    intro:
      "Need lighting for a shoot in Accra? OUTTA RENTALS rents LED fixtures and modifiers for film, commercial, music video and photo productions.",
    categoryHref: "/equipment/lighting",
    categoryLabel: "Browse lighting",
    points: [
      "LED lights and lighting modifiers",
      "Stands and grip to rig them safely",
      "Delivery and collection around Accra",
      "Quote request or WhatsApp booking",
    ],
    faqs: sharedFaqs("film lighting"),
  },
  {
    slug: "film-equipment-rental-accra",
    title: "Film Equipment Rental in Accra",
    metaDescription:
      "Film and video equipment rental in Accra, Ghana: cameras, lenses, lighting, grip and audio from OUTTA RENTALS, with delivery and collection.",
    intro:
      "OUTTA RENTALS is a production equipment rental company in Accra, Ghana. Cameras, lenses, lighting, grip and audio — everything for your crew from one place.",
    categoryHref: "/equipment",
    categoryLabel: "Browse all equipment",
    points: [
      "Cameras, lenses, lighting, grip and audio",
      "Ready-made packages for common shoots",
      "Production support and delivery around Accra",
      "Quote request or WhatsApp booking",
    ],
    faqs: sharedFaqs("film equipment"),
  },
];

export function getRentPage(slug: string): RentPage | undefined {
  return rentPages.find((p) => p.slug === slug);
}
