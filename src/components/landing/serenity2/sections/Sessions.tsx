import { ArrowUpRight } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { SERVICES } from "@/components/landing/serenity2/data";

export default function Sessions() {
  const { openModal } = useBooking();

  const handleSelect = (id: string) => {
    const service = SERVICES.find((s) => s.id === id);
    if (service) openModal(service);
  };

  return (
    <section id="sessions" className="relative py-24 md:py-32">
      <div className="relative mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
        <header className="mb-16 grid grid-cols-12 gap-8 lg:mb-20 items-end">
          <div className="col-span-12 lg:col-span-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--sage-deep)] mb-6 block">— La collection</span>
            <h2 className="display-tight text-4xl text-foreground md:text-6xl lg:text-7xl leading-[0.92] -tracking-[0.02em]">
              Huit soins, <br />
              <span className="font-serif italic font-light opacity-90">une intention.</span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <p className="text-base leading-relaxed text-foreground/65 md:text-lg lg:pb-2">
              Chaque soin est calibré : durée, intensité, intention. <br />
              Découvrez la collection et choisissez le rituel qui correspond à votre besoin du moment.
            </p>
          </div>
        </header>

        {/* Modern grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <article key={service.id} className="group flex flex-col">
              <button onClick={() => handleSelect(service.id)} className="text-left">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-foreground/5 mb-6">
                  <img
                    src={service.image}
                    alt={service.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 saturate-[0.85] contrast-[1.1] sepia-[0.1]"
                  />
                  {/* Unified color grading overlay */}
                  <div className="absolute inset-0 bg-[#4a3728]/10 mix-blend-multiply opacity-40 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="inline-flex rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-foreground shadow-sm">
                      {service.tag}
                    </span>
                  </div>
                  
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">N° {service.id}</span>
                  <div className="h-px w-6 bg-foreground/10" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{service.duration}</span>
                </div>

                <h3 className="display-tight text-2xl text-foreground transition-colors duration-500 group-hover:text-[var(--orange)] md:text-3xl">
                  {service.name}
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-foreground/60 line-clamp-2 transition-colors group-hover:text-foreground/75">
                  {service.desc}
                </p>

                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                  <span>Réserver</span>
                  <ArrowUpRight size={14} strokeWidth={3} className="text-[var(--orange)]" />
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
