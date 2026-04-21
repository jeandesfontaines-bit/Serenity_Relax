'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Activity, Wind, ShieldCheck, ChevronRight, ArrowUpRight, 
  Clock, MapPin, Mail, Instagram, Linkedin, User, MessageCircle
} from "lucide-react";
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { SERVICES } from '@/lib/types';
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BookingFlow } from "@/components/booking/booking-flow";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { simplifyServiceName } from "@/lib/utils";

const FAQS = [
  { q: "Les soins sont-ils remboursés ?", a: "Oui, je suis agréé ASCA & RME. Veuillez vérifier auprès de votre assurance complémentaire pour connaître vos modalités de remboursement." },
  { q: "Où se situe le cabinet ?", a: "Le cabinet se trouve à Cointrin, au Alfa Business Center, Chemin de Joinville 26. Il est situé au 4ème étage avec ascenseur." },
  { q: "Proposez-vous des massages à domicile ?", a: "Oui, je propose des séances à domicile sur demande et selon mes disponibilités dans la région genevoise. Un supplément peut s'appliquer." },
  { q: "Quelle est votre politique d'annulation ?", a: "Toute annulation ou modification de rendez-vous doit être effectuée au moins 24 heures à l'avance. En cas de délai non respecté, la séance pourra être facturée." }
];

const IMPACTS = [
  { 
    id: "neuro", 
    title: "Neuro-apaisement", 
    desc: "Une détente profonde qui aide à calmer le système nerveux et à alléger la charge mentale.", 
    icon: Brain 
  },
  { 
    id: "myofascial", 
    title: "Relâchement myofascial", 
    desc: "Un travail ciblé pour délier les tensions installées et redonner de la mobilité aux zones congestionnées.", 
    icon: Activity 
  },
  { 
    id: "flow", 
    title: "Circulation & oxygène", 
    desc: "Des manœuvres qui soutiennent les échanges, stimulent les tissus et favorisent une sensation de légèreté durable.", 
    icon: Wind 
  },
  { 
    id: "regen", 
    title: "Régénération", 
    desc: "Un meilleur repos, une récupération plus stable et une sensation de corps plus disponible au quotidien.", 
    icon: ShieldCheck 
  }
];

