"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { LandingVariant } from "./types";

export default function Footer({ variant = "default" }: { variant?: LandingVariant }) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const headingClassName = "landing-type-micro text-white/30";
  const bodyClassName = "landing-type-body-s leading-[1.35] text-white/70";
  const rowGridClassName = "grid gap-y-2 pt-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await addDoc(collection(db, "newsletter_subscribers"), {
        email: email.toLowerCase().trim(),
        createdAt: serverTimestamp(),
        source: "landing_page_footer_serenity_v2"
      });
      setIsSubmitted(true);
      setEmail("");
    } catch (error) {
      console.error("Error saving email:", error);
      setIsSubmitted(true);
    }
  };

  return (
    <footer className="w-full text-white font-sans">
      <div className="w-full bg-[#0a1f1a] px-6 py-12 md:px-10 md:py-14 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-10 grid grid-cols-1 gap-8 text-left md:grid-cols-2 md:gap-x-10 md:gap-y-12 xl:grid-cols-[1.2fr_0.95fr_1fr_1.1fr_1.2fr]">
            <div className="max-w-[15rem]">
              <div className="space-y-3">
                <div className="landing-type-h4 text-[var(--off-white)]">SRT</div>
                <div className="landing-type-micro text-white/30">SÉRÉNITÉ & ÉQUILIBRE</div>
              </div>
            </div>

            <div className="max-w-[14rem]">
              <div className="space-y-6">
                <div className={headingClassName}>Contact</div>
                <div className={`${rowGridClassName} ${bodyClassName}`}>
                  <a href="tel:+41220000000" className="transition-colors hover:text-emerald-200">+41 22 000 00 00</a>
                  <a href="mailto:hello@serenityrelax.ch" className="transition-colors hover:text-emerald-200">hello@serenityrelax.ch</a>
                </div>
              </div>
            </div>

            <div className="max-w-[15rem]">
              <div className="space-y-6">
                <div className={headingClassName}>Le Cabinet</div>
                <a
                  href="https://maps.google.com/?q=Chemin+de+Joinville+26+1216+Cointrin+Genève"
                  target="_blank"
                  className={`${rowGridClassName} ${bodyClassName} hover:text-emerald-200`}
                >
                  <span>Chemin de Joinville 26</span>
                  <span>1216 Cointrin, Genève</span>
                </a>
              </div>
            </div>

            <div className="w-full max-w-[22rem]">
              <div className="space-y-6">
                <div className={headingClassName}>Horaires</div>
                <div className="landing-type-body-s grid gap-y-2 pt-1 leading-[1.35] text-white/50">
                  <div className="flex items-baseline gap-3 whitespace-nowrap">
                    <span>Lun — Ven</span>
                    <span className="text-white/80">08:00 — 21:00</span>
                  </div>
                  <div className="flex items-baseline gap-3 whitespace-nowrap">
                    <span>Sam — Dim</span>
                    <span className="text-white/80">09:30 — 21:00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-[18rem] xl:justify-self-end xl:w-full">
              <div className="space-y-6">
                <div className={headingClassName}>Newsletter</div>
                {isSubmitted ? (
                  <div className="landing-type-eyebrow pt-1 text-[var(--neon)]">
                    Inscription confirmée. Merci.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className={rowGridClassName}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Entrer votre e-mail"
                      required
                      className="landing-type-body-s landing-input-inverse landing-placeholder-inverse-soft h-auto w-full bg-transparent py-0 leading-[1.35] transition-all duration-300"
                    />
                    <button
                      type="submit"
                      className="landing-type-body-s self-start text-left leading-[1.35] text-[var(--neon)] transition-colors hover:text-[var(--off-white)]"
                    >
                      Recevoir les nouvelles →
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 md:flex-row md:items-center">
            <div className="landing-type-micro text-white/20">
              &copy; 2024 SERENITY RELAX THERAPY.
            </div>
            <div className="landing-type-micro flex gap-6 text-white/30">
              <a href="#" className="transition-colors hover:text-white">Confidentialité</a>
              <a href="#" className="transition-colors hover:text-white">Mentions Légales</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
