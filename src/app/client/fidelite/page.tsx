'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gift, Heart, Crown, Zap, ShieldCheck, ArrowLeft, Loader2, Sparkle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useFirestore, useUser } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const LEVELS = [
  { id: 'serenite', name: 'Sérénité', min: 0, icon: Heart, bonus: '5% de réduction' },
  { id: 'harmonie', name: 'Harmonie', min: 500, icon: Gift, bonus: '10% + priorité créneaux' },
  { id: 'equilibre', name: 'Équilibre', min: 1000, icon: Zap, bonus: '15% + 30 min offerte tous les 10 RDV' },
  { id: 'zen', name: 'Zen Master', min: 2000, icon: Crown, bonus: '20% + expériences exclusives' },
];

export default function CarteFidelite() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !user) {
      if (!isUserLoading) setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      doc(firestore, 'clients', user.uid),
      (clientDoc) => {
        if (clientDoc.exists()) {
          const data = clientDoc.data();
          setPoints(data.points || 0);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Fidelity fetch error:', err);
        setLoading(false);
      },
    );

    return unsub;
  }, [firestore, isUserLoading, user]);

  const currentLevelIndex = LEVELS.reduce((acc, level, index) => (points >= level.min ? index : acc), 0);
  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevel = LEVELS[currentLevelIndex + 1];
  const progress = nextLevel ? ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;

  if (loading) {
    return (
      <div className="landing-v2 flex min-h-screen items-center justify-center bg-[var(--off-white)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--teal-deep)]" />
      </div>
    );
  }

  return (
    <div className="landing-v2 min-h-screen pb-24" style={{ background: 'var(--landing-page-bg)' }}>
      <Navbar />

      <main className="mx-auto max-w-[1280px] px-6 pt-32 md:px-10 lg:px-12 lg:pt-40">
        <div className="mx-auto max-w-5xl space-y-10">
          <button
            onClick={() => router.push('/client/dashboard')}
            className="landing-type-caption inline-flex items-center gap-3 text-[var(--landing-muted)] transition-colors hover:text-[var(--teal-deep)]"
          >
            <ArrowLeft size={16} />
            Retour au dashboard
          </button>

          <header className="space-y-5">
            <div className="landing-pill landing-pill-soft landing-type-caption inline-flex gap-3 border text-[var(--landing-warm)]">
              <Trophy className="h-4 w-4 text-[var(--orange)]" />
              <span>Programme privilège</span>
            </div>
            <h1 className="landing-type-h1 landing-text-high display-tight max-w-[13ch]">
              Votre fidélité
              <br />
              <span className="landing-display-italic text-[var(--landing-muted)]">récompensée</span>
            </h1>
            <p className="landing-type-body landing-text-body max-w-2xl">
              Chaque instant passé au cabinet vous rapproche d&apos;avantages exclusifs et de soins d&apos;exception.
            </p>
          </header>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="landing-surface-card relative overflow-hidden rounded-[2.2rem] p-8 md:p-10"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[rgba(21,56,57,0.05)]" />

            <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="space-y-5">
                <div className="landing-pill landing-pill-soft landing-type-caption inline-flex gap-2 border text-[var(--landing-warm)]">
                  <ShieldCheck size={14} className="text-[var(--orange)]" />
                  <span>Souverain réseau privé</span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-[var(--landing-tint-fill)] text-[var(--teal-deep)]">
                    <currentLevel.icon className="h-9 w-9" />
                  </div>
                  <div>
                    <h2 className="landing-type-h3 landing-text-high">{currentLevel.name}</h2>
                    <p className="landing-type-caption landing-text-muted mt-2">Statut actuel</p>
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right">
                <div className="landing-type-h1 landing-text-high">{points}</div>
                <p className="landing-type-caption landing-text-muted mt-2">Points d&apos;éveil accumulés</p>
              </div>
            </div>

            <div className="relative z-10 mt-10 space-y-4">
              <div className="h-3 overflow-hidden rounded-full bg-[var(--landing-tint-fill)]">
                <motion.div
                  className="h-full rounded-full bg-[var(--teal-deep)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                />
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="landing-type-caption text-[var(--teal-deep)]">{currentLevel.name}</p>
                {nextLevel && (
                  <p className="landing-type-caption landing-text-muted">
                    Plus que <span className="text-[var(--teal-deep)]">{nextLevel.min - points} pts</span> avant{' '}
                    <span className="text-[var(--orange)]">{nextLevel.name}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="relative z-10 mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {LEVELS.map((level, index) => {
                const isCurrent = index === currentLevelIndex;
                const isUnlocked = index <= currentLevelIndex;
                return (
                  <div
                    key={level.id}
                    className={`rounded-[1.6rem] border p-6 transition-all ${
                      isCurrent
                        ? 'border-[var(--teal-deep)] bg-[var(--off-white)]'
                        : isUnlocked
                          ? 'border-[var(--landing-tint)] bg-[var(--landing-tint-fill)]'
                          : 'border-[var(--landing-tint)] bg-[rgba(255,255,255,0.45)] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <level.icon className={isUnlocked ? 'h-6 w-6 text-[var(--teal-deep)]' : 'h-6 w-6 text-[var(--landing-muted)]'} />
                      {isUnlocked && <Sparkle className="h-4 w-4 text-[var(--orange)]" />}
                    </div>
                    <h3 className="landing-type-h5 landing-text-high mt-5">{level.name}</h3>
                    <p className="landing-type-body-s landing-text-body mt-2">{level.bonus}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <section className="space-y-5">
            <h2 className="landing-type-h4 landing-text-high">Dernières acquisitions</h2>
            <div className="space-y-4">
              {[
                { date: '13 avril 2026', session: 'Massage Sensoriel Profond • 90 min', pts: '+120' },
                { date: '28 mars 2026', session: 'Rituel Énergétique Myofascial', pts: '+90' },
              ].map((item) => (
                <div key={`${item.date}-${item.pts}`} className="landing-surface-card rounded-[1.8rem] p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[var(--landing-tint-fill)] text-[var(--orange)]">
                        <Zap size={18} />
                      </div>
                      <div>
                        <p className="landing-type-caption text-[var(--landing-warm)]">{item.date}</p>
                        <p className="landing-type-body landing-text-high mt-1">{item.session}</p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="landing-type-h4 text-[var(--teal-deep)]">{item.pts}</p>
                      <p className="landing-type-caption landing-text-muted">points</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
