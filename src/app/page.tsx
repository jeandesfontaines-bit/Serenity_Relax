
'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Instagram, Linkedin, CheckCircle2, Menu, ArrowRight, Activity, Wind, Droplets, Sparkles, Sun, Heart, Clock, Calendar, Moon
} from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';

// --- DONNÉES ---
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
  }
];

const BENEFITS = [
  { title: "Douleurs", desc: "Apaise les tensions, réduit les raideurs dorsales et cervicales.", icon: Activity },
  { title: "Mobilité", desc: "Assouplit les muscles et améliore durablement la posture.", icon: Wind },
  { title: "Vitalité", desc: "Stimule la circulation et accélère la récupération naturelle.", icon: Droplets },
  { title: "Peau", desc: "Adoucit et revitalise l'épiderme par le pétrissage précis.", icon: Sparkles },
  { title: "Énergie", desc: "Approfondit la respiration et redonne un équilibre global.", icon: Sun },
  { title: "Harmonie", desc: "Réduit le stress pour une sensation durable de bien-être.", icon: Heart }
];

const RITUAL_STEPS = [
  { title: "Émotions", desc: "Accueillez vos ressentis.", icon: Heart },
  { title: "Temps", desc: "Restez allongé 5 min.", icon: Clock },
  { title: "Eau", desc: "Éliminez les toxines.", icon: Droplets },
  { title: "Huiles", desc: "Laissez agir 1h.", icon: Wind },
  { title: "Repos", desc: "Prolongez le calme.", icon: Moon },
  { title: "Suivi", desc: "Prévoyez le prochain soin.", icon: Calendar },
  { title: "Douceur", desc: "Activités calmes.", icon: Sun }
];

