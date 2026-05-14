import { IMPACTS } from "@/components/landing/serenity2/data";

export default function Sanctuary() {
  return (
    <section
      id="sanctuary"
      className="relative overflow-hidden py-20 text-[var(--off-black)] md:py-24 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,102,77,0.08),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(21,56,57,0.05),transparent_24%)]" />

      <div className="relative mx-auto max-w-[1280px] px-6 md:px-10 lg:px-12">
        <header className="grid grid-cols-12 gap-8 border-b border-[#d9c8b4] pb-8 md:pb-10">
          <div className="col-span-12 lg:col-span-7">
            <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--orange)]">
              — Expertise
            </span>
            <h2 className="display-tight max-w-4xl text-[2.6rem] leading-[0.94] -tracking-[0.02em] md:text-[4.4rem] lg:text-[4.8rem]">
              Les bienfaits{" "}
              <span className="font-serif italic font-light text-[#8b8176]">
                sur votre corps.
              </span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-10">
            <p className="max-w-sm text-[15px] leading-relaxed text-[#6f6459] md:text-base">
              Le massage thérapeutique agit sur les tensions, la mobilité, la circulation et l&apos;apaisement global.
            </p>
          </div>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {IMPACTS.map((impact) => (
            <article key={impact.num} className="border-t border-[#d9c8b4] pt-5">
              <span className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full bg-[var(--orange)] px-3 font-serif text-[0.95rem] italic leading-none text-white shadow-[0_10px_24px_rgba(241,102,77,0.18)]">
                {impact.num}
              </span>
              <h3 className="mt-5 display-tight max-w-[16ch] text-[1.32rem] leading-[1.02] text-[var(--off-black)] md:text-[1.5rem]">
                {impact.title}
              </h3>
              <p className="mt-2 max-w-[30ch] text-[13px] leading-relaxed text-[#6f6459] md:text-[14px]">
                {impact.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
