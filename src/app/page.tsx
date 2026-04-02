
'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { 
  ArrowRight, Sparkles, Moon, Wind, Droplets, Plus, 
  Heart, Clock, Calendar, Sun, Instagram,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const SERVICES = [
  {
    id: "01", name: "Massage thérapeutique", duration: "60 min",
    image: PlaceHolderImages.find(img => img.id === 'service-1')?.imageUrl || "",
    imageHint: "back massage",
    tag: "Excellence"
  },
  {
    id: "02", name: "Deep relax signature", duration: "60 min",
    image: PlaceHolderImages.find(img => img.id === 'service-2')?.imageUrl || "",
    imageHint: "essential oils",
    tag: "Sérénité"
  },
  {
    id: "03", name: "Massage sportif", duration: "60 min",
    image: PlaceHolderImages.find(img => img.id === 'service-3')?.imageUrl || "",
    imageHint: "sports massage",
    tag: "Performance"
  },
  {
    id: "04", name: "Kalari thérapeutique", duration: "75 min",
    image: PlaceHolderImages.find(img => img.id === 'service-4')?.imageUrl || "",
    imageHint: "hot stones",
    tag: "Tradition"
  },
  {
    id: "05", name: "Drainage lymphatique", duration: "60 min",
    image: PlaceHolderImages.find(img => img.id === 'service-5')?.imageUrl || "",
    imageHint: "lymphatic massage",
    tag: "Détox"
  },
  {
    id: "06", name: "Massage découverte", duration: "30 min",
    image: PlaceHolderImages.find(img => img.id === 'service-6')?.imageUrl || "",
    imageHint: "head massage",
    tag: "Initiation"
  }
];

const RITUAL_STEPS = [
  { title: "Accueillez vos émotions", desc: "Un massage peut libérer des ressentis profonds.", icon: Heart },
  { title: "Prenez votre temps", desc: "Restez allongé quelques minutes avant de vous relever.", icon: Clock },
  { title: "Hydratez-vous", desc: "Buvez de l'eau pour éliminer les toxines.", icon: Droplets },
  { title: "Évitez la douche immédiate", desc: "Laissez les huiles et l'énergie agir au moins une heure.", icon: Wind },
  { title: "Prolongez la détente", desc: "Accordez-vous encore quelques instants de repos.", icon: Moon },
  { title: "Planifiez un prochain soin", desc: "Pensez à réserver pour un bien-être durable.", icon: Calendar },
  { title: "Choisissez la douceur", desc: "Privilégiez des activités calmes après votre séance.", icon: Sun }
];

