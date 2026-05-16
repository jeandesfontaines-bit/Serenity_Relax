"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FAQ } from "@/components/landing/serenity2/data";
import { LandingVariant } from "../types";

export default function Atelier({ variant = "default" }: { variant?: LandingVariant }) {
  const [openIndex, setOpenIndex] = useState(0);
  const useConciergeDesign = variant === "default" || variant === "concierge";

  return (
    <section
      id="atelier"
      className={[
        "landing-section",
        variant === "immersive" ? "overflow-hidden" : "",
      ].join(" ")}
    >
      {variant === "immersive" ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_24%,rgba(21,56,57,0.09),transparent_20%),radial-gradient(circle_at_12%_80%,rgba(241,102,77,0.08),transparent_18%)]" />
      ) : null}

      <div className="relative mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-12 gap-10 lg:gap-14">
          <div className={`col-span-12 ${variant === "editorial" ? "lg:col-span-8" : "lg:col-span-8"}`}>
            <div className="landing-section-header border-b border-[var(--landing-tint)] pb-8">
              <p className="landing-type-eyebrow text-[var(--landing-warm-faint)]">
                FAQ Serenity
              </p>
            </div>

            <div>
              {FAQ.map((item, index) => {
                const isOpen = openIndex === index;
                const number = String(index + 1).padStart(2, "0");

                return (
                  <article
                    key={item.q}
                    className={[
                      "border-b border-[var(--landing-tint)] py-5 md:py-6",
                      isOpen ? "bg-transparent" : "",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      className="group grid w-full grid-cols-[48px_1fr_36px] items-start gap-3 text-left md:grid-cols-[60px_1fr_40px] md:gap-5"
                      aria-expanded={isOpen}
                    >
                      <span className="landing-display-italic text-[1.45rem] leading-none text-[var(--orange)]/82 transition-colors duration-300 group-hover:text-[var(--orange)] md:text-[1.7rem]">
                        {number}
                      </span>
                      <div>
                        <h3 className="landing-type-h5 landing-text-high display-tight transition-colors duration-300 group-hover:text-[var(--landing-warm-hover-soft)]">
                          {item.q}
                        </h3>
                      </div>
                      <span
                        className={[
                          "landing-text-body mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--landing-tint)] transition-all duration-300 md:h-9 md:w-9",
                          isOpen
                            ? "rotate-45 border-[var(--orange)]/28 text-[var(--orange)]"
                            : "group-hover:border-[var(--orange)]/40 group-hover:text-[var(--orange)]",
                        ].join(" ")}
                      >
                        <Plus size={15} strokeWidth={2.2} />
                      </span>
                    </button>

                    {isOpen ? (
                      <div className="grid grid-cols-1 gap-3 pt-4 md:grid-cols-[60px_1fr] md:gap-5">
                        <div />
                        <div className="border-t border-[var(--landing-tint-soft)] pt-4">
                          <p className="landing-type-body-s landing-text-body max-w-[44ch]">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>

          <div className={`col-span-12 ${variant === "editorial" ? "lg:col-span-3 lg:col-start-10" : "lg:col-span-3 lg:col-start-10"}`}>
            <span className="landing-type-eyebrow mb-6 block text-[var(--orange)]">
              — Questions fréquentes
            </span>
            <h2 className="landing-type-h2 landing-text-high display-tight">
              <span className="font-serif tracking-[0.015em]">{variant === "concierge" ? "Ce qu'il faut savoir" : "Tout ce qu'il faut savoir"}</span>
              <br />
              <span className="landing-display-italic text-[0.75em] landing-text-muted">
                {variant === "immersive" ? "avant de décrocher." : "avant la séance."}
              </span>
            </h2>
            <p className="landing-type-body landing-text-body mt-8 max-w-[21rem]">
              {variant === "editorial"
                ? "Dans cette version, la colonne d'accompagnement agit presque comme une note d'éditeur, plus étroite, plus tendue, plus présente dans la composition."
                : variant === "concierge"
                  ? "Les réponses restent identiques, mais la structure assume davantage son rôle de réassurance pratique avant la prise de rendez-vous."
                  : variant === "immersive"
                    ? "Quelques repères simples pour arriver sereinement au cabinet, comprendre le déroulé du soin et savoir à quoi vous attendre."
                    : "Quelques repères simples pour arriver sereinement au cabinet, comprendre le déroulé du soin et savoir à quoi vous attendre."}
            </p>
            <div className="mt-12 max-w-[21rem] border-t border-[var(--landing-tint)] pt-10">
              <p className="landing-type-micro text-[var(--orange)]">
                Besoin d&apos;un échange direct ?
              </p>
              <p className="landing-type-body landing-text-body mt-4">
                Si votre question concerne un besoin précis, le plus simple reste d&apos;écrire avant de réserver.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
