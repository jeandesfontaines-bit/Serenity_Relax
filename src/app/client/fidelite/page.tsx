'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift, Heart, Trophy, Crown, Zap, ChevronRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const LEVELS = [
  { id: 'serenite', name: 'Sérénité', min: 0, color: '#5F27CD', icon: Heart, bonus: '5% de réduction' },
  { id: 'harmonie', name: 'Harmonie', min: 500, color: '#0ABDE3', icon: Gift, bonus: '10% + priorité créneaux' },
  { id: 'equilibre', name: 'Équilibre', min: 1000, color: '#1DD1A1', icon: Zap, bonus: '15% + 30 min offerte tous les 10 RDV' },
  { id: 'zen', name: 'Zen Master', min: 2000, color: '#FF9F43', icon: Crown, bonus: '20% + expériences exclusives' },
];

export default function CarteFidelite() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [points, setPoints] = useState(0);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!firestore || !user) return;
    const unsub = onSnapshot(doc(firestore, 'clients', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setPoints(data.points || 0);
        setClientData(data);
      }
      setLoading(false);
    });
    return unsub;
  }, [firestore, user]);

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#F8F5F0] to-white pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          
          {/* ── HEADER IMPACT LUXE ── */}
          <motion.header 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center mb-16 lg:mb-24"
          >
            <div className="inline-flex items-center gap-4 bg-white/70 backdrop-blur-3xl px-8 py-5 rounded-[2rem] mb-8 border border-white/60 shadow-xl shadow-indigo-100/20">
              <Trophy className="w-8 h-8 text-[#5F27CD]" />
              <span className="font-black uppercase tracking-[0.4em] text-[#5F27CD] text-[0.65rem]">Programme Privilège Professionnel</span>
            </div>
            <h1 className="title-luxe text-6xl md:text-8xl leading-none">Votre Voyage Sensoriel Récompensé</h1>
            <p className="text-xl md:text-3xl text-gray-500 font-serif italic mt-6">Vers un équilibre absolu, récompensé avec élégance.</p>
          </motion.header>

          {/* ── CARTE DE FIDÉLITÉ SENSORIELLE ── */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="dash-card relative p-10 lg:p-16 overflow-hidden border border-white/80"
          >
            {/* Liquid Background Pulse */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#5F27CD]/5 via-[#0ABDE3]/5 to-transparent blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
              <div className="w-full md:w-auto">
                <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-2">
                   <ShieldCheck size={12} className="text-[#1DD1A1]" />
                   Souverain Réseau Privé
                </p>
                <div className="flex items-center gap-6 mt-3">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-white text-white flex items-center justify-center shadow-2xl overflow-hidden relative">
                     <div className="absolute inset-0 opacity-20" style={{ backgroundColor: currentLevel.color }} />
                     <currentLevel.icon className="w-10 h-10 relative z-10" style={{ color: currentLevel.color }} />
                  </div>
                  <div>
                    <h2 className="text-5xl lg:text-6xl font-serif font-light leading-none" style={{ color: currentLevel.color }}>
                      {currentLevel.name}
                    </h2>
                    <p className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mt-2 italic">Status Actuel de Présence</p>
                  </div>
                </div>
              </div>

              <div className="text-right w-full md:w-auto space-y-2">
                <div className="text-8xl lg:text-9xl font-light text-[#222F3E] tracking-tighter leading-none">{points}</div>
                <p className="text-[0.6rem] font-black uppercase text-gray-400 tracking-[0.3em]">Points d&apos;Éveil Accumulés</p>
              </div>
            </div>

            {/* PROGRESS BAR SENSORIELLE */}
            <div className="mt-20 relative">
              <div className="h-4 bg-white/40 rounded-3xl overflow-hidden backdrop-blur-sm border border-white/20">
                <motion.div
                  className="h-full rounded-3xl relative shadow-[0_0_20px_rgba(95,39,205,0.3)]"
                  style={{ background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel?.color || '#1DD1A1'})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 2.5, ease: "circOut" }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>

              <div className="flex justify-between items-center text-[0.65rem] mt-6 font-black uppercase tracking-widest">
                <span style={{ color: currentLevel.color }}>Région {currentLevel.name}</span>
                {nextLevel && (
                  <span className="text-gray-400">
                    Plus que <span className="text-[#222F3E]">{nextLevel.min - points} pts</span> avant le palier <span style={{ color: nextLevel.color }}>{nextLevel.name}</span>
                  </span>
                )}
              </div>
            </div>

            {/* GRILLE DES NIVEAUX IMPACT */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {LEVELS.map((level, i) => {
                const isCurrent = i === currentLevelIndex;
                const isUnlocked = i <= currentLevelIndex;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className={`glass p-8 rounded-[3rem] transition-all duration-500 relative group overflow-hidden ${
                      isCurrent ? 'ring-4 ring-offset-8 ring-[#1DD1A1]/30 border-transparent shadow-2xl' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    {isUnlocked && <div className="absolute top-4 right-4 text-[#1DD1A1]"><Sparkles size={14} /></div>}
                    <level.icon className="w-10 h-10 mx-auto mb-6 transition-transform group-hover:scale-110" style={{ color: level.color }} />
                    <p className="text-center font-serif text-xl font-medium text-[#222F3E]">{level.name}</p>
                    <p className="text-center text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest mt-3 leading-relaxed">
                      {level.bonus}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* CONFETTI IMPACT */}
            <AnimatePresence>
              {showConfetti && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none flex items-center justify-center"
                >
                   <div className="text-7xl">✨🎉✨</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── HISTORIQUE D&apos;ÉVEIL ── */}
          <div className="mt-24 lg:mt-32">
            <h2 className="text-3xl font-serif font-light mb-12 flex items-center gap-4 text-[#222F3E]">
              <Sparkles className="w-8 h-8 text-[#5F27CD]" /> 
              Dernières Acquisitions
            </h2>
            <div className="space-y-6">
              {[
                { date: '13 avril 2026', session: 'Massage Sensoriel Profond • 90 min', pts: '+120' },
                { date: '28 mars 2026', session: 'Rituel Énergétique Myofascial', pts: '+90' },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="dash-card p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group"
                >
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#5F27CD] group-hover:text-white transition-all">
                        <Zap size={20} />
                     </div>
                     <div>
                        <p className="text-[0.65rem] font-black uppercase tracking-widest text-[#5F27CD] mb-1">{item.date}</p>
                        <p className="text-xl font-serif font-medium text-[#222F3E]">{item.session}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-5xl font-light text-[#1DD1A1] tracking-tighter">{item.pts}</span>
                     <span className="text-[0.6rem] font-black text-gray-300 uppercase tracking-widest">points</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
