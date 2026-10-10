export interface TierCopy {
  title: string;
  description: string;
}

/**
 * The shared description for each kind of tier — the same wording on every
 * package (Commercial's "TOP BOY · MID" and the others' "TOP GUY" are the
 * same professional tier).
 */
const TIER_COPY: Record<string, TierCopy> = {
  lite: {
    title: "Essential production package",
    description: "For smaller crews, interviews, documentaries and low-footprint productions.",
  },
  "top-guy": {
    title: "Professional cinema package",
    description: "For productions requiring a stronger camera, lighting and monitoring setup.",
  },
  yolo: {
    title: "Full-scale production package",
    description:
      "For high-end commercial and music-video productions requiring a more complete cinema setup.",
  },
};

const TIER_COPY_ALIASES: Record<string, string> = { "top-boy-mid": "top-guy" };

export function getTierCopy(tierSlug: string): TierCopy | undefined {
  return TIER_COPY[TIER_COPY_ALIASES[tierSlug] ?? tierSlug];
}
