export const LANDING_VARIANTS = [
  "default",
  "immersive",
  "alpine",
  "cocoon",
  "editorial",
  "concierge",
  "kinetic",
  "zen",
  "ephemeral",
  "heritage",
  "nocturnal",
  "bento",
] as const;

export type LandingVariant = (typeof LANDING_VARIANTS)[number];

export function normalizeLandingVariant(value?: string): LandingVariant {
  if (!value) return "default";
  return LANDING_VARIANTS.includes(value as LandingVariant)
    ? (value as LandingVariant)
    : "default";
}
