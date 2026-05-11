"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { SERVICES } from "@/components/landing/serenity2/data";

const FILTERS = ["Tous", "Signature", "Restorative", "Sportive", "Sensorielle"];

export default function Sessions() {
  const [filter, setFilter] = useState("Tous");
  const { openModal } = useBooking();

  const filtered = SERVICES.filter((s) => filter === "Tous" || s.tag === filter);

  const handleSelect = (id: string) => {
    const service = SERVICES.find((s) => s.id === id);
    if (service) openModal(service);
  };

  return (
    <section id="sessions" className="relative py-24 md:py-32 lg:py-36">
      <div className="relative mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
        <header className="mb-16 grid grid-cols-12 gap-6 lg:mb-20">
          <div className="col-span-12 lg:col-span-7">
            <span className="mono-caption text-[var(--sage-deep)]">— La collection</span>
            <h2 className="mt-6 display-tight text-5xl text-foreground md:text-6xl lg:text-7xl">
              Huit soins, <em>une intention.</em>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-8">
            <p className="text-base leading-[1.6] text-foreground/65">
              Chaque soin est calibré : durée, intensité, intention. Filtrez selon
              votre besoin du moment.
            </p>
          </div>
        </header>

        {/* Modern filter chips */}
        <div className="mb-12 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium tracking-tight transition-all duration-300 ${
                filter === f
                  ? "bg-foreground text-background"
                  : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Modern grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((service) => (
            <article key={service.id} className="group flex flex-col">
              <button onClick={() => handleSelect(service.id)} className="text-left">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-foreground/5">
                  <img
                    src={service.image}
                    alt={service.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-background/90 backdrop-blur-md px-3 py-1.5">
                    <span className="text-[11px] font-semibold tracking-tight text-foreground">{service.tag}</span>
                  </div>
                  <div className="absolute bottom-4 right-4 rounded-full bg-foreground/90 backdrop-blur-md px-3 py-1.5">
                    <span className="text-[11px] font-semibold tracking-tight text-background">CHF {service.price}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <span className="text-xs font-medium tracking-wide text-foreground/40">N° {service.id}</span>
                  <span className="h-1 w-1 rounded-full bg-foreground/20" />
                  <span className="text-xs font-medium tracking-wide text-foreground/40">{service.duration}</span>
                </div>

                <h3 className="mt-2 display-tight text-3xl text-foreground transition-colors duration-300 group-hover:text-[var(--sage-deep)]">
                  {service.name}
                </h3>

                <p className="mt-3 text-sm leading-[1.6] text-foreground/65">
                  {service.desc}
                </p>

                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium tracking-tight text-foreground">
                  <span>Découvrir</span>
                  <ArrowUpRight size={15} strokeWidth={1.75} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
