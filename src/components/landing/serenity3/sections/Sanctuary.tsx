import { IMPACTS } from "@/components/landing/serenity3/data";
import { LandingVariant } from "../types";

export default function Sanctuary({ variant = "default" }: { variant?: LandingVariant }) {
  const gridClassName =
    variant === "concierge"
      ? "md:grid-cols-2 xl:grid-cols-3"
      : variant === "editorial"
        ? "md:grid-cols-2 xl:grid-cols-2"
        : "md:grid-cols-2 xl:grid-cols-3";

  return (
    <section
      id="sanctuary"
      className="relative overflow-hidden py-20 md:py-32 text-[var(--off-black)]"
    >
      <div
        className={[
          "pointer-events-none absolute inset-0",
          variant === "immersive"
            ? "bg-[radial-gradient(circle_at_top_left,rgba(21,56,57,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(241,102,77,0.12),transparent_24%)]"
            : "bg-[radial-gradient(circle_at_top_left,rgba(241,102,77,0.08),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(21,56,57,0.05),transparent_24%)]",
        ].join(" ")}
      />

      <div className="relative mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12">
        <header
          className={[
            "grid grid-cols-12 gap-8 border-b border-[#d9c8b4] pb-8 md:pb-10",
            variant === "editorial" ? "lg:items-start" : "lg:items-end",
          ].join(" ")}
        >
          <div className="col-span-12 lg:col-span-7">
            <span className="landing-type-eyebrow mb-5 block text-[var(--orange)]">
              — Expertise
            </span>
            <h2 className="landing-type-h2 display-tight text-3xl leading-[0.95] -tracking-[0.02em] text-foreground md:text-[4.2rem] lg:text-[4.35rem]">
              {variant === "immersive" ? "Le corps ralentit," : "Les bienfaits"}
              <br />
              <span className="font-serif italic font-light text-[#8b8176]">
                {variant === "concierge" ? "visibles rapidement." : variant === "editorial" ? "sur votre corps." : variant === "immersive" ? "l'esprit suit." : "sur votre corps."}
              </span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <p className="landing-type-body max-w-sm text-[15px] text-[#6f6459] md:text-[15px]">
              {variant === "concierge"
                ? "Une lecture plus directe des bénéfices aide à comprendre ce que chaque soin change concrètement pour le corps, la mobilité et le système nerveux."
                : variant === "editorial"
                  ? "Cette variation renforce les contrastes de composition et transforme les bénéfices en fragments plus sculptés, presque comme des notes de marge."
                  : variant === "immersive"
                    ? "Ici, les bénéfices sont mis en scène comme une montée progressive vers l'apaisement, avec plus de densité, plus de matière et moins de neutralité."
                    : "Le massage thérapeutique agit sur les tensions, la mobilité, la circulation et l'apaisement global."}
            </p>
          </div>
        </header>

        <div className={`mt-12 grid grid-cols-1 gap-x-12 gap-y-8 ${gridClassName}`}>
          {IMPACTS.map((impact, index) => (
            <article
              key={impact.num}
              className={[
                "pt-10",
                variant === "editorial"
                  ? index === 0
                    ? "border-t border-[#d9c8b4] md:col-span-2 md:grid md:grid-cols-[1fr_1fr] md:gap-8"
                    : "border-t border-[#d9c8b4]"
                  : variant === "immersive"
                    ? "rounded-[2rem] border border-[rgba(21,56,57,0.1)] bg-white/60 px-6 pb-6 shadow-[0_22px_36px_rgba(21,56,57,0.06)] backdrop-blur-sm"
                    : variant === "concierge"
                      ? "rounded-[1.75rem] border border-[#d9c8b4] bg-white/72 px-5 pb-5"
                      : "border-t border-[#d9c8b4]",
              ].join(" ")}
            >
              <div>
                <span className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full bg-[var(--orange)] px-3 font-serif text-[0.95rem] italic leading-none text-white shadow-[0_10px_24px_rgba(241,102,77,0.18)]">
                  {impact.num}
                </span>
                <h3 className="landing-type-h4 mt-5 display-tight max-w-[16ch] text-[1.38rem] leading-[1.03] text-[var(--off-black)] md:text-[1.55rem]">
                  {impact.title}
                </h3>
              </div>
              <p className="landing-type-body-s mt-2 max-w-[32ch] text-[14px] text-[#6f6459]">
                {impact.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
