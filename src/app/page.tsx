'use client';

import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { 
  Instagram, Linkedin, ArrowRight, MessageCircle, Droplets, Moon, HeartPulse, Sparkles, Wind, CheckCircle2, ChevronRight
} from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { SERVICES } from '@/lib/types';

const SERVICES_DISPLAY = SERVICES.map((s, i) => ({
  ...s,
  id: (i + 1).toString().padStart(2, '0'),
  image: `https://picsum.photos/seed/massage-${i+1}/800/1000`,
  tag: s.id === '3' || s.id === '7' ? "Signature" : s.id === '5' ? "Performance" : "Soin"
}));

const RITUAL_STEPS = [
  { 
    title: "Hydratation", 
    desc: "Buvez de l'eau alcaline ou une infusion tiède pour aider votre système lymphatique à éliminer les toxines.",
    icon: <Droplets size={24} />,
    advice: "Buvez au moins 1.5L après votre séance."
  },
  { 
    title: "Huiles", 
    desc: "Laissez les huiles précieuses pénétrer votre épiderme. Évitez la douche immédiate pendant au moins 1 heure.",
    icon: <Sparkles size={24} />,
    advice: "Laissez agir pour une peau nourrie."
  },
  { 
    title: "Repos", 
    desc: "Évitez les écrans et les efforts intenses. Accordez-vous un moment de calme pour ancrer les bénéfices.",
    icon: <Moon size={24} />,
    advice: "Privilégiez le repos absolu."
  },
  { 
    title: "Suivi", 
    desc: "Observez vos ressentis. Des courbatures légères sont normales, c'est le signe que le corps se réaligne.",
    icon: <HeartPulse size={24} />,
    advice: "Notez l'évolution de vos tensions."
  }
];

