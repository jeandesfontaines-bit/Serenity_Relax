import { AFTERCARE, JOURNAL_IMAGE } from "@/components/landing/serenity2/data";

export default function Journal() {
  return (
    <section id="journal" className="relative bg-white py-24 md:py-32">
      <div className="relative mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
        <header className="mb-16 grid grid-cols-12 items-end gap-8">
          <div className="col-span-12 lg:col-span-8">
            <span className="mb-6 block text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--orange)]">
              — Rituels post-soin
            </span>
            <h2 className="display-tight text-4xl leading-[0.92] -tracking-[0.02em] md:text-6xl lg:text-7xl">
              Le rituel continue <br />
              <span className="font-serif italic font-light text-[var(--sage-deep)] opacity-90">
                après la séance.
              </span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <p className="text-base leading-relaxed text-foreground/65 md:text-lg lg:pb-2">
              Trois moments simples pour prolonger les bénéfices du soin, sans avoir à vous demander quoi faire ensuite.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-12 lg:gap-20">
          <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground/5 shadow-2xl">
              <div className="aspect-[4/5]">
                <img
                  src={JOURNAL_IMAGE}
                  alt="Rituel après-séance"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="inline-flex rounded-full bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-foreground shadow-sm backdrop-blur">
                  Rituel après-séance
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <div className="space-y-6">
              {AFTERCARE.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[2rem] border border-foreground/6 bg-[var(--sage-deep)]/[0.03] p-8 md:p-10"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-2xl">
                      <div className="mb-5 flex items-center gap-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--orange)]">
                          Etape {item.id}
                        </span>
                        <div className="h-px w-8 bg-foreground/10" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
                          {item.time}
                        </span>
                      </div>

                      <h3 className="display-tight text-3xl leading-[0.96] text-foreground md:text-4xl">
                        {item.title}
                      </h3>

                      <p className="mt-5 text-base leading-relaxed text-foreground/65 md:text-lg">
                        {item.desc}
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-foreground/35 shadow-sm">
                      {item.time}
                    </div>
                  </div>

                  <div className="mt-8 rounded-[1.75rem] border border-foreground/6 bg-white p-6 md:p-7">
                    <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--orange)]">
                      A faire
                    </span>
                    <p className="text-lg leading-snug tracking-tight text-foreground md:text-xl">
                      {item.advice}
                    </p>
                  </div>

                  <p className="mt-5 text-sm italic text-foreground/45">
                    {item.quote}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
