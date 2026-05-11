import { IMPACTS, SANCTUARY_IMAGE, TESTIMONIALS } from "@/components/landing/serenity2/data";

export default function Sanctuary() {
  return (
    <section id="sanctuary" className="relative bg-[var(--off-black)] py-24 md:py-32 lg:py-36 text-background">
      <div className="relative mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
        <header className="mb-16 grid grid-cols-12 gap-6 lg:mb-20">
          <div className="col-span-12 lg:col-span-7">
            <span className="mono-caption text-[var(--neon)]">— Le sanctuaire</span>
            <h2 className="mt-6 display-tight text-5xl text-background md:text-6xl lg:text-7xl">
              Quatre impacts, <em className="!text-[var(--neon)]">une transformation.</em>
            </h2>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          <div className="col-span-12 lg:col-span-7 relative">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <img
                src={SANCTUARY_IMAGE}
                alt="Atmosphère du cabinet Serenity Relax"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Modern floating quote */}
            <div className="absolute -bottom-8 -right-4 max-w-sm rounded-2xl bg-[var(--periwinkle)] p-7 text-[var(--off-black)] shadow-2xl md:-right-12 md:p-8">
              <p className="text-xl leading-[1.4] font-medium tracking-tight md:text-2xl">
                « Un cabinet pensé comme un espace neutre — où chaque geste trouve son temps. »
              </p>
              <p className="mt-5 text-xs font-bold tracking-wider uppercase">João, fondateur</p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:pl-4 mt-16 lg:mt-0">
            <div className="space-y-10">
              {IMPACTS.map((impact, idx) => (
                <div key={impact.num} className="group">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[var(--neon)] px-3 py-1 text-xs font-bold tracking-wider text-[var(--off-black)]">
                      {impact.num}
                    </span>
                    <span className="text-xs font-medium tracking-wider uppercase text-background/50">{impact.title}</span>
                  </div>
                  <h3 className="mt-4 display-tight text-3xl text-background md:text-4xl">
                    {impact.fr}
                  </h3>
                  <p className="mt-3 text-base leading-[1.6] text-background/70">
                    {impact.desc}
                  </p>
                  {idx !== IMPACTS.length - 1 && (
                    <div className="mt-10 h-px w-full bg-background/10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials moderne */}
        <div className="mt-32 lg:mt-40">
          <div className="mb-10 flex items-baseline justify-between">
            <span className="mono-caption text-[var(--neon)]">— Témoignages</span>
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm font-semibold tracking-tight text-background">★ 4.97</span>
              <span className="text-xs tracking-wide text-background/50">/ 240+ avis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-2xl bg-background/5 backdrop-blur-sm border border-background/10 p-7 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[var(--neon)] text-sm">★</span>
                  ))}
                </div>
                <blockquote className="text-base leading-[1.55] text-background/90 flex-1">
                  {t.content}
                </blockquote>
                <figcaption className="mt-6 pt-6 border-t border-background/10">
                  <p className="text-sm font-semibold tracking-tight text-background">{t.name}</p>
                  <p className="mt-0.5 text-xs tracking-wide text-background/50">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
