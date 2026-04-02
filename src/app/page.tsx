
'use client';

import React, { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { 
  Instagram, Linkedin, ArrowRight, Sparkles, MessageCircle, Droplets, Moon, Clock, Plus
} from "lucide-react";
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';

const MY_PHOTO = "https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg";

const SERVICES = [
  { id: "01", name: "Massage aux Bambous", intensity: 4, image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb.d0f88929.png&w=3840&q=75", tag: "Profond", desc: "Technique utilisant des bâtons de bambou pour travailler les tissus en profondeur et libérer les tensions.", duration: "60 min" },
  { id: "02", name: "Draineur Lymphatique", intensity: 2, image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(1).cc6cf032.png&w=3840&q=75", tag: "Vitalité", desc: "Technique de pompage douce pour revitaliser, détoxifier l'organisme et relancer la circulation.", duration: "60 min" },
  { id: "03", name: "Aromathérapie", intensity: 2, image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(2).8265cf32.png&w=3840&q=75", tag: "Sensoriel", desc: "Massage intégrant des huiles essentielles personnalisées pour une harmonie parfaite du corps et de l'esprit.", duration: "60 min" },
  { id: "04", name: "Réflexologie Plantaire", intensity: 3, image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(3).7bebd53b.png&w=3840&q=75", tag: "Ciblé", desc: "Technique ciblée basée sur la stimulation des points réflexes pour rééquilibrer l'énergie des organes internes.", duration: "30 min" },
  { id: "05", name: "Massage Sportif", intensity: 5, image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(4).d7de7c4e.png&w=3840&q=75", tag: "Performance", desc: "Conçu pour les sportifs ou personnes actives, aide à dénouer les blocages et optimiser la récupération.", duration: "60 min" },
  { id: "06", name: "Massage Thérapeutique", intensity: 4, image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(5).95f12a12.png&w=3840&q=75", tag: "Signature", desc: "Massage ciblé (technique suédoise) pour soulager les tensions musculaires, améliorer la mobilité et apaiser le système nerveux.", duration: "60 min" },
  { id: "07", name: "Massage Deep Relax", intensity: 2, image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(6).40bca099.png&w=3840&q=75", tag: "Détente", desc: "Technique lente et profonde pour une détente totale du corps, favorisant le lâcher-prise mental et nerveux.", duration: "60 min" },
  { id: "08", name: "Massage Thaï", intensity: 4, image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(7).681b63b0.png&w=3840&q=75", tag: "Dynamique", desc: "Technique dynamique combinant pressions profondes et étirements fluides pour relancer l'énergie vitale.", duration: "60 min" }
];

const AFTERCARE_TIPS = [
  { 
    id: "01",
    title: "Hydratation", 
    desc: "L'eau alcaline aide votre système lymphatique à drainer les toxines libérées.",
    advice: "Hydratez-vous",
    icon: Droplets
  },
  { 
    id: "02",
    title: "Repos", 
    desc: "Accordez-vous un temps de calme pour permettre à votre corps d'ancrer les bienfaits.",
    advice: "Prenez votre temps",
    icon: Moon
  },
  { 
    id: "03",
    title: "Prudence", 
    desc: "Votre organisme est en phase de récupération. Soyez à l'écoute de vos sensations.",
    advice: "Évitez l'alcool",
    icon: Sparkles
  }
];

const OverTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span className={`text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 block mb-6 ${className}`}>
    {children}
  </span>
);

const SectionTitle = ({ main, italic, className = "" }: { main: string, italic: string, className?: string }) => (
  <h2 className={`text-4xl md:text-5xl lg:text-7xl font-serif font-medium text-neutral-900 leading-[1] tracking-tighter ${className}`}>
    {main} <br className="hidden lg:block"/> <span className="text-neutral-500 italic font-light">{italic}</span>
  </h2>
);

const SectionDesc = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-neutral-600 text-base md:text-lg font-sans font-medium leading-relaxed italic ${className}`}>
    {children}
  </p>
);

const TextLink = ({ children, href = "/booking", className = "" }: { children: React.ReactNode, href?: string, className?: string }) => (
  <Link href={href} className={`inline-flex items-center gap-3 group transition-all ${className}`}>
    <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-900">{children}</span>
    <ArrowRight size={14} className="text-neutral-900 transition-transform group-hover:translate-x-1.5" />
  </Link>
);

const ServiceCard = ({ s, index }: { s: any, index: number }) => {
  const isStaggered = index % 2 !== 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: isStaggered ? 44 : -12 }}
      className={`relative w-full rounded-[2.5rem] bg-white overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.03)] transition-all duration-700
        ${isStaggered ? 'md:mt-24' : ''}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden m-4 rounded-[2rem]">
        <Image 
          src={s.image} 
          fill
          unoptimized
          className="object-cover transition-transform duration-1000 group-hover:scale-110" 
          alt={s.name}
        />
        <div className="absolute top-6 left-6">
          <span className="text-[9px] font-sans font-black uppercase tracking-[0.3em] text-white/90 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full">
            {s.tag}
          </span>
        </div>
      </div>

      <div className="p-10 pt-4 space-y-6">
        <h3 className="text-2xl font-serif font-medium text-neutral-900 tracking-tight leading-tight">
          {s.name}
        </h3>

        <p className="text-[13px] text-neutral-500 font-sans font-medium leading-relaxed line-clamp-2">
          {s.desc}
        </p>

        <div className="flex justify-between items-center pt-6 border-t border-neutral-50">
          <div className="flex items-center gap-3">
            <Clock size={12} className="text-neutral-300" />
            <span className="text-[10px] font-sans font-black uppercase tracking-widest text-neutral-300">
              {s.duration}
            </span>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-300 group-hover:bg-neutral-900 group-hover:text-white transition-all duration-500">
            <Plus size={16} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white antialiased relative">
      <Navbar />
      
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-neutral-900 z-[120] origin-left" style={{ scaleX }} />

      {/* SECTION HÉROS */}
      <section className="min-h-[90vh] flex flex-col justify-center px-6 md:px-12 lg:px-8 pt-32 pb-24 bg-white relative border-b border-neutral-50 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          <div className="w-full lg:w-[45%] flex justify-center lg:justify-start">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] overflow-hidden rounded-[8rem_4rem_8rem_4rem] shadow-2xl w-full max-w-[420px]"
            >
              <Image 
                src={MY_PHOTO} 
                fill
                unoptimized
                className="object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                alt="Portrait de João P."
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
            </motion.div>
          </div>

          <div className="w-full lg:w-[55%] space-y-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-center lg:items-start">
              <OverTitle className="text-center lg:text-left">L'Engagement João.</OverTitle>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-neutral-900 leading-[0.95] tracking-tighter text-center lg:text-left">
                L'équilibre<br />
                <span className="text-neutral-500 italic font-light">par le toucher.</span>
              </h1>
            </motion.div>
            
            <div className="space-y-10 max-w-xl mx-auto lg:mx-0">
              <SectionDesc className="text-neutral-800 text-center lg:text-left">
                "Une approche personnalisée pour restaurer votre harmonie physique et mentale."
              </SectionDesc>
              <div className="space-y-8 text-center lg:text-left">
                <p className="text-neutral-600 text-lg font-sans font-medium leading-relaxed">
                  Passionné par le bien-être global, mon travail consiste à offrir des services de massothérapie dédiés à l'amélioration de votre qualité de vie au quotidien.
                </p>
                <div className="pl-8 border-l-2 border-neutral-900/10 py-2">
                   <p className="text-neutral-800 italic text-2xl leading-snug font-sans">« Le luxe ultime réside dans la reconnexion à soi, loin du tumulte urbain. »</p>
                   <span className="font-cursive text-4xl text-neutral-300 block mt-4">— João P.</span>
                </div>
              </div>
              <div className="flex justify-center lg:justify-start pt-6">
                <TextLink>Découvrir les rituels</TextLink>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION SERVICES */}
      <section id="services" className="py-32 px-6 md:px-12 lg:px-8 bg-[#FAF9F6] border-y border-neutral-100/50 rounded-[5rem] lg:mx-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-20 items-start">
            
            <div className="w-full lg:w-[32%] lg:sticky lg:top-32 h-fit flex flex-col items-center lg:items-start">
              <OverTitle>Menu Signature</OverTitle>
              <SectionTitle main="Soins" italic="Exclusifs." className="mb-8 text-center lg:text-left" />
              <SectionDesc className="text-neutral-800 mb-12 text-center lg:text-left">
                Une sélection exclusive de rituels conçue pour votre équilibre interne et votre récupération physique. Agréé ASCA & RME.
              </SectionDesc>
              <TextLink className="mt-4">Réserver un soin</TextLink>
            </div>

            <div className="w-full lg:w-[68%] grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
              {SERVICES.map((s, i) => (
                <ServiceCard key={s.id} s={s} index={i} />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* RITUEL POST-SOIN */}
      <section className="py-32 px-6 md:px-12 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-20 items-start">
            
            <div className="w-full lg:w-[72%] space-y-0 border-t border-neutral-100">
               {AFTERCARE_TIPS.map((tip) => (
                <div key={tip.id} className="group py-20 px-0 border-b border-neutral-100 flex flex-col md:flex-row items-start md:items-center gap-16 transition-all duration-700 hover:bg-neutral-50/30">
                  <div className="flex items-center gap-12 min-w-[140px]">
                    <span className="text-sm font-sans font-black text-neutral-200 uppercase tracking-widest">{tip.id}</span>
                    <div className="w-14 h-14 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white transition-all duration-700">
                      <tip.icon size={20} strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-8">
                    <h4 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 leading-none">
                      {tip.title}
                    </h4>
                    <div className="space-y-6">
                      <p className="text-neutral-900 text-2xl font-serif font-medium leading-tight">
                        {tip.advice}
                      </p>
                      <p className="text-neutral-500 text-lg font-sans font-medium leading-relaxed max-w-2xl">
                        {tip.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-[28%] lg:sticky lg:top-32 h-fit flex flex-col items-center lg:items-end text-center lg:text-right">
              <OverTitle className="mb-2 lg:text-right">Rituel Post-Séance</OverTitle>
              <SectionTitle main="Prolonger" italic="l'état de grâce." className="lg:text-right" />
              <div className="h-[2px] w-12 bg-neutral-900 my-10 mx-auto lg:mr-0 lg:ml-auto" />
              <SectionDesc className="text-neutral-800 lg:text-right">
                Quelques attentions pour ancrer les bienfaits du soin dans la durée.
              </SectionDesc>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#121212] text-white pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-24">
            <h2 className="text-3xl font-sans font-bold tracking-[0.4em] uppercase mb-6">SERENITY RELAX</h2>
            <p className="text-[10px] font-sans font-medium italic tracking-[0.4em] text-neutral-500 uppercase">EXCELLENCE THÉRAPEUTIQUE</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-32 w-full text-center mb-32">
            <div className="space-y-8">
              <h3 className="text-[10px] font-sans font-black text-neutral-600 uppercase tracking-[0.3em]">LOCALISATION</h3>
              <div className="text-sm font-sans text-neutral-400 space-y-3 leading-relaxed">
                <p>Alfa Business Center</p>
                <p>Chemin de Joinville 26, 4ème étage</p>
                <p>1216 Cointrin - Genève</p>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-sans font-black text-neutral-600 uppercase tracking-[0.3em]">CONTACT</h3>
              <div className="text-sm font-sans text-neutral-400 space-y-3 leading-relaxed">
                <p>+41 78 333 68 23</p>
                <p>serenityrelaxtherapy@gmail.com</p>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-sans font-black text-neutral-600 uppercase tracking-[0.3em]">SOCIAL</h3>
              <div className="flex items-center justify-center gap-10">
                <Instagram size={22} className="text-neutral-400 hover:text-white transition-colors cursor-pointer" />
                <MessageCircle size={22} className="text-neutral-400 hover:text-white transition-colors cursor-pointer" />
                <Linkedin size={22} className="text-neutral-400 hover:text-white transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
          
          <div className="w-full pt-12 border-t border-white/5">
            <div className="max-w-fit mx-auto px-16 py-6 border border-white/10 rounded-t-[2.5rem]">
              <p className="text-[9px] font-sans font-bold text-neutral-500 uppercase tracking-[0.5em]">
                © 2026 SERENITY RELAX THERAPY — TOUS DROITS RÉSERVÉS
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
