
'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Instagram, Linkedin, CheckCircle2, Menu, ArrowRight
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
  { title: "Douleurs", desc: "Apaise les tensions, réduit les raideurs dorsales et cervicales." },
  { title: "Mobilité", desc: "Assouplit les muscles et améliore durablement la posture." },
  { title: "Vitalité", desc: "Stimule la circulation et accélère la récupération naturelle." },
  { title: "Peau", desc: "Adoucit et revitalise l'épiderme par le pétrissage précis." },
  { title: "Énergie", desc: "Approfondit la respiration et redonne un équilibre global." },
  { title: "Harmonie", desc: "Réduit le stress pour une sensation durable de bien-être." }
];

const RITUAL_STEPS = [
  { title: "Émotions", desc: "Accueillez vos ressentis." },
  { title: "Temps", desc: "Restez allongé 5 min." },
  { title: "Eau", desc: "Éliminez les toxines." },
  { title: "Huiles", desc: "Laissez agir 1h." },
  { title: "Repos", desc: "Prolongez le calme." },
  { title: "Suivi", desc: "Prévoyez le prochain soin." },
  { title: "Douceur", desc: "Activités calmes." }
];

const GlobalStyle = () => (
  <style>{`
    :root {
      --primary: #0a0a0a;
      --bg-bone: #F8F8F5;
    }

    .soft-shadow {
      box-shadow: 0 10px 40px -15px rgba(0, 0, 0, 0.05);
    }
    
    .section-title {
      font-size: clamp(1.8rem, 5vw, 3rem);
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }

    .overline {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4em;
      color: #A3A3A3;
      display: block;
      margin-bottom: 1rem;
    }
  `}</style>
);

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
      className={`w-full aspect-[4/5.5] bg-white rounded-xl flex flex-col overflow-hidden relative group border border-neutral-100 soft-shadow hover:shadow-xl transition-all duration-700 ${staggered ? 'md:mt-12' : ''}`}
    >
      <div className="relative h-[50%] w-full overflow-hidden bg-neutral-50">
        <motion.div style={{ y: yImage }} className="absolute inset-0 w-full h-[120%]">
          <Image 
            src={s.image} 
            fill
            className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-[1s] scale-105"
            alt={s.name}
            data-ai-hint="luxury massage"
          />
        </motion.div>
        <div className="absolute top-3 left-3 z-10">
           <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-sm">{s.tag}</span>
        </div>
      </div>
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="text-base font-bold tracking-tight text-neutral-900 leading-tight">{s.name}</h3>
          <p className="text-neutral-500 text-[10px] font-medium leading-relaxed italic">{s.desc}</p>
        </div>
        <div className="pt-3 flex items-center justify-between border-t border-neutral-50">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-1 w-1 rounded-full ${i < s.intensity ? 'bg-neutral-900' : 'bg-neutral-100'}`} />
            ))}
          </div>
          <span className="text-[8px] font-bold text-neutral-400 tracking-widest uppercase">{s.duration}</span>
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
    <div className="min-h-screen bg-white">
      <GlobalStyle />
      <Navbar />
      
      {/* HEADER INFO COMPACT */}
      <div className="hidden md:flex fixed top-8 right-32 z-[101] items-center gap-4 text-[9px] font-bold tracking-[0.3em] text-neutral-300 pointer-events-none">
        {time} • CH / GENEVA
      </div>

      {/* HERO SECTION : PHILOSOPHIE */}
      <section className="relative pt-32 pb-20 px-8 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden bg-white soft-shadow max-h-[500px]">
              <Image 
                src="https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg" 
                fill
                className="object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
                alt="João Thérapeute"
                data-ai-hint="professional therapist"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="overline">Philosophie de soin</span>
              <h1 className="section-title text-neutral-900 mb-8">
                L'équilibre <br/>
                <span className="text-neutral-300 font-light">par le toucher.</span>
              </h1>
              <div className="space-y-6 text-neutral-500 font-medium leading-relaxed text-sm">
                <p className="text-neutral-900 text-lg font-bold italic border-l-2 border-neutral-900 pl-6 py-1">
                  "Une approche personnalisée pour restaurer votre harmonie physique et mentale."
                </p>
                <p>
                  Bonjour, je suis João, massothérapeute et le fondateur de Serenity & Relax Therapy. Passionné par le bien-être global, mon travail consiste à offrir des services de massothérapie personnalisés.
                </p>
                <p>
                  J'utilise des techniques variées et dédiées, comme le Massage Classique, Relaxant et Thérapeutique, pour apaiser votre corps et revitaliser votre esprit.
                </p>
                <div className="pt-4">
                  <Link href="/booking" className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-900 group">
                    Réserver une séance <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LES BIENFAITS SECTION */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-end">
            <div className="lg:col-span-8 flex flex-col">
              <span className="overline">Expertise Thérapeutique</span>
              <h2 className="section-title text-neutral-900">
                Les bienfaits du Massage <br/>sur le corps
              </h2>
            </div>
            <div className="lg:col-span-4 border-l border-neutral-100 pl-6">
              <p className="text-neutral-400 text-[13px] font-medium leading-relaxed italic">
                Le massage est un soin complet qui agit à la fois sur le corps et l’esprit, favorisant l’équilibre naturel de l’organisme.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
            {BENEFITS.map((b, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-neutral-50 group-hover:bg-black transition-all duration-500">
                    <CheckCircle2 size={12} className="text-neutral-300 group-hover:text-white" />
                  </div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-900">{b.title}</h4>
                </div>
                <p className="text-neutral-400 text-[11px] font-medium leading-relaxed group-hover:text-neutral-600 transition-colors">
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOGUE DES SOINS */}
      <section className="py-24 px-8 bg-[#F8F8F5] border-y border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="w-full lg:w-[25%] lg:sticky lg:top-24 h-fit space-y-6">
              <span className="overline">Menu de Soins</span>
              <h2 className="section-title text-neutral-900">Soins.</h2>
              <div className="h-[1.5px] w-10 bg-neutral-900" />
              <p className="text-[10px] text-neutral-400 font-bold leading-relaxed uppercase tracking-widest max-w-[180px]">
                Sélection exclusive pour votre équilibre interne à Cointrin.
              </p>
              <div className="pt-8">
                <Link href="/booking" className="inline-flex items-center gap-4 px-8 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-sm hover:opacity-80 transition-all shadow-xl">
                  Réserver
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-[75%] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {SERVICES_DISPLAY.map((s, i) => (
                <ServiceCard key={s.id} s={s} staggered={i % 2 !== 0} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RITUEL POST-SOIN */}
      <section className="py-24 px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col">
             <span className="overline">Immersion Continue</span>
             <h2 className="section-title text-neutral-900">Le Rituel post-soin</h2>
          </div>

          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-neutral-100" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-y-12">
              {RITUAL_STEPS.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="pt-8 pr-4 group"
                >
                  <div className="flex flex-col space-y-4">
                    <span className="text-[9px] font-bold text-neutral-200 group-hover:text-neutral-900 transition-colors duration-500">0{i+1}</span>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-900">{step.title}</h4>
                      <p className="text-[10px] text-neutral-400 font-medium leading-relaxed italic">
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
      <footer className="bg-[#0a0a0a] text-white py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
            <div className="md:col-span-1">
              <Link href="/" className="flex flex-col">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Serenity Relax</span>
                <span className="text-[7px] text-neutral-500 font-bold tracking-[0.2em] uppercase">Studio Genève Cointrin</span>
              </Link>
            </div>
            
            <div className="space-y-2">
              <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-neutral-600 block">Adresse</span>
              <p className="text-[9px] font-medium text-neutral-400 leading-relaxed">
                Joinville 26, 1216 Cointrin
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-neutral-600 block">Contact</span>
              <p className="text-[9px] font-medium text-neutral-400 leading-relaxed">
                +41 78 333 68 23
              </p>
            </div>

            <div className="flex md:justify-end gap-6 text-neutral-500">
              <Instagram size={14} className="hover:text-white transition-colors cursor-pointer" />
              <Linkedin size={14} className="hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest">© 2024 Serenity & Relax Therapy</p>
            <div className="flex gap-6">
               <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Mentions Légales</span>
               <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Confidentialité</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
