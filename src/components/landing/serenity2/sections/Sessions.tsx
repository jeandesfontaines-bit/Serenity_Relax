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
    <section id="sessions" className="relative py-20 md:py-24 lg:py-28">
      <div className="relative mx-auto max-w-[1280px] px-6 md:px-10 lg:px-12">
        <header className="mb-14 grid grid-cols-12 gap-8 lg:mb-16 lg:items-end">
          <div className="col-span-12 lg:col-span-6">
            <span className="mb-6 block text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--orange)]">
              — La collection
            </span>
            <h2 className="display-tight text-3xl leading-[0.94] -tracking-[0.02em] text-foreground md:text-5xl lg:text-[4.8rem]">
              Huit soins, <br />
              <span className="font-serif italic font-light text-[#8b8176]">une intention.</span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <p className="max-w-sm text-[15px] leading-relaxed text-foreground/62 md:text-base">
              Chaque soin est calibré : durée, intensité, intention. Découvrez la collection et choisissez le rituel qui correspond à votre besoin du moment.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <article key={service.id} className="group flex flex-col">
              <button onClick={() => handleSelect(service.id)} className="text-left">
                <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-[2rem] border border-[#d9cbb8]/80 bg-[#e8dccd] shadow-[0_18px_40px_rgba(77,52,30,0.08)]">
                  <img
                    src={service.image}
                    alt={service.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 saturate-[0.88] contrast-[1.04] sepia-[0.08]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(42,29,20,0.04),rgba(42,29,20,0.26))] pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#f7f1e7]/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#f4e3cc]/85 bg-[linear-gradient(180deg,rgba(255,248,239,0.96),rgba(242,227,205,0.92))] px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#4d3524] shadow-[0_10px_24px_rgba(49,28,15,0.16)] backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--orange)]" />
                      {service.tag}
                    </span>
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8f7763]">N° {service.id}</span>
                  <div className="h-px w-8 bg-[#cbb8a2]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6f5a49]">{service.duration}</span>
                </div>

                <h3 className="display-tight text-[1.6rem] text-foreground transition-colors duration-500 group-hover:text-[#9f5d2a] md:text-[1.85rem]">
                  {service.name}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-foreground/62 line-clamp-2 transition-colors group-hover:text-foreground/82 md:text-[14px]">
                  {service.desc}
                </p>

                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5a4638] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
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
