
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Sparkles, Moon, Wind, Droplets, Plus, Menu, 
  Heart, Clock, Calendar, Sun, Instagram, MapPin, 
  Leaf, Coffee, X
} from 'lucide-react';
import { Navbar } from '@/components/navbar';

// --- DATA ---
const SERVICES = [
  { 
    id: "01", 
    name: "Rituel Thérapeutique", 
    duration: "60 MIN", 
    intensity: 4,
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1544126592-807daa215671?auto=format&fit=crop&q=80&w=1000",
    desc: "Libération des tensions profondes et restauration de l'équilibre corporel signé João.", 
    tag: "Excellence"
  },
  { 
    id: "02", 
    name: "Deep Relax Signature", 
    duration: "60 MIN", 
    intensity: 2,
    icon: Moon,
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=1000",
    desc: "Immersion sensorielle confidentielle conçue pour un lâcher-prise immédiat.", 
    tag: "Sérénité"
  },
  { 
    id: "03", 
    name: "Kalari Thérapeutique", 
    duration: "75 MIN", 
    intensity: 5,
    icon: Wind,
    image: "https://images.unsplash.com/photo-1614859324967-bdf781b9c897?auto=format&fit=crop&q=80&w=1000",
    desc: "Rééquilibre des flux énergétiques selon les traditions anciennes.", 
    tag: "Tradition"
  },
  { 
    id: "04", 
    name: "Drainage Lymphatique", 
    duration: "60 MIN", 
    intensity: 2,
    icon: Droplets,
    image: "https://images.unsplash.com/photo-1591343395582-99bf4eb11abc?auto=format&fit=crop&q=80&w=1000",
    desc: "Technique rythmique de pointe pour éliminer les toxines.", 
    tag: "Détox"
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

    .luxury-btn::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 1px;
      bottom: -2px;
      left: 0;
      background: currentColor;
      transform: scaleX(0);
      transform-origin: right;
      transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    }
    .luxury-btn:hover::after {
      transform: scaleX(1);
      transform-origin: left;
    }

    .hero-mask {
      clip-path: inset(0 0 0 0 round 0 0 3rem 3rem);
    }
  `}</style>
);

const ServiceCard = ({ s, staggered }: { s: any, staggered: boolean }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const yImage = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className={`w-full aspect-[4/6.5] bg-white rounded-[2.5rem] flex flex-col overflow-hidden relative group hover:shadow-xl transition-all duration-700 ${staggered ? 'md:mt-24' : ''}`}
    >
      <div className="relative h-[55%] w-full overflow-hidden bg-neutral-100">
        <motion.img 
          style={{ y: yImage, scale: 1.1 }}
          src={s.image} 
          className="absolute inset-0 w-full h-[120%] object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000"
          alt={s.name}
        />
        <div className="absolute top-6 left-8 flex flex-col gap-1">
           <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/90">{s.tag}</span>
        </div>
        <div className="absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center border border-white/20">
          {React.createElement(s.icon, { size: 16, className: "text-neutral-900", strokeWidth: 1 })}
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
             <h3 className="text-xl font-fraunces font-semibold tracking-tight text-neutral-900 leading-tight max-w-[85%]">
              {s.name}
            </h3>
            <span className="text-[9px] font-medium text-neutral-300 italic font-fraunces">{s.id}</span>
          </div>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            {s.desc}
          </p>
        </div>

        <div className="pt-6 flex items-end justify-between">
          <div className="space-y-3">
            <span className="text-[7px] font-bold text-neutral-300 tracking-[0.3em] uppercase block">Intensité</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-[1px] w-3 rounded-full ${i < s.intensity ? 'bg-neutral-900' : 'bg-neutral-100'}`} />
              ))}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-fraunces font-bold text-neutral-900 block mb-2">{s.duration}</span>
            <Link href="/booking" className="w-8 h-8 rounded-full border border-neutral-50 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition-all">
              <Plus size={14} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative grained bg-[#F9F9F7] selection:bg-neutral-900 selection:text-white">
      <GlobalStyle />
      <Navbar />

      {/* Hero Header */}
      <section className="relative h-[90vh] w-full overflow-hidden hero-mask bg-[#1a1a1a]">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-50 scale-105"
            alt="Détail zen et minimaliste"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#F9F9F7]" />
        </motion.div>

        <div className="relative h-full max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
            className="max-w-3xl"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/70 block mb-6">Genève • Cointrin</span>
            <h1 className="text-6xl md:text-[7.5rem] font-fraunces font-black tracking-tighter leading-[0.82] uppercase text-white mb-8">
              L'art du<br/>
              <span className="serif-italic font-light lowercase tracking-normal block ml-4 md:ml-12">mouvement calme.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-fraunces italic font-light max-w-md leading-relaxed">
              Un sanctuaire sensoriel confidentiel dédié à la restauration profonde du corps et de l'esprit.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12 left-6 md:left-10"
          >
            <div className="flex items-center gap-4 text-white/40">
              <div className="w-12 h-[1px] bg-white/20" />
              <span className="text-[8px] font-bold uppercase tracking-[0.4em]">Faites défiler pour explorer</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION ENGAGEMENT JOÃO (SOUS LE HERO) --- */}
      <section className="py-24 md:py-32 px-6 md:px-10 bg-[#F9F9F7]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5 flex flex-col justify-between">
             <div>
               <span className="text-[10px] font-black uppercase tracking-[0.6em] text-neutral-400 block mb-6">La Philosophie</span>
               <h2 className="text-4xl md:text-6xl font-fraunces font-black tracking-tighter leading-[0.9] text-neutral-900 mb-12 lg:mb-20">
                 L'Engagement <span className="serif-italic font-light lowercase">João.</span>
               </h2>
             </div>
             
             {/* Portrait João intégré */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 1 }}
               className="relative aspect-[4/5] w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 hidden lg:block border border-white"
             >
                <img 
                  src={PHOTO_JOAO} 
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                  alt="João - Serenity Relax"
                />
             </motion.div>
          </div>
          
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
              <p className="text-xl md:text-2xl font-fraunces font-light text-neutral-700 leading-snug">
                Je ne pratique pas seulement le massage ; je sculpte un <span className="font-bold text-neutral-900">espace de décompression</span>. Mon approche fusionne la rigueur anatomique et l'intuition sensorielle pour répondre aux maux de la vie moderne.
              </p>
            </div>
            
            <div className="relative py-12 px-8 bg-white/50 rounded-[2rem] border border-neutral-100 italic">
               <span className="absolute -top-6 left-10 text-8xl font-serif text-neutral-100 select-none">“</span>
               <p className="text-2xl md:text-3xl font-fraunces text-neutral-900 leading-tight">
                 « Le luxe ultime réside dans la reconnexion à soi, loin du tumulte urbain. »
               </p>
               <div className="mt-8 h-[1px] w-20 bg-neutral-900/10" />
               <p className="mt-6 text-[12px] font-bold uppercase tracking-widest text-neutral-400 leading-relaxed max-w-md">
                 Chaque séance est un protocole unique, adapté à votre physiologie et à votre état émotionnel du moment.
               </p>
            </div>

            {/* Photo mobile */}
            <div className="lg:hidden relative aspect-[4/5] w-full max-w-md rounded-[3rem] overflow-hidden shadow-xl grayscale hover:grayscale-0 transition-all border border-white">
                <img 
                  src={PHOTO_JOAO} 
                  className="w-full h-full object-cover"
                  alt="João - Serenity Relax"
                />
             </div>
          </div>
        </div>
      </section>
      
      <main className="px-6 md:px-10 max-w-[1400px] mx-auto">
        {/* Section Soins */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 pb-32">
          <div className="w-full lg:w-[30%] lg:sticky lg:top-32 h-fit">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="w-10 h-[1px] bg-neutral-900 opacity-20" />
                <h2 className="text-3xl md:text-[3rem] font-fraunces font-black tracking-tighter leading-[0.9] uppercase text-neutral-900">
                  Soin<br/>
                  <span className="serif-italic font-light lowercase tracking-normal block">D'exception.</span>
                </h2>
              </div>
              
              <div className="space-y-8 max-w-xs">
                <p className="text-lg text-neutral-500 leading-relaxed font-fraunces italic font-light border-l border-neutral-100 pl-6">
                  "Une approche architecturale du massage pour une libération immédiate."
                </p>
                
                <div className="flex flex-col gap-8">
                  <Link href="/booking" className="group flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-lg transition-all group-hover:bg-neutral-800">
                       <ArrowRight size={18} strokeWidth={1} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-neutral-900">Prendre rendez-vous</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[70%] grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12">
            {SERVICES.map((s, i) => (
              <ServiceCard key={s.id} s={s} staggered={i % 2 !== 0} />
            ))}
          </div>
        </div>

        {/* Section Rituel Post-Soin */}
        <section className="pt-24 border-t border-neutral-100 pb-32">
          <div className="flex flex-col items-center text-center mb-24 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-neutral-400">7 gestes pour magnifier l'expérience</span>
            <h2 className="text-4xl md:text-5xl font-fraunces font-black tracking-tighter uppercase text-neutral-900">
              Le Rituel <span className="serif-italic font-light lowercase">Post-Soin</span>
            </h2>
            <p className="text-neutral-500 max-w-xl text-[13px] leading-relaxed">
              Quelques attentions essentielles pour accueillir pleinement les bienfaits de votre séance dans les heures qui suivent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
            {RITUAL_STEPS.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="group flex flex-col space-y-5"
              >
                <div className="w-10 h-10 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 transition-all duration-500">
                  {React.createElement(step.icon, { size: 16, strokeWidth: 1.2 })}
                </div>
                <div className="space-y-2">
                  <h4 className="font-fraunces font-bold text-neutral-900 text-[15px]">{step.title}</h4>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {/* CTA Final pour le rituel */}
            <Link href="/booking" className="lg:col-span-1 bg-neutral-900 rounded-3xl p-8 flex flex-col justify-between text-white group cursor-pointer overflow-hidden relative">
              <div className="relative z-10 space-y-4">
                <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/50">Engagement</span>
                <p className="font-fraunces text-lg leading-tight">Prêt pour votre prochain moment de calme ?</p>
              </div>
              <div className="relative z-10 flex justify-between items-center mt-8">
                <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Réserver</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={60} strokeWidth={0.5} />
              </div>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-24 px-6 bg-neutral-900 text-white overflow-hidden relative">
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-white/5 rounded-full blur-[120px] -mb-32 -mr-32 pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start gap-20 relative z-10">
          <div className="space-y-8">
            <h2 className="font-fraunces font-bold text-xs tracking-[0.3em] uppercase leading-none">
              SERENITY RELAX <span className="font-meow text-[28px] text-white/40 tracking-normal inline-block normal-case ml-3">by João</span>
            </h2>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-medium leading-loose max-w-xs">
              Un sanctuaire sensoriel confidentiel pour la restauration physique et mentale. Uniquement sur rendez-vous.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 md:gap-32">
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
          
          <div className="flex flex-col gap-10 items-start md:items-end pt-8 md:pt-0">
            <div className="flex gap-10 items-center">
              <a href="https://instagram.com/serenity.relax.therapy_by_joao" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-all transform hover:scale-110">
                <Instagram size={22} />
              </a>
              <div className="h-10 w-px bg-white/10 hidden md:block" />
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">ID ASCA</h3>
                <p className="text-sm text-emerald-400 font-black tracking-widest">Agréé Thérapeute</p>
              </div>
            </div>
            <p className="text-[9px] text-white/20 uppercase tracking-widest">&copy; {new Date().getFullYear()} Serenity Relax. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
