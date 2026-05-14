"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FAQ } from "@/components/landing/serenity2/data";

export default function Atelier() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      id="atelier"
      className="relative py-20 text-[var(--off-black)] md:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-12 gap-10 lg:gap-14">
          <div className="col-span-12 lg:col-span-7">
            <div className="mb-8 border-b border-[#d9c8b4] pb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#6f6459]">
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
                    className="border-b border-[#d9c8b4] py-6 md:py-7"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      className="group grid w-full grid-cols-[56px_1fr_36px] items-start gap-4 text-left md:grid-cols-[72px_1fr_44px] md:gap-6"
                      aria-expanded={isOpen}
                    >
                      <span className="font-serif text-[1.85rem] italic leading-none text-[var(--orange)]/82 md:text-[2.2rem]">
                        {number}
                      </span>
                      <span>
                        <span className="block text-[1.35rem] leading-[1.04] tracking-tight text-[var(--off-black)] transition-colors duration-300 group-hover:text-[#8d5a34] md:text-[1.65rem]">
                          {item.q}
                        </span>
                      </span>
                      <span className="flex justify-end pt-1">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#d9c8b4] bg-white/60 text-[#6f6459] transition-all duration-300 ${
                            isOpen
                              ? "rotate-45 border-[var(--orange)]/30 bg-[var(--orange)]/10 text-[var(--orange)]"
                              : "group-hover:border-[#cdb79f] group-hover:bg-white/80"
                          }`}
                        >
                          <Plus size={16} strokeWidth={1.8} />
                        </span>
                      </span>
                    </button>

                    {isOpen ? (
                      <div className="grid grid-cols-1 gap-4 pt-5 md:grid-cols-[72px_1fr] md:gap-6">
                        <div />
                        <p className="max-w-2xl text-sm leading-relaxed text-[#6f6459] md:text-[15px]">
                          {item.a}
                        </p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <span className="mb-6 block text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--orange)]">
              — Questions fréquentes
            </span>
            <h2 className="display-tight text-3xl leading-[0.94] -tracking-[0.02em] md:text-5xl lg:text-[4.8rem]">
              Tout ce qu&apos;il faut savoir
              <br />
              <span className="font-serif italic font-light text-[#8b8176]">
                avant la séance.
              </span>
            </h2>
            <p className="mt-7 max-w-md text-[15px] leading-relaxed text-[#6f6459] md:text-base">
              Quelques repères simples pour arriver sereinement au cabinet, comprendre le déroulé du soin et savoir à quoi vous attendre.
            </p>
            <div className="mt-8 max-w-sm border-t border-[#d9c8b4] pt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--orange)]">
                Besoin d&apos;un échange direct ?
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#6f6459] md:text-[15px]">
                Si votre question concerne un besoin précis, le plus simple reste d&apos;écrire avant de réserver.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
