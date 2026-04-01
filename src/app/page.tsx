'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Menu, X, Brain, Instagram, MessageCircle, LogOut, ArrowRight, Leaf, User, Coffee, Sparkles
} from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { SERVICES } from '@/lib/types';
import { recommendMassageService } from '@/ai/flows/ai-service-recommender';
import { toast } from '@/hooks/use-toast';

const BENEFITS = [
  { icon: Leaf, text: "Huiles Organiques", color: "text-emerald-500" },
  { icon: User, text: "Diagnostic Personnalisé", color: "text-amber-500" },
  { icon: Coffee, text: "Rituel Thé Cérémonial", color: "text-slate-500" },
  { icon: Sparkles, text: "Acoustique Zen", color: "text-indigo-500" }
];

export default function HomePage() {
  const { user } = useUser();
  const auth = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{recommendedServiceName: string, reasoning: string} | null>(null);

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

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/5">
      <nav className="fixed top-0 left-0 right-0 z-[100] px-8 py-6 bg-white/80 backdrop-blur-2xl border-b border-black/5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-baseline gap-2 cursor-pointer">
            <span className="font-sans font-bold text-lg tracking-[0.2em] text-primary uppercase">SERENITY RELAX</span>
            <span className="text-[12px] font-cursive lowercase text-muted-foreground tracking-normal whitespace-nowrap">by João</span>
          </div>
          
          <div className="hidden md:flex items-center gap-12">
            <Link href="/client/portal" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Espace Client</Link>
            <Link href="/therapist/dashboard" className="flex items-center gap-3 bg-white px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest text-primary shadow-sm hover:shadow-md transition-all border border-black/5">
              <LayoutDashboard size={14} /> Admin
            </Link>
            {user && !user.isAnonymous && (
              <button onClick={() => signOut(auth)} className="text-muted-foreground hover:text-destructive transition-colors">
                <LogOut size={18}/>
              </button>
            )}
          </div>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-primary">
            {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center pt-40 pb-40 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-sm border border-black/5 rounded-full mb-12">
              <div className="w-2 h-2 rounded-full bg-primary/20" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-black text-muted-foreground">Genève Cointrin</span>
            </div>
            
            <h1 className="text-7xl lg:text-8xl leading-[0.95] font-serif font-medium text-primary mb-12 tracking-tighter">
              L'éveil de la <br/>
              <span className="italic">plénitude.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-md italic mb-16">
              Un sanctuaire sensoriel confidentiel où le temps s'efface devant l'harmonie du corps et de l'esprit.
            </p>

            <div className="flex flex-wrap gap-4 mb-16">
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl text-[9px] font-bold uppercase tracking-widest text-muted-foreground shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-black/[0.02]">
                  <b.icon className={`${b.color} opacity-60`} size={14} />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
            
            <div className="max-w-md">
              <div className="bg-white p-3 rounded-[2rem] border border-black/5 flex gap-4 shadow-xl shadow-black/[0.02]">
                <div className="p-4 bg-background rounded-2xl text-primary"><Brain size={20}/></div>
                <input 
                  className="flex-1 bg-transparent border-none outline-none text-sm italic px-2"
                  placeholder="Dites-moi comment vous vous sentez..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                />
                <button 
                  onClick={handleAiRecommendation}
                  disabled={aiLoading}
                  className="high-end-button bg-primary text-white"
                >
                  {aiLoading ? '...' : 'Conseil IA'}
                </button>
              </div>
              
              <AnimatePresence>
                {aiResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-6 p-8 bg-white rounded-3xl shadow-xl border border-black/5">
                    <p className="text-sm text-muted-foreground leading-relaxed italic">"{aiResult.reasoning}"</p>
                    <Link 
                      href="/booking"
                      className="mt-6 text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-3 hover:translate-x-2 transition-transform"
                    >
                      Réserver le soin recommandé <ArrowRight size={14}/>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1.5 }}
            className="relative flex justify-center"
          >
            <div className="aspect-[4/5.5] w-full max-w-[420px] rounded-[5rem] overflow-hidden shadow-[0_80px_120px_-20px_rgba(0,0,0,0.08)] border-[12px] border-white group relative">
              <Image 
                src="https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg" 
                alt="João" 
                fill
                className="object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-40" />
              <div className="absolute bottom-10 left-10">
                <div className="bg-white/90 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-2xl border border-white/40">
                  <span className="text-base font-bold uppercase tracking-[0.3em] block text-primary">João</span>
                  <span className="text-[8px] text-muted-foreground block tracking-[0.5em] uppercase font-black mt-1 opacity-80">Praticien ASCA</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-40 bg-white">
        <div className="max-w-6xl mx-auto px-8 mb-24">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-0.5 w-12 bg-primary"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Le Catalogue</span>
          </div>
          <h2 className="font-serif text-5xl font-medium tracking-tighter">Nos Soins <span className="italic font-normal">Holistiques</span></h2>
        </div>
        
        <div className="flex gap-12 overflow-x-auto scrollbar-hide snap-x px-8 max-w-6xl mx-auto pb-20">
          {SERVICES.map((service, i) => (
            <Link 
              key={service.id}
              href={`/booking?serviceId=${service.id}`}
              className="flex-shrink-0 w-[80vw] sm:w-[320px] snap-center relative aspect-[3/4.2] rounded-[4rem] overflow-hidden group shadow-2xl transition-all hover:scale-[1.02]"
            >
              <Image src={`https://picsum.photos/seed/${service.id}/800/1000`} fill className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" alt={service.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
              <div className="absolute bottom-12 left-10 right-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3 block opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">Therapy 0{i+1}</span>
                <h3 className="text-2xl font-serif text-white font-bold leading-tight mb-4">{service.name.split(' - ')[0]}</h3>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest">CHF {service.price} • {service.duration}</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/booking" className="inline-flex items-center gap-4 bg-primary text-white h-16 px-12 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-2xl hover:bg-black transition-all">
            Explorer tous les rituels <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="py-24 px-8 bg-primary text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="flex items-baseline gap-4">
            <h2 className="font-sans text-2xl font-bold tracking-[0.2em] uppercase leading-none">
              SERENITY RELAX <span className="font-cursive lowercase text-xl text-white/40 tracking-normal inline-block">by João</span>
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-16 text-center md:text-left">
            <div className="space-y-2">
              <h3 className="text-[9px] font-bold tracking-widest uppercase text-white/20">Localisation</h3>
              <p className="text-xs text-white/70 font-medium">Chemin de Joinville 26, 1216 Cointrin</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-[9px] font-bold tracking-widest uppercase text-white/20">RCC ID</h3>
              <p className="text-xs text-[#FACC15] font-bold tracking-widest">Z123456</p>
            </div>
          </div>
          
          <div className="flex gap-8 text-white/40">
            <Instagram size={20} className="hover:text-white cursor-pointer transition-colors" />
            <MessageCircle size={20} className="hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}