const ServiceCard = ({ s, staggered }: { s: typeof SERVICES_DISPLAY[0], staggered: boolean }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const yImage = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className={`w-full aspect-[4/5] bg-white rounded-3xl flex flex-col overflow-hidden relative group border border-neutral-100/50 shadow-sm hover:shadow-2xl transition-all duration-700 ${staggered ? 'md:mt-16' : ''}`}
    >
      <div className="relative h-[55%] w-full overflow-hidden bg-neutral-100">
        <motion.div style={{ y: yImage }} className="absolute inset-0 w-full h-[120%]">
          <Image 
            src={s.image} 
            fill
            className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-[1s] scale-105"
            alt={s.name}
            data-ai-hint="luxury massage"
          />
        </motion.div>
        <div className="absolute top-6 left-6 z-10">
           <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-white bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full">{s.tag}</span>
        </div>
      </div>
      <div className="flex-1 p-8 flex flex-col justify-between">
        <div className="space-y-3">
          <h3 className="text-xl font-serif font-bold tracking-tight text-neutral-900 leading-none">{s.name.split(' - ')[0]}</h3>
          <p className="text-neutral-500 text-sm font-sans font-medium leading-relaxed italic line-clamp-2">{s.description}</p>
        </div>
        <div className="pt-6 flex items-center justify-between border-t border-neutral-100">
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-1 w-4 rounded-full transition-colors duration-500 ${i < (s.price > 115 ? 5 : 4) ? 'bg-neutral-900' : 'bg-neutral-100'}`} />
            ))}
          </div>
          <span className="text-[10px] font-sans font-black text-neutral-400 tracking-widest uppercase">{s.duration}</span>
        </div>
      </div>
    </motion.div>
  );
};

const AftercareSection = () => {
  const [selectedTip, setSelectedTip] = useState(0);

  return (
    <section className="py-32 md:py-44 px-8 bg-[#FAF9F6] rounded-[3rem] md:rounded-[5rem] mx-4 md:mx-6 mb-20 overflow-hidden border border-neutral-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          
          {/* Carte de détail (À GAUCHE) */}
          <div className="relative">
             <AnimatePresence mode="wait">
               <motion.div
                 key={selectedTip}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 transition={{ duration: 0.4 }}
                 className="bg-white rounded-[4rem] p-12 md:p-20 text-neutral-900 aspect-square flex flex-col justify-between relative overflow-hidden border border-neutral-100 shadow-2xl"
               >
                 <div className="space-y-10 relative z-10">
                   <div className="w-16 h-16 rounded-3xl bg-neutral-50 flex items-center justify-center shadow-inner text-neutral-900">
                     {RITUAL_STEPS[selectedTip].icon}
                   </div>
                   <h3 className="text-4xl font-serif font-bold tracking-tight leading-tight">
                     Pourquoi c'est <br/> <span className="italic font-medium text-neutral-400">fondamental ?</span>
                   </h3>
                   <p className="text-xl font-sans font-medium text-neutral-500 italic leading-relaxed">
                     {RITUAL_STEPS[selectedTip].desc}
                   </p>
                 </div>

                 <div className="space-y-6 relative z-10">
                   <div className="flex items-center gap-4 text-neutral-200">
                     <span className="w-8 h-px bg-neutral-100"></span>
                     <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Le conseil de João</span>
                   </div>
                   <div className="p-8 bg-neutral-50 rounded-[2rem] border border-neutral-100">
                     <p className="text-neutral-900 text-lg font-serif font-bold italic tracking-tight">
                       « {RITUAL_STEPS[selectedTip].advice} »
                     </p>
                   </div>
                 </div>
               </motion.div>
             </AnimatePresence>
          </div>

          {/* Texte et Liste (À DROITE) */}
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-[11px] font-sans font-black uppercase tracking-[0.4em] text-neutral-300 block mb-4">Immersion Continue</span>
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-neutral-900 leading-none tracking-tighter">
                Le Rituel <br/> <span className="text-neutral-200 italic font-light">post-soin.</span>
              </h2>
              <p className="text-neutral-500 text-lg font-sans font-medium leading-relaxed pt-6 border-l-2 border-neutral-100 pl-8 italic">
                Le massage ne s'arrête pas à la porte du studio. Les heures qui suivent sont essentielles pour ancrer vos bénéfices.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {RITUAL_STEPS.map((tip, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTip(i)}
                  className={`group relative flex items-start gap-6 p-6 rounded-[2rem] transition-all duration-500 text-left ${
                    selectedTip === i 
                      ? 'bg-white shadow-xl border border-neutral-100/50' 
                      : 'hover:bg-white/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                    selectedTip === i ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {tip.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-[11px] font-sans font-black uppercase tracking-widest transition-colors duration-500 ${
                      selectedTip === i ? 'text-neutral-900' : 'text-neutral-300 group-hover:text-neutral-600'
                    }`}>
                      {tip.title}
                    </h4>
                    <p className={`text-sm font-sans font-medium transition-opacity duration-500 ${
                      selectedTip === i ? 'opacity-100 text-neutral-600' : 'opacity-0 h-0 overflow-hidden'
                    }`}>
                      {tip.desc}
                    </p>
                  </div>
                  {selectedTip === i && (
                    <motion.div layoutId="indicator" className="absolute right-8 top-1/2 -translate-y-1/2 text-neutral-200">
                      <ArrowRight size={20} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[120] origin-left" style={{ scaleX }} />

      {/* SECTION HÉROS - IMAGE À GAUCHE */}
      <section className="min-h-screen flex flex-col justify-center px-8 pt-24 pb-20 bg-neutral-50 relative border-b border-neutral-100">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          <div className="w-full lg:w-[45%] relative">
            <div className="blob-shape bg-white shadow-2xl max-w-[420px] w-full mx-auto overflow-hidden relative border-[12px] border-white">
              <Image 
                src="https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg" 
                fill
                className="object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                alt="João Thérapeute"
                data-ai-hint="professional therapist"
                priority
              />
            </div>
          </div>

          <div className="w-full lg:w-[55%] space-y-12 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[11px] font-sans font-black uppercase tracking-[0.5em] text-neutral-300 block mb-6">
                L'Engagement João.
              </span>
              <h1 className="text-5xl md:text-8xl font-bold text-neutral-900 leading-[0.85] tracking-tighter font-serif">
                L'équilibre<br />
                <span className="text-neutral-200 italic font-light">par le toucher.</span>
              </h1>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="space-y-8 max-w-xl mx-auto lg:mx-0"
            >
              <p className="text-xl md:text-2xl font-serif font-bold text-neutral-900 leading-tight italic">
                "Une approche personnalisée pour restaurer votre harmonie physique et mentale."
              </p>
              
              <div className="space-y-6 text-neutral-600 font-sans font-medium leading-relaxed text-base md:text-lg">
                <p>
                  Passionné par le bien-être global, mon travail consiste à offrir des services de massothérapie dédiés à l'amélioration de votre qualité de vie au quotidien.
                </p>
                <div className="pl-6 border-l-2 border-neutral-900/10 py-2">
                   <p className="text-neutral-400 italic text-lg leading-snug">
                     « Le luxe ultime réside dans la reconnexion à soi, loin du tumulte urbain. »
                   </p>
                   <span className="font-cursive text-3xl text-neutral-300 block mt-2">— João P.</span>
                </div>
              </div>

              <Link href="/booking" className="inline-flex items-center gap-6 group pt-4">
                <div className="w-14 h-14 rounded-full bg-neutral-900 text-white flex items-center justify-center group-hover:bg-neutral-800 transition-all duration-500 shadow-lg">
                  <ArrowRight size={22} />
                </div>
                <span className="text-[11px] font-sans font-black uppercase tracking-[0.3em] text-neutral-900">Prendre rendez-vous</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION SERVICES - SOINS À GAUCHE CARDS À DROITE */}
      <section id="services" className="py-32 md:py-44 px-8 bg-white overflow-visible">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            <div className="w-full lg:w-[25%] lg:sticky lg:top-32 h-fit space-y-10 text-left">
              <span className="text-xs font-sans font-bold uppercase tracking-[0.4em] text-neutral-300 mb-6 block">Menu Signature</span>
              <h2 className="text-5xl md:text-7xl font-bold text-neutral-900 tracking-tight font-serif leading-none">Soins.</h2>
              <div className="h-1 w-12 bg-neutral-900" />
              <p className="text-sm font-sans text-neutral-400 font-bold leading-relaxed uppercase tracking-widest max-w-[200px]">
                Sélection exclusive de {SERVICES_DISPLAY.length} rituels pour votre équilibre interne.
              </p>
              <div className="pt-8">
                <Link href="/booking" className="inline-flex items-center gap-6 px-12 py-4 bg-black text-white text-[10px] font-sans font-bold uppercase tracking-[0.3em] rounded-sm hover:opacity-80 transition-all shadow-xl">
                  Réserver
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-[75%] grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16 pb-12">
              {SERVICES_DISPLAY.map((s, i) => (
                <ServiceCard key={s.id} s={s} staggered={i % 2 !== 0} />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* RITUEL POST-SOIN INTERACTIF */}
      <AftercareSection />

      {/* FOOTER - COMPACT & NOIR */}
      <footer className="bg-[#0a0a0a] text-white py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
          <div className="space-y-1">
            <div className="font-sans font-bold text-sm tracking-[0.3em] uppercase">SERENITY RELAX</div>
            <p className="text-[10px] font-sans font-medium italic tracking-[0.3em] text-neutral-500 uppercase">Excellence Thérapeutique</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 w-full max-w-4xl text-[11px] font-sans font-medium text-neutral-400">
            <div>
              <p className="font-black uppercase tracking-widest text-neutral-600 mb-2">Localisation</p>
              <p>Alpha Business Center • Joinville 26, 1216 Cointrin</p>
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-neutral-600 mb-2">Contact</p>
              <p>+41 78 333 68 23 • serenityrelaxtherapy@gmail.com</p>
            </div>
            <div className="flex justify-center items-center gap-6">
              <Instagram size={16} className="hover:text-white transition-colors cursor-pointer" />
              <a href="https://wa.me/41783336823" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} className="hover:text-white transition-colors cursor-pointer" />
              </a>
              <Linkedin size={16} className="hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 w-full">
            <p className="text-[9px] font-sans font-bold text-neutral-700 uppercase tracking-[0.4em]">
              © 2025 Serenity & Relax Therapy — Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
