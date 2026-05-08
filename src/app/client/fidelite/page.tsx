'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle, Gift, Heart, Trophy, Crown, Zap, ChevronRight, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useFirestore, useUser } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const LEVELS = [
  { id: 'serenite', name: 'Sérénité', min: 0, color: 'text-primary', bg: 'bg-primary/5', icon: Heart, bonus: '5% de réduction' },
  { id: 'harmonie', name: 'Harmonie', min: 500, color: 'text-secondary', bg: 'bg-secondary/5', icon: Gift, bonus: '10% + priorité créneaux' },
  { id: 'equilibre', name: 'Équilibre', min: 1000, color: 'text-primary', bg: 'bg-primary/5', icon: Zap, bonus: '15% + 30 min offerte tous les 10 RDV' },
  { id: 'zen', name: 'Zen Master', min: 2000, color: 'text-secondary', bg: 'bg-secondary/5', icon: Crown, bonus: '20% + expériences exclusives' },
];

export default function CarteFidelite() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [points, setPoints] = useState(0);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!firestore || !user) {
      if (!isUserLoading) setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(firestore, 'clients', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setPoints(data.points || 0);
        setClientData(data);
      }
      setLoading(false);
    }, (err) => {
      console.error("Fidelity fetch error:", err);
      setLoading(false);
    });
    return unsub;
  }, [firestore, user, isUserLoading]);

  // Recherche du niveau actuel et suivant
  const currentLevelIndex = LEVELS.reduce((acc, level, index) => {
    if (points >= level.min) return index;
    return acc;
  }, 0);
  
  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevel = LEVELS[currentLevelIndex + 1];
  
  const progress = nextLevel 
    ? ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 
    : 100;

  useEffect(() => {
    if (progress >= 100 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [progress, showConfetti]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-6 pt-32 lg:px-8 lg:pt-40">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <button 
            onClick={() => router.push('/client/dashboard')} 
            className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> 
            Retour au Dashboard
          </button>

          <header className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Programme Privilège</span>
            </div>
            <h1 className="text-5xl font-serif leading-tight text-foreground md:text-8xl">
              Votre Fidélité <span className="italic opacity-40 font-serif">Récompensée.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-sans max-w-xl leading-relaxed">
              Chaque instant passé dans notre sanctuaire vous rapproche d&apos;avantages exclusifs et de soins d&apos;exception.
            </p>
          </header>

          {/* FIDELITY CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-premium relative p-10 lg:p-16 overflow-hidden border-primary/10 group"
          >
            {/* Background element */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-1000" />

            <div className="flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
              <div className="w-full md:w-auto space-y-8">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                    <ShieldCheck size={12} />
                    Souverain Réseau Privé
                  </div>
                  <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-3xl ${currentLevel.bg} ${currentLevel.color} flex items-center justify-center shadow-sm border border-current/10`}>
                       <currentLevel.icon className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className={`text-5xl lg:text-6xl font-serif leading-none ${currentLevel.color}`}>
                        {currentLevel.name}
                      </h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-2">Status de Présence</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right w-full md:w-auto">
                <div className="text-8xl lg:text-9xl font-light text-foreground tracking-tighter leading-none">{points}</div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-[0.3em] mt-2">Points d&apos;Éveil Accumulés</p>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="mt-20 relative">
              <div className="h-2 bg-muted/20 rounded-full overflow-hidden border border-border/50">
                <motion.div
                  className="h-full bg-primary relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 2, ease: "circOut" }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>

              <div className="flex justify-between items-center text-[10px] mt-6 font-bold uppercase tracking-widest">
                <span className={currentLevel.color}>{currentLevel.name}</span>
                {nextLevel && (
                  <span className="text-muted-foreground/60">
                    Plus que <span className="text-foreground">{nextLevel.min - points} pts</span> avant <span className="text-primary">{nextLevel.name}</span>
                  </span>
                )}
              </div>
            </div>

            {/* LEVELS GRID */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {LEVELS.map((level, i) => {
                const isCurrent = i === currentLevelIndex;
                const isUnlocked = i <= currentLevelIndex;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className={`p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden ${
                      isCurrent 
                        ? 'bg-background border-primary/30 shadow-xl' 
                        : isUnlocked 
                          ? 'bg-background/50 border-border/50 opacity-80' 
                          : 'bg-muted/5 border-border/20 opacity-40'
                    }`}
                  >
                    {isUnlocked && <div className="absolute top-6 right-6 text-emerald-500"><Sparkle size={14} /></div>}
                    <level.icon className={`w-10 h-10 mx-auto mb-6 ${isUnlocked ? level.color : 'text-muted-foreground/20'}`} />
                    <p className="text-center font-serif text-xl text-foreground">{level.name}</p>
                    <p className="text-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-3 leading-relaxed">
                      {level.bonus}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* CONFETTI */}
            <AnimatePresence>
              {showConfetti && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none flex items-center justify-center z-50"
                >
                   <div className="text-7xl">✨🎉✨</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* HISTORY */}
          <section className="space-y-12">
            <h2 className="text-3xl font-serif font-light flex items-center gap-4 text-foreground">
              <Sparkle className="w-8 h-8 text-primary" /> 
              Dernières Acquisitions
            </h2>
            <div className="space-y-4">
              {[
                { date: '13 avril 2026', session: 'Massage Sensoriel Profond • 90 min', pts: '+120' },
                { date: '28 mars 2026', session: 'Rituel Énergétique Myofascial', pts: '+90' },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-premium p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-muted/10 flex items-center justify-center text-muted-foreground/40 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                        <Zap size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">{item.date}</p>
                        <p className="text-xl font-serif text-foreground">{item.session}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-5xl font-light text-primary tracking-tighter">{item.pts}</span>
                     <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">points</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