const ServiceCard = ({ s, staggered }: { s: typeof SERVICES_DISPLAY[0], staggered: boolean }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const yImage = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={`w-full aspect-[4/5.5] bg-white rounded-xl flex flex-col overflow-hidden relative group border border-neutral-100 shadow-sm hover:shadow-2xl transition-all duration-700 ${staggered ? 'md:mt-16' : ''}`}
    >
      <div className="relative h-[55%] w-full overflow-hidden bg-neutral-50">
        <motion.div style={{ y: yImage }} className="absolute inset-0 w-full h-[120%]">
          <Image 
            src={s.image} 
            fill
            className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-[1.2s] scale-105"
            alt={s.name}
            data-ai-hint="luxury massage"
          />
        </motion.div>
        <div className="absolute top-4 left-4 z-10">
           <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white bg-black/40 backdrop-blur-md px-3 py-1 rounded-sm">{s.tag}</span>
        </div>
      </div>
      <div className="flex-1 p-8 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-lg font-black tracking-tighter text-neutral-900 leading-tight">{s.name}</h3>
          <p className="text-neutral-500 text-xs font-medium leading-relaxed italic">{s.desc}</p>
        </div>
        <div className="pt-6 flex items-center justify-between border-t border-neutral-50">
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-1 w-1 rounded-full ${i < s.intensity ? 'bg-neutral-900' : 'bg-neutral-100'}`} />
            ))}
          </div>
          <span className="text-[9px] font-black text-neutral-400 tracking-[0.2em] uppercase">{s.duration}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0a0a0a]">
      <Navbar />
      
      {/* HEADER INFO COMPACT */}
      <div className="hidden md:flex fixed top-8 right-32 z-[101] items-center gap-4 text-[9px] font-black tracking-[0.3em] text-neutral-300 pointer-events-none">
        {time} • CH / GENEVA
      </div>

      {/* HERO SECTION : PHILOSOPHIE */}
      <section className="relative pt-32 pb-24 px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden bg-white shadow-2xl">
              <Image 
                src="https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg" 
                fill
                className="object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
                alt="João Thérapeute"
                data-ai-hint="professional therapist"
                priority
              />
            </div>
            <div className="lg:col-span-7 flex flex-col pl-0 lg:pl-12">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300 mb-8 block">À propos de moi</span>
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] text-neutral-900 mb-10">
                L'équilibre <br/>
                <span className="text-neutral-200 font-light">par le toucher.</span>
              </h1>
              <div className="space-y-8 text-neutral-500 font-medium leading-relaxed text-base max-w-xl">
                <p className="text-neutral-900 text-xl font-bold italic border-l-4 border-neutral-900 pl-8 py-2">
                  "Bonjour, je suis João, massothérapeute et le fondateur de Serenity & Relax Therapy."
                </p>
                <p>
                  Je suis passionnée par le bien-être global et mon travail consiste à offrir des services de massothérapie personnalisés pour améliorer votre qualité de vie.
                </p>
                <p>
                  J'utilise des techniques variées et dédiées, comme le Massage Classique, Relaxant et Thérapeutique, pour apaiser votre corps et revitaliser votre esprit, créant ainsi une harmonie parfaite.
                </p>
                <div className="pt-6">
                  <Link href="/booking" className="inline-flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-neutral-900 group">
                    Réserver une séance <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LES BIENFAITS SECTION */}
      <section className="py-32 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-end">
            <div className="lg:col-span-8 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300 mb-6 block">Expertise Thérapeutique</span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1] text-neutral-900">
                Les bienfaits du Massage <br/>sur le corps
              </h2>
            </div>
            <div className="lg:col-span-4 border-l border-neutral-100 pl-8">
              <p className="text-neutral-400 text-sm font-medium leading-relaxed italic">
                Le massage est un soin complet qui agit à la fois sur le corps et l’esprit, favorisant l’équilibre naturel de l’organisme et améliore la qualité de vie au quotidien.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-16">
            {BENEFITS.map((b, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-6 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center group-hover:bg-black transition-all duration-500">
                    {React.createElement(b.icon, { size: 16, className: "text-neutral-400 group-hover:text-white" })}
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">{b.title}</h4>
                </div>
                <p className="text-neutral-400 text-[13px] font-medium leading-relaxed group-hover:text-neutral-600 transition-colors">
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOGUE DES SOINS : GRID DÉCALÉE */}
      <section className="py-32 px-8 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-24">
            <div className="w-full lg:w-[30%] lg:sticky lg:top-32 h-fit space-y-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300 block">Menu de Soins</span>
              <h2 className="text-5xl font-black tracking-tighter leading-none text-neutral-900">Rituels.</h2>
              <div className="h-1 w-12 bg-neutral-900" />
              <p className="text-xs text-neutral-400 font-bold leading-relaxed uppercase tracking-[0.2em] max-w-[200px]">
                Sélection exclusive pour votre équilibre interne à Cointrin.
              </p>
              <div className="pt-12">
                <Link href="/booking" className="inline-flex items-center gap-4 px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-sm hover:scale-105 transition-all shadow-2xl">
                  Réserver un soin
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-[70%] grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              {SERVICES_DISPLAY.map((s, i) => (
                <ServiceCard key={s.id} s={s} staggered={i % 2 !== 0} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RITUEL POST-SOIN : LIGNE ÉPURÉE */}
      <section className="py-32 px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 flex flex-col">
             <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300 mb-6 block">Immersion Continue</span>
             <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1] text-neutral-900">Le Rituel post-soin</h2>
          </div>

          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-px bg-neutral-100" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-y-16">
              {RITUAL_STEPS.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="pt-12 pr-6 group"
                >
                  <div className="flex flex-col space-y-6">
                    <span className="text-xs font-black text-neutral-200 group-hover:text-neutral-900 transition-colors duration-500">0{i+1}</span>
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900">{step.title}</h4>
                      <p className="text-[11px] text-neutral-400 font-medium leading-relaxed italic">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER NOIR COMPACT */}
      <footer className="bg-[#0a0a0a] text-white py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
            <div className="md:col-span-4">
              <Link href="/" className="flex flex-col gap-1 mb-6">
                <span className="text-xs font-black tracking-[0.5em] uppercase">Serenity Relax</span>
                <span className="text-[9px] text-neutral-500 font-bold tracking-[0.3em] uppercase">Studio Genève Cointrin</span>
              </Link>
              <p className="text-[10px] text-neutral-500 font-medium tracking-[0.1em] uppercase leading-relaxed max-w-xs">
                Sanctuaire privé dédié à la restauration physique et mentale. Praticien agréé ASCA & RME.
              </p>
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-neutral-600">Localisation</span>
              <p className="text-[11px] font-medium text-neutral-400 leading-relaxed">
                Chemin de Joinville 26<br />
                1216 Cointrin – Genève
              </p>
            </div>

            <div className="md:col-span-2 space-y-4">
              <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-neutral-600">Contact</span>
              <p className="text-[11px] font-medium text-neutral-400 leading-relaxed">
                +41 78 333 68 23<br />
                hello@serenityrelax.ch
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col items-start md:items-end gap-6">
              <div className="flex gap-6 text-neutral-500">
                <Instagram size={18} className="hover:text-white transition-colors cursor-pointer" />
                <Linkedin size={18} className="hover:text-white transition-colors cursor-pointer" />
              </div>
              <Link href="/booking" className="px-8 py-3 border border-white/10 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                Réserver en ligne
              </Link>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-[0.4em]">© {new Date().getFullYear()} Serenity & Relax Therapy</p>
            <div className="flex gap-8">
               <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-[0.4em] cursor-pointer hover:text-white transition-colors">Mentions Légales</span>
               <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-[0.4em] cursor-pointer hover:text-white transition-colors">Politique de Confidentialité</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
