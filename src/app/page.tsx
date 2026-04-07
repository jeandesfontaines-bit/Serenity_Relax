
'use client';

import React, { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { 
  Brain, Zap, Activity, ShieldCheck, Calendar
} from "lucide-react";
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { SERVICES } from '@/lib/types';
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BookingFlow } from "@/components/booking/booking-flow";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

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

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [isMounted, setIsMounted] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const openBooking = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setBookingOpen(true);
  };

  if (!isMounted) return null;

  return (
    <div className="bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white antialiased relative">
      <Navbar onBookingClick={() => openBooking()} />
      
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-neutral-900 z-[120] origin-left" style={{ scaleX }} />

      {/* SECTION HÉROS */}
      <section className="min-h-[85vh] flex flex-col justify-center px-6 md:px-12 pt-32 pb-24 relative border-b border-neutral-50 overflow-hidden bg-[#F9F8F6]">
        <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
          
          {/* TEXTE À GAUCHE */}
          <div className="w-full lg:w-1/2 space-y-12 text-center lg:text-left order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-center lg:items-start">
              <span className="text-[0.7rem] font-sans font-black uppercase tracking-[0.28em] text-neutral-400 block mb-6 md:text-[0.75rem] lg:text-[0.8rem]">L'Engagement João.</span>
              <h1 className="text-[2.4rem] leading-[0.95] md:text-[3.3rem] lg:text-[4.2rem] font-serif font-medium text-neutral-900 tracking-tighter">
                L'Art du<br />
                <span className="text-neutral-500 italic font-light">Lâcher-Prise.</span>
              </h1>
            </motion.div>
            
            <div className="space-y-10 max-w-xl mx-auto lg:mx-0">
              <div className="pl-8 border-l border-neutral-900/10 py-2">
                 <p className="text-[1rem] font-sans font-light leading-relaxed text-neutral-800 md:text-[1.08rem] lg:text-[1.15rem] mb-4">
                   « Je ne pratique pas seulement le massage ; je sculpte un espace de décompression. Mon approche fusionne la rigueur anatomique et l'intuition sensorielle pour répondre aux maux de la vie moderne. Le luxe ultime réside dans la reconnexion à soi, loin du tumulte urbain. »
                 </p>
                 <span className="font-cursive text-[1.5rem] text-neutral-900 block mt-4 md:text-[1.75rem] lg:text-[2rem]">— João P.</span>
              </div>
              <div className="flex justify-center lg:justify-start pt-4">
                <button onClick={() => openBooking()} className="inline-flex items-center justify-center px-4 py-1.5 border border-neutral-900 rounded-full text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-black uppercase tracking-[0.18em] transition-all duration-500 hover:bg-neutral-900 hover:text-white">
                  Réserver un soin
                </button>
              </div>
            </div>
          </div>

          {/* IMAGE À DROITE */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-center order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] overflow-hidden shadow-2xl w-full max-w-[240px] md:max-w-[260px]"
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
              <span className="text-[0.7rem] font-sans font-black uppercase tracking-[0.28em] text-neutral-400 block mb-6 md:text-[0.75rem] lg:text-[0.8rem]">Impact Biologique</span>
              <h2 className="text-[1.9rem] leading-tight md:text-[2.3rem] lg:text-[2.8rem] font-serif font-medium text-neutral-900 tracking-tighter mb-8">
                L'Écho <span className="text-neutral-500 italic font-light">du Corps.</span>
              </h2>
              <p className="text-[1rem] font-sans font-light leading-relaxed text-neutral-600 md:text-[1.08rem] lg:text-[1.15rem]">
                Au-delà de la détente, une influence mesurable sur votre santé globale et votre vitalité. Chaque séance est un protocole unique, adapté à votre physiologie et à votre état émotionnel du moment.
              </p>
            </header>

            <div className="w-full lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              {BIOLOGICAL_IMPACTS.map((impact) => (
                <div key={impact.id} className="space-y-6">
                  <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-900">
                    <impact.icon size={24} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-[1.1rem] leading-snug md:text-[1.2rem] lg:text-[1.25rem] font-serif font-medium text-neutral-900 tracking-tight">{impact.title}</h4>
                  <p className="text-[0.8125rem] leading-relaxed md:text-[0.875rem] lg:text-[0.9375rem] text-neutral-500 font-sans font-medium">
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
              <span className="text-[0.7rem] font-sans font-black uppercase tracking-[0.28em] text-neutral-400 block mb-6 md:text-[0.75rem] lg:text-[0.8rem]">Menu Signature</span>
              <h2 className="text-[1.9rem] leading-tight md:text-[2.3rem] lg:text-[2.8rem] font-serif font-medium text-neutral-900 tracking-tighter mb-8">
                Soins <br className="hidden lg:block"/> <span className="text-neutral-500 italic font-light">exclusifs.</span>
              </h2>
              <p className="text-[1rem] font-sans font-light leading-relaxed italic text-neutral-600 md:text-[1.08rem] lg:text-[1.15rem] mb-12 max-w-sm">
                Une sélection exclusive de 8 rituels conçue pour votre équilibre interne et votre récupération physique.
              </p>
              <button onClick={() => openBooking()} className="inline-flex items-center justify-center px-4 py-1.5 bg-neutral-900 text-white border border-neutral-900 rounded-full text-[0.65rem] md:text-[0.7rem] lg:text-[0.75rem] font-black uppercase tracking-[0.18em] transition-all duration-500 hover:bg-neutral-800">
                Réserver un soin
              </button>
            </div>

            <div className="w-full lg:w-[68%] grid grid-cols-1 md:grid-cols-2 gap-x-12">
               <div className="flex flex-col gap-12 items-center md:items-end">
                  {SERVICES.slice(0, 4).map((s) => (
                    <ServiceCard key={s.id} s={s} onClick={() => openBooking(s.id)} />
                  ))}
               </div>
               <div className="flex flex-col gap-12 md:pt-32 items-center md:items-start">
                  {SERVICES.slice(4, 8).map((s) => (
                    <ServiceCard key={s.id} s={s} onClick={() => openBooking(s.id)} />
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
              <span className="text-[0.7rem] font-sans font-black uppercase tracking-[0.28em] text-neutral-400 block mb-8 md:text-[0.75rem] lg:text-[0.8rem]">Assistance</span>
              <h2 className="text-[1.9rem] leading-tight md:text-[2.3rem] lg:text-[2.8rem] font-serif font-medium text-neutral-900 tracking-tighter mb-8">
                Questions <br /> <span className="text-neutral-500 italic font-light">fréquentes.</span>
              </h2>
              <p className="text-[1rem] font-sans font-light leading-relaxed italic text-neutral-600 md:text-[1.08rem] lg:text-[1.15rem] mb-12 max-w-xs">
                Tout ce qu'il faut savoir pour préparer votre visite dans notre sanctuaire de Cointrin.
              </p>
            </div>

            <div className="w-full lg:w-[68%] space-y-20">
              {FAQS.map((f, i) => (
                <div key={i} className="group transition-all duration-500 border-b border-neutral-100 pb-16 last:border-0">
                  <div className="flex gap-12 items-start">
                    <span className="text-[0.7rem] font-sans font-black text-neutral-200 uppercase tracking-widest mt-2">0{i+1}</span>
                    <div className="space-y-6">
                      <h4 className="text-[1.1rem] leading-snug md:text-[1.2rem] lg:text-[1.25rem] font-serif font-medium text-neutral-900 tracking-tight">{f.q}</h4>
                      <p className="text-[0.8125rem] leading-relaxed text-neutral-500 font-sans font-medium border-l-2 border-neutral-50 pl-8 max-w-xl md:text-[0.875rem] lg:text-[0.9375rem]">
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
      <footer className="bg-neutral-900 text-white pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-12">
            <h2 className="text-[1.1rem] font-sans font-bold tracking-[0.4em] mb-4 text-white md:text-[1.2rem] lg:text-[1.25rem]">Serenity Relax Therapy</h2>
            <p className="text-[0.7rem] font-sans font-medium italic tracking-[0.4em] text-white/50 uppercase md:text-[0.75rem] lg:text-[0.8rem]">EXCELLENCE THÉRAPEUTIQUE</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 w-full text-center">
            <div className="space-y-6">
              <h3 className="text-[0.7rem] font-sans font-black text-white/30 uppercase tracking-[0.3em] md:text-[0.75rem] lg:text-[0.8rem]">LOCALISATION</h3>
              <div className="text-[0.8125rem] leading-relaxed font-sans text-white/40 space-y-2 md:text-[0.875rem] lg:text-[0.9375rem]">
                <p>Alfa Business Center</p>
                <p>Chemin de Joinville 26, 4ème étage</p>
                <p>1216 Cointrin - Genève</p>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-[0.7rem] font-sans font-black text-white/30 uppercase tracking-[0.3em] md:text-[0.75rem] lg:text-[0.8rem]">CONTACT</h3>
              <div className="text-[0.8125rem] leading-relaxed font-sans text-white/40 space-y-2 md:text-[0.875rem] lg:text-[0.9375rem]">
                <p>+41 78 333 68 23</p>
                <p>serenityrelaxtherapy@gmail.com</p>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-[0.7rem] font-sans font-black text-white/30 uppercase tracking-[0.3em] md:text-[0.75rem] lg:text-[0.8rem]">SOCIAL</h3>
              <div className="flex items-center justify-center gap-8">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">Instagram</span>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">Linkedin</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* SYSTEME DE RESERVATION (DRAWER) */}
      <Sheet open={bookingOpen} onOpenChange={setBookingOpen}>
        <SheetContent side="bottom" className="h-[80vh] w-[90%] max-w-[1500px] mx-auto rounded-t-[2.5rem] p-0 border-none bg-white overflow-y-auto scrollbar-hide shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
          <VisuallyHidden.Root>
            <SheetTitle>Réserver votre rituel Serenity Relax</SheetTitle>
          </VisuallyHidden.Root>
          <BookingFlow services={SERVICES} initialServiceId={selectedServiceId} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

const ServiceCard = ({ s, onClick }: { s: any, onClick: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    onClick={onClick}
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
      <span className="text-[0.7rem] font-sans font-black uppercase tracking-[0.28em] text-neutral-400 block mb-1 md:text-[0.75rem] lg:text-[0.8rem]">
        {s.name.includes('Bambous') ? 'Profond' : s.name.includes('Draineur') ? 'Vitalité' : s.name.includes('Aroma') ? 'Sensoriel' : s.name.includes('Réflexologie') ? 'Ciblé' : s.name.includes('Sportif') ? 'Performance' : s.name.includes('Thérapeutique') ? 'Signature' : s.name.includes('Deep Relax') ? 'Détente' : 'Dynamique'}
      </span>
      <h3 className="text-[1.1rem] leading-snug font-serif font-medium text-neutral-900 tracking-tight md:text-[1.2rem] lg:text-[1.25rem]">
        {s.name.split(' - ')[0]}
      </h3>
      <p className="text-[0.8125rem] leading-relaxed text-neutral-500 font-sans font-medium md:text-[0.875rem] lg:text-[0.9375rem]">
        {s.description}
      </p>
    </div>
  </motion.div>
);
