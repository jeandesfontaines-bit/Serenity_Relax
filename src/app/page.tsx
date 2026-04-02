
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Sparkles, Moon, Wind, Droplets, Plus, Menu, 
  Heart, Clock, Calendar, Sun, Instagram, Activity,
  ShieldCheck, Zap, Smile, Waves, Power, X, MapPin
} from 'lucide-react';
import { Navbar } from '@/components/navbar';

// --- DATA ---
const SERVICES = [
  {
    id: "01", name: "Massage Thérapeutique", duration: "60 min",
    image: "https://images.unsplash.com/photo-1544126592-807daa215671?auto=format&fit=crop&q=80&w=1000",
    desc: "Libération des tensions profondes et restauration de l'équilibre corporel signé João.",
    tag: "Excellence"
  },
  {
    id: "02", name: "Deep Relax Signature", duration: "60 min",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=1000",
    desc: "Une immersion sensorielle confidentielle conçue pour un lâcher-prise immédiat.",
    tag: "Sérénité"
  },
  {
    id: "03", name: "Massage Sportif", duration: "60 min",
    image: "https://images.unsplash.com/photo-1614859324967-bdf781b9c897?auto=format&fit=crop&q=80&w=1000",
    desc: "Conçu pour les sportifs, un travail musculaire profond pour une récupération optimale.",
    tag: "Performance"
  },
  {
    id: "04", name: "Kalari Thérapeutique", duration: "75 min",
    image: "https://images.unsplash.com/photo-1600334129128-685c4583168a?auto=format&fit=crop&q=80&w=1000",
    desc: "Alliance d'étirements doux et de chaleur pour une vitalité et une souplesse retrouvées.",
    tag: "Tradition"
  },
  {
    id: "05", name: "Drainage Lymphatique", duration: "60 min",
    image: "https://images.unsplash.com/photo-1591343395582-99bf4eb11abc?auto=format&fit=crop&q=80&w=1000",
    desc: "Soin fluide pour améliorer la circulation et éliminer les toxines du corps.",
    tag: "Détox"
  },
  {
    id: "06", name: "Massage Découverte", duration: "30 min",
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?auto=format&fit=crop&q=80&w=1000",
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

const PHOTO_JOAO = "https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg";
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`;

const GlobalStyle = () => (
  <style>{`
    .font-fraunces { font-family: 'Fraunces', serif; }
    .font-meow { font-family: 'Meow Script', cursive; }
    .serif-italic { font-family: 'Fraunces', serif; font-style: italic; }

    .grained::before { 
      content: ''; 
      position: fixed; 
      inset: 0; 
      background-image: ${GRAIN_SVG}; 
      pointer-events: none; 
      z-index: 100; 
      opacity: 0.1;
    }

    @keyframes morph {
      0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
      50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
      100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    }
    .blob-shape { animation: morph 12s ease-in-out infinite; will-change: border-radius; }
  `}</style>
);

const PortraitCard = ({ service }) => {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="relative w-full aspect-[3/4.5] rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer"
    >
      <img 
        src={service.image} 
        alt={service.name} 
        className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">{service.tag}</span>
          <span className="text-[9px] font-fraunces font-bold text-white/40 italic">{service.id}</span>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-2xl md:text-3xl font-fraunces font-bold text-white leading-tight tracking-tight">
            {service.name}
          </h3>
          <p className="text-[11px] text-white/60 font-medium leading-relaxed opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 line-clamp-2">
            {service.desc}
          </p>
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
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

  return (
    <div className="min-h-screen relative grained bg-[#F9F9F7]">
      <GlobalStyle />
      <Navbar />

      {/* SECTION 1: HERO */}
      <section className="relative h-[95vh] flex items-center px-6 md:px-20 overflow-hidden bg-[#1a1a1a] rounded-b-[3rem] md:rounded-b-[5rem]">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-50 scale-105"
            alt="Sanctuaire Serenity Relax"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#F9F9F7]" />
        </motion.div>

        <div className="max-w-5xl relative z-20 w-full pt-20 mx-auto text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-[11px] font-black uppercase tracking-[0.6em] text-white/70 mb-8"
          >
            Genève • Cointrin
          </motion.span>
          <h1 className="text-5xl md:text-[8rem] font-fraunces font-black leading-[0.82] tracking-tighter mb-12 text-white uppercase">
            L'art du <span className="serif-italic font-light lowercase tracking-normal block mt-4">mouvement calme</span>
          </h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-col items-center gap-12">
            <p className="max-w-lg text-lg md:text-xl text-white/80 font-fraunces italic font-light leading-relaxed">
              Un sanctuaire sensoriel confidentiel dédié à la restauration profonde du corps et de l'esprit.
            </p>
            <Link href="/booking" className="inline-flex items-center gap-6 px-14 py-5 bg-white text-neutral-900 rounded-full text-[11px] font-black uppercase tracking-[0.4em] hover:scale-105 transition-all shadow-2xl">
              Réserver votre rituel <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: L'ENGAGEMENT JOÃO */}
      <section className="py-32 px-6 md:px-10 bg-white relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          <div className="lg:col-span-5 relative">
             <span className="text-[11px] font-black uppercase tracking-[0.6em] text-neutral-400 block mb-10">La philosophie</span>
             <h2 className="text-4xl md:text-6xl font-fraunces font-black tracking-tighter leading-[0.9] text-neutral-900 mb-12">
               L'engagement <span className="serif-italic font-light lowercase">João.</span>
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
            <p className="text-xl md:text-3xl font-fraunces font-light text-neutral-700 leading-snug">
              Je ne pratique pas seulement le massage ; je sculpte un <span className="font-bold text-neutral-900">espace de décompression</span>. Mon approche fusionne la rigueur anatomique et l'intuition sensorielle.
            </p>
            
            <div className="relative py-20 px-12 bg-[#F9F9F7] rounded-[3rem] border border-neutral-100 italic">
               <span className="absolute -top-12 left-12 text-9xl font-serif text-neutral-100 select-none opacity-40">“</span>
               <p className="text-2xl md:text-4xl font-fraunces text-neutral-900 leading-tight">
                 « Le luxe ultime réside dans la reconnexion à soi, loin du tumulte urbain. »
               </p>
               <div className="mt-12 h-[1px] w-28 bg-neutral-900/10" />
               <p className="mt-10 text-[13px] font-bold uppercase tracking-widest text-neutral-400 leading-relaxed max-w-lg">
                 Chaque séance est un protocole unique, adapté à votre physiologie et à votre état émotionnel du moment. Agréé ASCA & RME.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: LES SOINS */}
      <section className="py-32 px-6 md:px-10 bg-[#F9F9F7]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col items-center text-center mb-24 space-y-8">
            <span className="text-[11px] font-black uppercase tracking-[0.6em] text-neutral-400 italic">Expertise thérapeutique</span>
            <h2 className="text-4xl md:text-6xl font-fraunces font-black tracking-tighter leading-[0.9] text-neutral-900">
              La carte des <span className="serif-italic font-light lowercase">rituels.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
            {SERVICES.map((s) => (
              <PortraitCard key={s.id} service={s} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: LE RITUEL POST-SOIN */}
      <section className="py-40 px-6 md:px-10 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col items-center text-center mb-40 space-y-8">
            <span className="text-[11px] font-black uppercase tracking-[0.6em] text-neutral-400 italic">Art de vivre</span>
            <h2 className="text-4xl md:text-6xl font-fraunces font-black tracking-tighter text-neutral-900">
              Le rituel <span className="serif-italic font-light lowercase">post-soin.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-32">
            {RITUAL_STEPS.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="group relative"
              >
                <span className="absolute -top-16 -left-4 text-[10rem] font-fraunces font-bold text-neutral-50 select-none z-0">
                  0{i + 1}
                </span>
                
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-300 group-hover:bg-neutral-900 group-hover:text-white transition-all duration-700">
                    {React.createElement(step.icon as any, { size: 24, strokeWidth: 1 })}
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-fraunces font-bold text-neutral-900 text-2xl">
                      {step.title}
                    </h4>
                    <p className="text-neutral-400 text-[11px] leading-relaxed italic font-fraunces">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <Link href="/booking" className="lg:col-span-1 bg-neutral-900 rounded-[2.5rem] p-10 flex flex-col justify-between text-white group relative overflow-hidden shadow-2xl transition-all hover:scale-[1.02]">
              <div className="relative z-10 space-y-6">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Engagement bien-être</span>
                <p className="font-fraunces text-2xl leading-tight">
                  Prêt pour votre prochain <span className="serif-italic">moment de calme ?</span>
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-4 mt-12 px-8 py-4 bg-white/10 rounded-full hover:bg-white hover:text-neutral-900 transition-all">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Réserver</span>
                <ArrowRight size={16} />
              </div>
              <div className="absolute -top-10 -right-10 opacity-10">
                <Sparkles size={150} strokeWidth={0.5} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-32 px-6 bg-neutral-900 text-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-start gap-24">
          <div className="space-y-10">
            <h2 className="font-fraunces font-bold text-sm tracking-[0.4em] uppercase">
              SERENITY RELAX <span className="font-meow text-4xl text-white/40 tracking-normal inline-block normal-case ml-3">by João</span>
            </h2>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-medium leading-loose max-w-xs">
              Un sanctuaire sensoriel confidentiel pour la restauration physique et mentale. Agréé Thérapeute ASCA & RME.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 md:gap-40">
            <div className="space-y-8">
              <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/20">Cabinet</h3>
              <p className="text-sm text-white/70 font-medium leading-relaxed italic font-fraunces">
                Chemin de Joinville 26,<br />
                Alpha Business Center, 4ème étage,<br />
                1216 Cointrin – Genève
              </p>
            </div>
            <div className="space-y-8">
              <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/20">Horaires</h3>
              <p className="text-sm text-white/70 font-medium leading-relaxed italic font-fraunces">
                Lundi au vendredi : 8h00 – 20h00<br />
                Samedi et dimanche : 9h30 – 20h00
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-12 items-start md:items-end">
            <div className="flex gap-12 items-center">
              <a href="https://instagram.com/serenity.relax.therapy_by_joao" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-all transform hover:scale-110">
                <Instagram size={24} />
              </a>
              <div className="h-12 w-px bg-white/10 hidden md:block" />
              <div className="space-y-3 text-right">
                <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">Agréments</h3>
                <p className="text-xs text-emerald-400 font-black tracking-widest uppercase">ASCA • RME</p>
              </div>
            </div>
            <p className="text-[10px] text-white/20 uppercase tracking-widest">&copy; {new Date().getFullYear()} Serenity Relax. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
