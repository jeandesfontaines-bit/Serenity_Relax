export const LANDING_VARIANTS = ["default", "immersive", "editorial", "concierge"] as const;

export type LandingVariant = (typeof LANDING_VARIANTS)[number];

export function normalizeLandingVariant(value?: string): LandingVariant {
  if (!value) return "default";
  return LANDING_VARIANTS.includes(value as LandingVariant)
    ? (value as LandingVariant)
    : "default";
}
