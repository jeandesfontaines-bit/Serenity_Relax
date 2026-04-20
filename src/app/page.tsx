
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
import { simplifyServiceName } from "@/lib/utils";

const MY_PHOTO = "https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg";

const FAQS = [
  { q: "Les soins sont-ils remboursés ?", a: "Oui, je suis agréé ASCA & RME. Veuillez vérifier auprès de votre assurance complémentaire pour connaître vos modalités de remboursement." },
  { q: "Où se situe le cabinet ?", a: "Le cabinet se trouve à Cointrin, au Alfa Business Center, Chemin de Joinville 26. Il est situé au 4ème étage avec ascenseur." },
  { q: "Proposez-vous des massages à domicile ?", a: "Oui, je propose des séances à domicile sur demande et selon mes disponibilités dans la région genevoise. Un supplément peut s'appliquer." },
  { q: "Quelle est votre politique d'annulation ?", a: "Toute annulation ou modification de rendez-vous doit être effectuée au moins 24 heures à l'avance. En cas de délai non respecté, la séance pourra être facturée." }
];

const BIOLOGICAL_IMPACTS = [
  { id: "brain",     title: "Neuro-Apaisement",      desc: "Régulation immédiate du cortisol et stimulation de l'ocytocine pour un état de calme mental profond.",           icon: Brain,       color: "#5F27CD", bg: "rgba(95,39,205,0.08)" },
  { id: "myofascial",title: "Relâchement Myofascial",desc: "Dissolution des noeuds musculaires et amélioration de l'élasticité des tissus pour une liberté de mouvement retrouvée.", icon: Zap, color: "#FF9F43", bg: "rgba(255,159,67,0.08)" },
  { id: "flow",      title: "Flux & Oxygène",        desc: "Optimisation de la microcirculation sanguine facilitant l'apport nutritif aux cellules et le drainage des toxines.", icon: Activity,    color: "#0ABDE3", bg: "rgba(10,189,227,0.08)" },
  { id: "regen",     title: "Régénération",           desc: "Soutien du système immunitaire and induction d'un sommeil réparateur, clé de la reconstruction organique.",       icon: ShieldCheck, color: "#1DD1A1", bg: "rgba(29,209,161,0.08)" }
];

const SERVICE_COLORS = [
  { accent: "#3772ff", light: "rgba(60,66,71,0.06)" }, // Slate
  { accent: "#7fb069", light: "rgba(91,107,120,0.06)" }, // Storm
  { accent: "#4A5568", light: "rgba(74,85,104,0.06)" }, // Deep Grey
  { accent: "#718096", light: "rgba(113,128,150,0.06)" }, // Muted Blue
  { accent: "#3772ff", light: "rgba(60,66,71,0.06)" }, // Slate (repeat for unity)
  { accent: "#7fb069", light: "rgba(91,107,120,0.06)" }, // Storm
  { accent: "#4A5568", light: "rgba(74,85,104,0.06)" }, // Deep Grey
  { accent: "#718096", light: "rgba(113,128,150,0.06)" }, // Muted Blue
];

