"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { FAQ } from "@/components/landing/serenity2/data";

export default function Atelier() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="atelier" className="relative py-24 md:py-32 lg:py-36">
      <div className="relative mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
        <header className="mb-16 grid grid-cols-12 gap-6 lg:mb-20">
          <div className="col-span-12 lg:col-span-7">
            <span className="mono-caption text-[var(--sage-deep)]">— Questions fréquentes</span>
            <h2 className="mt-6 display-tight text-4xl text-foreground md:text-6xl lg:text-7xl leading-[0.95]">
              Tout ce qu'il faut savoir <em>avant la première séance.</em>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-8">
            <p className="text-base leading-[1.65] text-foreground/65 md:text-lg">
              Une question qui n'est pas listée ? Contactez-nous directement,
              nous y répondons sous 24 heures.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <div className="space-y-3">
              {FAQ.map((item, idx) => {
                const isOpen = openIdx === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-colors duration-300 ${
                      isOpen
                        ? "bg-foreground/[0.03] border-foreground/15"
                        : "bg-foreground/[0.02] border-foreground/8 hover:border-foreground/15"
                    }`}
                  >
                    <button
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-6 p-6 text-left md:p-7"
                    >
                      <div className="flex items-center gap-5">
                        <span className="text-xs font-semibold tracking-wide text-foreground/40">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-lg font-medium tracking-tight text-foreground md:text-xl">
                          {item.q}
                        </span>
                      </div>
                      <div className={`flex-shrink-0 rounded-full bg-foreground/5 p-2 transition-all duration-500 ${isOpen ? "bg-[var(--sage-deep)] rotate-45" : ""}`}>
                        <Plus
                          size={16}
                          strokeWidth={2}
                          className={isOpen ? "text-background" : "text-foreground/60"}
                        />
                      </div>
                    </button>
                    <div
                      className={`grid transition-all duration-500 ease-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-7 ml-12 max-w-3xl text-base leading-[1.65] text-foreground/70 md:px-7">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
