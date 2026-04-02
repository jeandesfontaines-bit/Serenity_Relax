
'use client';

import React, { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { 
  Instagram, Linkedin, ArrowRight, Sparkles, MessageCircle, Droplets, Moon
} from "lucide-react";
import Image from 'next/image';
import { Navbar } from '@/components/navbar';

// --- IMPORTS DES IMAGES ---
import bambooImg from '@/lib/Gemini_Generated_Image_4vxbi24vxbi24vxb.png';
import lymphImg from '@/lib/Gemini_Generated_Image_4vxbi24vxbi24vxb (1).png';
import aromaImg from '@/lib/Gemini_Generated_Image_4vxbi24vxbi24vxb (2).png';
import reflexoImg from '@/lib/Gemini_Generated_Image_4vxbi24vxbi24vxb (3).png';
import sportifImg from '@/lib/Gemini_Generated_Image_4vxbi24vxbi24vxb (4).png';
import theraImg from '@/lib/Gemini_Generated_Image_4vxbi24vxbi24vxb (5).png';
import relaxImg from '@/lib/Gemini_Generated_Image_4vxbi24vxbi24vxb (6).png';
import thaiImg from '@/lib/Gemini_Generated_Image_4vxbi24vxbi24vxb (7).png';

const MY_PHOTO = "https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg";

const SERVICES = [
  { id: "01", name: "Bambous", intensity: 4, image: bambooImg, desc: "Technique utilisant des bâtons de bambou pour travailler les tissus en profondeur et libérer les tensions.", tag: "Profond" },
  { id: "02", name: "Draineur Lymphatique", intensity: 2, image: lymphImg, desc: "Technique de pompage douce pour revitaliser, détoxifier l'organisme et relancer la circulation.", tag: "Vitalité" },
  { id: "03", name: "Aromathérapie", intensity: 2, image: aromaImg, desc: "Massage intégrant des huiles essentielles personnalisées pour une harmonie parfaite du corps et de l'esprit.", tag: "Sensoriel" },
  { id: "04", name: "Réflexologie Plantaire", intensity: 3, image: reflexoImg, desc: "Technique ciblée basée sur la stimulation des points réflexes pour rééquilibrer l'énergie des organes internes.", tag: "Ciblé" },
  { id: "05", name: "Sportif", intensity: 5, image: sportifImg, desc: "Conçu pour les sportifs ou personnes actives, aide à dénouer les blocages et optimiser la récupération.", tag: "Performance" },
  { id: "06", name: "Thérapeutique", intensity: 4, image: theraImg, desc: "Massage ciblé (technique suédoise) pour soulager les tensions musculaires, améliorer la mobilité et apaiser le système nerveux.", tag: "Signature" },
  { id: "07", name: "Deep Relax", intensity: 2, image: relaxImg, desc: "Technique lente et profonde pour une détente totale du corps, favorisant le lâcher-prise mental et nerveux.", tag: "Détente" },
  { id: "08", name: "Thaï", intensity: 4, image: thaiImg, desc: "Technique dynamique combinant pressions profondes et étirements fluides pour relancer l'énergie vitale.", tag: "Dynamique" }
];

const AFTERCARE_TIPS = [
  { 
    id: "01",
    title: "Hydratation", 
    desc: "L'eau alcaline aide votre système lymphatique à drainer les toxines libérées.",
    advice: "Évitez l'alcool pendant 24h.",
    icon: Droplets
  },
  { 
    id: "02",
    title: "Repos", 
    desc: "Accordez-vous un temps de calme pour permettre à votre corps d'ancrer les bienfaits.",
    advice: "Calme absolu, sans écrans.",
    icon: Moon
  },
  { 
    id: "03",
    title: "Écoute", 
    desc: "Vos fascias retrouvent leur liberté. Soyez à l'écoute de vos sensations.",
    advice: "Douche tiède apaisante.",
    icon: Sparkles
  }
];

const OverTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span className={`text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-600 block mb-6 text-center lg:text-left ${className}`}>
    {children}
  </span>
);

const SectionTitle = ({ main, italic, className = "" }: { main: string, italic: string, className?: string }) => (
  <h2 className={`text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-neutral-900 leading-[1.1] md:leading-[1] tracking-tight text-center lg:text-left ${className}`}>
    {main} <br className="hidden lg:block"/> <span className="text-neutral-500 italic font-light">{italic}</span>
  </h2>
);