export default function HomePage() {
  const { scrollYProgress } = useScroll();
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
    <div className="bg-sandstone text-onyx selection:bg-onyx/5 antialiased relative">
      <Navbar onBookingClick={() => openBooking()} />

      {/* ── HERO ── */}
      <section className="min-h-[85vh] flex flex-col justify-center px-6 md:px-12 pt-40 pb-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16 relative z-10">
          
          <div className="w-full lg:w-1/2 space-y-xl text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-m">
              <span className="font-heading text-[10px] font-black uppercase tracking-[0.3em] text-onyx/40 block">Praticien Agrée</span>
              <h1 className="font-serif text-display font-normal text-onyx leading-[0.95] mb-l">
                L'Art du<br />
                <span className="text-fresh-green">Lâcher-Prise.</span>
              </h1>
              <p className="font-heading text-body font-medium leading-relaxed text-onyx/70 max-w-lg mx-auto lg:mx-0">
                Un sanctuaire confidentiel à Genève Cointrin pour restaurer votre vitalité physique et mentale par l'excellence du toucher.
              </p>
            </div>
            
            <div className="flex justify-center lg:justify-start pt-l">
              <button 
                onClick={() => openBooking()} 
                className="h-14 px-10 bg-onyx text-white rounded-full font-heading text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-onyx/20 hover:scale-[1.02] transition-all"
              >
                Réserver un soin
              </button>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center order-1 lg:order-2">
            <div 
              className="relative aspect-[4/5] overflow-hidden w-full max-w-[420px] blob-shape shadow-2xl"
              style={{ borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%' }}
            >
              <Image 
                src="https://images.unsplash.com/photo-1544161515-4af6b1d462c2?q=80&w=2070&auto=format&fit=crop"
                fill
                unoptimized
                className="object-cover"
                alt="Soin Serenity Relax Therapy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT ── */}
      <section className="py-xxxl px-6 md:px-12 bg-white rounded-[4rem] mx-m">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-24 items-start">
            <header className="w-full lg:w-1/3">
              <span className="font-heading text-[10px] font-black uppercase tracking-[0.3em] text-onyx/40 block mb-m">Impact Biologique</span>
              <h2 className="font-serif text-h1 font-normal text-onyx leading-tight mb-m">
                L'Écho <br /> <span className="text-fresh-green">du Corps.</span>
              </h2>
              <p className="font-heading text-small font-medium leading-relaxed text-onyx/60">
                Chaque rituel est conçu comme un protocole unique, fusionnant rigueur anatomique et intuition pour répondre aux maux modernes.
              </p>
            </header>

            <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-16">
              {BIOLOGICAL_IMPACTS.map((impact) => (
                <div key={impact.id} className="space-y-m">
                  <div className="w-xl h-xl rounded-full bg-sandstone flex items-center justify-center text-onyx">
                    <impact.icon size={20} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-heading text-small font-black uppercase tracking-widest text-onyx">{impact.title}</h4>
                  <p className="font-heading text-small font-medium leading-relaxed text-onyx/50">
                    {impact.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-xxxl px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-24 items-start mb-xxxl">
            <header className="w-full lg:w-1/3">
              <span className="font-heading text-[10px] font-black uppercase tracking-[0.3em] text-onyx/40 block mb-m">Savoir-Faire</span>
              <h2 className="font-serif text-h1 font-normal text-onyx leading-tight mb-m">
                Soins <br /> <span className="text-fresh-green">exclusifs.</span>
              </h2>
              <p className="font-heading text-small font-medium leading-relaxed text-onyx/60">
                Une sélection de 8 rituels signatures pour votre équilibre interne et votre récupération.
              </p>
              <button 
                onClick={() => openBooking()} 
                className="mt-xl h-12 px-8 bg-white border border-border text-onyx rounded-full font-heading text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all"
              >
                Tous les rituels
              </button>
            </header>

            <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-12">
              {SERVICES.map((s, i) => (
                <div 
                  key={s.id} 
                  onClick={() => openBooking(s.id)}
                  className="group cursor-pointer space-y-m"
                >
                  <div className="relative aspect-[4/5] bg-secondary rounded-[2rem] overflow-hidden">
                    <Image src={s.image || ''} fill unoptimized className="object-cover transition-transform duration-700 group-hover:scale-105" alt={s.name} />
                  </div>
                  <div className="space-y-xs px-xs">
                    <span className="font-heading text-[9px] font-black uppercase tracking-[0.2em] text-onyx/40 block">
                      {i % 2 === 0 ? 'SIGNATURE' : 'PERFORMANCE'}
                    </span>
                    <h3 className="font-serif text-h4 text-onyx">{simplifyServiceName(s.name)}</h3>
                    <p className="font-heading text-[11px] font-medium leading-relaxed text-onyx/50 line-clamp-2">
                       {s.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-xxxl bg-white rounded-[4rem] mx-m mb-xxxl">
        <div className="max-w-4xl mx-auto px-6">
          <header className="text-center mb-xxxl">
             <span className="font-heading text-[10px] font-black uppercase tracking-[0.3em] text-onyx/40 block mb-m">Informations</span>
             <h2 className="font-serif text-h1 text-onyx mb-m">Questions fréquentes.</h2>
          </header>
          <div className="space-y-12">
            {FAQS.map((f, i) => (
              <div key={i} className="flex gap-10 items-start border-b border-border pb-12 last:border-0">
                <span className="font-serif text-h4 text-fresh-green/40">0{i+1}</span>
                <div className="space-y-xs">
                  <h4 className="font-heading text-small font-black uppercase tracking-widest text-onyx">{f.q}</h4>
                  <p className="font-heading text-small font-medium leading-relaxed text-onyx/60 border-l-2 border-fresh-green/10 pl-6">
                    {f.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-onyx text-sandstone pt-xxxl pb-xl px-12 text-center overflow-hidden relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <p className="font-serif text-h1 mb-m opacity-20">Serenity Relax Therapy</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 pt-xl border-t border-white/5 opacity-60">
             <div className="space-y-xs">
               <p className="font-heading text-[10px] font-black uppercase tracking-widest">Localisation</p>
               <p className="font-heading text-small opacity-80 leading-relaxed">Alfa Business Center, Cointrin<br/>Genève, Suisse</p>
             </div>
             <div className="space-y-xs">
               <p className="font-heading text-[10px] font-black uppercase tracking-widest">Contact</p>
               <p className="font-heading text-small opacity-80">+41 78 333 68 23<br/>serenityrelaxtherapy@gmail.com</p>
             </div>
             <div className="space-y-xs">
               <p className="font-heading text-[10px] font-black uppercase tracking-widest">Suivez-nous</p>
               <div className="flex justify-center gap-6">
                 <a href="#" className="font-heading text-small hover:text-fresh-green transition-all">Instagram</a>
                 <a href="#" className="font-heading text-small hover:text-fresh-green transition-all">Linkedin</a>
               </div>
             </div>
          </div>
        </div>
      </footer>

      <Sheet open={bookingOpen} onOpenChange={setBookingOpen}>
        <SheetContent side="bottom" className="h-[85vh] w-[95%] max-w-[1500px] mx-auto rounded-t-[3rem] p-0 border-none bg-white overflow-hidden shadow-2xl shadow-black/40">
           <VisuallyHidden.Root><SheetTitle>Réserver</SheetTitle></VisuallyHidden.Root>
           <div className="h-full overflow-y-auto scrollbar-hide">
              <BookingFlow services={SERVICES} initialServiceId={selectedServiceId} />
           </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

const ServiceCard = ({ s, colorIdx, onClick }: { s: any, colorIdx: number, onClick: () => void }) => {
  const colors = SERVICE_COLORS[colorIdx % SERVICE_COLORS.length];
  return (
    <div 
      onClick={onClick}
      className="relative w-full max-w-[320px] bg-secondary/10 rounded-card p-m group cursor-pointer transition-all duration-500 border border-transparent hover:border-border hover:bg-white"
    >
      <div className="relative aspect-square overflow-hidden mb-m rounded-card-inner">
        <Image 
          src={s.image || ''} 
          fill
          unoptimized
          className="object-cover transition-transform duration-1000 group-hover:scale-110" 
          alt={s.name}
        />
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ background: `linear-gradient(to top, #0a0b0920, transparent)` }}
        />
      </div>

      <div className="px-xxs pb-xl space-y-xs">
        <span 
          className="font-heading text-small font-black uppercase tracking-widest block mb-xxs"
          style={{ color: '#0a0b09' }}
        >
          {s.name.includes('Bambous') ? 'Profond' : s.name.includes('Draineur') ? 'Vitalité' : s.name.includes('Aroma') ? 'Sensoriel' : s.name.includes('Réflexologie') ? 'Ciblé' : s.name.includes('Sportif') ? 'Performance' : s.name.includes('Thérapeutique') ? 'Signature' : s.name.includes('Deep Relax') ? 'Détente' : 'Dynamique'}
        </span>
        <h3 className="font-heading text-h3 font-medium text-onyx tracking-heading leading-heading">
          {simplifyServiceName(s.name)}
        </h3>
        <p className="font-body text-small leading-body text-onyx/60">
          {s.description}
        </p>
      </div>

      <div 
        className="absolute bottom-m left-1/2 -translate-x-1/2 w-m h-xxs rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 bg-onyx"
      />
    </div>
  );
};
