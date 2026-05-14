"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Hero from "./sections/Hero";
import Sessions from "./sections/Sessions";
import Sanctuary from "./sections/Sanctuary";
import Atelier from "./sections/Atelier";
import BookingFunnel from "@/components/BookingFunnel";
import AIConciergeOverlay from "./AIConciergeOverlay";
import { useBooking } from "@/context/BookingContext";
import { SERVICES } from "./data";

function BookingQueryHandler() {
  const searchParams = useSearchParams();
  const { openModal, isModalOpen } = useBooking();

  useEffect(() => {
    const serviceId = searchParams.get("service");
    if (serviceId && !isModalOpen) {
      const service = SERVICES.find((s) => s.id === serviceId);
      if (service) {
        openModal(service);
        // Clear param without reload if possible, or just leave it
      }
    }
  }, [searchParams, openModal, isModalOpen]);

  return null;
}

export default function Home() {
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
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BookingQueryHandler />
      <div className="landing-v2 min-h-screen bg-[linear-gradient(180deg,#fbf8f2_0%,#f3eadf_100%)] text-foreground">
      <Navbar />
      <main>
        <Hero />
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-12">
          <div className="h-px bg-[#d9c8b4]" />
        </div>
        <Sanctuary />
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-12">
          <div className="h-px bg-[#dfcfbb]" />
        </div>
        <Sessions />
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-12">
          <div className="h-px bg-[#dfcfbb]" />
        </div>
        <Atelier />
      </main>
      <Footer />
      <BookingFunnel />
      <AIConciergeOverlay open={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Floating AI Concierge Button */}
      {showAiHint && !aiOpen && (
        <div className="fixed bottom-28 right-8 z-50 max-w-[280px] rounded-2xl border border-[var(--teal-deep)]/20 bg-white/95 p-4 text-[13px] leading-relaxed text-[var(--off-black)] shadow-xl backdrop-blur-sm">
          <p className="font-semibold">Besoin d&apos;être guidé ?</p>
          <p className="mt-1 text-[var(--teal-deep)]/80">
            Cliquez sur le chatbot, décrivez votre état en quelques mots et je vous recommande le soin idéal.
          </p>
        </div>
      )}
      <button
        onClick={() => {
          setShowAiHint(false);
          setAiOpen(true);
        }}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-full bg-[var(--periwinkle)] px-5 py-4 text-[var(--off-black)] shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-[var(--teal-deep)] hover:text-[var(--neon)] group"
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
    </Suspense>
  );
}
