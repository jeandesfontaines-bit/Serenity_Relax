'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Menu, X, Brain, Instagram, MessageCircle, LogOut, ArrowRight, Leaf, User, Coffee, Sparkles, MapPin, Clock, Heart, Droplets, Wind, Calendar, ShieldCheck
} from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { SERVICES } from '@/lib/types';
import { recommendMassageService } from '@/ai/flows/ai-service-recommender';
import { toast } from '@/hooks/use-toast';

const BENEFITS = [
  { icon: Leaf, text: "Huiles Organiques", color: "text-emerald-500" },
  { icon: User, text: "Approche Personnalisée", color: "text-amber-500" },
  { icon: Coffee, text: "Cadre Discret", color: "text-slate-500" },
  { icon: Sparkles, text: "Excellence João", color: "text-indigo-500" }
];

const WELLNESS_TIPS = [
  { id: 1, title: "Accueillez vos émotions", text: "Un massage peut libérer des ressentis profonds. Laissez-les s'exprimer naturellement.", icon: Heart },
  { id: 2, title: "Prenez votre temps", text: "Restez allongé quelques minutes avant de vous relever doucement.", icon: Clock },
  { id: 3, title: "Hydratez-vous", text: "Buvez de l'eau à température ambiante pour aider à éliminer les toxines.", icon: Heart },
  { id: 4, title: "Évitez la douche immédiate", text: "Attendez environ une heure pour laisser les huiles et l'énergie agir.", icon: Sparkles },
  { id: 5, title: "Prolongez la détente", text: "Accordez-vous encore quelques instants de repos et respirez profondément.", icon: Wind },
  { id: 6, title: "Planifiez un prochain soin", text: "Pensez à réserver votre prochaine séance pour un bien-être durable.", icon: Calendar },
  { id: 7, title: "Choisissez la douceur", text: "Privilégiez des activités calmes pour prolonger la sensation de bien-être.", icon: Leaf },
];

export default function HomePage() {
  const { user } = useUser();
  const auth = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/5">
      <nav className="absolute top-0 left-0 right-0 z-[100] px-6 py-6 bg-transparent">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-baseline gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <span className="font-sans font-bold text-sm md:text-base tracking-[0.2em] text-primary uppercase">SERENITY RELAX</span>
            <span className="font-cursive text-[22px] text-muted-foreground tracking-normal whitespace-nowrap normal-case">by João</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/client/portal" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Espace Client</Link>
            <Link href="/therapist/dashboard" className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest text-primary shadow-sm hover:shadow-md transition-all border border-black/5">
              <LayoutDashboard size={12} /> Admin
            </Link>
            {user && !user.isAnonymous && (
              <button onClick={() => signOut(auth)} className="text-muted-foreground hover:text-destructive transition-colors">
                <LogOut size={16}/>
              </button>
            )}
          </div>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-primary">
            {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>

      <section className="relative min-h-[85vh] flex items-center pt-24 pb-16 md:pt-48 md:pb-32 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/50 backdrop-blur-sm border border-black/5 rounded-full mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              <span className="text-[9px] uppercase tracking-[0.3em] font-black text-muted-foreground">Genève Cointrin</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl leading-[1.1] font-serif font-medium text-primary mb-6 tracking-tighter">
              Massage sur <span className="italic">mesure.</span>
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
            
            <Link href="/booking" className="inline-flex items-center gap-3 bg-primary text-white h-14 px-10 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95">
              Réserver votre rituel <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 1.5 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="blob-shape relative aspect-square w-full max-w-[340px] md:max-w-[420px] shadow-2xl border-[6px] md:border-[8px] border-white/20">
              <Image 
                src="https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg" 
                alt="João" 
                fill
                className="object-cover grayscale-[10%] transition-all duration-1000"
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
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter mt-4">Techniques & <span className="italic font-normal">Expériences</span></h2>
          <p className="mt-8 text-muted-foreground font-normal max-w-2xl mx-auto leading-relaxed font-sans">
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
                <h3 className="text-lg md:text-xl font-serif text-white font-bold leading-tight mb-3">{service.name.split(' - ')[0]}</h3>
                <p className="text-[9px] text-white/80 font-bold uppercase tracking-widest font-sans">CHF {service.price} • {service.duration}</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/booking" className="inline-flex items-center gap-3 bg-primary text-white h-14 px-10 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95">
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
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter mb-6">7 conseils pour prolonger <br /> les bienfaits</h2>
            <p className="text-muted-foreground font-normal max-w-lg mx-auto leading-relaxed font-sans">
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
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-6">{tip.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed font-sans max-w-2xl">
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
              SERENITY RELAX <span className="font-cursive text-[28px] text-white/40 tracking-normal inline-block normal-case">by João</span>
            </h2>
            <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed max-w-xs font-sans">
              Un sanctuaire sensoriel confidentiel pour la restauration physique et mentale. Uniquement sur rendez-vous.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 md:gap-24">
            <div className="space-y-4">
              <h3 className="text-[9px] font-bold tracking-widest uppercase text-white/20">Alpha Business Center</h3>
              <p className="text-xs text-white/70 font-medium leading-relaxed font-sans">
                Chemin de Joinville 26,<br />
                4ème étage,<br />
                1216 Cointrin – Genève
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-[9px] font-bold tracking-widest uppercase text-white/20">Horaires</h3>
              <p className="text-xs text-white/70 font-medium leading-relaxed font-sans">
                Lun - Ven : 8h00 – 20h00<br />
                Sam - Dim : 9h30 – 20h00
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
