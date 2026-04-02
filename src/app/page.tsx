'use client';

import React, { useState } from "react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { 
  Instagram, Linkedin, ArrowRight, Sparkles, MessageCircle
} from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { SERVICES } from '@/lib/types';

// --- CONFIGURATION & DONNÉES ---
const MY_PHOTO = "https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg";

const AFTERCARE_TIPS = [
  { 
    id: "01",
    title: "Hydratation Optimale", 
    desc: "Boire de l'eau alcaline ou une infusion tiède après votre soin permet d'aider votre système lymphatique à drainer les toxines libérées durant le massage.",
    advice: "Évitez l'alcool pendant 24h."
  },
  { 
    id: "02",
    title: "Repos & Intégration", 
    desc: "Votre système nerveux a été apaisé. Accordez-vous un temps de calme, sans écrans, pour permettre à votre corps d'ancrer les bienfaits du relâchement.",
    advice: "Sieste de 15 min conseillée."
  },
  { 
    id: "03",
    title: "Nutrition Douce", 
    desc: "Privilégiez un repas léger et chaud pour ne pas mobiliser toute votre énergie vers la digestion, mais plutôt vers la régénération de vos tissus.",
    advice: "Repas chaud privilégié."
  },
  { 
    id: "04",
    title: "Écoute & Souplesse", 
    desc: "Des sensations de courbatures légères peuvent apparaître le lendemain : c'est le signe que vos fascias retrouvent leur liberté de mouvement.",
    advice: "Une douche tiède apaisera."
  }
];

// --- COMPOSANTS DE STYLE ---

const OverTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span className={`text-[10px] font-sans font-black uppercase tracking-[0.5em] text-neutral-400 block mb-6 ${className}`}>
    {children}
  </span>
);

const SectionTitle = ({ main, italic, className = "" }: { main: string, italic: string, className?: string }) => (
  <h2 className={`text-5xl md:text-7xl font-serif font-medium text-neutral-900 leading-[0.9] tracking-tighter ${className}`}>
    {main} <br/> <span className="text-neutral-200 italic font-light">{italic}</span>
  </h2>
);