const PortraitCard = ({ service }: { service: typeof SERVICES[0] }) => {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white"
    >
      <Image 
        src={service.image} 
        alt={service.name} 
        fill
        data-ai-hint={service.imageHint}
        className="object-cover group-hover:scale-105 transition-all duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/70 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full">{service.tag}</span>
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-lg md:text-xl font-serif text-white leading-tight">
            {service.name}
          </h3>
          <div className="flex justify-between items-center pt-3 border-t border-white/10">
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/60">{service.duration}</span>
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-black transition-all">
              <Plus size={12} />
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
      <section className="relative h-[80vh] flex items-center px-6 md:px-20 overflow-hidden bg-[#1a1a1a] rounded-b-[2rem] md:rounded-b-[4rem]">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0">
          <Image 
            src={PlaceHolderImages.find(img => img.id === 'hero-bg')?.imageUrl || ""} 
            fill
            className="object-cover opacity-40 scale-105"
            alt="Sanctuaire Serenity Relax"
            data-ai-hint="luxury spa"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        </motion.div>

        <div className="max-w-6xl relative z-20 w-full mx-auto text-center md:text-left">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-[10px] font-black uppercase tracking-[0.5em] text-white/50 mb-6"
          >
            Genève • Cointrin
          </motion.span>
          <h1 className="text-4xl md:text-6xl font-serif leading-tight tracking-tight mb-8 text-white">
            L'art du <span className="italic font-light">mouvement calme</span>
          </h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col items-center md:items-start gap-8">
            <p className="max-w-md text-base md:text-xl text-white/70 font-serif italic font-light leading-relaxed">
              Un sanctuaire sensoriel confidentiel dédié à la restauration profonde du corps et de l'esprit par João.
            </p>
            <Link href="/booking" className="inline-flex items-center gap-6 px-10 py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl">
              Réserver votre rituel <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: PHILOSOPHIE */}
      <section className="py-20 px-6 md:px-10 bg-[#F9F9F7]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 block italic">La philosophie</span>
             <h2 className="text-3xl md:text-4xl font-serif tracking-tight leading-tight text-neutral-900">
               L'engagement de João
             </h2>
             <p className="text-xl md:text-2xl font-serif font-light text-neutral-700 leading-relaxed italic">
              "Je ne pratique pas seulement le massage ; je sculpte un espace de décompression. Mon approche fusionne la rigueur anatomique et l'intuition sensorielle."
             </p>
             <div className="pt-8 border-t border-neutral-200">
               <p className="text-sm text-neutral-500 max-w-sm leading-relaxed">
                Chaque séance est un protocole unique, adapté à votre physiologie. Agréé Thérapeute ASCA & RME.
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
                <Image 
                  src={PlaceHolderImages.find(img => img.id === 'joao-portrait')?.imageUrl || ""} 
                  fill 
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
                  alt="João" 
                  data-ai-hint="professional therapist" 
                />
             </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3: LES SOINS (CARROUSEL) */}
      <section className="py-20 px-6 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 space-y-6 md:space-y-0 px-4">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 italic">Expertise thérapeutique</span>
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight leading-none text-neutral-900">
                La carte des rituels
              </h2>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={scrollPrev} 
                className="w-12 h-12 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-black hover:text-white transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={scrollNext} 
                className="w-12 h-12 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-black hover:text-white transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-hidden px-4 -mx-4 pb-20" ref={emblaRef}>
            <div className="flex gap-8">
              {SERVICES.map((s) => (
                <div key={s.id} className="flex-[0_0_85%] md:flex-[0_0_40%] lg:flex-[0_0_30%]">
                  <PortraitCard service={s} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: LE RITUEL POST-SOIN */}
      <section className="py-20 px-6 md:px-10 bg-[#F9F9F7]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 italic">Art de vivre</span>
            <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-neutral-900">
              Le rituel post-soin
            </h2>
            <p className="text-neutral-500 max-w-lg text-sm md:text-base font-serif italic font-light">
              Sept gestes essentiels pour prolonger l'immersion et magnifier les bienfaits de votre séance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {RITUAL_STEPS.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative group p-8 bg-white rounded-[2.5rem] shadow-md hover:shadow-xl transition-all border border-neutral-50"
              >
                <span className="absolute -top-4 -left-4 text-5xl font-serif font-bold text-neutral-100/60 select-none z-0">
                  {i + 1}
                </span>
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-300 group-hover:bg-black group-hover:text-white transition-all duration-500">
                    {React.createElement(step.icon as any, { size: 20, strokeWidth: 1.5 })}
                  </div>
                  <h4 className="font-serif text-lg text-neutral-900 leading-tight">{step.title}</h4>
                  <p className="text-neutral-400 text-xs leading-relaxed italic font-serif font-light">{step.desc}</p>
                </div>
              </motion.div>
            ))}
            
            <Link href="/booking" className="lg:col-span-1 bg-black rounded-[2.5rem] p-8 flex flex-col justify-between text-white group relative overflow-hidden transition-transform hover:scale-[1.02] shadow-2xl">
              <div className="relative z-10 space-y-3">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Engagement bien-être</span>
                <p className="font-serif text-xl leading-tight">
                  Prêt pour votre prochain moment ?
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-10 px-6 py-3 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Réserver maintenant</span>
                <ArrowRight size={14} />
              </div>
              <Sparkles className="absolute -top-6 -right-6 opacity-10 h-24 w-24" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-6 bg-[#1a1a1a] text-white rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-16">
          <div className="space-y-8">
            <h2 className="font-sans font-bold text-[12px] tracking-[0.4em] uppercase">
              SERENITY RELAX <span className="font-cursive text-3xl text-white/30 tracking-normal normal-case ml-2">by João</span>
            </h2>
            <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-medium leading-loose max-w-[240px]">
              Sanctuaire sensoriel confidentiel dédié à la restauration profonde. Thérapeute agréé ASCA & RME.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/20">Le Cabinet</h3>
              <p className="text-xs text-white/60 font-serif italic font-light">
                Chemin de Joinville 26, 4ème étage<br />
                1216 Cointrin – Genève
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/20">Horaires</h3>
              <p className="text-xs text-white/60 font-serif italic font-light">
                Lun-Ven : 8h00 – 20h00<br />
                Sam-Dim : 9h30 – 20h00
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-8 items-start md:items-end">
            <div className="flex gap-6 items-center">
              <a href="#" className="text-white/40 hover:text-white transition-all"><Instagram size={22} /></a>
              <div className="h-8 w-px bg-white/10" />
              <div className="space-y-1 text-right">
                <h3 className="text-[8px] font-bold tracking-[0.2em] uppercase text-white/20">Agréments</h3>
                <p className="text-[10px] text-emerald-400 font-black tracking-[0.1em] uppercase">ASCA • RME</p>
              </div>
            </div>
            <p className="text-[9px] text-white/20 uppercase tracking-widest">&copy; {new Date().getFullYear()} Serenity Relax.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

