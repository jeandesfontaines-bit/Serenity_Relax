'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Instagram, Linkedin, MapPin } from 'lucide-react';

import BookingFunnel from '@/components/BookingFunnel';
import Accordion from '@/components/Accordion';
import { useBooking } from '@/context/BookingContext';
import {
  SERVICES,
  IMPACTS,
  AFTERCARE_EXPERIENCE,
  FAQ_ITEMS,
  MY_PHOTO,
} from '@/data';

export default function Home() {
  const { openModal } = useBooking();
  const [selectedTip, setSelectedTip] = useState(0);
  const heroHighlights = [
    { label: 'Soins signatures', value: `${SERVICES.length}` },
    { label: 'Rituels après-séance', value: `${AFTERCARE_EXPERIENCE.length}` },
    { label: 'Questions utiles', value: `${FAQ_ITEMS.length}` },
  ];

  return (
    <div className="relative overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(132,204,22,0.11),transparent_22%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.11),transparent_24%),linear-gradient(180deg,#fffdfa_0%,#f7f8fc_42%,#fbfcfe_100%)] text-[#0f172a] selection:bg-[#d9f99d] selection:text-[#0f172a]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-[28rem] w-[28rem] rounded-full bg-[#84cc16]/[0.08] blur-3xl" />
        <div className="absolute right-0 top-0 h-[24rem] w-[24rem] rounded-full bg-[#6366f1]/[0.08] blur-3xl" />
        <div className="absolute bottom-[16%] left-[8%] h-[18rem] w-[18rem] rounded-full bg-white/70 blur-3xl" />
      </div>

      <nav className="absolute left-0 top-0 z-50 flex w-full items-center justify-between border-b border-[#e2e8f0]/80 bg-[rgba(255,255,255,0.72)] px-6 py-5 backdrop-blur-xl md:px-10 lg:px-16">
        <div>
          <div className="flex items-baseline gap-2">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[#64748b] md:text-[0.8rem]">
              SERENITY RELAX THERAPY
            </p>
            <span className="font-serif text-[0.64rem] italic leading-none text-[#0f172a] md:text-[0.72rem]">
              by João
            </span>
          </div>
        </div>

        <div className="hidden items-center space-x-10 md:flex">
          <a className="border-b border-[#0f172a] pb-1 text-xs uppercase tracking-[0.2em] text-[#0f172a]" href="#sessions">
            Sessions
          </a>
          <a className="text-xs uppercase tracking-[0.2em] text-[#64748b] transition-colors duration-500 hover:text-[#0f172a]" href="#sanctuary">
            Sanctuary
          </a>
          <a className="text-xs uppercase tracking-[0.2em] text-[#64748b] transition-colors duration-500 hover:text-[#0f172a]" href="#journal">
            Journal
          </a>
          <a className="text-xs uppercase tracking-[0.2em] text-[#64748b] transition-colors duration-500 hover:text-[#0f172a]" href="#atelier">
            Atelier
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-[#dbe3ef] bg-white/84 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0f172a] transition-all duration-500 hover:-translate-y-[1px] hover:bg-white md:px-6"
          >
            Connexion
          </Link>
          <button
            onClick={() => openModal(SERVICES[0])}
            className="rounded-full bg-gradient-to-r from-[#5b21b6] to-[#6366f1] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_12px_24px_rgba(99,102,241,0.22)] transition-all duration-500 hover:-translate-y-[1px] md:px-8"
          >
            Réserver
          </button>
        </div>
      </nav>

      <main className="relative overflow-hidden pt-28">
        <section className="relative flex min-h-[85vh] items-center px-6 pb-24 pt-10 md:px-10 lg:px-16 lg:pt-16">
          <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="relative z-30 lg:col-span-5 lg:pr-8">
              <span className="mb-6 inline-block rounded-full border border-[#d9f99d] bg-[#f7fee7] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#3f6212]">
                Architectural Wellness
              </span>
              <h1 className="serif-font mb-8 text-[3.4rem] leading-[1.02] tracking-[-0.04em] text-[#0f172a] md:text-[5rem] lg:text-[6.25rem]">
                The Art of <br />
                <span className="italic text-[#6366f1]">Centering.</span>
              </h1>
              <p className="mb-12 max-w-md text-lg leading-relaxed text-[#475569]">
                Une parenthèse thérapeutique pensée comme un souffle profond: matières
                organiques, silence visuel et soins ciblés pour réancrer le corps.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <button
                  onClick={() => openModal(SERVICES[0])}
                  className="rounded-full bg-[#111827] px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] text-white shadow-[0_14px_26px_rgba(15,23,42,0.18)] transition-all duration-500 hover:-translate-y-[1px]"
                >
                  Commencer le rituel
                </button>
                <a
                  href="#sessions"
                  className="inline-flex items-center justify-center rounded-full border border-[#dbe3ef] bg-white/78 px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] text-[#0f172a] transition-colors duration-500 hover:bg-[#f8faff]"
                >
                  Explorer les soins
                </a>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {heroHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[20px] border border-[#e2e8f0] bg-white/76 px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#94a3b8]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[#0f172a]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-20 mt-16 flex justify-end lg:col-span-7 lg:mt-0">
              <div className="relative w-full max-w-[600px] overflow-visible">
                <div className="absolute -left-12 top-10 hidden h-40 w-40 rounded-full bg-[#d9f99d]/50 blur-3xl lg:block" />
                <div className="absolute right-[-2rem] top-[-2rem] hidden h-44 w-44 rounded-full bg-[#c7d2fe]/55 blur-3xl lg:block" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] border border-white/70 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                  <Image
                    src={MY_PHOTO}
                    alt="João massothérapie Genève"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 600px"
                  />
                </div>

                <div className="absolute bottom-6 right-6 rounded-[24px] border border-white/70 bg-[rgba(255,255,255,0.88)] px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#94a3b8]">
                    Focus du jour
                  </p>
                  <p className="mt-2 text-xl font-semibold text-[#0f172a]">Présence. Lâcher-prise.</p>
                  <p className="mt-1 text-sm text-[#64748b]">Approche thérapeutique douce, ciblée et premium.</p>
                </div>

                <div className="absolute -bottom-10 -left-3 hidden aspect-[3/4] w-[180px] overflow-hidden rounded-[28px] border-[10px] border-[#f8faff] shadow-[0_18px_36px_rgba(15,23,42,0.14)] md:block lg:-bottom-16 lg:-left-16 lg:w-[250px]">
                  <Image
                    src={SERVICES[1].image}
                    alt={SERVICES[1].name}
                    fill
                    className="object-cover"
                    sizes="250px"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="sessions" className="bg-[linear-gradient(180deg,rgba(248,250,252,0.3),rgba(241,245,249,0.66))] px-6 py-24 md:px-10 lg:px-16 lg:py-[120px]">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-16 flex flex-col gap-6 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.3em] text-[#6366f1]">
                La Collection
                </span>
                <h2 className="serif-font text-4xl text-[#0f172a] md:text-5xl">
                  Nos Soins Exclusifs
                </h2>
              </div>
              <p className="max-w-xl text-base leading-relaxed text-[#64748b]">
                Une collection pensée comme un menu éditorial: plus lisible, plus sensorielle,
                plus premium, sans perdre la clarté de réservation.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-4">
              {SERVICES.map((service) => (
                <button
                  key={service.id}
                  onClick={() => openModal(service)}
                  className="group rounded-[28px] border border-[#e2e8f0] bg-white/80 p-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(15,23,42,0.1)]"
                >
                  <div className="mb-6 aspect-[3/4] overflow-hidden rounded-[22px] bg-[#e5e7eb]">
                    <Image
                      src={service.image}
                      alt={service.name}
                      width={700}
                      height={900}
                      className="h-full w-full object-cover grayscale-[20%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    />
                  </div>
                  <div className="space-y-2 px-1 pb-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="rounded-full border border-[#d9f99d] bg-[#f7fee7] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4d7c0f]">
                        {service.tag}
                      </span>
                      <span className="text-[11px] text-[#64748b]">{service.duration}</span>
                    </div>
                    <h3 className="serif-font text-[1.45rem] text-[#0f172a]">{service.name}</h3>
                    <p className="max-w-xs text-sm leading-relaxed text-[#475569]">{service.desc}</p>
                    <div className="inline-flex items-center gap-2 pt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#0f172a]">
                      Découvrir le rituel <ArrowRight size={12} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="sanctuary" className="px-6 py-24 md:px-10 lg:px-16 lg:py-[120px]">
          <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 lg:gap-10">
            <div className="relative col-span-12 lg:col-span-7">
              <div className="relative overflow-hidden rounded-[36px] border border-[#e2e8f0] bg-[linear-gradient(135deg,#eef2ff,#ffffff)] p-5 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
                <div className="relative h-[520px] w-full overflow-hidden rounded-[30px] shadow-2xl shadow-stone-200">
                <Image
                  src={SERVICES[2].image}
                  alt={SERVICES[2].name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
              </div>
              </div>

              <div className="absolute -bottom-8 right-0 z-20 max-w-xs rounded-[24px] border border-white/70 bg-white/92 p-8 shadow-[0_18px_38px_rgba(15,23,42,0.12)] backdrop-blur-md md:-bottom-12 md:-right-6 md:p-10">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#6366f1]">
                  Après la séance
                </p>
                <h3 className="serif-font mb-3 text-2xl text-[#0f172a]">
                  {AFTERCARE_EXPERIENCE[selectedTip].title}
                </h3>
                <p className="text-sm leading-relaxed text-[#475569]">
                  {AFTERCARE_EXPERIENCE[selectedTip].advice}
                </p>
              </div>
            </div>

            <div className="col-span-12 mt-20 lg:col-span-4 lg:col-start-9 lg:mt-0">
              <div className="rounded-[30px] border border-[#e2e8f0] bg-white/76 p-8 shadow-[0_10px_32px_rgba(15,23,42,0.05)] lg:p-10">
              <div className="space-y-12 lg:space-y-16">
                {IMPACTS.map((impact, index) => (
                  <div key={impact.title}>
                    <span className="text-sm font-bold uppercase tracking-widest text-[#6366f1]">
                      0{index + 1} / {impact.title}
                    </span>
                    <h2 className="serif-font mb-4 mt-4 text-3xl text-[#0f172a] md:text-[2rem]">
                      {index === 0
                        ? 'Restorative Reset'
                        : index === 1
                          ? 'Myofascial Ease'
                          : index === 2
                            ? 'Circulatory Flow'
                            : 'Deep Regeneration'}
                    </h2>
                    <p className="text-base leading-relaxed text-[#475569]">{impact.desc}</p>
                    {index !== IMPACTS.length - 1 && (
                      <div className="mt-12 h-px w-full bg-[#e2e8f0]" />
                    )}
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>
        </section>

        <section id="journal" className="px-6 py-24 text-center md:px-10 lg:px-16 lg:py-[120px]">
          <div className="mx-auto max-w-3xl">
            <span className="mb-6 inline-block text-[11px] font-bold uppercase tracking-[0.3em] text-[#6366f1]">
              Journal du Corps
            </span>
            <h2 className="serif-font mb-10 text-4xl text-[#0f172a] md:text-5xl">
              Le rituel continue après la séance.
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-base leading-relaxed text-[#475569] md:text-lg">
              Chaque soin appelle une intégration. Sélectionnez une étape pour prolonger les
              effets du massage et soutenir votre récupération.
            </p>

            <div className="mx-auto max-w-3xl rounded-[32px] border border-[#e2e8f0] bg-[linear-gradient(135deg,#ffffff,#f8fafc)] p-8 text-left shadow-[0_14px_34px_rgba(15,23,42,0.06)] md:p-12">
              <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start">
                <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#eef2ff] text-5xl shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                  {AFTERCARE_EXPERIENCE[selectedTip].icon}
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#6366f1]">
                    {AFTERCARE_EXPERIENCE[selectedTip].time}
                  </p>
                  <h3 className="serif-font text-3xl text-[#0f172a]">
                    {AFTERCARE_EXPERIENCE[selectedTip].title}
                  </h3>
                </div>
              </div>
              <p className="mb-8 text-lg leading-relaxed text-[#475569]">
                {AFTERCARE_EXPERIENCE[selectedTip].desc}
              </p>
              <p className="text-sm uppercase tracking-[0.24em] text-[#64748b]">
                {AFTERCARE_EXPERIENCE[selectedTip].quote}
              </p>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              {AFTERCARE_EXPERIENCE.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedTip(index)}
                  aria-label={`Afficher ${item.title}`}
                  className={`h-2 rounded-full transition-all ${
                    selectedTip === index ? 'w-12 bg-[#6366f1]' : 'w-8 bg-[#cbd5e1]'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="atelier" className="px-6 py-24 md:px-10 lg:px-16 lg:py-[120px]">
          <div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <div>
              <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.3em] text-[#6366f1]">
                Atelier
              </span>
              <h2 className="serif-font mb-10 text-4xl text-[#0f172a] md:text-5xl">
                Questions fréquentes
              </h2>
              <div className="space-y-2">
                {FAQ_ITEMS.map((item, index) => (
                  <Accordion key={index} item={item} />
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[32px] border border-[#e2e8f0] bg-[linear-gradient(135deg,#ffffff,#f8fafc)] p-8 shadow-[0_12px_32px_rgba(15,23,42,0.06)] md:p-12">
              <div>
                <span className="mb-4 inline-block rounded-full border border-[#d9f99d] bg-[#f7fee7] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#4d7c0f]">
                  Join the Sanctuary
                </span>
                <h3 className="serif-font mb-6 text-3xl text-[#0f172a] md:text-4xl">
                  Recevez nos prochains rituels et disponibilités.
                </h3>
                <p className="mb-10 max-w-md text-base leading-relaxed text-[#475569]">
                  Conseils de récupération, nouveautés du cabinet et ouvertures de créneaux
                  transmis avec discrétion.
                </p>

                <form className="max-w-md">
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    className="w-full rounded-[18px] border border-[#dbe3ef] bg-white/88 px-5 py-4 text-base text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#6366f1] focus:outline-none focus:ring-4 focus:ring-[#6366f1]/10"
                  />
                  <button
                    type="button"
                    className="mt-6 rounded-full bg-[#111827] px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white transition-all hover:-translate-y-[1px]"
                  >
                    S'inscrire
                  </button>
                </form>
              </div>

              <div className="mt-12 border-t border-[#e2e8f0] pt-8">
                <div className="flex items-start gap-3 text-sm text-[#475569]">
                  <MapPin size={18} className="mt-0.5 text-[#6366f1]" />
                  <div>
                    <p>Rue du Rhône 12, 1204 Genève</p>
                    <p>Lundi au samedi, 09:00 à 19:00</p>
                  </div>
                </div>
                <button
                  onClick={() => openModal(SERVICES[0])}
                  className="mt-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#5b21b6] to-[#6366f1] px-7 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white shadow-[0_12px_28px_rgba(99,102,241,0.2)] transition-transform hover:scale-[1.02]"
                >
                  Réserver un soin <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex w-full flex-col justify-between gap-12 bg-[#0f172a] px-6 py-20 md:px-10 md:py-24 lg:flex-row lg:items-end lg:px-16">
        <div className="flex flex-col items-start">
          <div className="mb-6 flex items-baseline gap-2">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-white/75 md:text-[0.8rem]">
              SERENITY RELAX THERAPY
            </p>
            <span className="font-serif text-[0.64rem] italic leading-none text-white md:text-[0.72rem]">
              by João
            </span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
            © 2026 Serenity Relax Therapy. Massothérapie Genève.
          </div>
        </div>

        <div className="flex flex-wrap gap-8 text-[10px] uppercase tracking-[0.24em] text-slate-400 md:gap-12">
          <a className="transition-colors duration-300 hover:text-white" href="#">
            Privacy
          </a>
          <a className="transition-colors duration-300 hover:text-white" href="#">
            Terms
          </a>
          <a
            className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-white"
            href="#"
          >
            <Instagram size={14} /> Instagram
          </a>
          <a
            className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-white"
            href="#"
          >
            <Linkedin size={14} /> LinkedIn
          </a>
        </div>
      </footer>

      <BookingFunnel />
    </div>
  );
}
