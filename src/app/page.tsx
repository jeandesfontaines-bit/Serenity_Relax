'use client';

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  Instagram, Linkedin, CheckCircle2, ArrowRight, MessageCircle
} from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';

// --- DATA ---
const SERVICES_DISPLAY = [
  { 
    id: "01", 
    name: "Rituel Thérapeutique", 
    duration: "60 min", 
    intensity: 4,
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=1000",
    desc: "Libération des tensions chroniques et restauration de la fluidité physique.", 
    tag: "Signature"
  },
  { 
    id: "02", 
    name: "Deep Relax", 
    duration: "60 min", 
    intensity: 2,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000",
    desc: "Immersion sensorielle profonde pour un lâcher-prise nerveux immédiat.", 
    tag: "Détente"
  },
  { 
    id: "03", 
    name: "Kalari Thérapeutique", 
    duration: "75 min", 
    intensity: 5,
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1000",
    desc: "Équilibre énergétique global inspiré des traditions ancestrales.", 
    tag: "Énergie"
  },
  { 
    id: "04", 
    name: "Drainage Lymphatique", 
    duration: "60 min", 
    intensity: 2,
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=1000",
    desc: "Technique de pompage douce pour revitaliser et détoxifier l'organisme.", 
    tag: "Vitalité"
  },
  { 
    id: "05", 
    name: "Récupération Athlète", 
    duration: "90 min", 
    intensity: 5,
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=1000",
    desc: "Travail ciblé sur les fascias et trigger points pour sportifs exigeants.", 
    tag: "Performance"
  },
  { 
    id: "06", 
    name: "Rituel Maman", 
    duration: "60 min", 
    intensity: 1,
    image: "https://images.unsplash.com/photo-1519824141121-99745c511f73?auto=format&fit=crop&q=80&w=1000",
    desc: "Soin prénatal enveloppant pour soulager le dos et les jambes lourdes.", 
    tag: "Douceur"
  }
];

