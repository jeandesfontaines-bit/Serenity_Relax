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
  // We keep the other variants for compatibility, but the default will be our primary focus
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
  alpine: {
    badge: "Lecture guidée · Expertise corporelle",
    titleTop: "Une direction",
    titleBottom: "artistique plus éditoriale.",
    intro:
      "Ici, la landing casse davantage sa symétrie et traite chaque bloc comme une mise en page de revue plutôt qu'un simple alignement marketing.",
    detail:
      "L'objectif est de créer des pauses franches, une hiérarchie plus sculptée et un regard qui se déplace avec plus d'intention.",
    aside: "Plus d'air, plus de rupture, moins de répétition.",
  },
  cocoon: {
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
  kinetic: {
    badge: "Lecture guidée · Expertise corporelle",
    titleTop: "Une direction",
    titleBottom: "artistique plus éditoriale.",
    intro:
      "Ici, la landing casse davantage sa symétrie et traite chaque bloc comme une mise en page de revue plutôt qu'un simple alignement marketing.",
    detail:
      "L'objectif est de créer des pauses franches, une hiérarchie plus sculptée et un regard qui se déplace avec plus d'intention.",
    aside: "Plus d'air, plus de rupture, moins de répétition.",
  },
  zen: {
    badge: "Lecture guidée · Expertise corporelle",
    titleTop: "Une direction",
    titleBottom: "artistique plus éditoriale.",
    intro:
      "Ici, la landing casse davantage sa symétrie et traite chaque bloc comme une mise en page de revue plutôt qu'un simple alignement marketing.",
    detail:
      "L'objectif est de créer des pauses franches, une hiérarchie plus sculptée et un regard qui se déplace avec plus d'intention.",
    aside: "Plus d'air, plus de rupture, moins de répétition.",
  },
  ephemeral: {
    badge: "Lecture guidée · Expertise corporelle",
    titleTop: "Une direction",
    titleBottom: "artistique plus éditoriale.",
    intro:
      "Ici, la landing casse davantage sa symétrie et traite chaque bloc comme une mise en page de revue plutôt qu'un simple alignement marketing.",
    detail:
      "L'objectif est de créer des pauses franches, une hiérarchie plus sculptée et un regard qui se déplace avec plus d'intention.",
    aside: "Plus d'air, plus de rupture, moins de répétition.",
  },
  heritage: {
    badge: "Lecture guidée · Expertise corporelle",
    titleTop: "Une direction",
    titleBottom: "artistique plus éditoriale.",
    intro:
      "Ici, la landing casse davantage sa symétrie et traite chaque bloc comme une mise en page de revue plutôt qu'un simple alignement marketing.",
    detail:
      "L'objectif est de créer des pauses franches, une hiérarchie plus sculptée et un regard qui se déplace avec plus d'intention.",
    aside: "Plus d'air, plus de rupture, moins de répétition.",
  },
  nocturnal: {
    badge: "Lecture guidée · Expertise corporelle",
    titleTop: "Une direction",
    titleBottom: "artistique plus éditoriale.",
    intro:
      "Ici, la landing casse davantage sa symétrie et traite chaque bloc comme une mise en page de revue plutôt qu'un simple alignement marketing.",
    detail:
      "L'objectif est de créer des pauses franches, une hiérarchie plus sculptée et un regard qui se déplace avec plus d'intention.",
    aside: "Plus d'air, plus de rupture, moins de répétition.",
  },
  bento: {
    badge: "Lecture guidée · Expertise corporelle",
    titleTop: "Une direction",
    titleBottom: "artistique plus éditoriale.",
    intro:
      "Ici, la landing casse davantage sa symétrie et traite chaque bloc comme une mise en page de revue plutôt qu'un simple alignement marketing.",
    detail:
      "L'objectif est de créer des pauses franches, une hiérarchie plus sculptée et un regard qui se déplace avec plus d'intention.",
    aside: "Plus d'air, plus de rupture, moins de répétition.",
  },
};

const METRICS = [
  { value: "Genève", label: "Cabinet à Cointrin" },
  { value: "8", label: "Soins ciblés" },
  { value: "100%", label: "Adapté à votre corps" },
];

export default function Hero({ variant = "default" }: { variant?: LandingVariant }) {
  const copy = VARIANT_COPY[variant];

  return (
    <section id="top" className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Full width background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/joao-collage.png"
          alt="Ambiance massage"
          className="h-full w-full object-cover object-center"
        />
        {/* Subtle overlay to improve readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent md:via-white/70" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1360px] px-6 py-20 md:px-10 lg:px-12">
        <div className="max-w-2xl">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#B87355]/20 bg-white/70 backdrop-blur-md px-5 py-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#B87355] opacity-40" />
              <span className="relative h-2 w-2 rounded-full bg-[#B87355]" />
            </span>
            <span className="text-[#B87355] text-[0.75rem] font-medium tracking-wide uppercase">{copy.badge}</span>
          </div>

          <h1 className="mb-8 text-5xl md:text-6xl lg:text-7xl font-serif tracking-[0.015em] text-[#153839] leading-tight">
            <span>{copy.titleTop}</span>
            <br />
            <span className="italic opacity-90 text-[0.9em]">{copy.titleBottom}</span>
          </h1>

          <div className="mb-12 space-y-6 rounded-2xl border border-white/40 bg-white/60 p-6 shadow-lg backdrop-blur-md lg:p-8">
            <p className="text-lg md:text-xl text-[#301f10]/80 leading-relaxed">{copy.intro}</p>
            <p className="text-lg md:text-xl text-[#301f10]/80 leading-relaxed">{copy.detail}</p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/booking"
              className="group relative inline-flex h-14 items-center gap-4 rounded-full bg-[#B87355] px-8 text-white shadow-[0_8px_20px_rgba(184,115,85,0.3)] transition-all duration-500 hover:scale-105 hover:bg-[#9c5f44] active:scale-95"
            >
              <span className="text-[0.9rem] font-medium tracking-wide">Réserver un soin</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-45">
                <ArrowDownRight size={16} strokeWidth={2.5} />
              </div>
            </Link>
            <a
              href="#sessions"
              className="group flex items-center text-[0.9rem] font-medium text-[#153839]/70 transition-colors duration-300 hover:text-[#153839]"
            >
              Découvrir les soins <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>

          <div className="mt-16 flex flex-wrap gap-8 md:gap-12 border-t border-[#153839]/10 pt-8">
            {METRICS.map((metric) => (
              <div key={metric.label}>
                <div className="text-2xl font-serif text-[#153839]">{metric.value}</div>
                <div className="text-[0.8rem] text-[#301f10]/60 mt-1 uppercase tracking-wider">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
