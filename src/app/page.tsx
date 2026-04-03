
'use client';

import React, { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { 
  Instagram, Linkedin, Brain, Zap, Activity, ShieldCheck
} from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { SERVICES } from '@/lib/types';

const MY_PHOTO = "https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg";

const FAQS = [
  { q: "Les soins sont-ils remboursés ?", a: "Oui, je suis agréé ASCA & RME. Veuillez vérifier auprès de votre assurance complémentaire pour connaître vos modalités de remboursement." },
  { q: "Où se situe le cabinet ?", a: "Le cabinet se trouve à Cointrin, au Alfa Business Center, Chemin de Joinville 26. Il est situé au 4ème étage avec ascenseur." },
  { q: "Proposez-vous des massages à domicile ?", a: "Oui, je propose des séances à domicile sur demande et selon mes disponibilités dans la région genevoise. Un supplément peut s'appliquer." },
  { q: "Quelle est votre politique d'annulation ?", a: "Toute annulation ou modification de rendez-vous doit être effectuée au moins 24 heures à l'avance. En cas de délai non respecté, la séance pourra être facturée." }
];

const BIOLOGICAL_IMPACTS = [
  { 
    id: "brain", 
    title: "Neuro-Apaisement", 
    desc: "Régulation immédiate du cortisol et stimulation de l'ocytocine pour un état de calme mental profond.", 
    icon: Brain 
  },
  { 
    id: "myofascial", 
    title: "Relâchement Myofascial", 
    desc: "Dissolution des noeuds musculaires et amélioration de l'élasticité des tissus pour une liberté de mouvement retrouvée.", 
    icon: Zap 
  },
  { 
    id: "flow", 
    title: "Flux & Oxygène", 
    desc: "Optimisation de la microcirculation sanguine facilitant l'apport nutritif aux cellules et le drainage des toxines.", 
    icon: Activity 
  },
  { 
    id: "regen", 
    title: "Régénération", 
    desc: "Soutien du système immunitaire and induction d'un sommeil réparateur, clé de la reconstruction organique.", 
    icon: ShieldCheck 
  }
];

const ServiceCard = ({ s }: { s: any }) => (
  <Link href={`/booking?serviceId=${s.id}`}>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative w-full max-w-[320px] bg-white rounded-[3rem] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.03)] group cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden mb-6 rounded-[2rem]">
        <Image 
          src={s.image} 
          fill
          unoptimized
          className="object-cover transition-transform duration-1000 group-hover:scale-110" 
          alt={s.name}
        />
      </div>

      <div className="px-2 pb-20 space-y-3">
        <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 block mb-1">
          {s.name.includes('Bambous') ? 'Profond' : s.name.includes('Draineur') ? 'Vitalité' : s.name.includes('Aroma') ? 'Sensoriel' : s.name.includes('Réflexologie') ? 'Ciblé' : s.name.includes('Sportif') ? 'Performance' : s.name.includes('Thérapeutique') ? 'Signature' : s.name.includes('Deep Relax') ? 'Détente' : 'Dynamique'}
        </span>
        <h3 className="text-2xl font-serif font-medium text-neutral-900 tracking-tight leading-tight">
          {s.name.split(' - ')[0]}
        </h3>
        <p className="text-[14px] text-neutral-500 font-sans font-medium leading-relaxed">
          {s.description}
        </p>
      </div>
    </motion.div>
  </Link>
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
      <section className="min-h-[90vh] flex flex-col justify-center px-6 md:px-12 lg:px-8 pt-32 pb-24 bg-white relative border-b border-neutral-50 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* TEXTE À GAUCHE */}
          <div className="w-full lg:w-[55%] space-y-12 text-center lg:text-left order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-center lg:items-start">
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 block mb-6">L'Engagement João.</span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-neutral-900 leading-[0.95] tracking-tighter">
                L'Art du<br />
                <span className="text-neutral-500 italic font-light text-6xl md:text-8xl">Lâcher-Prise Absolu.</span>
              </h1>
            </motion.div>
            
            <div className="space-y-10 max-w-xl mx-auto lg:mx-0">
              <p className="text-neutral-800 text-base md:text-lg font-sans font-medium leading-relaxed italic">
                Découvrez une parenthèse de sérénité au cœur de Genève. Des soins sur-mesure conçus pour restaurer l'équilibre entre votre corps et votre esprit.
              </p>
              <div className="pl-8 border-l-2 border-neutral-900/10 py-2 hidden lg:block">
                 <p className="text-neutral-800 text-xl leading-relaxed font-sans mb-4">
                   Je ne pratique pas seulement le massage ; je sculpte un espace de décompression. Mon approche fusionne la rigueur anatomique et l'intuition sensorielle pour répondre aux maux de la vie moderne.
                 </p>
                 <p className="text-neutral-800 italic text-2xl leading-snug font-sans">« Le luxe ultime réside dans la reconnexion à soi, loin du tumulte urbain. »</p>
                 <span className="font-cursive text-4xl text-neutral-900 block mt-4">— João P.</span>
              </div>
              <div className="flex justify-center lg:justify-start pt-6">
                <Link href="/booking" className="high-end-button">
                  Réserver un soin
                </Link>
              </div>
            </div>
          </div>

          {/* IMAGE À DROITE */}
          <div className="w-full lg:w-[45%] flex justify-center lg:justify-end order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] overflow-hidden shadow-2xl w-full max-w-[420px]"
              style={{ borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%' }}
            >
              <Image 
                src={MY_PHOTO} 
                fill
                unoptimized
                className="object-cover transition-all duration-1000"
                alt="Portrait de João P."
                priority
              />
            </motion.div>
          </div>

        </div>
      </section>

      {/* SECTION IMPACT BIOLOGIQUE */}
      <section className="py-32 px-6 md:px-12 lg:px-8 bg-white border-b border-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row-reverse gap-24 items-start">
            <header className="w-full lg:w-[40%] lg:sticky lg:top-32 h-fit flex flex-col items-center lg:items-end text-center lg:text-right">
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 block mb-6">Impact Biologique</span>
              <h2 className="text-4xl md:text-6xl font-serif font-medium text-neutral-900 leading-[1] tracking-tighter mb-8">
                L'Écho <span className="text-neutral-500 italic font-light">du Corps.</span>
              </h2>
              <p className="text-neutral-600 text-lg font-sans font-medium leading-relaxed italic">
                Au-delà de la détente, une influence mesurable sur votre santé globale et votre vitalité. Chaque séance est un protocole unique, adapté à votre physiologie et à votre état émotionnel du moment.
              </p>
            </header>

            <div className="w-full lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              {BIOLOGICAL_IMPACTS.map((impact) => (
                <div key={impact.id} className="space-y-6">
                  <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-900">
                    <impact.icon size={24} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-xl font-serif font-bold text-neutral-900">{impact.title}</h4>
                  <p className="text-sm text-neutral-500 font-sans font-medium leading-relaxed">
                    {impact.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION SERVICES */}
      <section id="services" className="py-32 px-6 md:px-12 lg:px-8 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-20 items-start">
            <div className="w-full lg:w-[32%] lg:sticky lg:top-32 h-fit flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 block mb-6">Menu Signature</span>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-medium text-neutral-900 leading-[1] tracking-tighter mb-8">
                Soins <br className="hidden lg:block"/> <span className="text-neutral-500 italic font-light">exclusifs.</span>
              </h2>
              <p className="text-neutral-600 text-base font-sans font-medium leading-relaxed italic mb-12 max-w-sm">
                Une sélection exclusive de 8 rituels conçue pour votre équilibre interne et votre récupération physique.
              </p>
              <Link href="/booking" className="high-end-button">
                Réserver un soin
              </Link>
            </div>

            <div className="w-full lg:w-[68%] grid grid-cols-1 md:grid-cols-2 gap-x-12">
               <div className="flex flex-col gap-12 items-center md:items-end">
                  {SERVICES.slice(0, 4).map((s) => (
                    <ServiceCard key={s.id} s={s} />
                  ))}
               </div>
               <div className="flex flex-col gap-12 md:pt-32 items-center md:items-start">
                  {SERVICES.slice(4, 8).map((s) => (
                    <ServiceCard key={s.id} s={s} />
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION FAQ */}
      <section className="py-48 px-6 md:px-12 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row-reverse gap-24 items-start">
            <div className="w-full lg:w-[32%] lg:sticky lg:top-32 h-fit flex flex-col items-center lg:items-end text-center lg:text-right">
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 block mb-8">Assistance</span>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-medium text-neutral-900 leading-[1] tracking-tighter mb-8">
                Questions <br /> <span className="text-neutral-500 italic font-light">fréquentes.</span>
              </h2>
              <p className="text-neutral-600 text-base font-sans font-medium leading-relaxed italic mb-12 max-w-xs">
                Tout ce qu'il faut savoir pour préparer votre visite dans notre sanctuaire de Cointrin.
              </p>
            </div>

            <div className="w-full lg:w-[68%] space-y-20">
              {FAQS.map((f, i) => (
                <div key={i} className="group transition-all duration-500 border-b border-neutral-100 pb-16 last:border-0">
                  <div className="flex gap-12 items-start">
                    <span className="text-[11px] font-sans font-black text-neutral-200 uppercase tracking-widest mt-2">0{i+1}</span>
                    <div className="space-y-6">
                      <h4 className="text-2xl font-serif font-medium text-neutral-900 tracking-tight leading-tight">{f.q}</h4>
                      <p className="text-[14px] text-neutral-500 font-sans font-medium leading-relaxed border-l-2 border-neutral-50 pl-8 max-w-xl">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-neutral-900 text-white pt-16 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-sans font-bold tracking-[0.4em] uppercase mb-4 text-white">SERENITY RELAX</h2>
            <p className="text-[10px] font-sans font-medium italic tracking-[0.4em] text-white/50 uppercase">EXCELLENCE THÉRAPEUTIQUE</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 w-full text-center">
            <div className="space-y-6">
              <h3 className="text-[10px] font-sans font-black text-white/30 uppercase tracking-[0.3em]">LOCALISATION</h3>
              <div className="text-sm font-sans text-white/40 space-y-2">
                <p>Alfa Business Center</p>
                <p>Chemin de Joinville 26, 4ème étage</p>
                <p>1216 Cointrin - Genève</p>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-[10px] font-sans font-black text-white/30 uppercase tracking-[0.3em]">CONTACT</h3>
              <div className="text-sm font-sans text-white/40 space-y-2">
                <p>+41 78 333 68 23</p>
                <p>serenityrelaxtherapy@gmail.com</p>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-[10px] font-sans font-black text-white/30 uppercase tracking-[0.3em]">SOCIAL</h3>
              <div className="flex items-center justify-center gap-8">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram size={20} className="text-white/30 hover:text-white transition-colors cursor-pointer" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <Linkedin size={20} className="text-white/30 hover:text-white transition-colors cursor-pointer" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
