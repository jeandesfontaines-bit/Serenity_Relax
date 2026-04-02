
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { 
  ArrowRight, Sparkles, Moon, Wind, Droplets, Plus, Menu, 
  Heart, Clock, Calendar, Sun, Instagram, Activity,
  ShieldCheck, Zap, Smile, Waves, Power, X, MapPin, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// --- DATA ---
const SERVICES = [
  {
    id: "01", name: "Massage thérapeutique", duration: "60 min",
    image: PlaceHolderImages.find(img => img.id === 'service-1')?.imageUrl || "",
    desc: "Libération des tensions profondes et restauration de l'équilibre corporel signé João.",
    tag: "Excellence",
    glow: "#F0F4F8"
  },
  {
    id: "02", name: "Deep relax signature", duration: "60 min",
    image: PlaceHolderImages.find(img => img.id === 'service-2')?.imageUrl || "",
    desc: "Une immersion sensorielle confidentielle conçue pour un lâcher-prise immédiat.",
    tag: "Sérénité",
    glow: "#E8F0F2"
  },
  {
    id: "03", name: "Massage sportif", duration: "60 min",
    image: PlaceHolderImages.find(img => img.id === 'service-3')?.imageUrl || "",
    desc: "Conçu pour les sportifs, un travail musculaire profond pour une récupération optimale.",
    tag: "Performance",
    glow: "#E8EBF2"
  },
  {
    id: "04", name: "Kalari thérapeutique", duration: "75 min",
    image: PlaceHolderImages.find(img => img.id === 'service-4')?.imageUrl || "",
    desc: "Alliance d'étirements doux et de chaleur pour une vitalité et une souplesse retrouvées.",
    tag: "Tradition",
    glow: "#F2EDE8"
  },
  {
    id: "05", name: "Drainage lymphatique", duration: "60 min",
    image: PlaceHolderImages.find(img => img.id === 'service-5')?.imageUrl || "",
    desc: "Soin fluide pour améliorer la circulation et éliminer les toxines du corps.",
    tag: "Détox",
    glow: "#E8F2F0"
  },
  {
    id: "06", name: "Massage découverte", duration: "30 min",
    image: PlaceHolderImages.find(img => img.id === 'service-6')?.imageUrl || "",
    desc: "Idéal pour découvrir l'approche Serenity & Relax dans un format court et apaisant.",
    tag: "Initiation",
    glow: "#F2E8E8"
  }
];

const RITUAL_STEPS = [
  { title: "Accueillez vos émotions", desc: "Un massage peut libérer des ressentis profonds. Laissez-les s'exprimer naturellement.", icon: Heart },
  { title: "Prenez votre temps", desc: "Restez allongé quelques minutes avant de vous relever doucement.", icon: Clock },
  { title: "Hydratez-vous", desc: "Buvez de l'eau à température ambiante pour aider à éliminer les toxines.", icon: Droplets },
  { title: "Évitez la douche immédiate", desc: "Attendez environ une heure pour laisser les huiles et l'énergie agir.", icon: Wind },
  { title: "Prolongez la détente", desc: "Accordez-vous encore quelques instants de repos et respirez profondément.", icon: Moon },
  { title: "Planifiez un prochain soin", desc: "Pensez à réserver votre prochaine séance pour un bien-être durable.", icon: Calendar },
  { title: "Choisissez la douceur", desc: "Privilégiez des activités calmes pour prolonger la sensation de bien-être.", icon: Sun }
];

const PHOTO_JOAO = PlaceHolderImages.find(img => img.id === 'joao-portrait')?.imageUrl || "";

const GlobalStyle = () => (
  <style>{`
    .font-fraunces { font-family: 'Fraunces', serif; }
    .serif-italic { font-family: 'Fraunces', serif; font-style: italic; }

    .grained::before { 
      content: ''; 
      position: fixed; 
      inset: 0; 
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E"); 
      pointer-events: none; 
      z-index: 100; 
      opacity: 0.1;
    }

    @keyframes morph {
      0% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
      50% { border-radius: 70% 30% 46% 54% / 30% 29% 71% 70%; }
      100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
    }
    .blob-shape { animation: morph 12s ease-in-out infinite; will-change: border-radius; }
  `}</style>
);

const PortraitCard = ({ service }) => {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="relative w-full aspect-[3/4.5] rounded-[3rem] overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer flex-shrink-0"
    >
      <img 
        src={service.image} 
        alt={service.name} 
        className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      
      <div className="absolute inset-0 p-10 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">{service.tag}</span>
          <span className="text-[9px] font-fraunces font-bold text-white/40 italic">{service.id}</span>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-2xl md:text-3xl font-fraunces font-medium text-white leading-tight tracking-tight">
            {service.name}
          </h3>
          <p className="text-[11px] text-white/60 font-medium leading-relaxed opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 line-clamp-2">
            {service.desc}
          </p>
          <div className="flex justify-between items-center pt-6 border-t border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{service.duration}</span>
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-neutral-900 transition-all">
              <Plus size={18} strokeWidth={1.5} className="group-hover:rotate-90 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
    dragFree: true
  });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="min-h-screen relative grained bg-[#F9F9F7]">
      <GlobalStyle />
      <Navbar />

      {/* SECTION 1: HERO */}
      <section className="relative h-[95vh] flex items-center px-6 md:px-20 overflow-hidden bg-[#1a1a1a] rounded-b-[3rem] md:rounded-b-[5rem]">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0">
          <img 
            src={PlaceHolderImages.find(img => img.id === 'hero-bg')?.imageUrl || ""} 
            className="w-full h-full object-cover opacity-50 scale-105"
            alt="Sanctuaire Serenity Relax"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#F9F9F7]" />
        </motion.div>

        <div className="max-w-6xl relative z-20 w-full pt-20 mx-auto text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-[11px] font-black uppercase tracking-[0.6em] text-white/70 mb-10"
          >
            Genève • Cointrin
          </motion.span>
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-fraunces font-medium leading-[0.82] tracking-tighter mb-16 text-white">
            L'art du <span className="serif-italic font-light tracking-normal block mt-4">mouvement calme</span>
          </h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-col items-center gap-14">
            <p className="max-w-xl text-lg md:text-2xl text-white/80 font-fraunces italic font-light leading-relaxed">
              Un sanctuaire sensoriel confidentiel dédié à la restauration profonde du corps et de l'esprit.
            </p>
            <Link href="/booking" className="inline-flex items-center gap-6 px-14 py-5 bg-white text-neutral-900 rounded-full text-[11px] font-black uppercase tracking-[0.4em] hover:scale-105 transition-all shadow-2xl">
              Réserver votre rituel <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: L'ENGAGEMENT JOÃO */}
      <section className="py-32 px-6 md:px-10 bg-[#F9F9F7] relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          <div className="lg:col-span-5 relative">
             <span className="text-[11px] font-black uppercase tracking-[0.6em] text-neutral-400 block mb-12 italic">La philosophie</span>
             <h2 className="text-5xl md:text-7xl font-fraunces font-medium tracking-tighter leading-[0.9] text-neutral-900 mb-12">
               L'engagement <span className="serif-italic font-light">João.</span>
             </h2>
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="relative aspect-[4/5] w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-1000 hidden lg:block"
             >
                <img src={PHOTO_JOAO} className="w-full h-full object-cover scale-105 grayscale hover:grayscale-0 transition-all duration-1000" alt="João, votre thérapeute" />
             </motion.div>
          </div>
          
          <div className="lg:col-span-7 space-y-16">
            <p className="text-2xl md:text-4xl font-fraunces font-light text-neutral-700 leading-snug">
              Je ne pratique pas seulement le massage ; je sculpte un <span className="font-bold text-neutral-900">espace de décompression</span>. Mon approche fusionne la rigueur anatomique et l'intuition sensorielle.
            </p>
            
            <div className="relative py-24 px-12 bg-white rounded-[3rem] border border-neutral-100 italic">
               <span className="absolute -top-12 left-12 text-9xl font-serif text-neutral-50 select-none">“</span>
               <p className="text-3xl md:text-5xl font-fraunces text-neutral-900 leading-tight relative z-10">
                 Le luxe ultime réside dans la reconnexion à soi, loin du tumulte urbain.
               </p>
               <div className="mt-14 h-[1px] w-28 bg-neutral-900/10" />
               <p className="mt-12 text-[13px] font-bold uppercase tracking-widest text-neutral-400 leading-relaxed max-w-lg">
                 Chaque séance est un protocole unique, adapté à votre physiologie et à votre état émotionnel du moment. Agréé Thérapeute ASCA & RME.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: LES SOINS (CARROUSEL) */}
      <section className="py-32 px-6 md:px-10 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 space-y-10 md:space-y-0">
            <div className="space-y-10">
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-neutral-400 italic">Expertise thérapeutique</span>
              <h2 className="text-5xl md:text-7xl font-fraunces font-medium tracking-tighter leading-[0.9] text-neutral-900">
                La carte des <span className="serif-italic font-light">rituels.</span>
              </h2>
            </div>
            
            <div className="flex gap-5">
              <button 
                onClick={scrollPrev} 
                className="w-16 h-16 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={scrollNext} 
                className="w-16 h-16 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all shadow-sm"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-10">
              {SERVICES.map((s) => (
                <div key={s.id} className="flex-[0_0_85%] md:flex-[0_0_35%] lg:flex-[0_0_28%]">
                  <PortraitCard service={s} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: LE RITUEL POST-SOIN */}
      <section className="py-40 px-6 md:px-10 bg-[#F9F9F7]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col items-center text-center mb-40 space-y-10">
            <span className="text-[11px] font-black uppercase tracking-[0.6em] text-neutral-400 italic">Art de vivre</span>
            <h2 className="text-5xl md:text-7xl font-fraunces font-medium tracking-tighter text-neutral-900">
              Le rituel <span className="serif-italic font-light">post-soin.</span>
            </h2>
            <p className="text-neutral-500 max-w-2xl text-lg leading-relaxed font-fraunces italic font-light">
              Sept gestes essentiels pour prolonger l'immersion et magnifier les bienfaits de votre séance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-14 gap-y-32">
            {RITUAL_STEPS.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="group relative"
              >
                <span className="absolute -top-20 -left-6 text-[12rem] font-fraunces font-bold text-neutral-200/40 select-none z-0">
                  {i + 1}
                </span>
                
                <div className="relative z-10 space-y-8 pt-10">
                  <div className="w-16 h-16 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 transition-all duration-700">
                    {React.createElement(step.icon as any, { size: 28, strokeWidth: 1 })}
                  </div>
                  <div className="space-y-5">
                    <h4 className="font-fraunces font-medium text-neutral-900 text-2xl">
                      {step.title}
                    </h4>
                    <p className="text-neutral-400 text-[13px] leading-relaxed italic font-fraunces font-light">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <Link href="/booking" className="lg:col-span-1 bg-neutral-900 rounded-[3rem] p-12 flex flex-col justify-between text-white group relative overflow-hidden shadow-2xl transition-all hover:scale-[1.02]">
              <div className="relative z-10 space-y-8">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Engagement bien-être</span>
                <p className="font-fraunces text-2xl leading-tight">
                  Prêt pour votre prochain <span className="serif-italic">moment de calme ?</span>
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-16 px-10 py-5 bg-white/10 rounded-full hover:bg-white hover:text-neutral-900 transition-all">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Réserver</span>
                <ArrowRight size={18} />
              </div>
              <div className="absolute -top-10 -right-10 opacity-10">
                <Sparkles size={180} strokeWidth={0.5} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-32 px-6 bg-[#1a1a1a] text-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-start gap-24">
          <div className="space-y-12">
            <h2 className="font-fraunces font-bold text-sm tracking-[0.4em] uppercase">
              SERENITY RELAX <span className="font-meow text-5xl text-white/40 tracking-normal inline-block normal-case ml-3">by João</span>
            </h2>
            <p className="text-white/30 text-[11px] uppercase tracking-[0.2em] font-medium leading-loose max-w-sm">
              Un sanctuaire sensoriel confidentiel dédié à la restauration profonde du corps et de l'esprit. Agréé Thérapeute ASCA & RME pour un accompagnement d'excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-20 md:gap-40">
            <div className="space-y-10">
              <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/20">Le Cabinet</h3>
              <p className="text-base text-white/70 font-medium leading-relaxed italic font-fraunces font-light">
                Chemin de Joinville 26,<br />
                Alpha Business Center, 4ème étage,<br />
                1216 Cointrin – Genève
              </p>
            </div>
            <div className="space-y-10">
              <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/20">Horaires</h3>
              <p className="text-base text-white/70 font-medium leading-relaxed italic font-fraunces font-light">
                Lundi au vendredi : 8h00 – 20h00<br />
                Samedi et dimanche : 9h30 – 20h00
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-14 items-start md:items-end">
            <div className="flex gap-14 items-center">
              <a href="https://instagram.com/serenity.relax.therapy_by_joao" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-all transform hover:scale-110">
                <Instagram size={28} />
              </a>
              <div className="h-14 w-px bg-white/10 hidden md:block" />
              <div className="space-y-4 text-right">
                <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">Agréments</h3>
                <p className="text-[11px] text-emerald-400 font-black tracking-[0.2em] uppercase">ASCA • RME</p>
              </div>
            </div>
            <p className="text-[10px] text-white/20 uppercase tracking-widest">&copy; {new Date().getFullYear()} Serenity Relax Studio. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
