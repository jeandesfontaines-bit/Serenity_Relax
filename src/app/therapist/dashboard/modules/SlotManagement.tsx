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
        className="dashboard-panel-lg relative flex w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] shadow-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 100 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex flex-col items-center space-y-6 px-12 pb-8 pt-12 text-center">
           <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl">
              <Clock size={32} strokeWidth={2.5} />
           </div>
           <div>
              <p className="dashboard-table-header-cell mb-2">Gestion du créneau</p>
              <h2 className="dashboard-title-lg leading-none">{time}</h2>
              <p className="dashboard-meta mt-4">
                 {format(d, 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
           </div>
           <button
            onClick={onClose}
            className="absolute right-8 top-8 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all"
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
              className="group flex w-full items-center justify-between rounded-[1.75rem] bg-primary p-8 text-white shadow-2xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <UserPlus size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className="dashboard-section-title-lg leading-none text-white">Réserver</p>
                  <p className="dashboard-meta mt-2 text-white/40">Nouvelle séance</p>
                </div>
              </div>
              <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
            </button>
          ) : (
            <div className="flex w-full cursor-not-allowed items-center gap-6 rounded-[1.75rem] border border-border bg-secondary/40 p-8 text-muted-foreground grayscale opacity-50">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-background shadow-inner">
                <Lock size={24} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="dashboard-section-title-lg leading-none text-muted-foreground">Indisponible</p>
                <p className="dashboard-meta mt-2">Créneau bloqué</p>
              </div>
            </div>
          )}

          {/* Secondary Action: Toggle Block */}
          <button
            onClick={onToggleBlock}
            className={`group flex w-full items-center justify-between rounded-[1.75rem] border-2 p-8 transition-all ${
              isBlocked
                ? 'bg-emerald-500 text-white border-transparent'
                : 'border-border bg-background text-foreground'
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
                <p className={`dashboard-section-title-lg leading-none ${isBlocked ? 'text-white' : 'text-foreground'}`}>
                  {isBlocked ? 'Libérer' : 'Bloquer'}
                </p>
                <p className={`dashboard-meta mt-2 ${isBlocked ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {isBlocked ? 'Rendre disponible' : 'Désactiver le créneau'}
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="px-10 pb-10">
          <div className="flex items-center justify-center gap-4 border-t border-border py-6">
            <ShieldCheck size={16} strokeWidth={2.5} className="text-muted-foreground" />
            <span className="dashboard-table-header-cell text-muted-foreground">Sécurisé · 60 minutes</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
