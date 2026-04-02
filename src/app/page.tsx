'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Leaf, User, Coffee, Sparkles, Clock, Heart, Wind, Calendar, Instagram
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
  { id: 1, title: "ACCUEILLEZ VOS ÉMOTIONS", text: "Un massage peut libérer des ressentis profonds. Laissez-les s'exprimer naturellement.", icon: Heart },
  { id: 2, title: "PRENEZ VOTRE TEMPS", text: "Restez allongé quelques minutes avant de vous relever doucement.", icon: Clock },
  { id: 3, title: "HYDRATEZ-VOUS", text: "Buvez de l'eau à température ambiante pour aider à éliminer les toxines.", icon: Heart },
  { id: 4, title: "ÉVITEZ LA DOUCHE IMMÉDIATE", text: "Attendez environ une heure pour laisser les huiles et l'énergie agir.", icon: Sparkles },
  { id: 5, title: "PROLONGEZ LA DÉTENTE", text: "Accordez-vous encore quelques instants de repos et respirez profondément.", icon: Wind },
  { id: 6, title: "PLANIFIEZ UN PROCHAIN SOIN", text: "Pensez à réserver votre prochaine séance pour un bien-être durable.", icon: Calendar },
  { id: 7, title: "CHOISISSEZ LA DOUCEUR", text: "Privilégiez des activités calmes pour prolonger la sensation de bien-être.", icon: Leaf },
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
        <div className="max-w-6xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-2 items-center relative z-20">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/50 backdrop-blur-sm border border-black/5 rounded-full mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              <span className="text-[9px] uppercase tracking-[0.3em] font-black text-muted-foreground">Genève Cointrin</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl leading-[1.1] font-sans font-bold text-primary mb-6 tracking-tighter">
              Massage sur <span className="italic font-medium">mesure.</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground font-normal leading-relaxed max-w-md mb-8">
              Offrez-vous un moment de détente profonde à travers un soin entièrement personnalisé, adapté à vos besoins et à votre état du moment.
            </p>

            <div className="flex flex-wrap gap-2 md:gap-3 mb-10">
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl text-[9px] font-bold uppercase tracking-widest text-muted-foreground shadow-sm border border-black/[0.01]">
                  <b.icon className={`${b.color} opacity-60`} size={12} />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
            
            <Link href="/booking" className="inline-flex items-center gap-3 bg-primary text-white py-2.5 px-10 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95">
              Réserver votre rituel <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 1 }}
            className="relative flex justify-center lg:justify-end animate-float"
          >
            <div className="blob-shape relative aspect-square w-full max-w-[340px] md:max-w-[440px] shadow-2xl border-[6px] md:border-[8px] border-white/20">
              <Image 
                src="https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg" 
                alt="João" 
                fill
                className="object-cover grayscale-[10%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-40" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 mb-16 text-center">
          <div className="inline-flex items-center gap-3 mb-3 mx-auto">
            <div className="h-0.5 w-10 bg-primary"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">L'Art du Toucher</span>
          </div>
          <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mt-4 uppercase">Techniques & <span className="italic font-medium">Expériences</span></h2>
          <p className="mt-8 text-muted-foreground font-normal max-w-2xl mx-auto leading-relaxed italic">
            Une approche professionnelle, attentive et respectueuse. Vous restez couvert selon vos préférences, dans le respect total de votre confort et de votre intimité.
          </p>
        </div>
        
        <div className="flex gap-12 overflow-x-auto scrollbar-hide snap-x px-6 max-w-6xl mx-auto pb-12">
          {SERVICES.map((service, i) => (
            <Link 
              key={service.id}
              href={`/booking?serviceId=${service.id}`}
              className="flex-shrink-0 w-[75vw] sm:w-[260px] md:w-[280px] snap-center relative aspect-[3/4] rounded-[3rem] overflow-hidden group shadow-xl transition-all"
            >
              <Image src={`https://picsum.photos/seed/${service.id}/800/1000`} fill className="object-cover grayscale-[20%] transition-all duration-1000" alt={service.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
              <div className="absolute bottom-8 left-6 right-6 md:bottom-10 md:left-8 md:right-8">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-2 block opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-700">Expérience 0{i+1}</span>
                <h3 className="text-lg md:text-xl font-sans text-white font-bold leading-tight mb-3 uppercase">{service.name.split(' - ')[0]}</h3>
                <p className="text-[9px] text-white/80 font-bold uppercase tracking-widest">CHF {service.price} • {service.duration}</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/booking" className="inline-flex items-center gap-3 bg-primary text-white py-2.5 px-10 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95">
            Réserver votre rituel <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full mb-6 border border-black/[0.03] shadow-sm">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Bon à savoir</span>
            </div>
            <h2 className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 uppercase">7 conseils pour prolonger <br /> les bienfaits</h2>
            <p className="text-muted-foreground font-normal max-w-lg mx-auto leading-relaxed italic">
              Quelques gestes essentiels pour accueillir pleinement les effets de votre soin dans les heures qui suivent.
            </p>
          </div>

          <div className="space-y-32">
            {WELLNESS_TIPS.map((tip) => (
              <div key={tip.id} className="flex flex-col md:flex-row gap-12 items-start relative">
                <div className="absolute -left-12 md:-left-24 top-0 select-none">
                  <span className="editorial-number">{tip.id}</span>
                </div>
                <div className="flex-1 pt-4">
                  <h3 className="text-2xl md:text-3xl font-sans font-bold text-primary mb-6 uppercase tracking-tight">{tip.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                    {tip.text}
                  </p>
                </div>
                <div className="hidden md:flex w-24 h-24 rounded-full bg-white items-center justify-center shadow-sm border border-black/[0.02] shrink-0">
                  <tip.icon className="h-8 w-8 text-primary/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-20 px-6 bg-primary text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="space-y-6">
            <h2 className="font-sans text-xl font-bold tracking-[0.2em] uppercase leading-none">
              SERENITY RELAX <span className="font-cursive text-[28px] text-white/40 tracking-normal inline-block normal-case ml-2">by João</span>
            </h2>
            <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed max-w-xs">
              Un sanctuaire sensoriel confidentiel pour la restauration physique et mentale. Uniquement sur rendez-vous.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 md:gap-24">
            <div className="space-y-4">
              <h3 className="text-[9px] font-bold tracking-widest uppercase text-white/20">Alpha Business Center</h3>
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
