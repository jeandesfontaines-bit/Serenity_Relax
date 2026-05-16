import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { SERVICES } from "@/components/landing/serenity2/data";
import { LandingVariant } from "../types";

export default function Sessions({ variant = "default" }: { variant?: LandingVariant }) {
  const router = useRouter();

  const handleSelect = (id: string) => {
    router.push(`/booking?service=${id}`);
  };

  const gridClassName =
    variant === "concierge"
      ? "min-[560px]:grid-cols-2 lg:grid-cols-4"
      : "min-[560px]:grid-cols-2 lg:grid-cols-4";

  return (
    <section id="sessions" className="landing-section" style={{ backgroundColor: "rgba(255, 255, 255, 0.45)" }}>
      <div className="relative mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12">
        <header className="landing-section-header grid grid-cols-12 gap-8 lg:items-end">
          <div className="col-span-12 lg:col-span-6">
            <span className="landing-type-eyebrow mb-6 block text-[var(--orange)]">
              — La collection
            </span>
            <h2 className="landing-type-h2 landing-text-high display-tight">
              <span className="font-serif tracking-[0.015em]">{variant === "concierge" ? "Choisir un soin," : "Huit soins,"}</span> <br />
              <span className="landing-display-italic text-[0.75em] landing-text-muted">
                {variant === "immersive"
                  ? "une atmosphère."
                  : variant === "editorial"
                    ? "une mise en scène."
                    : variant === "concierge"
                      ? "sans hésiter."
                      : "une intention."}
              </span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <p className="landing-type-body landing-text-body max-w-sm">
              {variant === "concierge"
                ? "Chaque carte expose plus clairement l'usage, la durée et le signal d'entrée pour favoriser une décision rapide."
                : variant === "editorial"
                  ? "Chaque soin est traité avec la même attention visuelle, créant une grille équilibrée et rythmée."
                  : variant === "immersive"
                    ? "Les cartes gagnent en matière, en profondeur et en présence pour porter la sensation de rituel au lieu d'une simple liste."
                    : "Chaque soin est calibré : durée, intensité, intention. Découvrez la collection et choisissez le rituel qui correspond à votre besoin du moment."}
            </p>
          </div>
        </header>

        <div className={`mt-8 w-full grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10 lg:place-items-center`}>
          {SERVICES.map((service) => {
            return (
              <article key={service.id} className="flex h-full w-full max-w-[31rem] min-[560px]:max-w-[20rem] lg:max-w-[240px]">
                <button
                  type="button"
                  onClick={() => handleSelect(service.id)}
                  className="group flex h-full w-full flex-col text-left transition-all duration-500 hover:-translate-y-1 max-[559px]:flex-row max-[559px]:items-stretch bg-white border border-[rgba(0,0,0,0.06)] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] overflow-hidden"
                >
                  <div
                    className="relative shrink-0 w-full max-[559px]:w-[35%] max-[559px]:min-w-[7rem] aspect-[3/2] max-[559px]:aspect-[3/4] overflow-hidden"
                  >
                    <img
                      src={service.image}
                      alt={service.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-black/5 transition-colors duration-500 group-hover:bg-transparent" />
                  </div>

                  <div className="flex flex-1 flex-col p-4 max-[559px]:p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="landing-type-caption text-[var(--landing-warm-muted)] font-medium text-[0.7rem]">N° {service.id}</span>
                      <div className="h-px w-4 bg-[var(--landing-tint)]" />
                      <span className="landing-type-caption text-[var(--landing-warm-soft)] text-[0.7rem]">
                        {service.displayDuration ?? service.duration}
                      </span>
                    </div>

                    <h3
                      className="text-[0.95rem] leading-[1.2] font-serif tracking-[0.015em] landing-text-high display-tight transition-colors duration-500 group-hover:text-[var(--landing-warm-hover)] max-[559px]:text-[0.95rem]"
                      title={service.name}
                    >
                      {service.displayName ?? service.name}
                    </h3>

                    <p className="landing-type-body-s landing-text-body mt-2 line-clamp-2 min-h-[2.4rem] transition-colors group-hover:text-landing-soft text-[0.75rem] leading-relaxed">
                      {service.desc}
                    </p>

                    <div className="mt-auto flex items-center justify-end pt-4">
                      <div className="flex items-center gap-1 text-[var(--landing-warm)] opacity-0 -translate-x-3 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 font-medium text-[0.75rem]">
                        <span>Réserver</span>
                        <ArrowUpRight size={12} strokeWidth={2.5} className="text-[var(--orange)]" />
                      </div>
                    </div>
                  </div>
                </button>
              </article>
            );
          })}


        </div>
      </div>
    </section>
  );
}
