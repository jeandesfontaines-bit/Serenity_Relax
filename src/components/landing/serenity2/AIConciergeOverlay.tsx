"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { recommendMassageService } from "@/ai/flows/ai-service-recommender";
import { SERVICES } from "./data";
import { useBooking } from "@/context/BookingContext";

export default function AIConciergeOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openModal } = useBooking();
  const [messages, setMessages] = useState<{ role: "assistant" | "user"; text: string }[]>([
    {
      role: "assistant",
      text: "Bienvenue. Décrivez comment vous vous sentez aujourd'hui et je vous recommande le meilleur soin.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const send = async () => {
    if (!input.trim() || isTyping) return;
    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsTyping(true);

    try {
      const catalog = SERVICES.map((s) => ({
        name: s.name,
        description: s.desc,
        duration: s.duration,
        price: `${s.price} CHF`,
      }));

      const res = await recommendMassageService({
        clientDescription: userText,
        serviceCatalog: catalog,
      });

      const picked = SERVICES.find((s) => s.name === res.recommendedServiceName) ?? SERVICES[0];
      setServiceId(picked.id);
      setMessages((prev) => [...prev, { role: "assistant", text: res.reasoning }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Je n'ai pas pu répondre maintenant. Réessayez dans un instant." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const selected = serviceId ? SERVICES.find((s) => s.id === serviceId) : null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-28 right-8 z-[120] flex h-[min(72vh,620px)] w-[min(92vw,390px)] flex-col overflow-hidden rounded-[24px] border border-[#153839]/22 bg-white/96 shadow-[0_24px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-[#153839]/12 bg-[linear-gradient(135deg,#153839,#275E6A)] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/12 p-2 text-[var(--neon)]"><Sparkles size={14} /></div>
              <div>
                <p className="landing-type-micro text-white/70">IA Concierge</p>
                <p className="text-sm font-semibold text-white">Assistant bien-être</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full border border-white/25 p-2 text-white hover:bg-white/10"><X size={16} /></button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col bg-[var(--landing-panel)]">
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${m.role === "assistant" ? "bg-[var(--teal-deep)] text-white shadow-[0_10px_24px_rgba(21,56,57,0.12)]" : "bg-white landing-text-high border border-[#153839]/10 shadow-[0_10px_24px_rgba(21,32,35,0.04)]"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="landing-text-body inline-flex items-center gap-2 rounded-2xl border border-[#153839]/10 bg-white px-3.5 py-2.5 text-[13px] shadow-[0_10px_24px_rgba(21,32,35,0.04)]">
                    <Loader2 size={13} className="animate-spin" /> Réflexion...
                  </div>
                </div>
              )}
            </div>

            {selected ? (
              <div className="border-t border-[#153839]/10 bg-white px-4 py-3">
                <p className="landing-type-micro text-emerald-600">Soin recommandé</p>
                <p className="mt-1 text-sm font-semibold">{selected.name}</p>
                <button
                  onClick={() => {
                    openModal(selected);
                    onClose();
                  }}
                  className="mt-2 w-full rounded-full bg-[var(--teal-deep)] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_12px_26px_rgba(21,56,57,0.16)] transition-colors duration-300 hover:bg-[var(--orange)]"
                >
                  Réserver ce soin
                </button>
              </div>
            ) : null}

            <div className="flex items-center gap-2 border-t border-[#153839]/10 bg-white p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ex: stress, nuque tendue..."
                className="flex-1 rounded-full border border-[#153839]/14 bg-[var(--landing-panel-input)] px-4 py-2.5 text-[13px] outline-none transition-colors duration-300 focus:border-[#153839]/35"
              />
              <button onClick={send} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--orange)] text-white shadow-[0_10px_22px_rgba(241,102,77,0.18)] transition-colors duration-300 hover:bg-[var(--teal-deep)]">
                <Send size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
