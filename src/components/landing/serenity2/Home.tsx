"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Hero from "./sections/Hero";
import Sessions from "./sections/Sessions";
import Sanctuary from "./sections/Sanctuary";
import Journal from "./sections/Journal";
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
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BookingQueryHandler />
      <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
          <div className="hairline" />
        </div>
        <Sessions />
        <Sanctuary />
        <Journal />
        <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
          <div className="hairline" />
        </div>
        <Atelier />
      </main>
      <Footer />
      <BookingFunnel />
      <AIConciergeOverlay open={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Floating AI Concierge Button */}
      <button
        onClick={() => setAiOpen(true)}
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
