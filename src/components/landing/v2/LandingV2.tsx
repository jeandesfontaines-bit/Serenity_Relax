'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Geist, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { ArrowDownRight, ArrowUpRight, Clock, Instagram, Linkedin, Mail, MapPin, Menu, Phone, Plus, X } from 'lucide-react';
import {
  AFTERCARE,
  FAQ,
  HERO_IMAGE,
  IMPACTS,
  JOURNAL_IMAGE,
  SANCTUARY_IMAGE,
  SERVICES,
} from '@/data/landingV2';
import LoginModal from '@/components/auth/LoginModal';

const NAV_LINKS = [
  { label: 'Sessions', href: '#sessions' },
  { label: 'Sanctuaire', href: '#sanctuary' },
  { label: 'Journal', href: '#journal' },
  { label: 'FAQ', href: '#atelier' },
];

const FILTERS = ['Tous', 'Signature', 'Restorative', 'Sportive', 'Sensorielle'];

const landingDisplay = Geist({ subsets: ['latin'], variable: '--landing-font-display', weight: ['400', '500', '600', '700'] });
const landingSerif = Instrument_Serif({ subsets: ['latin'], variable: '--landing-font-serif', weight: ['400'] });
const landingMono = JetBrains_Mono({ subsets: ['latin'], variable: '--landing-font-mono', weight: ['500', '600'] });

