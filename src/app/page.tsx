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
  { id: 3, title: "Hydratez-vous", text: "Buvez de l'eau à température ambiante pour aider à éliminer les toxines.", icon: Droplets },
  { id: 4, title: "Évitez la douche immédiate", text: "Attendez environ une heure pour laisser les huiles et l'énergie agir.", icon: Sparkles },
  { id: 5, title: "Prolongez la détente", text: "Accordez-vous encore quelques instants de repos et respirez profondément.", icon: Wind },
  { id: 6, title: "Planifiez un prochain soin", text: "Pensez à réserver votre prochaine séance pour un bien-être durable.", icon: Calendar },
  { id: 7, title: "Choisissez la douceur", text: "Privilégiez des activités calmes pour prolonger la sensation de bien-être.", icon: Leaf },
];

export default function HomePage() {
  const { user } = useUser();
  const auth = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{recommendedServiceName: string, reasoning: string} | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAiRecommendation = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const result = await recommendMassageService({
        clientDescription: aiQuery,
        serviceCatalog: SERVICES.map(s => ({
          name: s.name,
          description: s.description,
          duration: s.duration,
          price: `CHF ${s.price}`
        }))
      });
      setAiResult(result);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur IA', description: 'Impossible de joindre le conseiller.' });
    } finally {
      setAiLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/5">
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 bg-white/80 backdrop-blur-2xl border-b border-black/5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-baseline gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <span className="font-sans font-bold text-sm md:text-base tracking-[0.2em] text-primary uppercase">SERENITY RELAX</span>
            <span className="hidden sm:inline-block text-[10px] font-cursive lowercase text-muted-foreground tracking-normal whitespace-nowrap">by João</span>
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

      <section className="relative min-h-[85vh] flex items-center pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-20">
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
            
            <div className="max-w-md">
              <div className="bg-white p-1.5 md:p-2 rounded-[2rem] border border-black/5 flex gap-2 md:gap-3 shadow-lg">
                <div className="hidden sm:flex p-3 bg-background rounded-2xl text-primary items-center justify-center"><Brain size={18}/></div>
                <input 
                  className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm px-2"
                  placeholder="Comment vous sentez-vous ?"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                />
                <button 
                  onClick={handleAiRecommendation}
                  disabled={aiLoading}
                  className="high-end-button bg-primary text-white !h-12 !px-6"
                >
                  {aiLoading ? '...' : 'Conseil IA'}
                </button>
              </div>
              
              <AnimatePresence>
                {aiResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-4 p-5 bg-white rounded-[2rem] shadow-xl border border-black/5">
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">"{aiResult.reasoning}"</p>
                    <Link 
                      href="/booking"
                      className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:translate-x-1 transition-transform"
                    >
                      Réserver le soin recommandé <ArrowRight size={12}/>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1.5 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="aspect-[4/5] w-full max-w-[340px] md:max-w-[380px] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-[6px] md:border-[8px] border-white group relative">
              <Image 
                src="https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg" 
                alt="João" 
                fill
                className="object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-40" />
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
                <div className="bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl border border-white/40">
                  <span className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] block text-primary">João</span>
                  <span className="text-[8px] text-muted-foreground block tracking-[0.3em] uppercase font-black mt-1 opacity-80">Praticien ASCA</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-0.5 w-10 bg-primary"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">L'Art du Toucher</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-medium tracking-tighter">Techniques & <span className="italic font-normal">Expériences</span></h2>
          <p className="mt-6 text-muted-foreground font-normal max-w-2xl leading-relaxed">
            Une approche professionnelle, attentive et respectueuse. Vous restez couvert selon vos préférences, dans le respect total de votre confort et de votre intimité.
          </p>
        </div>
        
        <div className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide snap-x px-6 max-w-6xl mx-auto pb-12">
          {SERVICES.map((service, i) => (
            <Link 
              key={service.id}
              href={`/booking?serviceId=${service.id}`}
              className="flex-shrink-0 w-[75vw] sm:w-[260px] md:w-[280px] snap-center relative aspect-[3/4] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden group shadow-xl transition-all hover:scale-[1.01]"
            >
              <Image src={`https://picsum.photos/seed/${service.id}/800/1000`} fill className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" alt={service.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
              <div className="absolute bottom-8 left-6 right-6 md:bottom-10 md:left-8 md:right-8">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-2 block opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-700">Expérience 0{i+1}</span>
                <h3 className="text-lg md:text-xl font-serif text-white font-bold leading-tight mb-3">{service.name.split(' - ')[0]}</h3>
                <p className="text-[9px] text-white/80 font-bold uppercase tracking-widest">CHF {service.price} • {service.duration}</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/booking" className="inline-flex items-center gap-3 bg-primary text-white h-14 px-10 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">
            Réserver votre rituel <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="py-32 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full mb-6 border border-black/[0.03] shadow-sm">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Conseils Bien-être</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tighter mb-6">7 conseils pour prolonger <br /> les bienfaits</h2>
            <p className="text-muted-foreground font-normal max-w-lg mx-auto leading-relaxed">
              Quelques gestes essentiels pour accueillir pleinement les effets de votre soin dans les heures qui suivent.
            </p>
          </div>

          <div className="space-y-20">
            {WELLNESS_TIPS.map((tip, index) => (
              <div key={tip.id} className={`flex flex-col md:flex-row gap-8 items-start ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 space-y-5">
                  <div className="flex items-center gap-6">
                    <span className="text-6xl font-serif text-primary/10 font-bold italic select-none">{tip.id}</span>
                    <div className="h-px bg-primary/10 flex-1 hidden md:block"></div>
                    <h3 className="text-2xl font-serif font-bold text-primary">{tip.title}</h3>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed md:pl-20">
                    {tip.text}
                  </p>
                </div>
                <div className="hidden md:flex w-20 h-20 rounded-full bg-white items-center justify-center shadow-sm border border-black/[0.02] shrink-0 mt-2">
                  <tip.icon className="h-6 w-6 text-primary/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 md:py-20 px-6 bg-primary text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 md:gap-12">
          <div className="flex items-baseline gap-3 text-center md:text-left">
            <h2 className="font-sans text-lg md:text-xl font-bold tracking-[0.2em] uppercase leading-none">
              SERENITY RELAX <span className="font-cursive lowercase text-base md:text-lg text-white/40 tracking-normal inline-block">by João</span>
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
            <div className="space-y-1">
              <h3 className="text-[9px] font-bold tracking-widest uppercase text-white/20">Alpha Business Center</h3>
              <p className="text-[10px] md:text-xs text-white/70 font-medium">Chemin de Joinville 26, 4ème étage, 1216 Cointrin</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-[9px] font-bold tracking-widest uppercase text-white/20">RCC ID</h3>
              <p className="text-[10px] md:text-xs text-[#FACC15] font-bold tracking-widest">Z123456</p>
            </div>
          </div>
          
          <div className="flex gap-6 text-white/40">
            <a href="https://instagram.com/serenity.relax.therapy_by_joao" target="_blank" rel="noopener noreferrer">
              <Instagram size={18} className="hover:text-white cursor-pointer transition-colors" />
            </a>
            <MessageCircle size={18} className="hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
