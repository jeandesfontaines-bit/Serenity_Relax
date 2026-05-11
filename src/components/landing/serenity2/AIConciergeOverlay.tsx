"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-8 flex h-[calc(100vh-4rem)] w-[min(1100px,94vw)] flex-col overflow-hidden rounded-[28px] border border-white/20 bg-[#F6F2EA]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[var(--teal-deep)] p-2 text-[var(--neon)]"><Sparkles size={16} /></div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-foreground/45">IA Concierge</p>
                  <p className="text-sm font-semibold">Recommandation personnalisée</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-full border border-foreground/15 p-2 hover:bg-foreground/5"><X size={18} /></button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-5">
              <div className="col-span-3 flex min-h-0 flex-col border-r border-foreground/10">
                <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "assistant" ? "bg-[var(--teal-deep)] text-white" : "bg-white text-foreground border border-foreground/10"}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-foreground/60 border border-foreground/10">
                        <Loader2 size={14} className="animate-spin" /> Réflexion en cours…
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 border-t border-foreground/10 p-4">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ex: stress, nuque tendue, sommeil léger..."
                    className="flex-1 rounded-full border border-foreground/15 bg-white px-5 py-3 text-sm outline-none focus:border-foreground/30"
                  />
                  <button onClick={send} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--orange)] text-white hover:bg-[var(--teal-deep)]">
                    <Send size={16} />
                  </button>
                </div>
              </div>

              <div className="col-span-2 flex min-h-0 flex-col bg-white/55 p-6">
                {!selected ? (
                  <div className="m-auto text-center text-foreground/55">
                    <Bot size={28} className="mx-auto mb-3" />
                    <p className="text-sm">Parlez de votre besoin pour recevoir une recommandation.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Soin recommandé</p>
                    <h3 className="text-2xl font-semibold">{selected.name}</h3>
                    <p className="text-sm text-foreground/70">{selected.desc}</p>
                    <button
                      onClick={() => {
                        openModal(selected);
                        onClose();
                      }}
                      className="mt-4 w-full rounded-full bg-[var(--teal-deep)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--orange)]"
                    >
                      Réserver ce soin
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
