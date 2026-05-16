"use client";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Hero from "./sections/Hero";
import Sessions from "./sections/Sessions";
import About from "./sections/About";
import Atelier from "./sections/Atelier";
import AIConciergeOverlay from "./AIConciergeOverlay";
import { LandingVariant } from "./types";

const VARIANT_LABELS: Record<LandingVariant, string> = {
  default: "Signature",
  immersive: "Immersive",
  alpine: "Alpine Clinic",
  cocoon: "Sensual Cocoon",
  editorial: "Editorial",
  concierge: "Concierge",
  kinetic: "Kinetic Flow",
  zen: "Zen Brutalist",
  ephemeral: "Ephemeral Light",
  heritage: "Heritage",
  nocturnal: "Nocturnal",
  bento: "Bento Grid",
};

export default function Home({ variant = "default" }: { variant?: LandingVariant }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [showAiHint, setShowAiHint] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setShowAiHint(true), 3000);
    const hideTimer = window.setTimeout(() => setShowAiHint(false), 11000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div
      className="landing-v2 landing-text-high min-h-screen"
      data-variant={variant}
      style={{ background: "var(--landing-page-bg)" }}
    >
      <Navbar />
      <main>
        <Hero variant={variant} />
        {variant !== "default" ? (
          <div className="mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12">
            <div className="flex justify-end pb-2">
              <span className="landing-border-soft landing-bg-surface-soft landing-text-faint landing-type-micro rounded-full border px-3 py-1 backdrop-blur-sm">
                Variant · {VARIANT_LABELS[variant]}
              </span>
            </div>
          </div>
        ) : null}
        <div className="mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12">
          <div className="h-px bg-[var(--landing-tint)]" />
        </div>
        <About />
        <div className="mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12">
          <div className="h-px bg-[var(--landing-tint)]" />
        </div>
        <Sessions variant={variant} />
        <div className="mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12">
          <div className="h-px bg-[var(--landing-tint)]" />
        </div>
        <Atelier variant={variant} />
      </main>
      <Footer variant={variant} />
      <AIConciergeOverlay open={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Floating AI Concierge Button */}
      {showAiHint && !aiOpen && (
        <div className="fixed bottom-24 right-4 z-50 hidden max-w-[280px] rounded-2xl border border-[rgba(21,56,57,0.14)] bg-white/95 p-4 text-[13px] leading-relaxed text-[var(--off-black)] shadow-xl backdrop-blur-sm md:right-8 md:block">
          <p className="font-semibold">Besoin d&apos;être guidé ?</p>
          <p className="mt-1 text-[rgba(21,56,57,0.8)]">
            Cliquez sur le chatbot, décrivez votre état en quelques mots et je vous recommande le soin idéal.
          </p>
        </div>
      )}
      <button
        onClick={() => {
          setShowAiHint(false);
          setAiOpen(true);
        }}
        className="group fixed bottom-8 right-8 z-50 hidden items-center gap-3 rounded-full bg-[var(--periwinkle)] px-5 py-4 text-[var(--off-black)] shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-[var(--teal-deep)] hover:text-[var(--neon)] md:flex"
      >
        <div className="flex -space-x-1">
          <span className="relative flex h-3 w-3">
            <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-75" />
            <span className="relative h-3 w-3 rounded-full bg-white" />
          </span>
        </div>
        <span className="text-sm font-bold tracking-tight">IA Concierge</span>
      </button>
    </div>
  );
}
