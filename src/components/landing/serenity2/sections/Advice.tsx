const ADVICES = [
  {
    num: "01",
    title: "Accueillez vos émotions",
    desc: "Un massage peut libérer des ressentis profonds. Laissez-les s’exprimer naturellement, sans jugement.",
  },
  {
    num: "02",
    title: "Prenez votre temps",
    desc: "Restez allongé quelques minutes avant de vous relever. Étirez-vous doucement et levez-vous lentement.",
  },
  {
    num: "03",
    title: "Hydratez-vous",
    desc: "Buvez un verre d’eau à température ambiante pour aider votre corps à éliminer les toxines.",
  },
  {
    num: "04",
    title: "Évitez la douche immédiate",
    desc: "Attendez environ une heure avant de vous laver afin de laisser les huiles et l’énergie du soin agir pleinement.",
  },
  {
    num: "05",
    title: "Prolongez la détente",
    desc: "Accordez-vous encore quelques instants de repos, respirez profondément et savourez ce moment.",
  },
  {
    num: "06",
    title: "Planifiez un prochain soin",
    desc: "Pour un bien-être durable, pensez à réserver votre prochaine séance avant de repartir.",
  },
  {
    num: "07",
    title: "Choisissez la douceur",
    desc: "Après le massage, privilégiez des activités calmes et sereines pour prolonger la sensation de bien-être.",
  },
];

export default function Advice() {
  return (
    <section id="advice" className="relative py-20 md:py-32 bg-[var(--sage-deep)]/5">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
        <header className="mb-16 max-w-3xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--sage-deep)] mb-6 block">— Rituels post-soin</span>
          <h2 className="display-tight text-4xl md:text-6xl lg:text-7xl text-foreground leading-[0.95]">
            7 rituels pour prolonger <br /> 
            <span className="font-serif italic font-light text-[var(--orange)]">l&apos;instant de sérénité.</span>
          </h2>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-foreground/65 md:text-lg">
            L&apos;expérience Serenity ne s&apos;arrête pas à la porte du studio. Voici comment prendre soin de votre corps et de votre esprit après votre séance.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ADVICES.map((advice, idx) => (
            <div 
              key={advice.num}
              className="group relative flex flex-col rounded-[2rem] border border-foreground/5 bg-white p-8 transition-all duration-700 hover:shadow-[0_30px_60px_-20px_rgba(21,32,35,0.08)] md:p-9"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-bold text-[var(--orange)] opacity-40">
                  Rituel {advice.num}
                </span>
                <div className="h-2 w-2 rounded-full bg-[var(--orange)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <h4 className="mb-4 display-tight text-2xl text-foreground transition-transform group-hover:translate-x-1 md:text-[1.9rem]">
                {advice.title}
              </h4>
              <p className="text-sm leading-relaxed text-foreground/60 transition-colors group-hover:text-foreground/75 md:text-base">
                {advice.desc}
              </p>

              {/* Decorative line */}
              <div className="absolute bottom-0 left-10 right-10 h-px bg-foreground/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