export default function LandingPage() {
  const isMobile = useIsMobile();
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
    <div className="bg-sandstone text-onyx selection:bg-onyx/5 antialiased">
      <Navbar onBookingClick={() => openBooking()} />

      <main>
        {/* --- HERO SECTION (Split Style) --- */}
        <section className="container mx-auto px-6 pt-32 pb-40 md:pt-48">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-start"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-[1px] bg-onyx" />
                <span className="text-[12px] font-black uppercase tracking-[2px] text-onyx/40">
                  Praticien agréé · Genève
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl leading-[1] font-black tracking-tighter mb-8 uppercase">
                Le massage comme art du recentrage.
              </h1>
              <p className="text-[18px] leading-[1.6] text-earth mb-12 max-w-[540px]">
                Des soins thérapeutiques et sensoriels pensés pour ralentir, relâcher et retrouver une énergie plus stable dans un cadre intime à Cointrin, avec une approche plus douce, plus précise et plus haut de gamme.
              </p>
              <div className="flex items-center gap-4 flex-wrap mb-16">
                <button 
                  onClick={() => openBooking()}
                  className="bg-ochre text-white h-16 px-9 rounded-full text-[13px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-ochre/20"
                >
                  Réserver un soin
                </button>
                <button className="bg-transparent border border-clay h-16 px-9 rounded-full text-[13px] font-black uppercase tracking-widest hover:bg-white transition-all text-onyx">
                  Découvrir l'approche
                </button>
              </div>
              <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-earth/50">
                <span>Sur-mesure</span>
                <div className="w-1 h-1 rounded-full bg-clay" />
                <span>Cointrin · Genève</span>
                <div className="w-1 h-1 rounded-full bg-clay" />
                <span>ASCA · RME</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative aspect-[3/4] rounded-[40px] overflow-hidden border border-clay shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1544161515-4af6b1d462c2?q=80&w=2070&auto=format&fit=crop"
                  fill
                  alt="Luxury Spa Room"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute -bottom-8 -left-8 md:-left-12 bg-neon/95 backdrop-blur-xl border border-clay p-6 md:p-8 rounded-[32px] shadow-2xl max-w-[320px] z-10"
              >
                <p className="text-[15px] font-black uppercase tracking-widest mb-2 text-forest">Atmosphère premium douce</p>
                <p className="text-[14px] text-earth leading-relaxed font-medium">
                  Une approche plus calme, plus luxueuse et plus affirmée visuellement.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* --- IMPACT SECTION --- */}
        <section className="container mx-auto px-6 mb-40">
          <div className="bg-white border border-clay rounded-[40px] p-10 md:p-20 shadow-sm">
            <div className="text-center max-w-[720px] mx-auto mb-16 space-y-6">
              <span className="text-[12px] font-black uppercase tracking-[2px] text-forest">Impact biologique</span>
              <h2 className="text-2xl md:text-3xl leading-[1.1] font-black tracking-tighter uppercase">
                Quand le soin travaille en profondeur.
              </h2>
              <p className="text-[18px] leading-[1.6] text-earth">
                Des résultats tangibles sur le corps et l'esprit, pensés pour vous rééquilibrer durablement.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {IMPACTS.map((impact) => (
                <div key={impact.id} className="flex flex-col items-start px-4">
                  <div className="w-16 h-16 rounded-full bg-sandstone flex items-center justify-center mb-8 border border-clay/50">
                    <impact.icon size={24} strokeWidth={1.5} className="text-onyx" />
                  </div>
                  <h3 className="text-[16px] font-black uppercase tracking-widest mb-4">{impact.title}</h3>
                  <p className="text-[14px] leading-[1.6] text-earth font-medium">
                    {impact.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SERVICES SECTION --- */}
        <section className="container mx-auto px-6 mb-40" id="services">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16">
            <div className="max-w-[600px]">
              <span className="text-[12px] font-black uppercase tracking-[2px] text-ochre">Savoir-faire</span>
              <h2 className="text-2xl lg:text-3xl leading-[1.1] font-black tracking-tighter uppercase mt-4">
                Nos soins exclusifs.
              </h2>
            </div>
            <div className="flex flex-col items-start md:items-end text-left md:text-right gap-6">
              <p className="text-[18px] text-earth leading-relaxed max-w-[440px]">
                Une sélection de rituels signatures pour votre équilibre interne et votre récupération.
              </p>
              <button className="h-14 px-8 border border-clay rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-neon transition-all">
                Tous les rituels
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {SERVICES.map((service, i) => (
              <div 
                key={service.id} 
                onClick={() => openBooking(service.id)}
                className="group cursor-pointer bg-white border border-clay rounded-[32px] p-4 flex flex-col transition-colors border-clay hover:border-forest shadow-sm"
              >
                <div className="relative mb-8 overflow-hidden rounded-[20px] aspect-[4/3]">
                  <Image 
                    src={service.image || ''} 
                    fill
                    alt={service.name}
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute left-4 top-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
                    {i % 2 === 0 ? 'Signature' : 'Performance'}
                  </div>
                </div>
                <div className="flex-1 px-4 pb-4">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-[18px] leading-tight font-black uppercase tracking-tight">
                      {simplifyServiceName(service.name)}
                    </h3>
                    <div className="w-9 h-9 rounded-full border border-clay flex items-center justify-center text-onyx group-hover:bg-forest group-hover:text-white transition-all">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                  <p className="text-[15px] leading-relaxed text-earth/80 mb-8 line-clamp-2 font-medium">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-3 pt-6 border-t border-clay/30">
                    <span className="text-[11px] font-black text-earth/60 uppercase tracking-widest">{service.duration}</span>
                    <div className="w-1 h-1 rounded-full bg-clay" />
                    <span className="text-[11px] font-black text-earth/60 uppercase tracking-widest">
                      {i % 2 === 0 ? 'Relâchement' : 'Performance'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="container mx-auto px-6 mb-40">
          <div className="bg-white border border-clay rounded-[40px] p-10 md:p-20 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-20">
              <div className="flex flex-col items-start sticky top-32 h-fit">
                <span className="text-[12px] font-black uppercase tracking-[2px] text-forest">Informations</span>
                <h2 className="text-2xl md:text-3xl leading-[1.1] font-black tracking-tighter uppercase mt-4 mb-8">
                  Questions fréquentes.
                </h2>
                <p className="text-[16px] leading-relaxed text-earth mb-8 max-w-[320px]">
                  Tout ce qu'il faut savoir avant votre rendez-vous, pour réserver avec plus de sérénité.
                </p>
                <div className="inline-flex items-center gap-3 px-5 py-3 bg-sandstone rounded-full text-[13px] font-black uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-forest animate-pulse" />
                  Réponce rapide par message
                </div>
              </div>
              
              <div className="bg-sandstone border border-clay rounded-[32px] p-4 md:p-10">
                <div className="divide-y divide-clay">
                  {FAQS.map((faq, i) => (
                    <div key={i} className="grid grid-cols-[40px_1fr] gap-6 py-8 first:pt-0 last:pb-0">
                      <span className="text-[13px] font-black text-earth/40 pt-1">0{i+1}</span>
                      <div>
                        <h3 className="text-[15px] font-black uppercase tracking-widest mb-3">{faq.q}</h3>
                        <p className="text-[14px] leading-relaxed text-earth font-medium">{faq.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <section className="px-6 pb-12">
        <footer className="container mx-auto bg-forest text-white rounded-[40px] p-12 md:p-24 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 lg:gap-32 items-start mb-32">
            <div>
              <div className="leading-none flex flex-col gap-2">
                <span className="text-[28px] font-black uppercase tracking-tighter">Serenity Relax</span>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Therapy Genève</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Localisation</h4>
                <p className="text-[15px] leading-relaxed font-medium">
                  Alfa Business Center, Cointrin<br />Genève, Suisse
                </p>
              </div>
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Contact</h4>
                <p className="text-[15px] leading-relaxed font-medium">
                  +41 78 333 68 23<br />serenityrelaxtherapy@gmail.com
                </p>
              </div>
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Suivez-nous</h4>
                <div className="flex flex-col gap-3">
                  <a href="#" className="text-[15px] hover:text-white/60 transition-all font-medium">Instagram</a>
                  <a href="#" className="text-[15px] hover:text-white/60 transition-all font-medium">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-20 border-t border-white/10 text-center">
            <span className="text-[12vw] font-black tracking-[-0.05em] leading-[0.8] opacity-10 select-none">SERENITY</span>
          </div>
        </footer>
      </section>

      {isMobile ? (
        <Sheet open={bookingOpen} onOpenChange={setBookingOpen}>
          <SheetContent side="bottom" className="h-[90vh] w-full rounded-t-[3rem] p-0 border-none bg-white overflow-hidden shadow-2xl">
            <VisuallyHidden.Root><SheetTitle>Réserver</SheetTitle></VisuallyHidden.Root>
            <div className="h-full overflow-y-auto">
              <BookingFlow services={SERVICES} initialServiceId={selectedServiceId} onClose={() => setBookingOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogContent className="max-w-[1000px] h-[80vh] p-0 border-none bg-white overflow-hidden shadow-2xl rounded-[2rem]">
            <VisuallyHidden.Root><DialogTitle>Réserver</DialogTitle></VisuallyHidden.Root>
            <div className="h-full">
              <BookingFlow services={SERVICES} initialServiceId={selectedServiceId} onClose={() => setBookingOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
