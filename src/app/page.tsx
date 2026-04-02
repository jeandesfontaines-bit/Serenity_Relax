
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Sparkles, Moon, Wind, Droplets, Plus, Menu, 
  Heart, Clock, Calendar, Sun, Instagram, Activity,
  ShieldCheck, Check, ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/navbar';

// --- DATA ---
const SERVICES = [
  {
    id: "01",
    name: "Massage Thérapeutique & Relaxant",
    duration: "60 MIN",
    icon: <Sparkles size={22} strokeWidth={1.5} />,
    glow: "#E8F2F0",
    desc: "Approche personnalisée pour relâcher les tensions et apaiser le mental. Rééquilibre le corps en profondeur.",
    tag: "Soin Ciblé"
  },
  {
    id: "02",
    name: "Deep Relax Signature",
    duration: "60 MIN",
    icon: <Moon size={22} strokeWidth={1.5} />,
    glow: "#E8F0F2",
    desc: "Rituel exclusif pour une déconnexion sensorielle totale et un lâcher-prise immédiat.",
    tag: "Sérénité"
  },
  {
    id: "03",
    name: "Massage Kalari Thérapeutique",
    duration: "75 MIN",
    icon: <Wind size={22} strokeWidth={1.5} />,
    glow: "#F2EDE8",
    desc: "Technique ancestrale indienne stimulant les points vitaux pour rééquilibrer les flux énergétiques.",
    tag: "Tradition"
  },
  {
    id: "04",
    name: "Drainage Lymphatique & Détox",
    duration: "60 MIN",
    icon: <Droplets size={22} strokeWidth={1.5} />,
    glow: "#F0F4F8",
    desc: "Soin fluide et rythmique pour améliorer la circulation et éliminer les toxines du corps.",
    tag: "Détox"
  },
  {
    id: "05",
    name: "Deep Tissue Performance",
    duration: "60 MIN",
    icon: <Activity size={22} strokeWidth={1.5} />,
    glow: "#E8EBF2",
    desc: "Massage profond ciblant les fascias et les muscles intensément sollicités. Idéal récupération.",
    tag: "Performance"
  },
  {
    id: "06",
    name: "Massage Thaï Huiles Chaudes",
    duration: "60 MIN",
    icon: <Sun size={22} strokeWidth={1.5} />,
    glow: "#F2E8E8",
    desc: "Alliance d'étirements doux et de chaleur pour une vitalité retrouvée et une souplesse accrue.",
    tag: "Vitalité"
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
    :root {
      --primary: #111111;
      --bg: #F9F9F7;
    }
    
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

    .hero-title-mask {
      overflow: hidden;
      display: block;
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
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    cardRef.current.style.setProperty('--card-x', `${(x / r.width) * 100}%`);
    cardRef.current.style.setProperty('--card-y', `${(y / r.height) * 100}%`);
    cardRef.current.style.setProperty('--glow-color', `${service.glow}80`);
  };

  return (
    <motion.div 
      ref={cardRef}
      onMouseMove={handleMove}
      whileHover={{ y: -6 }}
      className="relative w-full aspect-[3/4.2] rounded-[3rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(17,17,17,0.08)] hover:border-slate-200 transition-all duration-500 cursor-pointer overflow-hidden group flex flex-col p-8 md:p-10 justify-between"
    >
      <div
        className="absolute inset-0 opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none"
        style={{ background: `linear-gradient(145deg, transparent 30%, ${service.glow} 100%)` }}
      />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-multiply" 
           style={{ 
             background: `radial-gradient(circle at var(--card-x, 50%) var(--card-y, 50%), var(--glow-color, rgba(0,0,0,0.02)) 0%, transparent 70%)` 
           }} 
      />
      
      <div className="space-y-6 relative z-10">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center justify-center text-primary transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] group-hover:-rotate-3">
            {React.cloneElement(service.icon, { size: 22, strokeWidth: 1.5 })}
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-300 group-hover:text-primary transition-colors duration-500">{service.tag}</span>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-fraunces font-bold text-primary leading-[1.1] tracking-tight group-hover:translate-x-1 transition-transform duration-500">
            {service.name}
          </h3>
          <p className="text-[12px] text-slate-400 font-medium leading-relaxed opacity-80 group-hover:opacity-100 line-clamp-3 transition-opacity duration-500">
            {service.desc}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-end relative z-10 pt-6 border-t border-slate-100 group-hover:border-slate-200 transition-colors duration-500">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Clock size={11} className="text-slate-300 group-hover:text-primary/60 transition-colors duration-500" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary/80 transition-colors duration-500">{service.duration}</span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-40 group-hover:opacity-60 transition-opacity duration-500">Séance</span>
        </div>
        
        <Link href="/booking" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:shadow-[0_8px_20px_rgba(17,17,17,0.2)]">
          <Plus size={20} strokeWidth={2} className="group-hover:rotate-90 transition-transform duration-500" />
        </Link>
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);
  const titleY = useTransform(scrollY, [0, 500], [0, -100]);

  return (
    <div className="min-h-screen relative grained bg-[#F9F9F7] selection:bg-neutral-900 selection:text-white">
      <GlobalStyle />
      <Navbar />

      {/* Hero Header */}
      <header className="relative h-screen flex items-center px-6 md:px-20 overflow-hidden bg-[#1a1a1a]">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-50 scale-105"
            alt="Détail zen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#F9F9F7]" />
        </motion.div>

        <motion.div style={{ y: titleY }} className="max-w-5xl relative z-20 w-full pt-20">
          <span className="hero-title-mask">
            <motion.span initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1 }} className="block text-[10px] font-bold uppercase tracking-[0.5em] text-white/70 mb-6">Expertise & Bien-être • Genève</motion.span>
          </span>
          <h2 className="text-[clamp(3rem,10vw,8rem)] font-fraunces font-black leading-[0.85] tracking-tighter mb-12 text-white uppercase">
            <span className="hero-title-mask"><motion.span initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1.2, delay: 0.1 }} className="block">L'art du</motion.span></span>
            <span className="hero-title-mask"><motion.span initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1.2, delay: 0.2 }} className="block serif-italic font-light lowercase tracking-normal ml-[8vw]">mouvement calme.</motion.span></span>
          </h2>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-col md:flex-row items-end gap-12 ml-[8vw]">
            <p className="max-w-[320px] text-sm md:text-lg text-white/80 font-fraunces italic font-light leading-relaxed">Un sanctuaire sensoriel confidentiel dédié à la restauration profonde du corps et de l'esprit.</p>
            <Link href="/booking" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white group cursor-pointer">
              <div className="w-px h-12 bg-white/20 group-hover:h-16 transition-all duration-500" /> Réserver un rituel
            </Link>
          </motion.div>
        </motion.div>
      </header>

      {/* --- SECTION ENGAGEMENT JOÃO --- */}
      <section className="py-24 md:py-32 px-6 md:px-10 bg-[#F9F9F7]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          <div className="lg:col-span-5 relative">
             <span className="text-xs font-black uppercase tracking-[0.6em] text-neutral-400 block mb-8">La Philosophie</span>
             <h2 className="text-4xl md:text-6xl lg:text-7xl font-fraunces font-black tracking-tighter leading-[0.9] text-neutral-900 mb-12">
               L'Engagement <span className="serif-italic font-light lowercase">João.</span>
             </h2>
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 1 }}
               className="relative aspect-[4/5] w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 hidden lg:block border border-white"
             >
                <img src={PHOTO_JOAO} className="w-full h-full object-cover" alt="João" />
             </motion.div>
          </div>
          
          <div className="lg:col-span-7 space-y-12">
            <p className="text-xl md:text-3xl font-fraunces font-light text-neutral-700 leading-snug">
              Je ne pratique pas seulement le massage ; je sculpte un <span className="font-bold text-neutral-900">espace de décompression</span>. Mon approche fusionne la rigueur anatomique et l'intuition sensorielle pour répondre aux maux de la vie moderne.
            </p>
            
            <div className="relative py-12 md:py-16 px-10 bg-white/50 rounded-[2.5rem] border border-neutral-100 italic">
               <span className="absolute -top-10 left-10 text-9xl font-serif text-neutral-100 select-none opacity-50">“</span>
               <p className="text-2xl md:text-4xl font-fraunces text-neutral-900 leading-tight">
                 « Le luxe ultime réside dans la reconnexion à soi, loin du tumulte urbain. »
               </p>
               <div className="mt-10 h-[1px] w-24 bg-neutral-900/10" />
               <p className="mt-8 text-xs md:text-sm font-bold uppercase tracking-widest text-neutral-400 leading-relaxed max-w-lg">
                 Chaque séance est un protocole unique, adapté à votre physiologie et à votre état émotionnel du moment.
               </p>
            </div>
            
            <div className="lg:hidden aspect-[4/5] w-full max-w-xs rounded-[2.5rem] overflow-hidden shadow-xl grayscale">
                <img src={PHOTO_JOAO} className="w-full h-full object-cover" alt="João mobile" />
            </div>
          </div>
        </div>
      </section>
      
      <main className="px-6 md:px-10 max-w-[1400px] mx-auto">
        {/* Section Soins */}
        <section className="flex flex-col lg:flex-row gap-16 lg:gap-24 pb-32">
          <div className="w-full lg:w-4/12 lg:sticky lg:top-32 h-fit">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="w-12 h-[1px] bg-neutral-900 opacity-20" />
                <h2 className="text-4xl md:text-6xl font-fraunces font-black tracking-tighter leading-[1] uppercase text-neutral-900 italic">
                  La Carte<br/>
                  <span className="serif-italic font-light lowercase tracking-normal block">Rituels.</span>
                </h2>
              </div>
              <p className="text-xl text-neutral-400 leading-relaxed font-fraunces italic font-light max-w-xs">
                Une approche précise de la massothérapie pour un équilibre musculaire et nerveux optimal.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-8/12 grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
            {SERVICES.map((s) => (
              <PortraitCard key={s.id} service={s} />
            ))}
          </div>
        </section>

        {/* Section Rituel Post-Soin */}
        <section className="pt-24 border-t border-neutral-100 pb-32">
          <div className="flex flex-col items-center text-center mb-20 space-y-6">
            <span className="text-xs font-black uppercase tracking-[0.6em] text-neutral-400">7 gestes pour magnifier l'expérience</span>
            <h2 className="text-4xl md:text-6xl font-fraunces font-black tracking-tighter uppercase text-neutral-900">
              Le Rituel <span className="serif-italic font-light lowercase">Post-Soin</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-20">
            {RITUAL_STEPS.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="group flex flex-col space-y-6"
              >
                <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                  {React.createElement(step.icon as any, { size: 20, strokeWidth: 1.2 })}
                </div>
                <div className="space-y-3">
                  <h4 className="font-fraunces font-bold text-neutral-900 text-lg">{step.title}</h4>
                  <p className="text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
            
            <Link href="/booking" className="lg:col-span-1 bg-neutral-900 rounded-[3rem] p-10 flex flex-col justify-between text-white group relative overflow-hidden shadow-2xl">
              <div className="relative z-10 space-y-6">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/50">Engagement</span>
                <p className="font-fraunces text-2xl leading-tight">Prêt pour votre prochain moment ?</p>
              </div>
              <div className="relative z-10 flex justify-between items-center mt-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Réserver</span>
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </div>
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Sparkles size={80} strokeWidth={0.5} />
              </div>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-24 px-6 bg-neutral-900 text-white overflow-hidden relative">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start gap-20 relative z-10">
          <div className="space-y-8">
            <h2 className="font-fraunces font-bold text-xs tracking-[0.3em] uppercase leading-none">
              SERENITY RELAX <span className="font-meow text-3xl text-white/40 tracking-normal inline-block normal-case ml-2">by João</span>
            </h2>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-medium leading-loose max-w-sm">
              Un sanctuaire sensoriel confidentiel pour la restauration physique et mentale. Uniquement sur rendez-vous.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 md:gap-32">
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">Cabinet</h3>
              <p className="text-sm text-white/70 font-medium leading-relaxed italic font-fraunces">
                Chemin de Joinville 26,<br />
                Alpha Business Center, 4ème étage,<br />
                1216 Cointrin – Genève
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">Horaires</h3>
              <p className="text-sm text-white/70 font-medium leading-relaxed italic font-fraunces">
                Lundi au vendredi : 8h00 – 20h00<br />
                Samedi et dimanche : 9h30 – 20h00
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-10 items-start md:items-end">
            <div className="flex gap-10 items-center">
              <a href="https://instagram.com/serenity.relax.therapy_by_joao" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-all transform hover:scale-110">
                <Instagram size={24} />
              </a>
              <div className="h-10 w-px bg-white/10 hidden md:block" />
              <div className="space-y-2">
                <h3 className="text-[9px] font-bold tracking-[0.3em] uppercase text-white/20">ID ASCA</h3>
                <p className="text-xs text-emerald-400 font-black tracking-widest">Agréé Thérapeute</p>
              </div>
            </div>
            <p className="text-[10px] text-white/20 uppercase tracking-widest">&copy; {new Date().getFullYear()} Serenity Relax. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
