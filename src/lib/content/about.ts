export interface AboutSection {
  eyebrow: string;
  title: string;
  body: string;
}

/**
 * Brand-voice copy for /about. Deliberately free of specific dates, named
 * founders or claimed history — those get filled in once they exist.
 */
export const aboutSections: AboutSection[] = [
  {
    eyebrow: "Who We Are",
    title: "A production-equipment partner, not just a rental counter.",
    body: "OUTTA RENTALS exists to get the right equipment into the right hands, with the technical grounding to back it up. Placeholder — full company profile to be added.",
  },
  {
    eyebrow: "What We Believe",
    title: "The right kit is the one that fits the shoot, not the biggest one available.",
    body: "A bigger camera or a longer equipment list isn't automatically a better one. OUTTA starts from the brief and works backward to the gear, not the other way around.",
  },
  {
    eyebrow: "Production Philosophy",
    title: "Equipment should disappear into the work, not complicate it.",
    body: "Gear that's well-matched, well-tested and well-understood lets a crew focus on the shot instead of troubleshooting the tools. That's the standard every kit is held to before it leaves the depot.",
  },
  {
    eyebrow: "Technical Expertise",
    title: "Every piece of equipment is handled by people who know how it works.",
    body: "From sensor formats to mount compatibility to power draw across a full lighting package, OUTTA's team understands the equipment at a level that goes beyond a spec sheet.",
  },
  {
    eyebrow: "Customer Experience",
    title: "Fast answers, clear pricing, no unnecessary friction.",
    body: "Requesting a quote, adjusting a kit, or asking a technical question should be simple. OUTTA is built around being easy to work with under production timelines, not just easy to book.",
  },
  {
    eyebrow: "Local Production Knowledge",
    title: "International standards, applied with local context.",
    body: "Production realities differ by market — permitting, locations, crew availability, power. OUTTA operates with international equipment and workflow standards while staying grounded in the realities of shooting locally.",
  },
];
