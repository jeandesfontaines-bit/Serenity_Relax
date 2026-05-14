'use client';
import React from 'react';
import { X, UserPlus, Lock, Clock, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface SlotManagementProps {
  date: string;
  time: string;
  isBlocked: boolean;
  onClose: () => void;
  onBook: () => void;
  onToggleBlock: () => void;
}

export default function SlotManagement({
  date, time, isBlocked, onClose, onBook, onToggleBlock,
}: SlotManagementProps) {
  const d = new Date(date);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <motion.div
        className="absolute inset-0 backdrop-blur-xl" style={{ background: "hsl(var(--primary) / 0.6)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-md rounded-[4rem] shadow-2xl overflow-hidden flex flex-col border" style={{ background: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 100 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="px-12 pt-12 pb-8 flex flex-col items-center text-center space-y-6">
           <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl rotate-3" style={{ background: "hsl(var(--primary))" }}>
              <Clock size={32} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] mb-2 leading-none" style={{ color: "hsl(var(--muted-foreground))" }}>GESTION DU CRÉNEAU</p>
              <h2 className="text-4xl font-bold tracking-tighter leading-none" style={{ color: "hsl(var(--foreground))" }}>{time}</h2>
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] mt-4 leading-none" style={{ color: "hsl(var(--muted-foreground))" }}>
                 {format(d, 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
           </div>
           <button
            onClick={onClose}
            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full transition-all" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Actions */}
        <div className="px-10 pb-12 space-y-6">
          {/* Main Action: Book */}
          {!isBlocked ? (
            <button
              onClick={onBook}
              className="w-full flex items-center justify-between p-8 rounded-[3rem] text-white shadow-2xl group hover:-translate-y-1 transition-all" style={{ background: "hsl(var(--primary))" }}
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <UserPlus size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold tracking-tighter leading-none">Réserver</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mt-2">Nouvelle séance</p>
                </div>
              </div>
              <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
            </button>
          ) : (
            <div className="w-full flex items-center gap-6 p-8 rounded-[3rem] border grayscale opacity-50 cursor-not-allowed" style={{ background: "hsl(var(--secondary))", borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
              <div className="w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner" style={{ background: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}>
                <Lock size={24} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold tracking-tighter leading-none">Indisponible</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Créneau bloqué</p>
              </div>
            </div>
          )}

          {/* Secondary Action: Toggle Block */}
          <button
            onClick={onToggleBlock}
            className={`w-full flex items-center justify-between p-8 rounded-[3rem] border-2 transition-all group ${
              isBlocked
                ? 'bg-emerald-500 text-white border-transparent'
                : 'bg-transparent text-inherit border'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-all ${
                isBlocked ? 'bg-white/20 text-white' : ''
              }`}>
                {isBlocked
                  ? <CheckCircle2 size={24} strokeWidth={2.5} />
                  : <Lock size={24} strokeWidth={2.5} />}
              </div>
              <div className="text-left">
                <p className="text-xl font-bold tracking-tighter leading-none">
                  {isBlocked ? 'Libérer' : 'Bloquer'}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2" style={{ color: isBlocked ? 'white/60' : 'hsl(var(--muted-foreground))' }}>
                  {isBlocked ? 'Rendre disponible' : 'Désactiver le créneau'}
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="px-10 pb-10">
          <div className="flex items-center justify-center gap-4 py-6 border-t" style={{ borderColor: "hsl(var(--border))" }}>
            <ShieldCheck size={16} strokeWidth={2.5} style={{ color: "hsl(var(--muted-foreground))" }} />
            <span className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "hsl(var(--muted-foreground))" }}>Sécurisé · 60 minutes</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
