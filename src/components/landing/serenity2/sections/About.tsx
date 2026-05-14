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
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastBenefitRef = useRef<HTMLDivElement | null>(null);
  const [panelLayout, setPanelLayout] = useState<{
    mode: "static" | "fixed" | "bottom";
    reserveSpace: number;
    panelHeight: number;
    left: number;
    width: number;
  }>({
    mode: "static",
    reserveSpace: 0,
    panelHeight: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    let frame = 0;

    const updateLayout = () => {
      frame = 0;

      if (window.innerWidth < 1024) {
        setPanelLayout({
          mode: "static",
          reserveSpace: 0,
          panelHeight: 0,
          left: 0,
          width: 0,
        });
        return;
      }

      const track = panelTrackRef.current;
      const panel = panelRef.current;
      const lastBenefit = lastBenefitRef.current;
      if (!track || !panel || !lastBenefit) return;

      const topOffset = 112;
      const scrollY = window.scrollY;
      const trackRect = track.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const trackTop = trackRect.top + scrollY;
      const lastTop = lastBenefit.getBoundingClientRect().top + window.scrollY;
      const reserveSpace = Math.max(0, lastTop - trackTop);
      const start = trackTop - topOffset;
      const end = trackTop + reserveSpace - topOffset;

      let mode: "static" | "fixed" | "bottom" = "static";
      if (scrollY >= start && scrollY < end) {
        mode = "fixed";
      } else if (scrollY >= end) {
        mode = "bottom";
      }

      setPanelLayout((prev) => {
        const next = {
          mode,
          reserveSpace,
          panelHeight: panelRect.height,
          left: trackRect.left,
          width: trackRect.width,
        };

        if (
          prev.mode === next.mode &&
          Math.abs(prev.reserveSpace - next.reserveSpace) < 1 &&
          Math.abs(prev.panelHeight - next.panelHeight) < 1 &&
          Math.abs(prev.left - next.left) < 1 &&
          Math.abs(prev.width - next.width) < 1
        ) {
          return prev;
        }

        return next;
      });
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateLayout);
    };

    const observer = new ResizeObserver(() => updateLayout());

    if (panelTrackRef.current) observer.observe(panelTrackRef.current);
    if (panelRef.current) observer.observe(panelRef.current);
    if (lastBenefitRef.current) observer.observe(lastBenefitRef.current);

    updateLayout();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("load", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("load", requestUpdate);
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
              style={
                panelLayout.panelHeight
                  ? { height: panelLayout.panelHeight + panelLayout.reserveSpace }
                  : undefined
              }
            >
              <div
                ref={panelRef}
                className="lg:will-change-transform"
                style={
                  panelLayout.mode === "fixed"
                    ? {
                        position: "fixed",
                        top: 112,
                        left: panelLayout.left,
                        width: panelLayout.width,
                      }
                    : panelLayout.mode === "bottom"
                      ? {
                          position: "absolute",
                          top: panelLayout.reserveSpace,
                          left: 0,
                          width: "100%",
                        }
                      : undefined
                }
              >
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
