
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Leaf, User, Coffee, Sparkles, Clock, Heart, Wind, Calendar, Instagram, Droplets
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { SERVICES } from '@/lib/types';

const BENEFITS = [
  { icon: Leaf, text: "Huiles Organiques", color: "text-emerald-500" },
  { icon: User, text: "Approche Personnalisée", color: "text-amber-500" },
  { icon: Coffee, text: "Cadre Discret", color: "text-slate-500" },
  { icon: Sparkles, text: "Excellence João", color: "text-indigo-500" }
];

const WELLNESS_TIPS = [
  { id: 1, title: "Accueillez vos émotions", text: "Un massage peut libérer des ressentis profonds. Laissez-les s'exprimer naturellement.", icon: Heart },
  { id: 2, title: "Prenez votre temps", text: "Restez allongé quelques minutes avant de vous relever doucement.", icon: Clock },
  { id: 3, title: "Hydratez-vous", text: "Buvez de l'eau à température ambiante pour aider à éliminer les toxines.", icon: Droplets },
  { id: 4, title: "Évitez la douche immédiate", text: "Attendez environ une heure pour laisser les huiles et l'énergie agir.", icon: Sparkles },
  { id: 5, title: "Prolongez la détente", text: "Accordez-vous encore quelques instants de repos et respirez profondément.", icon: Wind },
  { id: 6, title: "Planifiez un prochain soin", text: "Pensez à réserver votre prochaine séance pour un bien-être durable.", icon: Calendar },
  { id: 7, title: "Choisissez la douceur", text: "Privilégiez des activités calmes pour prolonger la sensation de bien-être.", icon: Leaf },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/5">
      <Navbar />

      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden px-6">
        {/* Background artistic element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_70%)] opacity-40 z-0 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto w-full text-center relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/50 backdrop-blur-sm border border-black/5 rounded-full mb-8 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-black text-muted-foreground">Genève Cointrin</span>
            </div>
            
            <h1 className="text-[2.8rem] md:text-6xl lg:text-8xl leading-[1] font-serif font-medium text-primary mb-2 tracking-tighter">
              Massage sur <span className="italic font-normal">mesure.</span>
            </h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="font-cursive text-[32px] md:text-[42px] text-muted-foreground/60 mb-12 -mt-2"
            >
              by João
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="relative mb-16"
            >
              <div className="blob-shape relative aspect-square w-[220px] md:w-[320px] shadow-2xl border-[8px] md:border-[12px] border-white/40 animate-float overflow-hidden">
                <Image 
                  src="https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg" 
                  alt="João" 
                  fill
                  className="object-cover grayscale-[10%]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
              </div>
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/30 rounded-full blur-3xl" />
            </motion.div>

            <p className="text-base md:text-xl text-muted-foreground font-normal leading-relaxed max-w-lg mb-12 italic px-4">
              Un sanctuaire sensoriel confidentiel pour une restauration physique et mentale profonde, entièrement adaptée à vos besoins.
            </p>
            
            <Link href="/booking" className="inline-flex items-center gap-4 bg-primary text-white py-2.5 px-12 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] shadow-[0_25px_50px_rgba(0,0,0,0.15)] hover:bg-black transition-all active:scale-95 group">
              Réserver votre rituel <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex flex-wrap justify-center gap-3 mt-16">
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl text-[9px] font-bold uppercase tracking-widest text-muted-foreground shadow-sm border border-black/[0.03]">
                  <b.icon className={`${b.color} opacity-60`} size={11} />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 mb-16 text-center">
          <div className="inline-flex items-center gap-3 mb-4 mx-auto">
            <div className="h-0.5 w-12 bg-primary/20"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">L'Art du Toucher</span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight mt-4">Techniques & Expériences</h2>
          <p className="mt-8 text-sm md:text-base text-muted-foreground font-normal max-w-2xl mx-auto leading-relaxed italic px-4">
            Une approche professionnelle, attentive et respectueuse. Vous restez couvert selon vos préférences, dans le respect total de votre confort et de votre intimité.
          </p>
        </div>
        
        <div className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide snap-x px-6 max-w-7xl mx-auto pb-16">
          {SERVICES.map((service, i) => (
            <Link 
              key={service.id}
              href={`/booking?serviceId=${service.id}`}
              className="flex-shrink-0 w-[48vw] sm:w-[200px] md:w-[280px] snap-center relative aspect-[3/4.5] rounded-[2rem] md:rounded-[3rem] overflow-hidden group shadow-lg transition-all"
            >
              <Image src={`https://picsum.photos/seed/${service.id}/800/1200`} fill className="object-cover grayscale-[20%] transition-all duration-1000" alt={service.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-8 md:right-8">
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2 block">Soin 0{i+1}</span>
                <h3 className="text-sm md:text-xl font-serif text-white font-medium leading-tight mb-2">{service.name.split(' - ')[0]}</h3>
                <p className="text-[8px] md:text-[10px] text-white/70 font-bold uppercase tracking-widest">CHF {service.price} • {service.duration}</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <Link href="/booking" className="inline-flex items-center gap-3 bg-primary text-white py-2.5 px-12 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95">
            Voir tous les soins <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-full mb-8 border border-black/[0.03] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Le Rituel Post-Soin</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-8">7 gestes pour magnifier l'expérience</h2>
            <p className="text-sm md:text-base text-muted-foreground font-normal max-w-lg mx-auto leading-relaxed italic">
              Quelques attentions essentielles pour accueillir pleinement les bienfaits de votre séance dans les heures qui suivent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {WELLNESS_TIPS.map((tip, idx) => (
              <div 
                key={tip.id} 
                className={`group bg-white p-8 md:p-10 rounded-[2rem] border border-black/[0.02] shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col items-start ${idx === 6 ? 'lg:col-span-3 lg:flex-row lg:items-center lg:gap-16' : ''}`}
              >
                <div className="flex items-center justify-between w-full mb-6 lg:mb-0 lg:w-auto">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary/10 group-hover:text-primary/50 transition-colors">
                    <tip.icon size={20} />
                  </div>
                  <span className="editorial-number !text-3xl md:!text-4xl !opacity-10 group-hover:!opacity-40 transition-opacity">0{tip.id}</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-serif font-medium text-primary mb-3 tracking-tight">{tip.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed italic">
                    {tip.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-24 px-6 bg-primary text-white overflow-hidden relative">
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-white/5 rounded-full blur-[120px] -mb-32 -mr-32 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20 relative z-10">
          <div className="space-y-8">
            <h2 className="font-sans font-bold text-xs tracking-[0.3em] uppercase leading-none">
              SERENITY RELAX <span className="font-cursive text-[28px] text-white/40 tracking-normal inline-block normal-case ml-3">by João</span>
            </h2>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-medium leading-loose max-w-xs">
              Un sanctuaire sensoriel confidentiel pour la restauration physique et mentale. Uniquement sur rendez-vous.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 md:gap-32">
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">Cabinet</h3>
              <p className="text-sm text-white/70 font-medium leading-relaxed italic">
                Chemin de Joinville 26,<br />
                Alpha Business Center, 4ème étage,<br />
                1216 Cointrin – Genève
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">Horaires</h3>
              <p className="text-sm text-white/70 font-medium leading-relaxed italic">
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
