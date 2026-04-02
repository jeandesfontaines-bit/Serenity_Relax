
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { 
  ArrowRight, Sparkles, Moon, Wind, Droplets, Plus, 
  Heart, Clock, Calendar, Sun, Instagram,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// --- DATA ---
const SERVICES = [
  {
    id: "01", name: "Massage thérapeutique", duration: "60 min",
    image: PlaceHolderImages.find(img => img.id === 'service-1')?.imageUrl || "",
    imageHint: "massage therapy",
    desc: "Libération des tensions profondes et restauration de l'équilibre corporel signé João.",
    tag: "Excellence"
  },
  {
    id: "02", name: "Deep relax signature", duration: "60 min",
    image: PlaceHolderImages.find(img => img.id === 'service-2')?.imageUrl || "",
    imageHint: "massage oils",
    desc: "Une immersion sensorielle confidentielle conçue pour un lâcher-prise immédiat.",
    tag: "Sérénité"
  },
  {
    id: "03", name: "Massage sportif", duration: "60 min",
    image: PlaceHolderImages.find(img => img.id === 'service-3')?.imageUrl || "",
    imageHint: "sports massage",
    desc: "Conçu pour les sportifs, un travail musculaire profond pour une récupération optimale.",
    tag: "Performance"
  },
  {
    id: "04", name: "Kalari thérapeutique", duration: "75 min",
    image: PlaceHolderImages.find(img => img.id === 'service-4')?.imageUrl || "",
    imageHint: "hot stones",
    desc: "Alliance d'étirements doux et de chaleur pour une vitalité et une souplesse retrouvées.",
    tag: "Tradition"
  },
  {
    id: "05", name: "Drainage lymphatique", duration: "60 min",
    image: PlaceHolderImages.find(img => img.id === 'service-5')?.imageUrl || "",
    imageHint: "spa treatment",
    desc: "Soin fluide pour améliorer la circulation et éliminer les toxines du corps.",
    tag: "Détox"
  },
  {
    id: "06", name: "Massage découverte", duration: "30 min",
    image: PlaceHolderImages.find(img => img.id === 'service-6')?.imageUrl || "",
    imageHint: "head massage",
    desc: "Idéal pour découvrir l'approche Serenity & Relax dans un format court et apaisant.",
    tag: "Initiation"
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

const PortraitCard = ({ service }: { service: typeof SERVICES[0] }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="relative w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white"
    >
      <img 
        src={service.image} 
        alt={service.name} 
        data-ai-hint={service.imageHint}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70">{service.tag}</span>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl md:text-2xl font-serif text-white leading-tight">
            {service.name}
          </h3>
          <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2">
            {service.desc}
          </p>
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/80">{service.duration}</span>
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-black transition-all">
              <Plus size={14} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 100]);
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
    <div className="min-h-screen relative bg-[#F9F9F7]">
      <Navbar />

      {/* SECTION 1: HERO */}
      <section className="relative h-[90vh] flex items-center px-6 md:px-20 overflow-hidden bg-[#1a1a1a] rounded-b-[3rem] md:rounded-b-[4rem]">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0">
          <img 
            src={PlaceHolderImages.find(img => img.id === 'hero-bg')?.imageUrl || ""} 
            className="w-full h-full object-cover opacity-50 scale-105"
            alt="Sanctuaire Serenity Relax"
            data-ai-hint="luxury spa"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        </motion.div>

        <div className="max-w-6xl relative z-20 w-full pt-20 mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-[10px] font-black uppercase tracking-[0.5em] text-white/70 mb-8"
          >
            Genève • Cointrin
          </motion.span>
          <h1 className="text-5xl md:text-8xl font-serif leading-[0.95] tracking-tight mb-12 text-white">
            L'art du <span className="italic font-light block mt-2">mouvement calme</span>
          </h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col items-start gap-12">
            <p className="max-w-xl text-lg md:text-2xl text-white/80 font-serif italic font-light leading-relaxed">
              Un sanctuaire sensoriel confidentiel dédié à la restauration profonde du corps et de l'esprit.
            </p>
            <Link href="/booking" className="inline-flex items-center gap-6 px-10 py-5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl">
              Réserver votre rituel <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: PHILOSOPHIE */}
      <section className="py-24 px-6 md:px-10 bg-[#F9F9F7]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 block italic">La philosophie</span>
             <h2 className="text-4xl md:text-6xl font-serif tracking-tight leading-[1.1] text-neutral-900">
               L'engagement <span className="italic font-light">João.</span>
             </h2>
             <p className="text-xl md:text-2xl font-serif font-light text-neutral-700 leading-relaxed italic">
              "Je ne pratique pas seulement le massage ; je sculpte un espace de décompression. Mon approche fusionne la rigueur anatomique et l'intuition sensorielle."
             </p>
             <div className="pt-8 border-t border-neutral-200">
               <p className="text-sm text-neutral-500 max-w-md leading-relaxed">
                Chaque séance est un protocole unique, adapté à votre physiologie et à votre état émotionnel. Agréé Thérapeute ASCA & RME.
               </p>
             </div>
          </div>
          
          <div className="relative">
             <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-[3rem] overflow-hidden shadow-2xl"
             >
                <img src={PlaceHolderImages.find(img => img.id === 'joao-portrait')?.imageUrl} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="João" data-ai-hint="therapist portrait" />
             </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3: LES SOINS (CARROUSEL) */}
      <section className="py-24 px-6 md:px-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 space-y-8 md:space-y-0">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 italic">Expertise thérapeutique</span>
              <h2 className="text-4xl md:text-6xl font-serif tracking-tight leading-none text-neutral-900">
                La carte des <span className="italic font-light">rituels.</span>
              </h2>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={scrollPrev} 
                className="w-12 h-12 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-black hover:text-white transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={scrollNext} 
                className="w-12 h-12 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-black hover:text-white transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-visible" ref={emblaRef}>
            <div className="flex gap-8 py-8 px-4 -mx-4">
              {SERVICES.map((s) => (
                <div key={s.id} className="flex-[0_0_80%] md:flex-[0_0_40%] lg:flex-[0_0_30%]">
                  <PortraitCard service={s} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: LE RITUEL POST-SOIN */}
      <section className="py-24 px-6 md:px-10 bg-[#F9F9F7]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-24 space-y-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 italic">Art de vivre</span>
            <h2 className="text-4xl md:text-7xl font-serif tracking-tight text-neutral-900">
              Le rituel <span className="italic font-light lowercase">post-soin.</span>
            </h2>
            <p className="text-neutral-500 max-w-xl text-lg font-serif italic font-light">
              Sept gestes essentiels pour prolonger l'immersion et magnifier les bienfaits de votre séance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
            {RITUAL_STEPS.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <span className="absolute -top-6 -left-4 text-6xl font-serif font-bold text-neutral-100 select-none z-0">
                  {i + 1}
                </span>
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:bg-black group-hover:text-white transition-all duration-500">
                    {React.createElement(step.icon as any, { size: 20, strokeWidth: 1.5 })}
                  </div>
                  <h4 className="font-serif text-xl text-neutral-900">{step.title}</h4>
                  <p className="text-neutral-500 text-xs leading-relaxed italic font-serif font-light">{step.desc}</p>
                </div>
              </motion.div>
            ))}
            
            <Link href="/booking" className="lg:col-span-1 bg-black rounded-[2rem] p-10 flex flex-col justify-between text-white group relative overflow-hidden transition-transform hover:scale-[1.02] shadow-2xl">
              <div className="relative z-10 space-y-4">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Engagement bien-être</span>
                <p className="font-serif text-2xl leading-tight">
                  Prêt pour votre prochain <span className="italic">moment de calme ?</span>
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-12 px-8 py-4 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Réserver</span>
                <ArrowRight size={16} />
              </div>
              <Sparkles className="absolute -top-6 -right-6 opacity-10 h-32 w-32" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-24 px-6 bg-[#1a1a1a] text-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-16">
          <div className="space-y-8">
            <h2 className="font-serif font-bold text-xs tracking-[0.4em] uppercase">
              SERENITY RELAX <span className="font-cursive text-4xl text-white/30 tracking-normal normal-case ml-2">by João</span>
            </h2>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-medium leading-loose max-w-xs">
              Un sanctuaire sensoriel confidentiel dédié à la restauration profonde du corps et de l'esprit. Thérapeute agréé ASCA & RME.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/20">Le Cabinet</h3>
              <p className="text-sm text-white/60 font-serif italic font-light">
                Chemin de Joinville 26, 4ème étage<br />
                1216 Cointrin – Genève
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/20">Horaires</h3>
              <p className="text-sm text-white/60 font-serif italic font-light">
                Lun-Ven : 8h00 – 20h00<br />
                Sam-Dim : 9h30 – 20h00
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-12 items-start md:items-end">
            <div className="flex gap-8 items-center">
              <a href="#" className="text-white/40 hover:text-white transition-all"><Instagram size={24} /></a>
              <div className="h-10 w-px bg-white/10" />
              <div className="space-y-2 text-right">
                <h3 className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/20">Agréments</h3>
                <p className="text-[12px] text-emerald-400 font-black tracking-[0.1em] uppercase">ASCA • RME</p>
              </div>
            </div>
            <p className="text-[9px] text-white/20 uppercase tracking-widest">&copy; {new Date().getFullYear()} Serenity Relax. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
