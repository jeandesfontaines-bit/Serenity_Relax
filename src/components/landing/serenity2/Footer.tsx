"use client";
import { useState } from "react";
import { Instagram, Linkedin, Mail, MapPin, Clock, Phone, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmail("");
  };

  return (
    <footer className="bg-[var(--off-black)] text-background">
      {/* CTA + Newsletter band */}
      <div className="border-b border-background/10">
        <div className="mx-auto max-w-[1480px] px-6 py-16 md:px-10 lg:px-14 md:py-20">
          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            <div className="col-span-12 lg:col-span-7">
              <span className="mono-caption text-[var(--neon)]">— Restons connectés</span>
              <h3 className="mt-5 display-tight text-4xl text-background md:text-5xl lg:text-6xl">
                Recevez les nouveautés <em className="!text-[var(--neon)]">du cabinet.</em>
              </h3>
              <p className="mt-5 max-w-xl text-base leading-[1.6] text-background/70">
                Une fois par mois : nouveaux soins, créneaux ouverts, conseils de
                récupération. Aucun spam, désinscription en un clic.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:pt-12">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.ch"
                  className="flex-1 rounded-full bg-background/5 border border-background/15 px-5 py-3.5 text-sm text-background placeholder:text-background/40 focus:outline-none focus:border-background/40 transition-colors duration-300"
                  required
                />
                <button
                  type="submit"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--neon)] px-6 py-3.5 text-sm font-bold tracking-tight text-[var(--off-black)] transition-all duration-300 hover:bg-white"
                >
                  S'inscrire
                  <ArrowUpRight size={15} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </form>
              <p className="mt-3 text-xs tracking-wide text-background/40">
                En vous inscrivant, vous acceptez notre politique de confidentialité.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-[1480px] px-6 py-16 md:px-10 lg:px-14 md:py-20">
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-12 md:col-span-5">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold tracking-tight text-background">Serenity Relax</span>
              <span className="text-sm tracking-wide text-background/60">— by João</span>
            </div>
            <p className="mt-5 max-w-md text-lg leading-[1.5] text-background/85 md:text-xl">
              Massothérapie thérapeutique pensée pour les corps actifs. Genève, depuis 2014.
            </p>

            {/* Social */}
            <div className="mt-8 flex gap-3">
              <a href="#" aria-label="Instagram" className="rounded-full bg-background/5 p-3 transition-all duration-300 hover:bg-[var(--neon)] hover:text-[var(--off-black)]">
                <Instagram size={16} strokeWidth={1.75} />
              </a>
              <a href="#" aria-label="LinkedIn" className="rounded-full bg-background/5 p-3 transition-all duration-300 hover:bg-[var(--neon)] hover:text-[var(--off-black)]">
                <Linkedin size={16} strokeWidth={1.75} />
              </a>
              <a href="mailto:hello@serenityrelax.ch" aria-label="Email" className="rounded-full bg-background/5 p-3 transition-all duration-300 hover:bg-[var(--neon)] hover:text-[var(--off-black)]">
                <Mail size={16} strokeWidth={1.75} />
              </a>
            </div>
          </div>

          {/* Coordonnées du cabinet */}
          <div className="col-span-12 md:col-span-7 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <p className="mono-caption text-[var(--neon)]">Cabinet</p>
              <div className="mt-4 flex items-start gap-3">
                <MapPin size={15} strokeWidth={1.75} className="mt-0.5 flex-shrink-0 text-background/40" />
                <p className="text-sm leading-[1.6] text-background/85">
                  Rue du Rhône 12<br />
                  1204 Genève<br />
                  Suisse
                </p>
              </div>
            </div>

            <div>
              <p className="mono-caption text-[var(--neon)]">Horaires</p>
              <div className="mt-4 flex items-start gap-3">
                <Clock size={15} strokeWidth={1.75} className="mt-0.5 flex-shrink-0 text-background/40" />
                <p className="text-sm leading-[1.6] text-background/85">
                  Lun — Ven<br />
                  09h00 — 19h00<br />
                  Sam · 10h00 — 17h00
                </p>
              </div>
            </div>

            <div>
              <p className="mono-caption text-[var(--neon)]">Contact</p>
              <div className="mt-4 flex items-start gap-3">
                <Phone size={15} strokeWidth={1.75} className="mt-0.5 flex-shrink-0 text-background/40" />
                <div className="text-sm leading-[1.6] text-background/85">
                  <p>+41 22 000 00 00</p>
                  <a href="mailto:hello@serenityrelax.ch" className="text-background/70 hover:text-[var(--neon)] transition-colors duration-300 editorial-link">
                    hello@serenityrelax.ch
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="mt-16 flex flex-wrap gap-x-8 gap-y-4 border-t border-background/10 pt-8">
          <a href="#sessions" className="text-sm tracking-tight text-background/70 hover:text-background transition-colors duration-300 editorial-link">Sessions</a>
          <a href="#sanctuary" className="text-sm tracking-tight text-background/70 hover:text-background transition-colors duration-300 editorial-link">Sanctuaire</a>
          <a href="#journal" className="text-sm tracking-tight text-background/70 hover:text-background transition-colors duration-300 editorial-link">Journal</a>
          <a href="#atelier" className="text-sm tracking-tight text-background/70 hover:text-background transition-colors duration-300 editorial-link">FAQ</a>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-4 border-t border-background/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs tracking-wide text-background/40">© 2026 Serenity Relax Therapy · Tous droits réservés</p>
          <div className="flex flex-wrap gap-6">
            <a href="#" className="text-xs tracking-wide text-background/40 hover:text-background/80 transition-colors duration-300">Mentions légales</a>
            <a href="#" className="text-xs tracking-wide text-background/40 hover:text-background/80 transition-colors duration-300">Confidentialité</a>
            <a href="#" className="text-xs tracking-wide text-background/40 hover:text-background/80 transition-colors duration-300">CGV</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
