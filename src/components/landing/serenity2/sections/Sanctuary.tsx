import { IMPACTS, SANCTUARY_IMAGE } from "@/components/landing/serenity2/data";

export default function Sanctuary() {
  return (
    <section id="sanctuary" className="relative bg-[var(--off-black)] py-24 md:py-32 text-background">
      <div className="relative mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
        <header className="mb-12 max-w-3xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--neon)] mb-6 block">— L&apos;Espace</span>
          <h2 className="display-tight text-4xl md:text-6xl lg:text-7xl text-background leading-[0.95]">
            Quatre impacts, <br />
            <span className="font-serif italic font-light !text-[var(--neon)]">une transformation.</span>
          </h2>
        </header>

        <div className="grid grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="col-span-12 lg:col-span-6 relative">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem]">
              <img
                src={SANCTUARY_IMAGE}
                alt="Atmosphère du cabinet Serenity Relax"
                loading="lazy"
                className="h-full w-full object-cover grayscale-[0.2] contrast-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--off-black)]/40 to-transparent" />
            </div>

            {/* Modern floating quote - more compact */}
            <div className="absolute -bottom-6 -right-4 max-w-[280px] rounded-[2rem] bg-[var(--periwinkle)] p-8 text-[var(--off-black)] shadow-2xl md:-right-8">
              <p className="text-lg leading-tight font-medium tracking-tight italic font-serif">
                « Un cabinet pensé comme un espace neutre — où chaque geste trouve son temps. »
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-px w-6 bg-[var(--off-black)]/20" />
                <span className="text-[9px] font-bold tracking-widest uppercase">João</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <div className="space-y-9">
              {IMPACTS.map((impact, idx) => (
                <div key={impact.num} className="group transition-all duration-500">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-[var(--neon)] opacity-50 group-hover:opacity-100 transition-opacity">
                      {impact.num} /
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-background/30 group-hover:text-background/50 transition-colors">{impact.title}</span>
                  </div>
                  <h3 className="mt-3 display-tight text-3xl text-background transition-transform group-hover:translate-x-1 md:text-4xl">
                    {impact.fr}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-background/60 transition-colors group-hover:text-background/75 md:text-base">
                    {impact.desc}
                  </p>
                  {idx !== IMPACTS.length - 1 && (
                    <div className="mt-8 h-px w-full bg-background/5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
