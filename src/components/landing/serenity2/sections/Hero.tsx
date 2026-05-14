import { ArrowDownRight } from "lucide-react";

import { useBooking } from "@/context/BookingContext";

export default function Hero() {
  const { openModal } = useBooking();

  return (
    <section id="top" className="relative overflow-hidden pt-24 pb-16 md:pt-30 md:pb-20 lg:pt-32">
      <div className="relative mx-auto grid max-w-[1280px] grid-cols-12 items-center gap-10 px-6 md:px-10 lg:gap-14 lg:px-12">
        
        {/* Left column: The Action Collage */}
        <div className="col-span-12 lg:col-span-4 lg:col-start-1">
          <div className="relative mx-auto max-w-[420px] lg:max-w-[390px]">
            <div className="absolute -top-12 -left-12 pointer-events-none select-none hidden lg:block opacity-[0.03]">
              <span className="display-tight text-[9rem] leading-none font-bold">
                JOÃO
              </span>
            </div>
            
            <div className="relative z-10 aspect-[3/4] max-h-[620px] overflow-hidden rounded-[2.2rem] border border-[#dbcab5]/65 bg-foreground/5 shadow-[0_22px_48px_rgba(48,31,16,0.12)]">
              <img
                src="/images/joao-collage.png"
                alt="L'expertise du geste par João"
                className="h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Right text column: The Narrative */}
        <div className="col-span-12 lg:col-span-7 lg:col-start-6 editorial-rise">
          <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-[#ddcdb9] bg-white/55 px-4 py-2 transition-colors hover:bg-white/75">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--orange)] opacity-40" />
              <span className="relative h-2 w-2 rounded-full bg-[var(--orange)]" />
            </span>
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-foreground/48">Massothérapie thérapeutique · Genève</span>
          </div>

          <h1 className="display-tight mb-8 text-[3rem] leading-[0.88] -tracking-[0.03em] text-foreground md:text-[4.7rem] lg:text-[5.2rem]">
            João. <br />
            <span className="font-serif italic font-light opacity-90">Le soin juste, pour votre corps.</span>
          </h1>

          <div className="mb-10 max-w-xl space-y-5">
            <p className="text-[16px] leading-relaxed tracking-tight text-foreground/88 md:text-[17px]">
              Des massages thérapeutiques pensés pour soulager les tensions, relancer la récupération et ramener le corps vers un équilibre durable.
            </p>
            <p className="text-[15px] leading-relaxed text-foreground/65 md:text-base">
              Chaque séance est ajustée à votre état du moment, avec une approche précise, calme et entièrement sur-mesure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <button
              onClick={() => openModal(null)}
              className="group relative inline-flex h-12 items-center gap-3 rounded-full bg-[var(--teal-deep)] px-8 text-background transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_16px_34px_rgba(21,56,57,0.16)]"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Réserver un soin</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background/20 transition-transform duration-500 group-hover:rotate-45">
                <ArrowDownRight size={14} strokeWidth={3} className="text-background" />
              </div>
            </button>
            <a
              href="#sessions"
              className="group text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/40 transition-colors duration-300 hover:text-foreground"
            >
              Découvrir les soins <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>

          <div className="mt-12 flex gap-7 border-t border-[#ddcdb9] pt-7 md:gap-10">
            <div>
              <div className="display-tight text-xl text-foreground italic font-serif md:text-2xl">Genève</div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-foreground/30">Cabinet à Cointrin</div>
            </div>
            <div>
              <div className="display-tight text-xl text-foreground md:text-2xl">8</div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-foreground/30">Soins ciblés</div>
            </div>
            <div>
              <div className="display-tight text-xl text-foreground md:text-2xl">100%</div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-foreground/30">Adapté à votre corps</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
