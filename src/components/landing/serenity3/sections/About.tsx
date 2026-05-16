"use client";

const BENEFITS = [
  {
    num: "01",
    title: "Soulager les tensions",
    desc: "Le soin dénoue les zones crispées et réduit les douleurs musculaires les plus fréquentes.",
  },
  {
    num: "02",
    title: "Mobilité retrouvée",
    desc: "Le corps gagne en souplesse, les gestes redeviennent plus fluides et moins contraints.",
  },
  {
    num: "03",
    title: "Moins de stress",
    desc: "La respiration ralentit, le stress baisse et la récupération devient plus profonde.",
  },
];

export default function About() {
  return (
    <section id="about" className="landing-section bg-[var(--landing-bg)]">
      <div className="mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12">
        <header className="landing-section-header mx-auto max-w-[820px] text-center">
          <span className="landing-type-eyebrow mb-6 block text-[var(--orange)]">
            — Bienfaits
          </span>
          <h2 className="landing-type-h2 landing-text-high display-tight leading-[0.94]">
            <span className="font-serif tracking-normal">Ce que le massage</span>
            <br />
            <span className="landing-display-italic text-[0.75em] landing-text-muted">vous apporte.</span>
          </h2>
          <p className="landing-type-body landing-text-body mx-auto mt-6 max-w-[44ch]">
            Des effets concrets, visibles dans le corps et perceptibles dès les premières
            séances.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8 lg:gap-10">
          {BENEFITS.map((benefit) => (
            <article
              key={benefit.num}
              className="flex min-h-[11rem] flex-col items-center justify-center border-t border-[var(--landing-tint)] px-4 pt-10 pb-6 text-center md:min-h-[12rem] lg:min-h-[13rem] lg:px-6 lg:pt-10 lg:pb-8"
            >
              <span className="landing-display-italic text-[1.45rem] leading-none text-[var(--orange)]/82 md:text-[1.7rem]">
                {benefit.num}
              </span>
              <h3 className="landing-type-h4 landing-text-high display-tight mt-4 font-serif tracking-normal">
                {benefit.title}
              </h3>
              <p className="landing-type-body-s landing-text-body mt-3 mx-auto max-w-[32ch] leading-relaxed">
                {benefit.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
