'use client';

import React, { useState, useEffect } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { Brain, Zap, Activity, ShieldCheck, Calendar, Sparkles, Heart, Trophy, ArrowRight, Clock, Star, ChevronRight } from "lucide-react";
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { SERVICES } from '@/lib/types';
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BookingFlow } from "@/components/booking/booking-flow";
import { useRouter } from 'next/navigation';

const MY_PHOTO = "https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg";

const FAQS = [
  { q: "Les soins sont-ils remboursés ?", a: "Oui, je suis agréé ASCA & RME. Veuillez vérifier auprès de votre assurance complémentaire pour connaître vos modalités de remboursement." },
  { q: "Où se situe le cabinet ?", a: "Le cabinet se situe à Cointrin, au Alfa Business Center, Chemin de Joinville 26. Situé au 4ème étage avec ascenseur." },
  { q: "Quelle est votre politique d'annulation ?", a: "Toute annulation ou modification doit être effectuée au moins 24 heures à l'avance pour éviter la facturation de la séance." }
];

const BIOLOGICAL_IMPACTS = [
  { id: "brain", title: "Neuro-Apaisement", desc: "Régulation immédiate du cortisol et stimulation de l'ocytocine pour un état de calme mental profond.", icon: Brain, color: "#5F27CD" },
  { id: "myofascial", title: "Relâchement Myofascial", desc: "Dissolution des noeuds musculaires et amélioration de l'élasticité pour une liberté retrouvée.", icon: Zap, color: "#FF9F43" },
  { id: "flow", title: "Flux & Oxygène", desc: "Optimisation de la microcirculation sanguine facilitant l'apport nutritif et le drainage des toxines.", icon: Activity, color: "#0ABDE3" },
  { id: "regen", title: "Régeneration", desc: "Soutien du système immunitaire et induction d'un sommeil réparateur, clé de la reconstruction organique.", icon: ShieldCheck, color: "#1DD1A1" }
];

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const router = useRouter();

  const openBooking = (id?: string) => {
    setSelectedServiceId(id);
    setBookingOpen(true);
  };

  return (
    <>
      <Navbar onBookingClick={() => openBooking()} />

      {/* ── PROGRESS BAR LUXE ── */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5F27CD] via-[#0ABDE3] to-[#1DD1A1] origin-left z-50" style={{ scaleX }} />

      <main className="bg-[#F8F5F0] overflow-hidden relative">
        
        {/* ── BACKGROUND ENGINE (RESPIRATION) ── */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.12, 0.08] }} transition={{ duration: 15, repeat: Infinity }} className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#5F27CD_0%,transparent_40%)]" />
          <motion.div animate={{ scale: [1.3, 1, 1.3], opacity: [0.08, 0.12, 0.08] }} transition={{ duration: 18, repeat: Infinity }} className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,#0ABDE3_0%,transparent_40%)]" />
        </div>

        {/* ── HERO MASTERPIECE ── */}
        <section className="relative min-h-[85vh] flex items-center px-4 md:px-8 pt-16 pb-12 z-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/60 shadow-lg shadow-indigo-100/5">
                <div className="w-6 h-6 rounded-lg bg-[#5F27CD] text-white flex items-center justify-center animate-pulse"><Sparkles size={12} /></div>
                <span className="text-[0.6rem] font-black uppercase tracking-[0.25em] text-[#222F3E]">Sanctuaire Thérapeutique • Genève</span>
              </div>

              <h1 className="title-luxe text-3xl md:text-4xl lg:text-[3.5rem] leading-[1.1] tracking-tight">
                L&apos;Art du <br />
                <span className="italic   opacity-80 text-4xl lg:text-[4rem]">Lâcher-Prise</span>
              </h1>

              <div className="space-y-8">
                 <p className="text-base md:text-lg text-gray-400   italic max-w-md mx-auto lg:mx-0 leading-relaxed">
                   Un espace confidentiel où l&apos;excellence anatomique rencontre l&apos;intuition sensorielle de João.
                 </p>
                 <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 justify-center lg:justify-start">
                    <button onClick={() => openBooking()} className="btn-luxe px-8 py-3.5 text-sm group">
                       <span className="flex items-center gap-2">Réserver mon Rituel <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
                    </button>
                    <div className="flex items-center gap-3 px-6 py-3 border border-gray-100 rounded-full bg-white/50 backdrop-blur-md">
                       <ShieldCheck className="text-emerald-500" size={18} />
                       <span className="text-[0.6rem] font-black uppercase tracking-widest text-gray-500">Agréé ASCA / RME</span>
                    </div>
                 </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9, rotateY: 15 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} transition={{ duration: 1.5 }} className="relative group perspective-1000">
              <div className="absolute inset-0 bg-[#5F27CD] blur-[80px] opacity-10 rounded-full group-hover:scale-125 transition-transform duration-1000" />
              <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-indigo-100/20 transform group-hover:rotate-1 transition-transform duration-700">
                <Image src={MY_PHOTO} alt="João P. - Serenity Relax" width={400} height={530} className="object-cover w-full scale-102 group-hover:scale-100 transition-transform duration-1000" priority />
              </div>
              <div className="absolute -bottom-6 -left-6 glass p-6 rounded-2xl shadow-xl hidden md:block">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1DD1A1] rounded-xl flex items-center justify-center text-white"><Star size={18} /></div>
                    <div>
                       <p className="text-xl   font-bold text-[#222F3E]">Excellence</p>
                       <p className="text-[0.55rem] font-black uppercase tracking-widest text-[#1DD1A1]">Note 5.0 • Genève</p>
                    </div>
                 </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ── BIOLOGICAL IMPACTS HUB ── */}
        <section className="py-8 md:py-10 bg-white relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <header className="text-center mb-8 max-w-xl mx-auto space-y-2">
              <p className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-[#5F27CD]">Science & Sensoriel</p>
              <h2 className="title-luxe text-xl md:text-2xl">L'Immersion Corporelle</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BIOLOGICAL_IMPACTS.map((impact, i) => (
                <motion.div key={impact.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass p-5 rounded-xl hover:shadow-lg transition-all duration-500 border-white">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-white shadow-md" style={{ backgroundColor: impact.color }}>
                    <impact.icon size={16} />
                  </div>
                  <h3 className="text-lg   font-bold text-[#222F3E] mb-2">{impact.title}</h3>
                  <p className="text-[0.65rem] text-gray-400   italic leading-relaxed">{impact.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE SIGNATURE COLLECTION ── */}
        <section className="py-10 md:py-12 relative z-10">
           <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row gap-12 items-start">
                 <div className="lg:w-[30%] lg:sticky lg:top-20 h-fit space-y-6">
                    <div>
                       <p className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-[#0ABDE3] mb-2">Le Menu Privé</p>
                       <h2 className="title-luxe text-2xl leading-tight">Rituels <br/><span className="italic   opacity-40">D'Exceptions.</span></h2>
                    </div>

                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="dash-card p-5 bg-[#222F3E] text-white shadow-lg relative overflow-hidden group cursor-pointer border-none"
                      onClick={() => router.push('/booking/ai-concierge')}
                    >
                       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Sparkles size={40} /></div>
                       <p className="text-[0.45rem] font-black uppercase tracking-widest text-[#0ABDE3] mb-2">Besoin d'Aide ?</p>
                       <h3 className="text-base   font-medium mb-1.5">L'Oracle Zen</h3>
                       <p className="text-[0.55rem] text-gray-400   italic mb-3 leading-relaxed">Suggestion par IA du soin idéal.</p>
                       <div className="flex items-center gap-2 text-[#0ABDE3] text-[0.5rem] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                          Consulter <ArrowRight size={10} />
                       </div>
                    </motion.div>

                    <p className="text-sm   italic text-gray-500 max-w-sm leading-relaxed">
                       Expériences uniques pour la régénération profonde.
                    </p>
                    <button onClick={() => openBooking()} className="btn-luxe px-6 py-3 text-[0.65rem]">Réserver Maintenant</button>
                 </div>

                  <div className="lg:w-[70%] grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SERVICES.map((s, i) => (
                       <motion.div 
                         key={s.id}
                         initial={{ opacity: 0, scale: 0.98 }}
                         whileInView={{ opacity: 1, scale: 1 }}
                         onClick={() => openBooking(s.id)}
                         className="dash-card p-4 overflow-hidden border border-white cursor-pointer group"
                       >
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-5 shadow-md">
                             <Image src={s.image || ''} fill unoptimized alt={s.name} className="object-cover group-hover:scale-105 transition-transform duration-700" />
                          </div>
                          <div className="px-1 space-y-2">
                             <div className="flex justify-between items-center">
                                <p className="text-[0.55rem] font-bold text-[#5F27CD] uppercase tracking-widest">{s.duration}</p>
                                <span className="text-lg   font-black text-[#222F3E]">{s.price} CHF</span>
                             </div>
                             <h3 className="text-xl   font-medium text-[#222F3E] leading-tight">{s.name}</h3>
                             <p className="text-[0.65rem]   italic text-gray-400 leading-relaxed line-clamp-2">{s.description}</p>
                          </div>
                       </motion.div>
                    ))}
                  </div>
              </div>
           </div>
        </section>

        {/* ── FAQ SANCTUAIRE ── */}
        <section className="py-16 bg-white relative z-10">
           <div className="max-w-4xl mx-auto px-6">
              <header className="text-center mb-12">
                 <h2 className="title-luxe text-3xl">L&apos;Ordre des Choses</h2>
                 <p className="text-gray-400 italic   mt-1.5 text-[0.6rem]">Transparence & Sérénité</p>
              </header>
              <div className="space-y-8">
                 {FAQS.map((faq, i) => (
                    <motion.div key={i} className="border-b border-gray-100 pb-8 cursor-help group last:border-none">
                       <h3 className="text-xl   font-light text-[#222F3E] group-hover:text-[#5F27CD] transition-colors flex justify-between items-center">
                          {faq.q} <ChevronRight size={16} className="text-gray-200 group-hover:text-[#5F27CD]" />
                       </h3>
                       <p className="text-sm   italic text-gray-400 mt-4 leading-relaxed max-w-2xl">{faq.a}</p>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>

      </main>

      {/* ── BOOKING MODAL (ZEN) ── */}
      <AnimatePresence>
        {bookingOpen && (
          <Sheet open={bookingOpen} onOpenChange={setBookingOpen}>
            <SheetContent side="right" className="w-full sm:w-[50vw] xl:w-[40vw] p-0 border-l-0 bg-white overflow-hidden shadow-edge">
              <SheetTitle className="sr-only">Espace de Réservation - Serenity Relax</SheetTitle>
              <BookingFlow initialServiceId={selectedServiceId} onClose={() => setBookingOpen(false)} services={SERVICES} />
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>
    </>
  );
}
