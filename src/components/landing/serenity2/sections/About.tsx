"use client";

import { useEffect, useRef, useState } from "react";

const BENEFITS = [
  {
    title: "Soulagement des douleurs",
    desc: "Apaise les tensions musculaires, réduit les raideurs et atténue les douleurs dorsales, cervicales ou articulaires.",
  },
  {
    title: "Souplesse et mobilité",
    desc: "Assouplit les muscles, améliore la posture et prévient les inconforts chroniques.",
  },
  {
    title: "Circulation et vitalité",
    desc: "Stimule la circulation sanguine et lymphatique, favorise l'élimination des toxines et accélère la récupération.",
  },
  {
    title: "Beauté et peau",
    desc: "Adoucit et revitalise la peau, tout en améliorant son aspect grâce aux mouvements de pétrissage.",
  },
  {
    title: "Respiration et énergie",
    desc: "Apaise le mental, approfondit la respiration et redonne énergie et équilibre.",
  },
  {
    title: "Bien-être émotionnel",
    desc: "Réduit le stress, favorise la relaxation profonde et procure une sensation durable d'harmonie.",
  },
];

export default function About() {
  const panelTrackRef = useRef<HTMLDivElement | null>(null);
  const lastBenefitRef = useRef<HTMLDivElement | null>(null);
  const [reserveSpace, setReserveSpace] = useState(0);

  useEffect(() => {
    const updateLayout = () => {
      if (window.innerWidth < 1024) {
        setReserveSpace(0);
        return;
      }

      const track = panelTrackRef.current;
      const lastBenefit = lastBenefitRef.current;
      if (!track || !lastBenefit) return;

      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      const lastTop = lastBenefit.getBoundingClientRect().top + window.scrollY;

      setReserveSpace(Math.max(0, lastTop - trackTop));
    };

    const observer = new ResizeObserver(() => updateLayout());

    if (panelTrackRef.current) observer.observe(panelTrackRef.current);
    if (lastBenefitRef.current) observer.observe(lastBenefitRef.current);

    updateLayout();
    window.addEventListener("resize", updateLayout);
    window.addEventListener("load", updateLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("load", updateLayout);
    };
  }, []);

  return (
    <section id="expertise" className="relative border-t border-foreground/5 bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
        {/* Section: Expertise & Benefits (Magazine Layout) */}
        <div className="relative">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-24">
            {/* Intro Column */}
            <div
              ref={panelTrackRef}
              className="lg:w-[32%] lg:flex-none"
              style={{ paddingBottom: reserveSpace ? `${reserveSpace}px` : undefined }}
            >
              <div className="lg:sticky lg:top-28">
                <span className="mb-6 block text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--orange)]">
                  — Expertise
                </span>
                <h2 className="display-tight mb-8 text-4xl leading-[0.95] text-foreground md:text-5xl lg:text-6xl">
                  Les bienfaits <br />
                  <span className="font-serif italic font-light opacity-40">sur votre corps.</span>
                </h2>
                <p className="mb-12 max-w-xl text-base leading-relaxed text-foreground/65 md:text-lg">
                  Le massage est bien plus qu&apos;un moment de détente : c&apos;est un soin complet qui favorise
                  l&apos;équilibre naturel de l&apos;organisme.
                </p>

                <div className="hidden lg:block">
                  <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[2.5rem] bg-[var(--sage-deep)]/5">
                    <img
                      src="/images/joao-hands.jpg"
                      alt="L'expertise du geste"
                      className="h-full w-full object-cover saturate-[0.8] contrast-[1.1] sepia-[0.1]"
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 italic">
                    — L&apos;expertise du geste
                  </span>
                </div>
              </div>
            </div>

            {/* List Column */}
            <div className="lg:flex-1">
              <div className="grid grid-cols-1 gap-y-14 lg:gap-y-16">
                {BENEFITS.map((benefit, idx) => (
                  <div
                    key={idx}
                    ref={idx === BENEFITS.length - 1 ? lastBenefitRef : undefined}
                    className="group flex items-start gap-8 md:gap-12"
                  >
                    <span className="shrink-0 pt-2 text-2xl font-serif italic text-foreground/10 transition-colors duration-500 group-hover:text-[var(--orange)] md:text-3xl">
                      0{idx + 1}.
                    </span>
                    <div className="space-y-4">
                      <h4 className="display-tight text-2xl text-foreground transition-transform duration-500 group-hover:translate-x-2 md:text-3xl">
                        {benefit.title}
                      </h4>
                      <p className="text-base leading-relaxed text-foreground/55 transition-colors group-hover:text-foreground/70 md:text-lg">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