const SectionDesc = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-neutral-500 text-lg font-sans font-medium leading-relaxed ${className}`}>
    {children}
  </p>
);

const ServiceCard = ({ s, staggered }: { s: typeof SERVICES[0], staggered: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`group w-full aspect-[3/4] bg-white rounded-[2.5rem] flex flex-col overflow-hidden relative border border-neutral-100/50 shadow-sm hover:shadow-xl transition-all duration-700 ${staggered ? 'md:mt-12 lg:mt-16' : ''}`}
  >
    <div className="relative h-[62%] w-full overflow-hidden bg-neutral-100">
      <Image 
        src={`https://picsum.photos/seed/massage-${s.id}/800/1000`} 
        fill
        className="object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out" 
        alt={s.name}
        data-ai-hint="luxury massage"
      />
      <div className="absolute top-6 left-6 z-10">
         <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-white bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full">Soin</span>
      </div>
    </div>
    
    <div className="flex-1 p-8 md:p-9 flex flex-col justify-between bg-white z-20">
      <div className="space-y-2">
        <h3 className="text-2xl font-serif font-bold tracking-tight text-neutral-900 leading-none">{s.name.split(' - ')[0]}</h3>
        <p className="text-neutral-500 text-[12px] font-sans font-medium leading-relaxed line-clamp-2">{s.description}</p>
      </div>
      <div className="pt-5 flex items-center justify-between border-t border-neutral-50">
        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-1 w-4 rounded-full transition-colors duration-500 ${i < (s.price > 115 ? 5 : 4) ? 'bg-neutral-900/70' : 'bg-neutral-100'}`} />
          ))}
        </div>
        <span className="text-[10px] font-sans font-black text-neutral-400 tracking-widest uppercase">{s.duration}</span>
      </div>
    </div>
  </motion.div>
);

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [selectedTip, setSelectedTip] = useState(0);

  return (
    <div className="bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white antialiased relative">
      <Navbar />
      
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-neutral-900 z-[120] origin-left" style={{ scaleX }} />

      {/* SECTION HÉROS - IMAGE À GAUCHE */}
      <section className="min-h-screen flex flex-col justify-center px-8 pt-32 pb-20 bg-white relative border-b border-neutral-50 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          <div className="w-full lg:w-[45%] relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border-[12px] border-white shadow-2xl"
            >
              <Image 
                src={MY_PHOTO} 
                fill
                className="object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                alt="Portrait de João P."
                data-ai-hint="professional therapist"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 text-white">
                <OverTitle className="mb-2 text-white/70">Fondateur</OverTitle>
                <p className="text-lg font-serif font-bold tracking-tight leading-none">João P.</p>
              </div>
            </motion.div>
          </div>

          <div className="w-full lg:w-[55%] space-y-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <OverTitle>L'Engagement João.</OverTitle>
              <h1 className="text-6xl md:text-8xl font-serif font-bold text-neutral-900 leading-[0.85] tracking-tighter">
                L'équilibre<br />
                <span className="text-neutral-200 italic font-light">par le toucher.</span>
              </h1>
            </motion.div>
            
            <div className="space-y-10 max-w-xl">
              <p className="text-xl md:text-2xl font-serif font-bold text-neutral-900 leading-tight italic">
                "Une approche personnalisée pour restaurer votre harmonie physique et mentale."
              </p>
              <div className="space-y-8">
                <SectionDesc>
                  Passionné par le bien-être global, mon travail consiste à offrir des services de massothérapie dédiés à l'amélioration de votre qualité de vie au quotidien.
                </SectionDesc>
                <div className="pl-6 border-l-2 border-neutral-900/10 py-2">
                   <p className="text-neutral-400 italic text-lg leading-snug">« Le luxe ultime réside dans la reconnexion à soi, loin du tumulte urbain. »</p>
                   <span className="font-cursive text-3xl text-neutral-300 block mt-2">— João P.</span>
                </div>
              </div>
              <Link href="/booking" className="inline-flex items-center gap-6 group pt-4">
                <div className="w-14 h-14 rounded-full bg-neutral-900 text-white flex items-center justify-center transition-all duration-500 shadow-lg group-hover:scale-110 group-hover:bg-neutral-800">
                  <ArrowRight size={22} />
                </div>
                <span className="text-[11px] font-sans font-black uppercase tracking-[0.3em] text-neutral-900">Découvrir les rituels</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION SERVICES - TEXTE À GAUCHE CARDS À DROITE */}
      <section id="services" className="py-24 md:py-32 px-8 bg-[#FAF9F6] border-y border-neutral-100/50 rounded-[3rem] md:rounded-[5rem] md:mx-6 overflow-visible">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
            
            <div className="w-full lg:w-[28%] lg:sticky lg:top-24 h-fit text-left">
              <OverTitle>Menu Signature</OverTitle>
              <SectionTitle main="Soins" italic="Exclusifs." className="mb-6" />
              <div className="h-[2px] w-12 bg-neutral-900 mb-10" />
              <p className="text-xl md:text-2xl font-serif font-bold text-neutral-900 leading-tight italic mb-12">
                Une sélection exclusive de {SERVICES.length} rituels conçue pour votre équilibre interne et votre récupération physique.
              </p>
              <Link href="/booking" className="inline-flex items-center px-10 py-4 bg-black text-white text-[10px] font-sans font-bold uppercase tracking-[0.3em] rounded-sm hover:opacity-80 transition-all shadow-xl">
                Réserver un soin
              </Link>
            </div>

            <div className="w-full lg:w-[72%] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
              {SERVICES.map((s, i) => (
                <ServiceCard key={s.id} s={s} staggered={i % 2 !== 0} />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* RITUEL POST-SOIN - CONSEILS À GAUCHE LISTE À DROITE */}
      <section className="py-40 px-8 bg-white max-w-7xl mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* CARTE DE CONSEILS (À GAUCHE) */}
          <div className="relative pt-12 lg:pt-32">
            <div className="min-h-[400px] flex flex-col justify-between relative">
                <AnimatePresence mode="wait">
                <motion.div 
                    key={selectedTip}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-10 relative z-10"
                >
                    <div className="pt-8">
                        <div className="p-10 md:p-14 bg-[#FAF9F6] rounded-[2.5rem] border border-neutral-100/50 shadow-2xl">
                            <div className="space-y-8">
                                <motion.div 
                                  key={`advice-text-${selectedTip}`}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="pb-4"
                                >
                                  <h3 className="text-3xl md:text-4xl tracking-tight leading-tight text-neutral-900 font-serif italic">
                                      « {AFTERCARE_TIPS[selectedTip].advice} »
                                  </h3>
                                </motion.div>
                                <div className="h-[1px] w-full bg-neutral-200/50" />
                                <p className="text-neutral-500 text-lg font-sans font-medium leading-relaxed max-w-xl">
                                    {AFTERCARE_TIPS[selectedTip].desc}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
                </AnimatePresence>
                <div className="absolute top-0 left-0 text-neutral-50/50 pointer-events-none select-none -z-0">
                    <Sparkles size={400} />
                </div>
            </div>
          </div>

          {/* LISTE DES ÉTAPES (À DROITE) */}
          <div className="space-y-12">
            <div className="space-y-4">
              <OverTitle className="mb-0">Rituel Post-Séance</OverTitle>
              <SectionTitle main="Prolonger" italic="l'état de grâce." />
            </div>
            <div className="flex flex-col gap-2">
              {AFTERCARE_TIPS.map((tip, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedTip(i)} 
                  className="group flex items-center gap-8 py-6 border-b border-neutral-100 last:border-0 transition-all duration-500 text-left"
                >
                  <span className={`text-4xl md:text-5xl font-sans font-black transition-all duration-500 ${selectedTip === i ? 'text-neutral-900 translate-x-2' : 'text-neutral-100 group-hover:text-neutral-200'}`}>
                    {tip.id}
                  </span>
                  <div className="space-y-1">
                    <h4 className={`text-sm font-sans font-black uppercase tracking-[0.2em] transition-colors duration-500 ${selectedTip === i ? 'text-neutral-900' : 'text-neutral-400 group-hover:text-neutral-600'}`}>
                      {tip.title}
                    </h4>
                    {selectedTip === i && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="h-0.5 w-8 bg-neutral-900 rounded-full"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER - ULTRA COMPACT & NOIR */}
      <footer className="bg-[#0a0a0a] text-white py-8 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <div className="font-sans font-bold text-xs tracking-[0.3em] uppercase">SERENITY RELAX</div>
            <p className="text-[8px] font-sans font-medium tracking-[0.3em] text-neutral-500 uppercase mt-1">Excellence Thérapeutique</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-[10px] font-sans font-medium text-neutral-400 text-center">
            <p className="tracking-widest uppercase"><span className="text-neutral-600 font-black mr-2">Localisation</span> Alpha Business Center • Genève</p>
            <p className="tracking-widest uppercase"><span className="text-neutral-600 font-black mr-2">Contact</span> +41 78 333 68 23</p>
          </div>

          <div className="flex items-center gap-6">
            <Instagram size={14} className="hover:text-white transition-colors cursor-pointer text-neutral-500" />
            <a href="https://wa.me/41783336823" target="_blank" rel="noopener noreferrer">
              <MessageCircle size={14} className="hover:text-white transition-colors cursor-pointer text-neutral-500" />
            </a>
            <Linkedin size={14} className="hover:text-white transition-colors cursor-pointer text-neutral-500" />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-white/5 flex justify-center">
          <p className="text-[8px] font-sans font-bold text-neutral-700 uppercase tracking-[0.4em]">
            © 2025 Serenity & Relax Therapy — Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}