const RITUAL_STEPS = [
  { title: "Émotions", desc: "Accueillez vos ressentis sans jugement après le soin. Observez le calme intérieur." },
  { title: "Hydratation", desc: "Buvez de l'eau alcaline ou une infusion tiède pour drainer les toxines libérées." },
  { title: "Repos", desc: "Évitez les écrans et les efforts intenses pendant les 2 heures suivant la séance." },
  { title: "Soin", desc: "Laissez les huiles essentielles pénétrer. Évitez la douche immédiate (attendre 1h)." }
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
           <span className="text-[9px] font-bold font-sans uppercase tracking-[0.25em] text-white bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full">{s.tag}</span>
        </div>
      </div>
      <div className="flex-1 p-8 flex flex-col justify-between">
        <div className="space-y-3">
          <h3 className="text-2xl font-serif font-bold tracking-tight text-neutral-900 leading-none">{s.name}</h3>
          <p className="text-neutral-500 text-sm font-sans font-medium leading-relaxed italic">{s.desc}</p>
        </div>
        <div className="pt-6 flex items-center justify-between border-t border-neutral-100">
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-1 w-4 rounded-full transition-colors duration-500 ${i < s.intensity ? 'bg-neutral-900' : 'bg-neutral-100'}`} />
            ))}
          </div>
          <span className="text-[10px] font-sans font-black text-neutral-400 tracking-widest uppercase">{s.duration}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[120] origin-left" style={{ scaleX }} />

      {/* SECTION HÉROS */}
      <section className="min-h-screen flex flex-col justify-center px-8 pt-24 pb-20 bg-neutral-50 relative border-b border-neutral-100">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          <div className="w-full lg:w-[55%] space-y-12">
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
              className="space-y-8 max-w-xl"
            >
              <p className="text-xl md:text-2xl font-serif font-bold text-neutral-900 leading-tight italic">
                "Une approche personnalisée pour restaurer votre harmonie physique et mentale."
              </p>
              
              <div className="space-y-6 text-neutral-600 font-sans font-medium leading-relaxed text-base md:text-lg">
                <p>
                  Bonjour, je suis João, massothérapeute et le fondateur de Serenity & Relax Therapy. Passionné par le bien-être global, mon travail consiste à offrir des services de massothérapie dédiés à l'amélioration de votre qualité de vie.
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

          <div className="w-full lg:w-[45%] relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
              className="blob-shape bg-white shadow-2xl max-w-[420px] w-full mx-auto overflow-hidden relative"
            >
              <Image 
                src="https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg" 
                fill
                className="object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                alt="João Thérapeute"
                data-ai-hint="professional therapist"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION SERVICES */}
      <section id="services" className="py-32 md:py-44 px-8 bg-white overflow-visible">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            {/* Colonne Texte (Gauché sur desktop) */}
            <div className="w-full lg:w-[25%] lg:sticky lg:top-32 h-fit space-y-10">
              <span className="text-xs font-sans font-bold uppercase tracking-[0.4em] text-neutral-300 mb-6 block">Menu Signature</span>
              <h2 className="text-5xl md:text-7xl font-bold text-neutral-900 tracking-tight font-serif leading-none">Soins.</h2>
              <div className="h-1 w-12 bg-neutral-900" />
              <p className="text-xs font-sans text-neutral-400 font-bold leading-relaxed uppercase tracking-widest max-w-[200px]">
                Sélection exclusive de 6 rituels pour votre équilibre interne.
              </p>
              <div className="pt-8">
                <Link href="/booking" className="inline-flex items-center gap-6 px-12 py-4 bg-black text-white text-[10px] font-sans font-bold uppercase tracking-[0.3em] rounded-sm hover:opacity-80 transition-all shadow-xl">
                  Réserver
                </Link>
              </div>
            </div>

            {/* Grille de Cartes (Droit sur desktop) */}
            <div className="w-full lg:w-[75%] grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16 pb-12">
              {SERVICES_DISPLAY.map((s, i) => (
                <ServiceCard key={s.id} s={s} staggered={i % 2 !== 0} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RITUEL POST-SOIN */}
      <section className="py-24 md:py-40 px-8 bg-neutral-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 flex flex-col text-left">
             <span className="text-xs font-sans font-bold uppercase tracking-[0.4em] text-neutral-300 mb-6 block">Immersion Continue</span>
             <h2 className="text-4xl md:text-6xl font-bold text-neutral-900 tracking-tight font-serif">Le Rituel post-soin</h2>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-[5.5rem] left-0 w-full h-[1px] bg-neutral-200" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
              {RITUAL_STEPS.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="relative group"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-6xl md:text-8xl font-cursive text-neutral-200 group-hover:text-neutral-900 transition-colors duration-700 leading-none mb-4 -ml-4">
                      {i + 1}
                    </span>
                    
                    <div className="space-y-4 pt-4 border-t border-neutral-200 lg:border-t-0 w-full">
                      <h4 className="text-lg font-sans font-bold uppercase tracking-widest text-neutral-900 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                        {step.title}
                      </h4>
                      <p className="text-base font-sans text-neutral-500 font-medium leading-relaxed italic group-hover:text-neutral-900 transition-colors">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="mt-24 pt-12 border-t border-neutral-200 text-center">
             <p className="font-cursive text-3xl text-neutral-300">João Thérapeute</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a0a0a] text-white pt-16 pb-10 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="font-sans font-bold text-lg md:text-xl tracking-[0.3em] uppercase mb-2">SERENITY RELAX</div>
            <p className="text-[10px] font-sans font-medium italic tracking-[0.3em] text-neutral-500 uppercase">Excellence Thérapeutique</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-12 border-b border-white/5 pb-12">
            <div className="space-y-6">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-neutral-600 block">Localisation</span>
              <div className="space-y-1 text-sm font-sans font-medium text-neutral-400">
                <p>Alfa Business Center</p>
                <p>Chemin de Joinville 26, 4ème étage</p>
                <p>1216 Cointrin - Genève</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-neutral-600 block">Contact</span>
              <div className="space-y-1 text-sm font-sans font-medium text-neutral-400">
                <p>+41 78 333 68 23</p>
                <p>serenityrelaxtherapy@gmail.com</p>
              </div>
            </div>

            <div className="space-y-6">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-neutral-600 block">Social</span>
              <div className="flex justify-center gap-8 text-neutral-400">
                <Instagram size={18} className="hover:text-white transition-colors cursor-pointer" />
                <MessageCircle size={18} className="hover:text-white transition-colors cursor-pointer" />
                <Linkedin size={18} className="hover:text-white transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-[9px] font-sans font-bold text-neutral-700 uppercase tracking-[0.4em]">
              © 2025 Serenity & Relax Therapy — Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
