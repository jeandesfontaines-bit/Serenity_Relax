
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
    <div className="flex flex-col min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-5 bg-white/80 backdrop-blur-2xl border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer">
            <div className="flex -space-x-1.5">
              {['#FACC15', '#A78BFA', '#34D399'].map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{backgroundColor: c}}></div>
              ))}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-sans font-black text-xl tracking-[0.2em] text-slate-950 uppercase">SERENITY RELAX</span>
              <span className="text-[12px] font-cursive lowercase text-slate-400 tracking-normal whitespace-nowrap">by João</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/client/portal" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-black transition-all">Espace Client</Link>
            <Link href="/therapist/dashboard" className="flex items-center gap-2 bg-slate-100 text-slate-400 px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all">
              <LayoutDashboard size={14} /> Admin
            </Link>
            {user && !user.isAnonymous && (
              <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <LogOut size={18}/>
              </button>
            )}
          </div>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-950">
            {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </nav>

      <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-[35rem] h-[35rem] bg-emerald-100/10 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-[15%] right-[15%] w-[30rem] h-[30rem] bg-amber-50/30 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-6s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2 }}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/50 backdrop-blur-sm border border-slate-200/30 rounded-full shadow-sm mb-10">
              <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-black text-slate-500">Genève Cointrin</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] font-medium text-slate-950 mb-10 tracking-tight font-serif">
              L'éveil de la <br/>
              <span className="italic font-serif text-emerald-800 relative">plénitude.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed max-w-md font-serif italic mb-12">
              Un sanctuaire sensoriel confidentiel où le temps s'efface devant l'harmonie.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-100 rounded-xl text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all cursor-default shadow-sm">
                  <b.icon className={`${b.color} opacity-60`} size={12} />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
            
            <div className="max-w-md mt-12">
              <div className="bg-slate-50 p-2 rounded-3xl border border-slate-100 flex gap-3 shadow-inner">
                <div className="p-3 bg-white rounded-2xl text-indigo-500 shadow-sm"><Brain size={18}/></div>
                <input 
                  className="flex-1 bg-transparent border-none outline-none text-sm italic font-serif px-2"
                  placeholder="Dites-moi comment vous vous sentez..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                />
                <button 
                  onClick={handleAiRecommendation}
                  disabled={aiLoading}
                  className="px-5 bg-black text-white rounded-2xl text-[9px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-slate-800"
                >
                  {aiLoading ? '...' : 'Conseil IA'}
                </button>
              </div>
              
              <AnimatePresence>
                {aiResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-xs text-indigo-900 leading-relaxed font-serif italic">"{aiResult.reasoning}"</p>
                    <Link 
                      href="/booking"
                      className="mt-3 text-[9px] font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-2 hover:translate-x-1 transition-transform"
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
            className="relative flex justify-center"
          >
            <div className="aspect-[4/5.2] w-full max-w-[340px] mx-auto rounded-[4rem] overflow-hidden shadow-[0_60px_100px_-30px_rgba(0,0,0,0.1)] border-[8px] border-white group relative">
              <Image 
                src="https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg" 
                alt="João" 
                fill
                className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-40" />
              <div className="absolute bottom-6 left-6">
                <div className="bg-white/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl border border-white/20">
                  <span className="text-sm font-bold uppercase tracking-[0.3em] block text-slate-950">João</span>
                  <span className="text-[7px] text-slate-400 block tracking-[0.5em] uppercase font-black mt-0.5 opacity-80">Praticien</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-0.5 w-8 bg-slate-950"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Le Catalogue</span>
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight">Nos Soins <span className="italic font-normal">Holistiques</span></h2>
        </div>
        
        <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x px-6 pb-12">
          {SERVICES.slice(0, 6).map((service, i) => (
            <Link 
              key={service.id}
              href={`/booking?serviceId=${service.id}`}
              className="flex-shrink-0 w-[75vw] sm:w-[280px] snap-center relative aspect-[3/4] rounded-[3rem] overflow-hidden group shadow-lg"
            >
              <Image src={`https://picsum.photos/seed/${service.id}/600/800`} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" alt={service.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2 block opacity-0 group-hover:opacity-100 transition-all">Therapy 0{i+1}</span>
                <h3 className="text-xl font-serif text-white font-bold leading-tight">{service.name.split(' - ')[0]}</h3>
                <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest mt-2">CHF {service.price} • {service.duration}</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/booking" className="inline-flex items-center gap-2 bg-slate-950 text-white px-10 py-5 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">
            Voir tous les soins <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <footer className="py-12 px-6 bg-[#121212] text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-baseline gap-3">
            <h2 className="font-sans text-xl font-black tracking-[0.2em] text-white uppercase leading-none">
              SERENITY RELAX <span className="font-cursive lowercase text-lg text-white/40 tracking-normal inline-block">by João</span>
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-8 text-center md:text-left">
            <div className="space-y-1">
              <h3 className="text-[8px] font-bold tracking-widest uppercase text-white/20">Localisation</h3>
              <p className="text-[10px] text-white/70 font-medium">Chemin de Joinville 26, 1216 Cointrin</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-[8px] font-bold tracking-widest uppercase text-white/20">RCC ID</h3>
              <p className="text-[10px] text-[#FACC15] font-bold tracking-widest">Z123456</p>
            </div>
          </div>
          
          <div className="flex gap-6 text-white/40">
            <Instagram size={18} className="hover:text-white cursor-pointer transition-colors" />
            <MessageCircle size={18} className="hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
