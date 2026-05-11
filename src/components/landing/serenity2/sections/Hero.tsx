import { ArrowDownRight } from "lucide-react";

import { useBooking } from "@/context/BookingContext";

export default function Hero() {
  const { openModal } = useBooking();

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-40">
      <div className="relative mx-auto grid max-w-[1480px] grid-cols-12 gap-12 lg:gap-24 px-6 md:px-10 lg:px-14 items-center">
        
        {/* Left column: The Action Collage */}
        <div className="col-span-12 lg:col-span-5 lg:col-start-1">
          <div className="relative">
            <div className="absolute -top-16 -left-16 pointer-events-none select-none hidden lg:block opacity-[0.03]">
              <span className="display-tight text-[12rem] leading-none font-bold">
                JOÃO
              </span>
            </div>
            
            <div className="relative z-10 aspect-[3/4] overflow-hidden rounded-[3rem] bg-foreground/5 shadow-2xl">
              <img
                src="/images/joao-collage.png"
                alt="L'expertise du geste par João"
                className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Right text column: The Narrative */}
        <div className="col-span-12 lg:col-span-7 lg:col-start-6 editorial-rise">
          <div className="inline-flex items-center gap-3 rounded-full bg-foreground/[0.03] border border-foreground/5 px-4 py-2 mb-8 transition-colors hover:bg-foreground/[0.05]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--orange)] opacity-40" />
              <span className="relative h-2 w-2 rounded-full bg-[var(--orange)]" />
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/50">Expert Massothérapeute · Genève</span>
          </div>

          <h1 className="display-tight mb-10 text-[3.5rem] leading-[0.86] -tracking-[0.03em] text-foreground md:text-[5.7rem] lg:text-[6.5rem]">
            João. <br />
            <span className="font-serif italic font-light opacity-90">L&apos;art du geste.</span>
          </h1>

          <div className="mb-12 max-w-2xl space-y-6">
            <p className="text-lg leading-relaxed tracking-tight text-foreground/90 md:text-xl">
              « Mon travail consiste à offrir des services personnalisés pour améliorer votre qualité de vie. Chaque geste est pensé pour apaiser le corps et revitaliser l&apos;esprit. »
            </p>
            <p className="text-base leading-relaxed text-foreground/65 md:text-lg">
              Spécialiste du rééquilibrage global, João consacre sa pratique à la précision du soin. Une approche attentive et rigoureuse pour des résultats durables sur votre bien-être.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={() => openModal(null)}
              className="group relative inline-flex h-14 items-center gap-4 rounded-full bg-foreground px-10 text-background transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl shadow-foreground/10"
            >
              <span className="text-xs font-bold uppercase tracking-widest">Réserver une séance</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background/20 transition-transform duration-500 group-hover:rotate-45">
                <ArrowDownRight size={14} strokeWidth={3} className="text-background" />
              </div>
            </button>
            <a
              href="#sessions"
              className="group text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors duration-300"
            >
              Explorer les soins <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>

          <div className="mt-14 flex gap-8 border-t border-foreground/8 pt-8 md:gap-12">
            <div>
              <div className="display-tight text-2xl text-foreground italic font-serif md:text-3xl">Genève</div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-foreground/30">Cointrin</div>
            </div>
            <div>
              <div className="display-tight text-2xl text-foreground md:text-3xl">8</div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-foreground/30">Soins Experts</div>
            </div>
            <div>
              <div className="display-tight text-2xl text-foreground md:text-3xl">100%</div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-foreground/30">Sur-Mesure</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
