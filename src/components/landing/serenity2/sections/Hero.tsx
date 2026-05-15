import Link from "next/link";
import { ArrowDownRight } from "lucide-react";
import { LandingVariant } from "../types";

const VARIANT_COPY: Record<
  LandingVariant,
  {
    badge: string;
    titleTop: string;
    titleBottom: string;
    intro: string;
    detail: string;
    aside: string;
  }
> = {
  default: {
    badge: "Massothérapie thérapeutique · Genève",
    titleTop: "Le soin juste,",
    titleBottom: "pour votre corps.",
    intro:
      "Des massages thérapeutiques pensés pour soulager les tensions, relancer la récupération et ramener le corps vers un équilibre durable.",
    detail:
      "Chaque séance est ajustée à votre état du moment, avec une approche précise, calme et entièrement sur-mesure.",
    aside: "Calme, précision, récupération durable.",
  },
  immersive: {
    badge: "Expérience enveloppante · Cointrin",
    titleTop: "Entrez dans un",
    titleBottom: "rythme de relâchement.",
    intro:
      "Une entrée plus cinématographique, où la page prend le temps d'installer une sensation avant de vendre un service.",
    detail:
      "Le discours devient moins transactionnel et plus atmosphérique, pour faire sentir le cabinet comme un refuge corporel immédiat.",
    aside: "Une page qui ralentit le lecteur avant de convertir.",
  },
  editorial: {
    badge: "Lecture guidée · Expertise corporelle",
    titleTop: "Une direction",
    titleBottom: "artistique plus éditoriale.",
    intro:
      "Ici, la landing casse davantage sa symétrie et traite chaque bloc comme une mise en page de revue plutôt qu'un simple alignement marketing.",
    detail:
      "L'objectif est de créer des pauses franches, une hiérarchie plus sculptée et un regard qui se déplace avec plus d'intention.",
    aside: "Plus d'air, plus de rupture, moins de répétition.",
  },
  concierge: {
    badge: "Parcours guidé · Choix simplifié",
    titleTop: "Trouver le bon soin,",
    titleBottom: "plus vite.",
    intro:
      "Cette variation rend l'accompagnement plus visible dès le premier écran, avec un discours orienté triage, besoin et recommandation.",
    detail:
      "La page garde sa sophistication visuelle mais devient plus directe, plus utile et plus lisible pour quelqu'un qui compare ses options.",
    aside: "Une landing qui agit davantage comme un conseiller.",
  },
};

const METRICS = [
  { value: "Genève", label: "Cabinet à Cointrin" },
  { value: "8", label: "Soins ciblés" },
  { value: "100%", label: "Adapté à votre corps" },
];