const SectionDesc = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-neutral-800 text-base md:text-lg font-sans font-medium leading-relaxed italic text-center lg:text-left ${className}`}>
    {children}
  </p>
);

const ServiceCard = ({ s, staggered }: { s: any, staggered: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`group w-full max-w-[340px] aspect-[4/5] md:aspect-[3/4] bg-white rounded-[2.5rem] flex flex-col overflow-hidden relative border border-neutral-100/50 transition-all duration-700 mx-auto lg:mx-0 ${staggered ? 'lg:mt-8 xl:mt-12' : ''}`}
  >
    <div className="relative h-[65%] w-full overflow-hidden bg-neutral-100">
      <Image 
        src={s.image} 
        fill
        className="object-cover transition-all duration-700 ease-out [filter:contrast(0.95)_saturate(0.92)_brightness(1.05)]" 
        alt={s.name}
      />
      <div className="absolute top-6 left-6 z-10">
         <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-white bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full">{s.tag}</span>
      </div>
    </div>
    
    <div className="flex-1 p-8 flex flex-col justify-between bg-white z-20">
      <div className="space-y-3">
        <h3 className="text-lg font-serif font-medium tracking-[0.05em] text-neutral-900 leading-none uppercase">{s.name.split(' - ')[0]}</h3>
        <p className="text-neutral-600 text-[11px] font-sans font-medium leading-relaxed line-clamp-3">{s.desc}</p>
      </div>
      <div className="pt-4 flex items-center justify-between border-t border-neutral-50">
        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-1 w-4 rounded-full transition-colors duration-500 ${i < s.intensity ? 'bg-neutral-900/70' : 'bg-neutral-100'}`} />
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

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
      <section className="min-h-[85vh] flex flex-col justify-center px-6 md:px-12 lg:px-8 pt-32 pb-24 bg-white relative border-b border-neutral-50 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* PORTRAIT À GAUCHE */}
          <div className="w-full lg:w-[45%] flex justify-center lg:justify-start">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] overflow-hidden rounded-[8rem_3rem_10rem_4rem] shadow-2xl w-full max-w-[380px]"
            >
              <Image 
                src={MY_PHOTO} 
                fill
                unoptimized
                className="object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                alt="Portrait de João P."
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </motion.div>
          </div>

          {/* TEXTE À DROITE */}
          <div className="w-full lg:w-[55%] space-y-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-center lg:items-start">
              <OverTitle>L'Engagement João.</OverTitle>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium text-neutral-900 leading-[1] md:leading-[1.1] tracking-tight text-center lg:text-left">
                L'équilibre<br />
                <span className="text-neutral-500 italic font-light">par le toucher.</span>
              </h1>
            </motion.div>
            
            <div className="space-y-8 max-w-xl mx-auto lg:mx-0">
              <SectionDesc className="text-neutral-800">
                "Une approche personnalisée pour restaurer votre harmonie physique et mentale."
              </SectionDesc>
              <div className="space-y-6">
                <p className="text-neutral-600 text-lg font-sans font-medium leading-relaxed text-center lg:text-left">
                  Passionné par le bien-être global, mon travail consiste à offrir des services de massothérapie dédiés à l'amélioration de votre qualité de vie au quotidien.
                </p>
                <div className="pl-6 border-l-2 border-neutral-900/10 py-2 text-center lg:text-left">
                   <p className="text-neutral-800 italic text-xl leading-snug font-sans">« Le luxe ultime réside dans la reconnexion à soi, loin du tumulte urbain. »</p>
                   <span className="font-cursive text-3xl text-neutral-300 block mt-2">— João P.</span>
                </div>
              </div>
              <div className="flex justify-center lg:justify-start pt-4">
                <button className="inline-flex items-center gap-4 group">
                  <div className="w-9 h-9 rounded-sm bg-neutral-900 text-white flex items-center justify-center transition-all duration-500 shadow-lg group-hover:bg-neutral-800">
                    <ArrowRight size={14} />
                  </div>
                  <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-900">Découvrir les rituels</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION SERVICES */}
      <section id="services" className="py-24 px-6 md:px-12 lg:px-8 bg-[#FAF9F6] border-y border-neutral-100/50 rounded-[5rem] lg:mx-6 overflow-visible">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-24 items-start">
            
            {/* TEXTE À GAUCHE (STICKY) */}
            <div className="w-full lg:w-[28%] lg:sticky lg:top-32 h-fit flex flex-col items-center lg:items-start">
              <OverTitle>Menu Signature</OverTitle>
              <SectionTitle main="Soins" italic="Exclusifs." className="mb-6" />
              <div className="h-[2px] w-12 bg-neutral-900 mb-8 mx-auto lg:mx-0" />
              <SectionDesc className="text-neutral-800 mb-12">
                Une sélection exclusive de 8 rituels conçue pour votre équilibre interne et votre récupération physique.
              </SectionDesc>
              <button className="w-full md:w-auto inline-flex items-center justify-center px-10 py-4 bg-black text-white text-[10px] font-sans font-bold uppercase tracking-[0.3em] rounded-sm hover:opacity-80 transition-all">
                Réserver un soin
              </button>
            </div>

            {/* GRILLE À DROITE */}
            <div className="w-full lg:w-[72%] grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              {SERVICES.map((s, i) => (
                <ServiceCard key={s.id} s={s} staggered={i % 2 !== 0} />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* RITUEL POST-SOIN - STYLE ÉDITORIAL LIGNES */}
      <section className="pt-24 pb-16 px-6 md:px-12 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-8 mb-24 text-center md:text-right">
            <div className="hidden md:block h-[1px] flex-1 bg-neutral-100 mb-8 mr-12" />
            <div>
              <OverTitle className="mb-2">Rituel Post-Séance</OverTitle>
              <SectionTitle main="Prolonger" italic="l'état de grâce." />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-0 border-t border-neutral-100">
            {AFTERCARE_TIPS.map((tip) => (
              <div key={tip.id} className="group py-16 px-0 border-b border-neutral-100 flex flex-col md:flex-row items-start md:items-center gap-12 transition-all duration-700 hover:bg-neutral-50/30">
                <div className="flex items-center gap-12 min-w-[120px]">
                  <span className="text-sm font-sans font-black text-neutral-200 uppercase tracking-widest">{tip.id}</span>
                  <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white transition-all duration-700">
                    <tip.icon size={18} strokeWidth={1.5} />
                  </div>
                </div>
                
                <div className="flex-1 space-y-6">
                  <h4 className="text-xs font-sans font-black uppercase tracking-[0.3em] text-neutral-900 leading-none">
                    {tip.title}
                  </h4>
                  <div className="space-y-4">
                    <p className="text-neutral-900 text-2xl font-serif font-medium leading-tight">
                      {tip.advice}
                    </p>
                    <p className="text-neutral-500 text-base font-sans font-medium leading-relaxed max-w-2xl">
                      {tip.desc}
                    </p>
                  </div>
                </div>
                
                <div className="hidden md:block">
                  <ArrowRight size={24} className="text-neutral-100 group-hover:text-neutral-900 group-hover:translate-x-4 transition-all duration-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a0a0a] text-white py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16 md:gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="font-sans font-bold text-base tracking-[0.3em] uppercase transition-all">SERENITY RELAX</div>
            <p className="text-xs font-sans font-medium tracking-[0.3em] text-neutral-500 uppercase mt-3">Excellence Thérapeutique</p>
          </div>

          <div className="flex flex-col md:flex-row gap-12 md:gap-16 text-sm font-sans font-medium text-neutral-400">
            <p className="tracking-widest uppercase"><span className="text-neutral-600 font-black mr-3">Localisation</span> Alpha Business Center • Genève</p>
            <p className="tracking-widest uppercase"><span className="text-neutral-600 font-black mr-3">Contact</span> +41 78 333 68 23</p>
          </div>

          <div className="flex items-center gap-10 justify-center">
            <Instagram size={20} className="hover:text-white transition-colors cursor-pointer text-neutral-600" />
            <a href="https://wa.me/41783336823" target="_blank" rel="noopener noreferrer">
              <MessageCircle size={20} className="hover:text-white transition-colors cursor-pointer text-neutral-600" />
            </a>
            <Linkedin size={20} className="hover:text-white transition-colors cursor-pointer text-neutral-600" />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex justify-center">
          <p className="text-xs font-sans font-bold text-neutral-800 uppercase tracking-[0.5em] text-center">
            © 2025 Serenity & Relax Therapy — Genève
          </p>
        </div>
      </footer>
    </div>
  );
}
