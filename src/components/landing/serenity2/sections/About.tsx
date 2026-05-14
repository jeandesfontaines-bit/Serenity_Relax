"use client";

const BENEFITS = [
  {
    num: "01",
    title: "Soulagement des douleurs",
    desc: "Apaise les tensions musculaires, réduit les raideurs et atténue les douleurs dorsales, cervicales ou articulaires.",
  },
  {
    num: "02",
    title: "Souplesse et mobilité",
    desc: "Assouplit les muscles, améliore la posture et prévient les inconforts chroniques.",
  },
  {
    num: "03",
    title: "Circulation et vitalité",
    desc: "Stimule la circulation sanguine et lymphatique, favorise l'élimination des toxines et accélère la récupération.",
  },
  {
    num: "04",
    title: "Beauté et peau",
    desc: "Adoucit et revitalise la peau, tout en améliorant son aspect grâce aux mouvements de pétrissage.",
  },
  {
    num: "05",
    title: "Respiration et énergie",
    desc: "Apaise le mental, approfondit la respiration et redonne énergie et équilibre.",
  },
  {
    num: "06",
    title: "Bien-être émotionnel",
    desc: "Réduit le stress, favorise la relaxation profonde et procure une sensation durable d'harmonie.",
  },
];

export default function About() {
  return (
    <section id="sanctuary" className="relative py-20 md:py-24 lg:py-28">
      <div className="relative mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12">
        <header className="grid grid-cols-12 gap-8 border-b border-[var(--landing-tint)] pb-8 md:pb-10 lg:items-end">
          <div className="col-span-12 lg:col-span-7">
            <span className="landing-type-eyebrow mb-5 block text-[var(--orange)]">
              — Expertise
            </span>
            <h2 className="landing-type-h2 landing-text-high display-tight">
              Les bienfaits
              <br />
              <span className="landing-display-italic landing-text-muted">
                sur votre corps.
              </span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <p className="landing-type-body landing-text-body max-w-sm">
              Le massage thérapeutique agit sur les tensions, la mobilité, la circulation
              et l&apos;apaisement global.
            </p>
          </div>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-12">
          {BENEFITS.map((benefit, index) => {
            const isFeature = index === 0;
            const cardClassName = isFeature
              ? "xl:col-span-5"
              : index === 1
                ? "xl:col-span-3"
                : index === 2
                  ? "xl:col-span-4"
                  : "xl:col-span-4";

            return (
              <article
                key={benefit.num}
                className={[
                  "landing-surface-card transition-transform duration-500 hover:-translate-y-1",
                  cardClassName,
                  isFeature
                    ? "flex min-h-[23rem] flex-col px-7 pb-7 pt-7 md:col-span-2 md:px-8 md:pb-8 md:pt-8"
                    : "flex min-h-[16.5rem] flex-col px-6 pb-6 pt-6",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="landing-type-caption text-[var(--landing-warm-muted)]">
                    {isFeature ? "Bénéfice prioritaire" : "Bénéfice ciblé"}
                  </span>
                  <span className="landing-ordinal text-[1.15rem] leading-none text-[var(--orange)]">
                    {benefit.num}
                  </span>
                </div>

                <div className={isFeature ? "mt-auto max-w-[32rem]" : "mt-auto"}>
                  <h3
                    className={[
                      "landing-type-h4 landing-text-high display-tight",
                      isFeature ? "mt-8 max-w-[12ch]" : "mt-8 max-w-[15ch]",
                    ].join(" ")}
                  >
                    {benefit.title}
                  </h3>
                  <p
                    className={[
                      "landing-type-body-s landing-text-body",
                      isFeature ? "mt-4 max-w-[37ch]" : "mt-3 max-w-[31ch]",
                    ].join(" ")}
                  >
                    {benefit.desc}
                  </p>
                </div>

                {!isFeature ? (
                  <div className="mt-6 h-px w-12 bg-[var(--landing-tint)]" />
                ) : (
                  <div className="mt-8 h-px w-16 bg-[var(--landing-tint)]" />
                )}

                <div className="mt-4">
                  <p className="landing-type-caption text-[var(--landing-warm-muted)]">
                    {isFeature ? "Base du rituel thérapeutique" : "Effet complémentaire"}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
