"use client";
import { useState } from "react";
import { AFTERCARE, JOURNAL_IMAGE } from "@/components/landing/serenity2/data";

export default function Journal() {
  const [active, setActive] = useState(0);
  const item = AFTERCARE[active];

  return (
    <section id="journal" className="relative py-24 md:py-32 lg:py-36">
      <div className="relative mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
        <header className="mb-16 grid grid-cols-12 gap-6 lg:mb-20">
          <div className="col-span-12 lg:col-span-7">
            <span className="mono-caption text-[var(--sage-deep)]">— Le journal du corps</span>
            <h2 className="mt-6 display-tight text-5xl text-foreground md:text-6xl lg:text-7xl">
              Le rituel continue <em>après la séance.</em>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-8">
            <p className="text-base leading-[1.6] text-foreground/65">
              Trois moments clés pour prolonger les bénéfices du soin.
              Sélectionnez une étape ci-dessous.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          <div className="col-span-12 lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <img
                src={JOURNAL_IMAGE}
                alt="Rituel après-séance"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Modern step pills */}
            <div className="mt-6 flex gap-2">
              {AFTERCARE.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setActive(idx)}
                  className={`flex-1 rounded-full py-3 text-xs font-semibold tracking-wide transition-all duration-300 ${
                    active === idx
                      ? "bg-foreground text-background"
                      : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
                  }`}
                >
                  Étape {step.id}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-8">
            <div key={item.id} className="editorial-rise">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--sage-deep)]/10 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--sage-deep)]" />
                <span className="text-xs font-semibold tracking-wide text-[var(--sage-deep)]">{item.time}</span>
              </div>

              <h3 className="mt-6 display-tight text-4xl text-foreground md:text-5xl lg:text-6xl">
                {item.title}
              </h3>

              <p className="mt-6 text-lg leading-[1.6] text-foreground/75">
                {item.desc}
              </p>

              <div className="mt-10 rounded-2xl bg-[var(--rose)]/40 p-6 md:p-7">
                <p className="text-xs font-semibold tracking-wide uppercase text-foreground/50">Le geste</p>
                <p className="mt-3 text-xl font-medium tracking-tight leading-[1.4] text-foreground">
                  {item.advice}
                </p>
              </div>

              <p className="mt-8 italic text-sm text-foreground/50">
                — {item.quote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