export default function LandingV2() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('Tous');
  const [active, setActive] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [email, setEmail] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const filtered = SERVICES.filter((s) => filter === 'Tous' || s.tag === filter);
  const item = AFTERCARE[active];

  return (
    <div className={`${landingDisplay.variable} ${landingSerif.variable} ${landingMono.variable} landing-v2 min-h-screen bg-[#F6F2EA] text-[#152023]`}>
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-[#F6F2EA]/85 backdrop-blur-xl border-b border-[#152023]/8' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-6 py-4 md:px-10 lg:px-14">
          <a href="#top" className="flex items-baseline gap-2">
            <span className="text-base font-semibold tracking-tight text-[#152023]">Serenity Relax</span>
            <span className="text-xs tracking-wide text-[#152023]/50">— by João</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="editorial-link text-sm font-medium tracking-tight text-[#152023]/70 hover:text-[#152023] transition-colors duration-300">
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/booking" className="hidden md:inline-flex items-center gap-2 rounded-full bg-[#F1664D] px-5 py-2.5 text-sm font-semibold tracking-tight text-white transition-all duration-300 hover:bg-[#152023]">
              Réserver
            </Link>
            <button type="button" onClick={() => setLoginOpen(true)} className="hidden md:inline-flex rounded-full border border-[#152023]/15 px-5 py-2.5 text-sm font-medium text-[#152023]">Connexion</button>
            <button className="md:hidden flex flex-col gap-1.5" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-[#152023]/8 bg-[#F6F2EA]/95 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-5 px-6 py-7">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-sm font-medium tracking-tight text-[#152023]">
                  {link.label}
                </a>
              ))}
              <Link href="/booking" onClick={() => setOpen(false)} className="mt-2 inline-flex items-center justify-center rounded-full bg-[#F1664D] px-6 py-3 text-sm font-semibold tracking-tight text-white">Réserver</Link>
              <button type="button" onClick={() => { setOpen(false); setLoginOpen(true); }} className="inline-flex items-center justify-center rounded-full border border-[#152023]/15 px-6 py-3 text-sm font-medium text-[#152023]">Connexion</button>
            </div>
          </div>
        )}
      </nav>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      <section id="top" className="relative overflow-hidden pt-28 pb-24 md:pt-36 md:pb-32 lg:pt-44">
        <div className="relative mx-auto grid max-w-[1480px] grid-cols-12 gap-6 px-6 md:px-10 lg:px-14">
          <div className="col-span-12 lg:col-span-6 editorial-rise">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-[#E5FD98] px-4 py-2 mb-10">
              <span className="h-1.5 w-1.5 rounded-full bg-[#29CA72]" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#152023]">Disponible cette semaine · Genève</span>
            </div>

            <h1 className="display-tight text-[3.75rem] text-[#152023] md:text-[5.5rem] lg:text-[6.5rem]">
              Le corps écouté.<br />
              <em>Le geste précis.</em>
            </h1>

            <p className="mt-10 max-w-lg text-lg leading-[1.55] text-[#152023]/70 md:text-xl">
              Massothérapie thérapeutique pensée pour les corps actifs.
              Soins ciblés, environnement minimal, résultats durables.
            </p>

            <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/booking" className="group relative inline-flex items-center gap-3 rounded-full bg-[#F1664D] px-8 py-4 text-white transition-all duration-500 hover:bg-[#152023]">
                <span className="text-sm font-semibold tracking-tight">Réserver une séance</span>
                <ArrowDownRight size={18} strokeWidth={2} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </Link>
              <a href="#sessions" className="text-sm font-medium tracking-tight text-[#152023]/70 hover:text-[#152023] transition-colors duration-300 editorial-link">
                Voir les soins
              </a>
            </div>

            <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-[#152023]/10 pt-10 sm:grid-cols-3">
              <div><dd className="display-tight text-4xl text-[#152023] md:text-5xl">8</dd><dt className="mt-2 text-xs font-medium tracking-wide text-[#152023]/50">Soins signature</dt></div>
              <div><dd className="display-tight text-4xl text-[#152023] md:text-5xl">12<span className="text-2xl text-[#152023]/40">a</span></dd><dt className="mt-2 text-xs font-medium tracking-wide text-[#152023]/50">D'expérience</dt></div>
            </dl>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8 mt-12 lg:mt-0">
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Image src={HERO_IMAGE} alt="Soin signature Serenity Relax" fill className="h-full w-full object-cover slow-pan" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14"><div className="hairline" /></div>

      <section id="sessions" className="relative py-24 md:py-32 lg:py-36">
        <div className="relative mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
          <header className="mb-16 grid grid-cols-12 gap-6 lg:mb-20">
            <div className="col-span-12 lg:col-span-7">
              <span className="mono-caption text-[#153839]">— La collection</span>
              <h2 className="mt-6 display-tight text-5xl text-[#152023] md:text-6xl lg:text-7xl">Huit soins, <em>une intention.</em></h2>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-8"><p className="text-base leading-[1.6] text-[#152023]/65">Chaque soin est calibré : durée, intensité, intention. Filtrez selon votre besoin du moment.</p></div>
          </header>

          <div className="mb-12 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-5 py-2.5 text-sm font-medium tracking-tight transition-all duration-300 ${filter===f?'bg-[#152023] text-[#F6F2EA]':'bg-[#152023]/5 text-[#152023]/70 hover:bg-[#152023]/10'}`}>{f}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((service) => (
              <article key={service.id} className="group flex flex-col">
                <Link href={`/booking?service=${service.id}`} className="text-left">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#152023]/5">
                    <Image src={service.image} alt={service.name} fill className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105" />
                    <div className="absolute top-4 left-4 rounded-full bg-[#F6F2EA]/90 backdrop-blur-md px-3 py-1.5"><span className="text-[11px] font-semibold tracking-tight text-[#152023]">{service.tag}</span></div>
                  </div>
                  <div className="mt-5 flex items-center gap-3"><span className="text-xs font-medium tracking-wide text-[#152023]/40">N° {service.id}</span><span className="h-1 w-1 rounded-full bg-[#152023]/20" /><span className="text-xs font-medium tracking-wide text-[#152023]/40">{service.duration}</span></div>
                  <h3 className="mt-2 display-tight text-3xl text-[#152023] transition-colors duration-300 group-hover:text-[#153839]">{service.name}</h3>
                  <p className="mt-3 text-sm leading-[1.6] text-[#152023]/65">{service.desc}</p>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium tracking-tight text-[#152023]"><span>Découvrir</span><ArrowUpRight size={15} strokeWidth={1.75} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="sanctuary" className="relative bg-[#152023] py-24 md:py-32 lg:py-36 text-[#F6F2EA]">
        <div className="relative mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
          <header className="mb-16 grid grid-cols-12 gap-6 lg:mb-20"><div className="col-span-12 lg:col-span-7"><span className="mono-caption text-[#E5FD98]">— Le sanctuaire</span><h2 className="mt-6 display-tight text-5xl text-[#F6F2EA] md:text-6xl lg:text-7xl">Quatre impacts, <em className="text-[#E5FD98]">une transformation.</em></h2></div></header>
          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            <div className="col-span-12 lg:col-span-7 relative">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl"><Image src={SANCTUARY_IMAGE} alt="Atmosphère du cabinet Serenity Relax" fill className="h-full w-full object-cover" /></div>
              <div className="absolute -bottom-8 -right-4 max-w-sm rounded-2xl bg-[#BCACFB] p-7 text-[#152023] shadow-2xl md:-right-12 md:p-8"><p className="text-xl leading-[1.4] font-medium tracking-tight md:text-2xl">« Un cabinet pensé comme un espace neutre — où chaque geste trouve son temps. »</p><p className="mt-5 text-xs font-bold tracking-wider uppercase">João, fondateur</p></div>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:pl-4 mt-16 lg:mt-0">
              <div className="space-y-10">
                {IMPACTS.map((impact, idx) => (
                  <div key={impact.num} className="group">
                    <div className="flex items-center gap-3"><span className="rounded-full bg-[#E5FD98] px-3 py-1 text-xs font-bold tracking-wider text-[#152023]">{impact.num}</span><span className="text-xs font-medium tracking-wider uppercase text-[#F6F2EA]/50">{impact.title}</span></div>
                    <h3 className="mt-4 display-tight text-3xl text-[#F6F2EA] md:text-4xl">{impact.fr}</h3>
                    <p className="mt-3 text-base leading-[1.6] text-[#F6F2EA]/70">{impact.desc}</p>
                    {idx !== IMPACTS.length - 1 && <div className="mt-10 h-px w-full bg-[#F6F2EA]/10" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      <section id="journal" className="relative py-24 md:py-32 lg:py-36">
        <div className="relative mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
          <header className="mb-16 grid grid-cols-12 gap-6 lg:mb-20"><div className="col-span-12 lg:col-span-7"><span className="mono-caption text-[#153839]">— Le journal du corps</span><h2 className="mt-6 display-tight text-5xl text-[#152023] md:text-6xl lg:text-7xl">Le rituel continue <em>après la séance.</em></h2></div><div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-8"><p className="text-base leading-[1.6] text-[#152023]/65">Trois moments clés pour prolonger les bénéfices du soin. Sélectionnez une étape ci-dessous.</p></div></header>
          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            <div className="col-span-12 lg:col-span-5"><div className="relative aspect-[4/5] overflow-hidden rounded-2xl"><Image src={JOURNAL_IMAGE} alt="Rituel après-séance" fill className="h-full w-full object-cover" /></div><div className="mt-6 flex gap-2">{AFTERCARE.map((step, idx) => <button key={step.id} onClick={() => setActive(idx)} className={`flex-1 rounded-full py-3 text-xs font-semibold tracking-wide transition-all duration-300 ${active===idx?'bg-[#152023] text-[#F6F2EA]':'bg-[#152023]/5 text-[#152023]/50 hover:bg-[#152023]/10'}`}>Étape {step.id}</button>)}</div></div>
            <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-8"><div key={item.id} className="editorial-rise"><div className="inline-flex items-center gap-2 rounded-full bg-[#153839]/10 px-4 py-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#153839]" /><span className="text-xs font-semibold tracking-wide text-[#153839]">{item.time}</span></div><h3 className="mt-6 display-tight text-4xl text-[#152023] md:text-5xl lg:text-6xl">{item.title}</h3><p className="mt-6 text-lg leading-[1.6] text-[#152023]/75">{item.desc}</p><div className="mt-10 rounded-2xl bg-[#BCACFB]/40 p-6 md:p-7"><p className="text-xs font-semibold tracking-wide uppercase text-[#152023]/50">Le geste</p><p className="mt-3 text-xl font-medium tracking-tight leading-[1.4] text-[#152023]">{item.advice}</p></div><p className="mt-8 italic text-sm text-[#152023]/50">— {item.quote}</p></div></div>
          </div>
        </div>
      </section>

      <section id="atelier" className="relative py-24 md:py-32 lg:py-36">
        <div className="relative mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
          <header className="mb-16 grid grid-cols-12 gap-6 lg:mb-20"><div className="col-span-12 lg:col-span-7"><span className="mono-caption text-[#153839]">— Questions fréquentes</span><h2 className="mt-6 display-tight text-5xl text-[#152023] md:text-6xl lg:text-7xl">Tout ce qu'il faut savoir <em>avant la première séance.</em></h2></div><div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-8"><p className="text-base leading-[1.6] text-[#152023]/65">Une question qui n'est pas listée ? Contactez-nous directement, nous y répondons sous 24 heures.</p></div></header>
          <div className="grid grid-cols-12 gap-6"><div className="col-span-12 lg:col-span-10 lg:col-start-2"><div className="space-y-3">{FAQ.map((faq, idx) => {const isOpen = openIdx===idx; return (<div key={idx} className={`rounded-2xl border transition-colors duration-300 ${isOpen?'bg-[#152023]/[0.03] border-[#152023]/15':'bg-[#152023]/[0.02] border-[#152023]/8 hover:border-[#152023]/15'}`}><button onClick={() => setOpenIdx(isOpen ? null : idx)} className="flex w-full items-center justify-between gap-6 p-6 text-left md:p-7"><div className="flex items-center gap-5"><span className="text-xs font-semibold tracking-wide text-[#152023]/40">{String(idx+1).padStart(2,'0')}</span><span className="text-lg font-medium tracking-tight text-[#152023] md:text-xl">{faq.q}</span></div><div className={`flex-shrink-0 rounded-full bg-[#152023]/5 p-2 transition-all duration-500 ${isOpen?'bg-[#153839] rotate-45':''}`}><Plus size={16} strokeWidth={2} className={isOpen?'text-[#F6F2EA]':'text-[#152023]/60'} /></div></button><div className={`grid transition-all duration-500 ease-out ${isOpen?'grid-rows-[1fr]':'grid-rows-[0fr]'}`}><div className="overflow-hidden"><p className="px-6 pb-7 ml-12 max-w-3xl text-base leading-[1.65] text-[#152023]/70 md:px-7">{faq.a}</p></div></div></div>);})}</div></div></div>
        </div>
      </section>

      <footer className="bg-[#152023] text-[#F6F2EA]">
        <div className="border-b border-[#F6F2EA]/10"><div className="mx-auto max-w-[1480px] px-6 py-16 md:px-10 lg:px-14 md:py-20"><div className="grid grid-cols-12 gap-8 lg:gap-12"><div className="col-span-12 lg:col-span-7"><span className="mono-caption text-[#E5FD98]">— Restons connectés</span><h3 className="mt-5 display-tight text-4xl text-[#F6F2EA] md:text-5xl lg:text-6xl">Recevez les nouveautés <em className="text-[#E5FD98]">du cabinet.</em></h3><p className="mt-5 max-w-xl text-base leading-[1.6] text-[#F6F2EA]/70">Une fois par mois : nouveaux soins, créneaux ouverts, conseils de récupération. Aucun spam, désinscription en un clic.</p></div><div className="col-span-12 lg:col-span-5 lg:pt-12"><form onSubmit={(e)=>e.preventDefault()} className="flex flex-col gap-3 sm:flex-row"><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="votre.email@exemple.ch" className="flex-1 rounded-full bg-[#F6F2EA]/5 border border-[#F6F2EA]/15 px-5 py-3.5 text-sm text-[#F6F2EA] placeholder:text-[#F6F2EA]/40 focus:outline-none focus:border-[#F6F2EA]/40 transition-colors duration-300" required /><button type="submit" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#E5FD98] px-6 py-3.5 text-sm font-bold tracking-tight text-[#152023] transition-all duration-300 hover:bg-white">S'inscrire</button></form><p className="mt-3 text-xs tracking-wide text-[#F6F2EA]/40">En vous inscrivant, vous acceptez notre politique de confidentialité.</p></div></div></div></div>
        <div className="mx-auto max-w-[1480px] px-6 py-16 md:px-10 lg:px-14 md:py-20"><div className="grid grid-cols-12 gap-8 lg:gap-12"><div className="col-span-12 md:col-span-5"><div className="flex items-baseline gap-2"><span className="text-base font-semibold tracking-tight text-[#F6F2EA]">Serenity Relax</span><span className="text-sm tracking-wide text-[#F6F2EA]/60">— by João</span></div><p className="mt-5 max-w-md text-lg leading-[1.5] text-[#F6F2EA]/85 md:text-xl">Massothérapie thérapeutique pensée pour les corps actifs. Genève, depuis 2014.</p><div className="mt-8 flex gap-3"><a href="#" aria-label="Instagram" className="rounded-full bg-[#F6F2EA]/5 p-3 transition-all duration-300 hover:bg-[#E5FD98] hover:text-[#152023]"><Instagram size={16} strokeWidth={1.75} /></a><a href="#" aria-label="LinkedIn" className="rounded-full bg-[#F6F2EA]/5 p-3 transition-all duration-300 hover:bg-[#E5FD98] hover:text-[#152023]"><Linkedin size={16} strokeWidth={1.75} /></a><a href="mailto:hello@serenityrelax.ch" aria-label="Email" className="rounded-full bg-[#F6F2EA]/5 p-3 transition-all duration-300 hover:bg-[#E5FD98] hover:text-[#152023]"><Mail size={16} strokeWidth={1.75} /></a></div></div><div className="col-span-12 md:col-span-7 grid grid-cols-1 gap-8 sm:grid-cols-3"><div><p className="mono-caption text-[#E5FD98]">Cabinet</p><div className="mt-4 flex items-start gap-3"><MapPin size={15} strokeWidth={1.75} className="mt-0.5 flex-shrink-0 text-[#F6F2EA]/40" /><p className="text-sm leading-[1.6] text-[#F6F2EA]/85">Rue du Rhône 12<br />1204 Genève<br />Suisse</p></div></div><div><p className="mono-caption text-[#E5FD98]">Horaires</p><div className="mt-4 flex items-start gap-3"><Clock size={15} strokeWidth={1.75} className="mt-0.5 flex-shrink-0 text-[#F6F2EA]/40" /><p className="text-sm leading-[1.6] text-[#F6F2EA]/85">Lun — Ven<br />09h00 — 19h00<br />Sam · 10h00 — 17h00</p></div></div><div><p className="mono-caption text-[#E5FD98]">Contact</p><div className="mt-4 flex items-start gap-3"><Phone size={15} strokeWidth={1.75} className="mt-0.5 flex-shrink-0 text-[#F6F2EA]/40" /><div className="text-sm leading-[1.6] text-[#F6F2EA]/85"><p>+41 22 000 00 00</p><a href="mailto:hello@serenityrelax.ch" className="text-[#F6F2EA]/70 hover:text-[#E5FD98] transition-colors duration-300 editorial-link">hello@serenityrelax.ch</a></div></div></div></div></div><div className="mt-16 flex flex-wrap gap-x-8 gap-y-4 border-t border-[#F6F2EA]/10 pt-8"><a href="#sessions" className="text-sm tracking-tight text-[#F6F2EA]/70 hover:text-[#F6F2EA] transition-colors duration-300 editorial-link">Sessions</a><a href="#sanctuary" className="text-sm tracking-tight text-[#F6F2EA]/70 hover:text-[#F6F2EA] transition-colors duration-300 editorial-link">Sanctuaire</a><a href="#journal" className="text-sm tracking-tight text-[#F6F2EA]/70 hover:text-[#F6F2EA] transition-colors duration-300 editorial-link">Journal</a><a href="#atelier" className="text-sm tracking-tight text-[#F6F2EA]/70 hover:text-[#F6F2EA] transition-colors duration-300 editorial-link">FAQ</a></div></div>
      </footer>
    </div>
  );
}
