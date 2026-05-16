"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import { SERVICES, FAQ } from "../../data";

/* ─── BENEFITS (kept from About.tsx) ─── */
const BENEFITS = [
  { num: "01", title: "Soulager les tensions", desc: "Le soin dénoue les zones crispées et réduit les douleurs musculaires les plus fréquentes." },
  { num: "02", title: "Mobilité retrouvée", desc: "Le corps gagne en souplesse, les gestes redeviennent plus fluides et moins contraints." },
  { num: "03", title: "Moins de stress", desc: "La respiration ralentit, le stress baisse et la récupération devient plus profonde." },
];

const METRICS = [
  { value: "Genève", label: "Cabinet à Cointrin" },
  { value: "8", label: "Soins ciblés" },
  { value: "100%", label: "Adapté à votre corps" },
];

export default function BentoGrid() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="landing-v2 landing-text-high min-h-screen" style={{ background: "var(--landing-page-bg, #f6f2ea)" }}>
      {/* ═══ NAVBAR ═══ */}
      <nav className="relative z-50 border-b border-[rgba(21,56,57,0.08)] bg-white shadow-[0_10px_30px_rgba(21,32,35,0.06)]">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between px-6 py-3.5 md:px-10 lg:px-12">
          <Link href="/" className="flex items-baseline gap-2.5">
            <span className="landing-type-h5 landing-text-high text-[15px] tracking-[0.03em] md:text-[16px] lg:text-[17px]">SERENITY RELAX THERAPY</span>
            <span className="signature-font landing-text-soft hidden text-[1.55rem] leading-none lg:inline">by João</span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            {["Sessions", "Bienfaits", "FAQ"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="landing-text-soft editorial-link text-[14px] font-medium tracking-tight transition-colors duration-300 hover:text-[var(--off-black)]">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/booking" className="hidden md:inline-flex items-center gap-2 rounded-full bg-[var(--orange)] px-5 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-[0_12px_26px_rgba(241,102,77,0.18)] transition-all duration-300 hover:translate-y-[-1px] hover:bg-[var(--teal-deep)]">Réserver</Link>
            <Link href="/login" className="landing-border-tint landing-text-high hidden md:inline-flex rounded-full border bg-white/55 px-5 py-2.5 text-[13px] font-medium transition-all duration-300 hover:bg-white/82">Connexion</Link>
          </div>
        </div>
      </nav>

      {/* ═══ BENTO: HERO ZONE ═══ */}
      <section className="mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12 pt-6">
        <div className="bento-hero-grid">
          {/* A — Giant hero image block */}
          <div className="bento-hero-a relative overflow-hidden">
            <img src="/images/joao-collage.png" alt="Ambiance massage" className="absolute inset-0 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10">
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#B87355]/20 bg-white/70 backdrop-blur-md px-5 py-2 shadow-sm">
                <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping rounded-full bg-[#B87355] opacity-40" /><span className="relative h-2 w-2 rounded-full bg-[#B87355]" /></span>
                <span className="text-[#B87355] text-[0.75rem] font-medium tracking-wide uppercase">Massothérapie thérapeutique · Genève</span>
              </div>
              <h1 className="mb-8 text-5xl md:text-6xl lg:text-7xl font-serif tracking-[0.015em] text-white leading-tight">
                <span>Le soin juste,</span><br />
                <span className="italic opacity-90 text-[0.9em]">pour votre corps.</span>
              </h1>
            </div>
          </div>

          {/* B — Pure void (negative space) */}
          <div className="bento-hero-b hidden lg:block" />

          {/* C — Micro-aligned CTA block */}
          <div className="bento-hero-c flex flex-col justify-end items-end">
            <Link href="/booking" className="group relative inline-flex h-14 items-center gap-4 rounded-full bg-[#B87355] px-8 text-white shadow-[0_8px_20px_rgba(184,115,85,0.3)] transition-all duration-500 hover:scale-105 hover:bg-[#9c5f44] active:scale-95">
              <span className="text-[0.9rem] font-medium tracking-wide">Réserver un soin</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-45"><ArrowDownRight size={16} strokeWidth={2.5} /></div>
            </Link>
          </div>

          {/* D — Intro paragraph, text anchored bottom-left */}
          <div className="bento-hero-d flex flex-col justify-end">
            <p className="text-lg md:text-xl text-[#301f10]/80 leading-relaxed">Des massages thérapeutiques pensés pour soulager les tensions, relancer la récupération et ramener le corps vers un équilibre durable.</p>
          </div>

          {/* E — Thin horizontal metrics band */}
          <div className="bento-hero-e flex items-center">
            <div className="flex flex-wrap gap-8 md:gap-12">
              {METRICS.map(m => (
                <div key={m.label}>
                  <div className="text-2xl font-serif text-[#153839]">{m.value}</div>
                  <div className="text-[0.8rem] text-[#301f10]/60 mt-1 uppercase tracking-wider">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BENTO: BENEFITS ZONE ═══ */}
      <section id="bienfaits" className="mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12 pt-3">
        <div className="bento-benefits-grid">
          {/* Header — occupies narrow left column */}
          <div className="bento-ben-header flex flex-col justify-end pb-6">
            <span className="landing-type-eyebrow mb-6 block text-[var(--orange)]">— Bienfaits</span>
            <h2 className="landing-type-h2 landing-text-high display-tight leading-[0.94]">
              <span className="font-serif tracking-normal">Ce que le massage</span><br />
              <span className="landing-display-italic text-[0.75em] landing-text-muted">vous apporte.</span>
            </h2>
          </div>

          {/* Void — pure breathing space */}
          <div className="bento-ben-void hidden lg:block" />

          {/* Benefit cards */}
          {BENEFITS.map((b, i) => (
            <article key={b.num} className={`bento-ben-${i} flex flex-col items-center justify-center border-t border-[var(--landing-tint)] px-4 pt-10 pb-6 text-center md:min-h-[12rem] lg:min-h-[13rem] lg:px-6 lg:pt-10 lg:pb-8`}>
              <span className="landing-display-italic text-[1.45rem] leading-none text-[var(--orange)]/82 md:text-[1.7rem]">{b.num}</span>
              <h3 className="landing-type-h4 landing-text-high display-tight mt-4 font-serif tracking-normal">{b.title}</h3>
              <p className="landing-type-body-s landing-text-body mt-3 mx-auto max-w-[32ch] leading-relaxed">{b.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ═══ BENTO: SERVICES ZONE ═══ */}
      <section id="sessions" className="mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12 pt-3">
        <div className="bento-services-header-grid mb-3">
          <div className="bento-srv-title">
            <span className="landing-type-eyebrow mb-6 block text-[var(--orange)]">— La collection</span>
            <h2 className="landing-type-h2 landing-text-high display-tight">
              <span className="font-serif tracking-[0.015em]">Huit soins,</span><br />
              <span className="landing-display-italic text-[0.75em] landing-text-muted">une intention.</span>
            </h2>
          </div>
          <div className="bento-srv-intro flex items-end">
            <p className="landing-type-body landing-text-body max-w-sm">Chaque soin est calibré : durée, intensité, intention. Découvrez la collection et choisissez le rituel qui correspond à votre besoin du moment.</p>
          </div>
        </div>

        <div className="bento-services-grid">
          {SERVICES.map((s, i) => (
            <article key={s.id} className={`bento-srv-${i}`}>
              <button type="button" onClick={() => router.push(`/booking?service=${s.id}`)} className="group flex h-full w-full flex-col text-left transition-all duration-500 hover:-translate-y-1 bg-white border border-[rgba(0,0,0,0.06)] overflow-hidden" style={{ borderRadius: 0 }}>
                <div className="relative shrink-0 w-full aspect-[3/2] overflow-hidden">
                  <img src={s.image} alt={s.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                  <div className="absolute inset-0 bg-black/5 transition-colors duration-500 group-hover:bg-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="landing-type-caption text-[var(--landing-warm-muted)] font-medium text-[0.7rem]">N° {s.id}</span>
                    <div className="h-px w-4 bg-[var(--landing-tint)]" />
                    <span className="landing-type-caption text-[var(--landing-warm-soft)] text-[0.7rem]">{s.displayDuration ?? s.duration}</span>
                  </div>
                  <h3 className="text-[0.95rem] leading-[1.2] font-serif tracking-normal landing-text-high display-tight transition-colors duration-500 group-hover:text-[var(--landing-warm-hover)]" title={s.name}>{s.displayName ?? s.name}</h3>
                  <p className="landing-type-body-s landing-text-body mt-2 line-clamp-2 min-h-[2.4rem] transition-colors group-hover:text-landing-soft text-[0.75rem] leading-relaxed">{s.desc}</p>
                  <div className="mt-auto flex items-center justify-end pt-4">
                    <div className="flex items-center gap-1 text-[var(--landing-warm)] opacity-0 -translate-x-3 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 font-medium text-[0.75rem]">
                      <span>Réserver</span><ArrowUpRight size={12} strokeWidth={2.5} className="text-[var(--orange)]" />
                    </div>
                  </div>
                </div>
              </button>
            </article>
          ))}
          {/* Void cell between services */}
          <div className="bento-srv-void hidden lg:block" />
        </div>
      </section>

      {/* ═══ BENTO: FAQ ZONE ═══ */}
      <section id="faq" className="mx-auto max-w-[1360px] px-6 md:px-10 lg:px-12 pt-3 pb-0">
        <div className="bento-faq-grid">
          {/* Sidebar — micro-aligned bottom-right */}
          <div className="bento-faq-sidebar flex flex-col justify-end items-start lg:items-end lg:text-right">
            <span className="landing-type-eyebrow mb-6 block text-[var(--orange)]">— Questions fréquentes</span>
            <h2 className="landing-type-h2 landing-text-high display-tight">
              <span className="font-serif tracking-[0.015em]">Tout ce qu&apos;il faut savoir</span><br />
              <span className="landing-display-italic text-[0.75em] landing-text-muted">avant la séance.</span>
            </h2>
            <p className="landing-type-body landing-text-body mt-8 max-w-[21rem]">Quelques repères simples pour arriver sereinement au cabinet, comprendre le déroulé du soin et savoir à quoi vous attendre.</p>
          </div>

          {/* FAQ accordion */}
          <div className="bento-faq-main">
            <div className="landing-section-header border-b border-[var(--landing-tint)] pb-8">
              <p className="landing-type-eyebrow text-[var(--landing-warm-faint)]">FAQ Serenity</p>
            </div>
            {FAQ.map((item, index) => {
              const isOpen = openFaq === index;
              const number = String(index + 1).padStart(2, "0");
              return (
                <article key={item.q} className={`border-b border-[var(--landing-tint)] py-5 md:py-6 ${isOpen ? "bg-transparent" : ""}`}>
                  <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)} className="group grid w-full grid-cols-[48px_1fr_36px] items-start gap-3 text-left md:grid-cols-[60px_1fr_40px] md:gap-5" aria-expanded={isOpen}>
                    <span className="landing-display-italic text-[1.45rem] leading-none text-[var(--orange)]/82 transition-colors duration-300 group-hover:text-[var(--orange)] md:text-[1.7rem]">{number}</span>
                    <div><h3 className="landing-type-h5 landing-text-high display-tight transition-colors duration-300 group-hover:text-[var(--landing-warm-hover-soft)]">{item.q}</h3></div>
                    <span className={`landing-text-body mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--landing-tint)] transition-all duration-300 md:h-9 md:w-9 ${isOpen ? "rotate-45 border-[var(--orange)]/28 text-[var(--orange)]" : "group-hover:border-[var(--orange)]/40 group-hover:text-[var(--orange)]"}`}><Plus size={15} strokeWidth={2.2} /></span>
                  </button>
                  {isOpen && (
                    <div className="grid grid-cols-1 gap-3 pt-4 md:grid-cols-[60px_1fr] md:gap-5">
                      <div />
                      <div className="border-t border-[var(--landing-tint-soft)] pt-4">
                        <p className="landing-type-body-s landing-text-body max-w-[44ch]">{item.a}</p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* Pure void */}
          <div className="bento-faq-void hidden lg:block" />
        </div>
      </section>

      {/* ═══ FOOTER (preserved) ═══ */}
      <footer className="w-full text-white font-sans mt-6">
        <div className="w-full bg-[#0a1f1a] px-6 py-12 md:px-10 md:py-14 lg:px-12">
          <div className="mx-auto max-w-[1360px]">
            <div className="mb-10 grid grid-cols-1 gap-8 text-left md:grid-cols-2 md:gap-x-10 md:gap-y-12 xl:grid-cols-[1.2fr_0.95fr_1fr_1.1fr_1.2fr]">
              <div className="max-w-[15rem]"><div className="space-y-3"><div className="landing-type-h4 text-[var(--off-white)]">SRT</div><div className="landing-type-micro text-white/30">SÉRÉNITÉ & ÉQUILIBRE</div></div></div>
              <div className="max-w-[14rem]"><div className="space-y-6"><div className="landing-type-micro text-white/30">Contact</div><div className="grid gap-y-2 pt-1 landing-type-body-s leading-[1.35] text-white/70"><a href="tel:+41220000000" className="transition-colors hover:text-emerald-200">+41 22 000 00 00</a><a href="mailto:hello@serenityrelax.ch" className="transition-colors hover:text-emerald-200">hello@serenityrelax.ch</a></div></div></div>
              <div className="max-w-[15rem]"><div className="space-y-6"><div className="landing-type-micro text-white/30">Le Cabinet</div><a href="https://maps.google.com/?q=Chemin+de+Joinville+26+1216+Cointrin+Genève" target="_blank" className="grid gap-y-2 pt-1 landing-type-body-s leading-[1.35] text-white/70 hover:text-emerald-200"><span>Chemin de Joinville 26</span><span>1216 Cointrin, Genève</span></a></div></div>
              <div className="w-full max-w-[22rem]"><div className="space-y-6"><div className="landing-type-micro text-white/30">Horaires</div><div className="landing-type-body-s grid gap-y-2 pt-1 leading-[1.35] text-white/50"><div className="flex items-baseline gap-3 whitespace-nowrap"><span>Lun — Ven</span><span className="text-white/80">08:00 — 21:00</span></div><div className="flex items-baseline gap-3 whitespace-nowrap"><span>Sam — Dim</span><span className="text-white/80">09:30 — 21:00</span></div></div></div></div>
            </div>
            <div className="flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 md:flex-row md:items-center">
              <div className="landing-type-micro text-white/20">© 2024 SERENITY RELAX THERAPY.</div>
              <div className="landing-type-micro flex gap-6 text-white/30"><a href="#" className="transition-colors hover:text-white">Confidentialité</a><a href="#" className="transition-colors hover:text-white">Mentions Légales</a></div>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ BENTO GRID CSS ═══ */}
      <style>{`
        /* ──────── HERO BENTO ──────── */
        .bento-hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4px;
        }
        .bento-hero-a { min-height: 65vh; grid-column: 1; }
        .bento-hero-b { display: none; }
        .bento-hero-c { padding: 24px 0; }
        .bento-hero-d { padding: 16px 0; }
        .bento-hero-e { padding: 16px 0; border-top: 1px solid var(--landing-tint); }

        @media (min-width: 1024px) {
          .bento-hero-grid {
            grid-template-columns: 7fr 1fr 4fr;
            grid-template-rows: 1fr auto auto;
            gap: 4px;
            min-height: 82vh;
          }
          .bento-hero-a { grid-column: 1 / 2; grid-row: 1 / 4; min-height: unset; }
          .bento-hero-b { display: block; grid-column: 2 / 3; grid-row: 1 / 2; }
          .bento-hero-c { grid-column: 3 / 4; grid-row: 1 / 2; padding: 32px; align-self: end; justify-self: end; }
          .bento-hero-d { grid-column: 3 / 4; grid-row: 2 / 3; padding: 32px; }
          .bento-hero-e { grid-column: 2 / 4; grid-row: 3 / 4; padding: 24px 32px; border-top: 1px solid var(--landing-tint); }
        }

        /* ──────── BENEFITS BENTO ──────── */
        .bento-benefits-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4px;
        }
        .bento-ben-header { padding: 32px 0; }
        .bento-ben-void { display: none; }

        @media (min-width: 1024px) {
          .bento-benefits-grid {
            grid-template-columns: 5fr 1fr 2fr 2fr 2fr;
            grid-template-rows: auto;
            gap: 4px;
            align-items: stretch;
          }
          .bento-ben-header { grid-column: 1 / 2; grid-row: 1; padding: 48px 32px 48px 0; }
          .bento-ben-void { display: block; grid-column: 2 / 3; grid-row: 1; }
          .bento-ben-0 { grid-column: 3 / 4; grid-row: 1; }
          .bento-ben-1 { grid-column: 4 / 5; grid-row: 1; }
          .bento-ben-2 { grid-column: 5 / 6; grid-row: 1; }
        }

        /* ──────── SERVICES HEADER ──────── */
        .bento-services-header-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          padding: 32px 0;
        }
        @media (min-width: 1024px) {
          .bento-services-header-grid {
            grid-template-columns: 5fr 1fr 6fr;
            gap: 4px;
          }
          .bento-srv-title { grid-column: 1 / 2; }
          .bento-srv-intro { grid-column: 3 / 4; }
        }

        /* ──────── SERVICES BENTO (asymmetric) ──────── */
        .bento-services-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4px;
        }
        .bento-srv-void { display: none; }

        @media (min-width: 768px) {
          .bento-services-grid { grid-template-columns: repeat(4, 1fr); }
        }

        @media (min-width: 1024px) {
          .bento-services-grid {
            grid-template-columns: 3fr 2fr 2fr 1fr 2fr;
            grid-template-rows: auto auto;
            gap: 4px;
          }
          .bento-srv-0 { grid-column: 1 / 2; grid-row: 1 / 3; }
          .bento-srv-0 .group { min-height: 100%; }
          .bento-srv-0 .group > div:first-child { aspect-ratio: 2/3; }
          .bento-srv-1 { grid-column: 2 / 3; grid-row: 1; }
          .bento-srv-2 { grid-column: 3 / 4; grid-row: 1; }
          .bento-srv-void { display: block; grid-column: 4 / 5; grid-row: 1; }
          .bento-srv-3 { grid-column: 5 / 6; grid-row: 1; }
          .bento-srv-4 { grid-column: 2 / 3; grid-row: 2; }
          .bento-srv-5 { grid-column: 3 / 4; grid-row: 2; }
          .bento-srv-6 { grid-column: 4 / 5; grid-row: 2; }
          .bento-srv-7 { grid-column: 5 / 6; grid-row: 2; }
        }

        /* ──────── FAQ BENTO ──────── */
        .bento-faq-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          padding: 32px 0;
        }
        .bento-faq-void { display: none; }

        @media (min-width: 1024px) {
          .bento-faq-grid {
            grid-template-columns: 3fr 1fr 8fr;
            grid-template-rows: auto;
            gap: 4px;
          }
          .bento-faq-sidebar { grid-column: 1 / 2; grid-row: 1; padding-right: 32px; }
          .bento-faq-void { display: block; grid-column: 2 / 3; grid-row: 1; }
          .bento-faq-main { grid-column: 3 / 4; grid-row: 1; }
        }
      `}</style>
    </div>
  );
}
