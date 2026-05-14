const RITUALS = [
  {
    num: "01",
    title: "Accueillez vos émotions",
    desc: "Laissez venir ce qui se présente, sans le brusquer.",
  },
  {
    num: "02",
    title: "Prenez votre temps",
    desc: "Relevez-vous lentement et laissez le corps revenir à son rythme.",
  },
  {
    num: "03",
    title: "Hydratez-vous",
    desc: "Buvez un verre d’eau pour accompagner la récupération.",
  },
  {
    num: "04",
    title: "Évitez la douche immédiate",
    desc: "Attendez un peu avant de vous laver pour prolonger le soin.",
  },
  {
    num: "05",
    title: "Prolongez la détente",
    desc: "Gardez encore un moment de calme avant de repartir.",
  },
  {
    num: "06",
    title: "Planifiez un prochain soin",
    desc: "Un rythme régulier aide le corps à garder ses bénéfices.",
  },
  {
    num: "07",
    title: "Choisissez la douceur",
    desc: "Privilégiez ensuite des activités calmes et légères.",
  },
];

export default function Journal() {
  return (
    <section id="journal" className="relative bg-[var(--off-black)] py-20 text-white md:py-24 lg:py-28">
      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-12 gap-10 lg:gap-14">
          <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <span className="landing-type-eyebrow mb-6 block text-[var(--orange)]">
              — Rituels post-soin
            </span>
            <h2 className="landing-type-h2 landing-text-inverse display-tight">
              Le rituel continue <br />
              <span className="landing-display-italic text-white/50">
                après la séance.
              </span>
            </h2>
            <p className="landing-type-body landing-text-inverse-soft mt-7">
              7 gestes simples pour prolonger l&apos;apaisement après votre séance.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <div className="mb-8 border-b border-white/10 pb-6">
              <p className="landing-type-micro text-white/35">
                7 étapes essentielles
              </p>
            </div>

            <div className="space-y-0">
              {RITUALS.map((ritual, index) => (
                <article
                  key={ritual.num}
                  className={`group py-7 transition-all duration-500 md:py-8 ${
                    index !== RITUALS.length - 1 ? "border-b border-white/10" : ""
                  }`}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[72px_1fr] md:gap-6">
                    <div className="flex items-start md:justify-center">
                      <span className="landing-ordinal text-[1.9rem] leading-none text-[var(--orange)]/75 md:text-[2.2rem]">
                        {ritual.num}
                      </span>
                    </div>
                    <div>
                      <h3 className="landing-type-h4 landing-text-inverse display-tight transition-transform duration-500 group-hover:translate-x-1">
                        {ritual.title}
                      </h3>
                      <p className="landing-type-body-s mt-2 max-w-2xl text-white/62 transition-colors group-hover:text-white/82">
                        {ritual.desc}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
