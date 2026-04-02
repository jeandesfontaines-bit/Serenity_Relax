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

      <section className="relative min-h-[85vh] flex items-center pt-24 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/50 backdrop-blur-sm border border-black/5 rounded-full mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              <span className="text-[8px] uppercase tracking-[0.3em] font-black text-muted-foreground">Genève Cointrin</span>
            </div>
            
            <h1 className="text-[2.6rem] md:text-5xl lg:text-7xl leading-[1.1] font-serif font-medium text-primary mb-6 tracking-tight">
              Massage sur <span className="italic font-normal">mesure.</span>
            </h1>
            
            <p className="text-sm md:text-lg text-muted-foreground font-normal leading-relaxed max-w-md mb-8">
              Offrez-vous un moment de détente profonde à travers un soin entièrement personnalisé, adapté à vos besoins et à votre état du moment.
            </p>

            <div className="flex flex-wrap gap-2 mb-10">
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-lg text-[8px] font-bold uppercase tracking-widest text-muted-foreground shadow-sm border border-black/[0.03]">
                  <b.icon className={`${b.color} opacity-60`} size={10} />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
            
            <Link href="/booking" className="inline-flex items-center gap-3 bg-primary text-white py-2.5 px-10 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:bg-black transition-all active:scale-95">
              Réserver votre rituel <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 1, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end lg:-ml-12 mt-12 lg:mt-0"
          >
            <div className="blob-shape relative aspect-square w-full max-w-[280px] md:max-w-[440px] shadow-2xl border-[6px] md:border-[8px] border-white/30 animate-float">
              <Image 
                src="https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg" 
                alt="João" 
                fill
                className="object-cover grayscale-[10%]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-30" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-3 mx-auto">
            <div className="h-0.5 w-10 bg-primary/20"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">L'Art du Toucher</span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight mt-4">Techniques & Expériences</h2>
          <p className="mt-6 text-sm md:text-base text-muted-foreground font-normal max-w-2xl mx-auto leading-relaxed italic">
            Une approche professionnelle, attentive et respectueuse. Vous restez couvert selon vos préférences, dans le respect total de votre confort et de votre intimité.
          </p>
        </div>
        
        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x px-6 max-w-6xl mx-auto pb-12">
          {SERVICES.map((service, i) => (
            <Link 
              key={service.id}
              href={`/booking?serviceId=${service.id}`}
              className="flex-shrink-0 w-[55vw] sm:w-[220px] md:w-[280px] snap-center relative aspect-[4/5] md:aspect-[3/4] rounded-[2rem] md:rounded-[3rem] overflow-hidden group shadow-lg transition-all"
            >
              <Image src={`https://picsum.photos/seed/${service.id}/800/1000`} fill className="object-cover grayscale-[20%] transition-all duration-1000" alt={service.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-8 md:right-8">
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-white/60 mb-1 md:mb-2 block">0{i+1}</span>
                <h3 className="text-sm md:text-xl font-serif text-white font-medium leading-tight mb-1 md:mb-3">{service.name.split(' - ')[0]}</h3>
                <p className="text-[8px] md:text-[9px] text-white/80 font-bold uppercase tracking-widest">CHF {service.price} • {service.duration}</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-8 md:mt-12">
          <Link href="/booking" className="inline-flex items-center gap-3 bg-primary text-white py-2.5 px-10 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95">
            Réserver votre rituel <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full mb-6 border border-black/[0.02] shadow-sm">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Le Rituel Post-Soin</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight mb-6">7 gestes pour magnifier l'expérience</h2>
            <p className="text-sm md:text-base text-muted-foreground font-normal max-w-lg mx-auto leading-relaxed italic">
              Quelques attentions essentielles pour accueillir pleinement les bienfaits de votre séance dans les heures qui suivent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {WELLNESS_TIPS.map((tip, idx) => (
              <div 
                key={tip.id} 
                className={`group bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-black/[0.02] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-start ${idx === 6 ? 'lg:col-span-3 lg:flex-row lg:items-center lg:gap-12' : ''}`}
              >
                <div className="flex items-center justify-between w-full mb-4 md:mb-5 lg:mb-0 lg:w-auto">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary/10 group-hover:text-primary/40 transition-colors">
                    <tip.icon size={18} className="md:size-[24px]" />
                  </div>
                  <span className="editorial-number !text-2xl md:!text-4xl !opacity-10 group-hover:!opacity-30 transition-opacity">0{tip.id}</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-base md:text-xl font-serif font-medium text-primary mb-2 md:mb-4 tracking-tight">{tip.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed italic">
                    {tip.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-20 px-6 bg-primary text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="space-y-6">
            <h2 className="font-sans font-bold text-xs tracking-[0.2em] uppercase leading-none">
              SERENITY RELAX <span className="font-cursive text-[24px] text-white/40 tracking-normal inline-block normal-case ml-2">by João</span>
            </h2>
            <p className="text-white/40 text-[9px] uppercase tracking-widest leading-relaxed max-w-xs">
              Un sanctuaire sensoriel confidentiel pour la restauration physique et mentale. Uniquement sur rendez-vous.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 md:gap-24">
            <div className="space-y-4">
              <h3 className="text-[9px] font-bold tracking-widest uppercase text-white/20">Cabinet</h3>
              <p className="text-xs text-white/70 font-medium leading-relaxed">
                Chemin de Joinville 26,<br />
                4ème étage,<br />
                1216 Cointrin – Genève
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-[9px] font-bold tracking-widest uppercase text-white/20">Horaires</h3>
              <p className="text-xs text-white/70 font-medium leading-relaxed">
                Lundi au vendredi : 8h00 – 20h00<br />
                Samedi et dimanche : 9h30 – 20h00
              </p>
            </div>
          </div>
          
          <div className="flex gap-8 items-center pt-8 md:pt-0">
            <a href="https://instagram.com/serenity.relax.therapy_by_joao" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <div className="h-10 w-px bg-white/10 hidden md:block" />
            <div className="space-y-1">
              <h3 className="text-[9px] font-bold tracking-widest uppercase text-white/20">ID ASCA</h3>
              <p className="text-xs text-emerald-400 font-bold tracking-widest">Agréé Thérapeute</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}