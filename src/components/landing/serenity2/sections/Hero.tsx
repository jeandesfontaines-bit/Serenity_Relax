import { ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { HERO_IMAGE } from "@/components/landing/serenity2/data";

import { useBooking } from "@/context/BookingContext";

export default function Hero() {
  const { openModal } = useBooking();

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-24 md:pt-36 md:pb-32 lg:pt-44">
      <div className="relative mx-auto grid max-w-[1480px] grid-cols-12 gap-6 px-6 md:px-10 lg:px-14">
        {/* Left text column */}
        <div className="col-span-12 lg:col-span-6 lg:col-start-1 editorial-rise">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-[var(--neon)] px-4 py-2 mb-10">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--green)] opacity-75" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--off-black)]">Disponible cette semaine · Genève</span>
          </div>

          <h1 className="display-tight text-[3.75rem] text-foreground md:text-[5.5rem] lg:text-[6.5rem]">
            Le corps écouté.<br />
            <em>Le geste précis.</em>
          </h1>

          <p className="mt-10 max-w-lg text-lg leading-[1.55] text-foreground/70 md:text-xl">
            Massothérapie thérapeutique pensée pour les corps actifs.
            Soins ciblés, environnement minimal, résultats durables.
          </p>

          <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <button
              onClick={() => openModal(null)}
              className="group relative inline-flex items-center gap-3 rounded-full bg-[var(--orange)] px-8 py-4 text-white transition-all duration-500 hover:bg-[var(--off-black)]"
            >
              <span className="text-sm font-semibold tracking-tight">Réserver une séance</span>
              <ArrowDownRight size={18} strokeWidth={2} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>
            <a
              href="#sessions"
              className="text-sm font-medium tracking-tight text-foreground/70 hover:text-foreground transition-colors duration-300 editorial-link"
            >
              Voir les soins →
            </a>
          </div>

          {/* Stats */}
          <dl className="mt-16 grid grid-cols-3 gap-6 border-t border-foreground/10 pt-10">
            <div>
              <dd className="display-tight text-4xl text-foreground md:text-5xl">8</dd>
              <dt className="mt-2 text-xs font-medium tracking-wide text-foreground/50">Soins signature</dt>
            </div>
            <div>
              <dd className="display-tight text-4xl text-foreground md:text-5xl">12<span className="text-2xl text-foreground/40">a</span></dd>
              <dt className="mt-2 text-xs font-medium tracking-wide text-foreground/50">D'expérience</dt>
            </div>
            <div>
              <dd className="display-tight text-4xl text-foreground md:text-5xl">240<span className="text-2xl text-foreground/40">+</span></dd>
              <dt className="mt-2 text-xs font-medium tracking-wide text-foreground/50">Avis 5 étoiles</dt>
            </div>
          </dl>
        </div>

        {/* Right image column */}
        <div className="col-span-12 lg:col-span-5 lg:col-start-8 mt-12 lg:mt-0">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <img
                src={HERO_IMAGE}
                alt="Soin signature Serenity Relax"
                className="h-full w-full object-cover slow-pan"
                loading="eager"
              />
            </div>

            {/* Floating modern badge */}
            <div className="absolute -bottom-6 -left-6 max-w-[280px] rounded-2xl bg-white border border-foreground/8 p-5 shadow-[0_24px_60px_-20px_rgba(21,32,35,0.25)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-1.5">
                  <span className="h-7 w-7 rounded-full bg-[var(--orange)] border-2 border-white" />
                  <span className="h-7 w-7 rounded-full bg-[var(--teal-deep)] border-2 border-white" />
                  <span className="h-7 w-7 rounded-full bg-[var(--periwinkle)] border-2 border-white" />
                </div>
                <div className="ml-2">
                  <div className="text-xs font-semibold tracking-tight text-foreground">★ 4.97 sur 5</div>
                  <div className="text-[10px] tracking-wide text-foreground/50">240+ avis Google</div>
                </div>
              </div>
              <p className="text-sm leading-snug text-foreground/75">
                « Une approche thérapeutique d'une rare précision. »
              </p>
            </div>

            {/* Floating Neon tag */}
            <div className="absolute -top-4 -right-4 hidden md:block rotate-6">
              <div className="rounded-full bg-[var(--neon)] px-5 py-2.5">
                <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--off-black)]">Édition Nº 02</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
