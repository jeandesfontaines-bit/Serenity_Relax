"use client";
import { useState } from "react";
import { Instagram, Mail, ArrowUpRight, Check } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { LandingVariant } from "./types";

export default function Footer({ variant = "default" }: { variant?: LandingVariant }) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await addDoc(collection(db, "newsletter_subscribers"), {
        email: email.toLowerCase().trim(),
        createdAt: serverTimestamp(),
        source: "landing_page_footer"
      });
      setIsSubmitted(true);
      setEmail("");
    } catch (error) {
      console.error("Error saving email:", error);
      setIsSubmitted(true);
    }
  };

  const bandClassName =
    variant === "immersive"
      ? "bg-[linear-gradient(135deg,rgba(14,33,34,0.98),rgba(21,56,57,0.92),rgba(39,94,106,0.9))]"
      : variant === "editorial"
        ? "bg-[linear-gradient(135deg,rgba(24,35,38,0.96),rgba(33,54,60,0.9))]"
        : variant === "concierge" || variant === "default"
          ? "bg-[linear-gradient(135deg,rgba(21,56,57,0.96),rgba(39,94,106,0.88),rgba(241,102,77,0.3))]"
          : "bg-[linear-gradient(135deg,rgba(21,56,57,0.96),rgba(39,94,106,0.88))]";

  return (
    <footer className="landing-bg-inverse landing-text-inverse">
      {/* CTA + Newsletter band */}
      <div className={`border-b border-white/10 ${bandClassName} shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)]`}>
        <div className="mx-auto max-w-[1360px] px-6 py-14 md:px-10 md:py-18 lg:px-12 lg:py-20">
          <div className="grid grid-cols-12 gap-8 lg:items-start lg:gap-12">
            <div className="col-span-12 lg:col-span-5">
              <span className="landing-type-eyebrow text-[var(--neon)]">— Restons connectés</span>
              <h3 className="landing-type-h2 landing-text-inverse mt-5 max-w-[10.8ch] display-tight">
                Recevez les nouveautés <em className="!text-[var(--neon)]">du cabinet.</em>
              </h3>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-6 lg:pt-2">
              {isSubmitted ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[2rem] border-t border-white/12 pt-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--neon)] text-[var(--off-black)]">
                      <Check size={20} strokeWidth={3} />
                    </div>
                    <p className="text-sm font-bold tracking-tight text-[var(--neon)]">Merci ! Vous êtes désormais inscrit.</p>
                  </div>
                </div>
              ) : (
                <div className="border-t border-white/12 pt-5">
                  <p className="landing-type-micro text-white/38">
                    Newsletter du cabinet
                  </p>
                  <form onSubmit={handleSubmit} className="mt-5">
                    <div className="flex flex-col gap-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre.email@exemple.ch"
                        className="h-14 rounded-full border border-white/14 bg-white px-7 text-base text-[var(--off-black)] placeholder:text-[var(--landing-warm-muted)] outline-none transition-all duration-300 focus:border-[var(--neon)]/55 focus:bg-white md:h-16"
                        required
                      />
                      <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
                        <button
                          type="submit"
                          className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--neon)] px-7 text-sm font-bold tracking-tight text-[var(--off-black)] transition-all duration-300 hover:translate-y-[-1px] hover:bg-[var(--landing-cta-hover)] md:w-auto md:min-w-[176px] md:px-8"
                        >
                          S'inscrire
                          <ArrowUpRight size={15} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                        <p className="landing-type-small max-w-[34rem] text-white/42">
                          En vous inscrivant, vous acceptez notre politique de confidentialité.
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-[1360px] px-6 py-16 md:px-10 lg:px-12 md:py-20">
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-12 lg:col-span-3">
            <div className="flex items-end gap-3">
              <span className="landing-type-h5 landing-text-inverse tracking-[0.08em]">SRT</span>
              <span className="signature-font landing-text-inverse-soft text-[1.7rem] leading-none">by João</span>
            </div>

            {/* Social */}
            <div className="mt-8 flex gap-3">
              <a 
                href="https://www.instagram.com/serenity.relax.therapy_by_joao" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram" 
                className="rounded-full bg-white/5 p-3 transition-all duration-300 hover:bg-[var(--neon)] hover:text-[var(--off-black)]"
              >
                <Instagram size={16} strokeWidth={1.75} />
              </a>
              <a href="mailto:hello@serenityrelax.ch" aria-label="Email" className="rounded-full bg-white/5 p-3 transition-all duration-300 hover:bg-[var(--neon)] hover:text-[var(--off-black)]">
                <Mail size={16} strokeWidth={1.75} />
              </a>
            </div>
          </div>

          {/* Coordonnées du cabinet */}
          <div className="col-span-12 lg:col-span-9 grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1.2fr] xl:gap-14">
            <div className="min-w-0">
              <p className="landing-type-caption text-[var(--neon)]">Cabinet</p>
              <p className="landing-type-body mt-5 text-white/86">
                Chemin de Joinville 26<br />
                4ème étage<br />
                1216 Cointrin – Genève
              </p>
            </div>

            <div className="min-w-0">
              <p className="landing-type-caption text-[var(--neon)]">Horaires</p>
              <p className="landing-type-body mt-5 text-white/86">
                Lun — Ven · 8h00 — 21h00<br />
                Sam — Dim · 9h30 — 21h00<br />
                <span className="landing-type-micro text-white/44">Sur rendez-vous</span>
              </p>
            </div>

            <div className="min-w-0">
              <p className="landing-type-caption text-[var(--neon)]">Contact</p>
              <div className="landing-type-body mt-5 text-white/86">
                <p>+41 22 000 00 00</p>
                <a href="mailto:hello@serenityrelax.ch" className="break-words text-white/76 transition-colors duration-300 hover:text-[var(--neon)] editorial-link">
                  hello@serenityrelax.ch
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="landing-text-inverse-faint text-xs tracking-wide">© 2026 SERENITY RELAX THERAPY by João · Tous droits réservés</p>
          <div className="flex flex-wrap gap-6">
            <a href="#" className="landing-text-inverse-faint text-xs tracking-wide transition-colors duration-300 hover:text-white/80">Mentions légales</a>
            <a href="#" className="landing-text-inverse-faint text-xs tracking-wide transition-colors duration-300 hover:text-white/80">Confidentialité</a>
            <a href="#" className="landing-text-inverse-faint text-xs tracking-wide transition-colors duration-300 hover:text-white/80">CGV</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
