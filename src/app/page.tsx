'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { 
  Instagram, Linkedin, ArrowRight, MessageCircle, Clock, Plus, Minus
} from "lucide-react";
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';

const MY_PHOTO = "https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg";

const SERVICES = [
  { id: "01", name: "Massage aux Bambous", duration: "60 min", image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb.d0f88929.png&w=3840&q=75", tag: "Profond", desc: "Technique utilisant des bâtons de bambou pour travailler les tissus en profondeur et libérer les tensions." },
  { id: "02", name: "Draineur Lymphatique", duration: "60 min", image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(1).cc6cf032.png&w=3840&q=75", tag: "Vitalité", desc: "Technique de pompage douce pour revitaliser, détoxifier l'organisme et relancer la circulation." },
  { id: "03", name: "Massage Aromathérapie", duration: "60 min", image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(2).8265cf32.png&w=3840&q=75", tag: "Sensoriel", desc: "Massage intégrant des huiles essentielles personnalisées pour une harmonie parfaite du corps et de l'esprit." },
  { id: "04", name: "Réflexologie Plantaire", duration: "30 min", image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(3).7bebd53b.png&w=3840&q=75", tag: "Ciblé", desc: "Technique ciblée basée sur la stimulation des points réflexes pour rééquilibrer l'énergie des organes internes." },
  { id: "05", name: "Massage Sportif", duration: "60 min", image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(4).d7de7c4e.png&w=3840&q=75", tag: "Performance", desc: "Conçu pour les sportifs ou personnes actives, aide à dénouer les blocages et optimiser la récupération." },
  { id: "06", name: "Massage Thérapeutique", duration: "60 min", image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(5).95f12a12.png&w=3840&q=75", tag: "Signature", desc: "Massage ciblé pour soulager les tensions musculaires, améliorer la mobilité et apaiser le système nerveux." },
  { id: "07", name: "Massage Deep Tissue", duration: "60 min", image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(6).40bca099.png&w=3840&q=75", tag: "Détente", desc: "Technique lente et profonde pour une détente totale du corps, favorisant le lâcher-prise mental et nerveux." },
  { id: "08", name: "Massage Thaï", duration: "60 min", image: "https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(7).681b63b0.png&w=3840&q=75", tag: "Dynamique", desc: "Technique dynamique combinant pressions profondes et étirements fluides pour relancer l'énergie vitale." }
];

const FAQS = [
  { q: "Les soins sont-ils remboursés ?", a: "Oui, je suis agréé ASCA & RME. Veuillez vérifier auprès de votre assurance complémentaire pour connaître vos modalités de remboursement." },
  { q: "Où se situe le cabinet ?", a: "Le cabinet se trouve à Cointrin, au Alfa Business Center, Chemin de Joinville 26. Il est situé au 4ème étage avec ascenseur." },
  { q: "Proposez-vous des massages à domicile ?", a: "Oui, je propose des séances à domicile sur demande et selon mes disponibilités dans la région genevoise. Un supplément peut s'appliquer." },
  { q: "Quelle est votre politique d'annulation ?", a: "Toute annulation ou modification de rendez-vous doit être effectuée au moins 24 heures à l'avance. En cas de délai non respecté, la séance pourra être facturée." }
];

const ServiceCard = ({ s }: { s: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative w-full max-w-[250px] rounded-[2.5rem] bg-white overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.03)] transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl"
  >
    <div className="relative aspect-square overflow-hidden m-4 rounded-[2rem]">
      <Image 
        src={s.image} 
        fill
        unoptimized
        className="object-cover transition-transform duration-1000 group-hover:scale-110" 
        alt={s.name}
      />
    </div>

    <div className="px-6 pb-8 pt-2 space-y-4">
      <div>
        <span className="text-[8px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 block mb-2">{s.tag}</span>
        <h3 className="text-2xl font-serif font-medium text-neutral-900 tracking-tight leading-tight">
          {s.name}
        </h3>
      </div>

      <p className="text-[12px] text-neutral-500 font-sans font-medium leading-relaxed line-clamp-2">
        {s.desc}
      </p>

      <div className="flex justify-between items-center pt-4 border-t border-neutral-50">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-neutral-300" />
          <span className="text-[9px] font-sans font-black uppercase tracking-widest text-neutral-300">
            {s.duration}
          </span>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-110">
          <Plus size={14} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  </motion.div>
);

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [isMounted, setIsMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            </motion.div>
          </div>

          <div className="w-full lg:w-[55%] space-y-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 block mb-6">L'Engagement João.</span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-neutral-900 leading-[0.95] tracking-tighter">
                L'équilibre<br />
                <span className="text-neutral-500 italic font-light">par le toucher.</span>
              </h1>
            </motion.div>
            
            <div className="space-y-10 max-w-xl mx-auto lg:mx-0">
              <p className="text-neutral-800 text-base md:text-lg font-sans font-medium leading-relaxed italic text-center lg:text-left">
                "Une approche personnalisée pour restaurer votre harmonie physique et mentale."
              </p>
              <div className="pl-8 border-l-2 border-neutral-900/10 py-2 hidden lg:block">
                 <p className="text-neutral-800 italic text-2xl leading-snug font-sans">« Le luxe ultime réside dans la reconnexion à soi. »</p>
                 <span className="font-cursive text-4xl text-neutral-300 block mt-4">— João P.</span>
              </div>
              <div className="flex justify-center lg:justify-start pt-6">
                <Link href="/booking" className="inline-flex items-center gap-3 group">
                  <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-900">Réserver un soin</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION SERVICES */}
      <section id="services" className="py-32 px-6 md:px-12 lg:px-8 bg-[#FAF9F6] border-y border-neutral-100/50 rounded-[5rem] lg:mx-6">
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
              <Link href="/booking" className="inline-flex items-center gap-3 group">
                <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-900">Réserver un soin</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="w-full lg:w-[68%] grid grid-cols-1 md:grid-cols-2 gap-x-12">
               {/* Colonne 1 (Gauche) */}
               <div className="flex flex-col gap-12 items-center md:items-end">
                  {SERVICES.filter((_, i) => i % 2 === 0).map((s) => (
                    <ServiceCard key={s.id} s={s} />
                  ))}
               </div>
               {/* Colonne 2 (Droite - Décalée) */}
               <div className="flex flex-col gap-12 md:pt-32 items-center md:items-start">
                  {SERVICES.filter((_, i) => i % 2 !== 0).map((s) => (
                    <ServiceCard key={s.id} s={s} />
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION FAQ */}
      <section className="py-32 px-6 md:px-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-neutral-400 block mb-4">Questions fréquentes</span>
            <h3 className="text-4xl md:text-5xl font-serif font-bold tracking-tighter text-neutral-900 uppercase">FAQ.</h3>
          </div>
          
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-[#FDFCFB] rounded-[2rem] border border-neutral-100 overflow-hidden hover:border-neutral-200 transition-all">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-8 flex items-center justify-between text-left group"
                >
                  <span className="font-serif font-bold text-lg md:text-xl tracking-tight text-neutral-900">{f.q}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${openFaq === i ? 'bg-neutral-900 text-white rotate-180' : 'bg-white shadow-sm'}`}>
                    {openFaq === i ? <Minus size={18} /> : <Plus size={18} />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <div className="px-8 pb-8 text-neutral-500 font-sans font-light leading-relaxed border-t border-neutral-50 pt-6 italic">
                        {f.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
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
              <div className="text-sm font-sans text-neutral-400 space-y-3">
                <p>Alfa Business Center</p>
                <p>Chemin de Joinville 26, 4ème étage</p>
                <p>1216 Cointrin - Genève</p>
              </div>
            </div>
            <div className="space-y-8">
              <h3 className="text-[10px] font-sans font-black text-neutral-600 uppercase tracking-[0.3em]">CONTACT</h3>
              <div className="text-sm font-sans text-neutral-400 space-y-3">
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
        </div>
      </footer>
    </div>
  );
}
