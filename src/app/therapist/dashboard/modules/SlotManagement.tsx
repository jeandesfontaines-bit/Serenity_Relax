'use client';
import React from 'react';
import { X, UserPlus, Lock, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface SlotManagementProps {
  date: string;
  time: string;
  isBlocked: boolean;
  onClose: () => void;
  onBook: () => void;
  onToggleBlock: () => void;
}

import { dashboardPanel, dashboardTitle, dashboardEyebrow } from './dashboardTheme';

export default function SlotManagement({
  date, time, isBlocked, onClose, onBook, onToggleBlock,
}: SlotManagementProps) {
  const d = new Date(date);

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <motion.div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className={`relative w-full sm:max-w-sm flex flex-col overflow-hidden ${dashboardPanel}`}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1 bg-black/10 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-8 py-7 border-b border-black/[0.05]">
          <div>
            <span className={`${dashboardEyebrow} mb-3`}>Créneau</span>
            <h2 className={dashboardTitle}>Gestion du créneau</h2>
            <div className="flex items-center gap-3 mt-2">
              <Clock size={12} className="text-primary/40" />
              <p className="font-sans text-[11px] text-foreground/50 tracking-[0.1em] capitalize">
                {format(d, 'EEEE d MMMM', { locale: fr })} · {time}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.03] text-foreground/40 hover:text-foreground transition-colors"
          >
            <X size={18} strokeWidth={1} />
          </button>
        </div>

        {/* Actions */}
        <div className="p-8 flex flex-col gap-4">
          {/* Book slot */}
          {!isBlocked ? (
            <button
              onClick={onBook}
              className="w-full flex items-center gap-4 p-5 rounded-[20px] bg-primary hover:bg-primary/90 transition-all duration-300 text-left group shadow-lg"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <UserPlus size={16} strokeWidth={1.5} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-sans font-medium text-white tracking-tight group-hover:pl-1 transition-all">Réserver une session</p>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mt-1">Nouveau ou ancien client</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-4 p-5 rounded-[20px] bg-black/[0.03] border border-black/[0.05]">
              <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center shrink-0">
                <Lock size={16} strokeWidth={1.5} className="text-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-sans font-medium text-foreground/60 tracking-tight">Créneau bloqué</p>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/40 mt-1">Non disponible à la réservation</p>
              </div>
            </div>
          )}

          {/* Block / unblock */}
          <button
            onClick={onToggleBlock}
            className={`w-full flex items-center gap-4 p-5 rounded-[20px] border transition-all duration-300 text-left group ${
              isBlocked
                ? 'bg-white/50 border-black/[0.05] hover:border-primary/30'
                : 'bg-white/50 border-black/[0.05] hover:border-primary/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0 ${
              isBlocked ? 'bg-white border-black/[0.05] group-hover:border-primary/50' : 'bg-white border-black/[0.05] group-hover:border-primary/50'
            }`}>
              {isBlocked
                ? <CheckCircle2 size={16} strokeWidth={1.5} className="text-foreground/50 group-hover:text-primary transition-colors" />
                : <Lock size={16} strokeWidth={1.5} className="text-foreground/50 group-hover:text-primary transition-colors" />}
            </div>
            <div>
              <p className="text-sm font-sans font-medium text-foreground tracking-tight group-hover:pl-1 transition-all">
                {isBlocked ? 'Libérer le créneau' : 'Bloquer le créneau'}
              </p>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/50 mt-1">
                {isBlocked ? 'Rendre à nouveau disponible' : 'Empêcher toute réservation'}
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          <div className="flex items-center justify-center gap-3 bg-primary/5 rounded-full border border-primary/20 border-dashed px-4 py-3">
            <Clock size={12} strokeWidth={1.5} className="text-primary/60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/60">Durée standard : 60 min</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