export default function Hero({ variant = "default" }: { variant?: LandingVariant }) {
  const copy = VARIANT_COPY[variant];
  const useImmersiveBackdrop = variant === "default" || variant === "immersive";

  const layoutClassName =
    variant === "immersive"
      ? "lg:grid-cols-12 lg:gap-14"
      : variant === "editorial"
        ? "lg:grid-cols-12 lg:gap-16"
        : variant === "concierge"
          ? "lg:grid-cols-12 lg:gap-12"
          : "lg:grid-cols-12 lg:gap-14";

  const sectionClassName = "min-h-[calc(84vh-72px)] flex items-start pt-10 pb-24 md:pt-14 md:pb-28 lg:pt-16 lg:pb-32";

  const imageColumnClassName =
    variant === "immersive"
      ? "col-span-12 lg:col-span-5 lg:col-start-1"
      : variant === "editorial"
        ? "col-span-12 lg:col-span-3 lg:col-start-2"
        : variant === "concierge"
          ? "col-span-12 lg:col-span-5 lg:col-start-8"
          : "col-span-12 lg:col-span-4 lg:col-start-1";

  const textColumnClassName =
    variant === "immersive"
      ? "col-span-12 lg:col-span-6 lg:col-start-7"
      : variant === "editorial"
        ? "col-span-12 lg:col-span-6 lg:col-start-6"
        : variant === "concierge"
          ? "col-span-12 lg:col-span-6 lg:col-start-1"
          : "col-span-12 lg:col-span-7 lg:col-start-6";

  return (
    <section id="top" className={`relative overflow-hidden ${sectionClassName}`}>
      {useImmersiveBackdrop ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(21,56,57,0.13),transparent_30%),radial-gradient(circle_at_84%_24%,rgba(241,102,77,0.12),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.45),transparent_38%)]" />
      ) : null}

      <div className={`relative mx-auto grid max-w-[1360px] grid-cols-12 items-center gap-10 px-6 md:px-10 lg:px-12 ${layoutClassName}`}>
        <div className={`${imageColumnClassName} ${variant === "concierge" ? "lg:order-2" : ""}`}>
          <div className={`relative mx-auto ${variant === "editorial" ? "max-w-[280px]" : "max-w-[360px] lg:max-w-[340px]"}`}>
            {variant !== "concierge" ? (
              <div className="absolute -top-12 -left-12 pointer-events-none hidden select-none opacity-[0.03] lg:block">
                <span className="display-tight text-[9rem] leading-none font-bold">JOÃO</span>
              </div>
            ) : null}

            <div
              className={[
                "landing-bg-subtle-strong relative z-10 overflow-hidden border",
                variant === "editorial"
                  ? "aspect-[2.6/4] rounded-[2.8rem] border-[rgba(216,215,210,0.75)] shadow-[0_28px_55px_rgba(48,31,16,0.1)]"
                  : "aspect-[3/4] rounded-[2.2rem] border-[rgba(216,215,210,0.65)] shadow-[0_22px_48px_rgba(48,31,16,0.12)]",
                variant === "immersive"
                  ? "before:absolute before:inset-x-[12%] before:bottom-0 before:top-auto before:h-20 before:rounded-full before:bg-[rgba(21,56,57,0.14)] before:blur-3xl"
                  : "",
              ].join(" ")}
            >
              <img
                src="/images/joao-collage.png"
                alt="L'expertise du geste par João"
                className={`h-full w-full object-cover ${variant === "immersive" ? "scale-[1.03]" : ""}`}
                loading="eager"
              />
              <div
                className={[
                  "absolute inset-0",
                  variant === "immersive"
                    ? "bg-[linear-gradient(180deg,rgba(7,18,18,0.08),transparent_35%,rgba(7,18,18,0.18))]"
                    : "bg-gradient-to-t from-[rgba(251,248,242,0.2)] via-transparent to-transparent",
                ].join(" ")}
              />
            </div>

            {variant === "concierge" ? (
              <div className="mt-5 rounded-[1.8rem] border border-[var(--landing-tint)] bg-white/75 p-5 shadow-[0_18px_40px_rgba(48,31,16,0.08)] backdrop-blur-sm">
                <p className="landing-type-micro text-[var(--orange)]">
                  Orientation rapide
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Stress", "Récupération", "Drainage", "Tensions profondes"].map((tag) => (
                    <span
                      key={tag}
                      className="landing-pill landing-pill-soft landing-type-caption landing-border-soft landing-text-soft border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className={`${textColumnClassName} editorial-rise ${variant === "concierge" ? "lg:order-1" : ""}`}>
          <div
            className={[
              "mb-10 inline-flex items-center gap-3 rounded-full border px-4 py-2 transition-colors",
              variant === "immersive"
                ? "border-[rgba(21,56,57,0.16)] bg-[rgba(255,255,255,0.68)] shadow-[0_18px_40px_rgba(21,56,57,0.08)] hover:bg-white/82"
                : "border-[var(--landing-tint)] bg-white/55 hover:bg-white/75",
            ].join(" ")}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--orange)] opacity-40" />
              <span className="relative h-2 w-2 rounded-full bg-[var(--orange)]" />
            </span>
            <span className="landing-text-faint landing-type-micro">{copy.badge}</span>
          </div>

          {variant === "editorial" ? (
            <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_150px] lg:items-end">
              <h1 className="landing-type-hero landing-text-high display-tight">
                {copy.titleTop}
                <br />
                <span className="landing-display-italic opacity-90">{copy.titleBottom}</span>
              </h1>
              <p className="landing-type-small landing-text-body max-w-[14ch]">
                {copy.aside}
              </p>
            </div>
          ) : (
            <h1 className="landing-type-hero landing-text-high display-tight mb-12">
              {copy.titleTop}
              <br />
              <span className="landing-display-italic opacity-90">{copy.titleBottom}</span>
            </h1>
          )}

          <div
            className={[
              "mb-14 max-w-xl space-y-6",
              variant === "immersive"
                ? "rounded-[2rem] border border-[rgba(21,56,57,0.12)] bg-white/55 p-6 shadow-[0_24px_44px_rgba(21,56,57,0.07)] backdrop-blur-sm"
                : "",
            ].join(" ")}
          >
            <p className="landing-type-body landing-text-soft">{copy.intro}</p>
            <p className="landing-type-body landing-text-soft">{copy.detail}</p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/booking"
              className={[
                "landing-text-inverse group relative inline-flex h-12 items-center gap-3 rounded-full px-8 transition-all duration-500 hover:scale-105 active:scale-95",
                variant === "editorial"
                  ? "bg-[var(--landing-display-dark)] shadow-[0_20px_40px_rgba(17,24,39,0.16)]"
                  : "bg-[var(--teal-deep)] shadow-[0_16px_34px_rgba(21,56,57,0.16)]",
              ].join(" ")}
            >
              <span className="landing-type-micro">Réserver un soin</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-45">
                <ArrowDownRight size={14} strokeWidth={3} className="landing-text-inverse" />
              </div>
            </Link>
            <a
              href="#sessions"
              className="landing-text-faint landing-type-micro group transition-colors duration-300 hover:text-[var(--off-black)]"
            >
              Découvrir les soins <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>

          <div
            className={[
              "mt-12 pt-10",
              variant === "concierge"
                ? "grid gap-3 border-t border-[var(--landing-tint)] md:grid-cols-3"
                : "flex gap-7 border-t border-[var(--landing-tint)] md:gap-10",
            ].join(" ")}
          >
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className={variant === "concierge" ? "rounded-[1.5rem] border border-[var(--landing-tint)] bg-white/65 p-4" : ""}
              >
                <div className="landing-text-high display-tight text-xl md:text-2xl">{metric.value}</div>
                <div className="landing-text-whisper landing-type-micro mt-1 scale-[0.94] origin-left">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
