import { ArrowUpRight } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { SERVICES } from "@/components/landing/serenity2/data";
import { LandingVariant } from "../types";

export default function Sessions({ variant = "default" }: { variant?: LandingVariant }) {
  const { openModal } = useBooking();

  const handleSelect = (id: string) => {
    const service = SERVICES.find((s) => s.id === id);
    if (service) openModal(service);
  };

  const gridClassName =
    variant === "editorial"
      ? "md:grid-cols-2 xl:grid-cols-3"
      : variant === "concierge"
        ? "md:grid-cols-2 [@media(min-width:820px)_and_(max-width:1024px)]:grid-cols-3 xl:grid-cols-4"
        : "md:grid-cols-2 [@media(min-width:820px)_and_(max-width:1024px)]:grid-cols-3 xl:grid-cols-4";

  return (
    <section id="sessions" className="relative py-20 md:py-24 lg:py-28">
      <div className="relative mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12">
        <header className="mb-14 grid grid-cols-12 gap-8 lg:mb-16 lg:items-end">
          <div className="col-span-12 lg:col-span-6">
            <span className="landing-type-eyebrow mb-6 block text-[var(--orange)]">
              — La collection
            </span>
            <h2 className="landing-type-h2 landing-text-high display-tight">
              {variant === "concierge" ? "Choisir un soin," : "Huit soins,"} <br />
              <span className="landing-display-italic landing-text-muted">
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
                  ? "Le premier soin prend plus d'importance visuelle, puis la grille reprend un rythme plus fragmenté pour éviter l'effet catalogue uniforme."
                  : variant === "immersive"
                    ? "Les cartes gagnent en matière, en profondeur et en présence pour porter la sensation de rituel au lieu d'une simple liste."
                    : "Chaque soin est calibré : durée, intensité, intention. Découvrez la collection et choisissez le rituel qui correspond à votre besoin du moment."}
            </p>
          </div>
        </header>

        <div className={`grid grid-cols-1 gap-8 ${gridClassName}`}>
          {SERVICES.map((service, index) => {
            const isEditorialFeature = variant === "editorial" && index === 0;

            return (
              <article
                key={service.id}
                className={isEditorialFeature ? "md:col-span-2 xl:col-span-2" : ""}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(service.id)}
                  className={[
                    "group w-full text-left transition-transform duration-500 hover:-translate-y-1",
                    variant === "immersive"
                      ? "rounded-[2.25rem] border border-[rgba(21,56,57,0.12)] bg-white/58 p-4 shadow-[0_26px_48px_rgba(21,56,57,0.07)] backdrop-blur-sm"
                      : variant === "concierge"
                        ? "rounded-[1.85rem] border border-[var(--landing-tint)] bg-white/75 p-4 shadow-[0_18px_34px_rgba(48,31,16,0.06)]"
                        : "rounded-[2rem]",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "relative overflow-hidden rounded-[1.8rem]",
                      isEditorialFeature
                        ? "aspect-[16/10] md:aspect-[16/9]"
                        : "aspect-[4/5] [@media(min-width:820px)_and_(max-width:1024px)]:max-h-[22rem]",
                    ].join(" ")}
                  >
                    <img
                      src={service.image}
                      alt={service.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(7,18,18,0.16))]" />
                    <span className="landing-pill landing-pill-soft landing-type-caption absolute left-5 top-5 text-[var(--landing-warm)] shadow-[0_10px_24px_rgba(48,31,16,0.08)]">
                      <span className="mr-2 text-[var(--orange)]">●</span>
                      {service.displayTag ?? service.tag}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="mb-3 flex items-center gap-4">
                      <span className="landing-type-caption text-[var(--landing-warm-muted)]">N° {service.id}</span>
                      <div className="h-px w-8 bg-[var(--landing-tint)]" />
                      <span className="landing-type-caption text-[var(--landing-warm-soft)]">
                        {service.displayDuration ?? service.duration}
                      </span>
                      {variant === "concierge" ? (
                        <span className="landing-pill landing-pill-tint landing-type-caption text-[var(--landing-warm-soft)]">
                          {service.displayIntensity ?? service.intensity}
                        </span>
                      ) : null}
                    </div>

                    <h3
                      className="landing-type-h5 landing-text-high display-tight overflow-hidden text-ellipsis whitespace-nowrap transition-colors duration-500 group-hover:text-[var(--landing-warm-hover)]"
                      title={service.name}
                    >
                      {service.displayName ?? service.name}
                    </h3>

                    <p className="landing-type-body-s landing-text-body mt-3 line-clamp-2 min-h-[2.9rem] max-w-[31ch] transition-colors group-hover:text-landing-soft">
                      {service.desc}
                    </p>

                    <div className="mt-6 flex items-center justify-end gap-3">
                      <div className="landing-type-micro text-[var(--landing-warm-muted)]">
                        {variant === "immersive" ? service.displayIntensity ?? service.intensity : null}
                      </div>
                      <div className="landing-type-caption flex items-center gap-2 text-[var(--landing-warm)] opacity-0 -translate-x-4 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                        <span>Réserver</span>
                        <ArrowUpRight size={14} strokeWidth={3} className="text-[var(--orange)]" />
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
