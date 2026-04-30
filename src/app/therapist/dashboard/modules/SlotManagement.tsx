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

export default function SlotManagement({
  date, time, isBlocked, onClose, onBook, onToggleBlock,
}: SlotManagementProps) {
  const d = new Date(date);

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <motion.div
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full sm:max-w-sm bg-[#faf9f7] border border-zinc-200 overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-zinc-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-6 border-b border-zinc-100">
          <div>
            <p className="font-serif text-[8px] tracking-[0.5em] text-zinc-400 uppercase mb-1">Créneau</p>
            <h2 className="font-serif text-base tracking-tighter text-zinc-900 uppercase">Gestion du créneau</h2>
            <p className="font-serif text-[10px] text-zinc-400 tracking-[0.2em] uppercase mt-1 capitalize">
              {format(d, 'EEEE d MMMM', { locale: fr })} · {time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center border border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all duration-300"
          >
            <X size={16} strokeWidth={1} />
          </button>
        </div>

        {/* Actions */}
        <div className="p-7 flex flex-col gap-3">
          {/* Book slot */}
          {!isBlocked ? (
            <button
              onClick={onBook}
              className="w-full flex items-center gap-4 p-5 bg-zinc-900 hover:bg-zinc-700 transition-all duration-500 text-left group"
            >
              <div className="w-10 h-10 bg-white/10 flex items-center justify-center shrink-0">
                <UserPlus size={18} strokeWidth={1.5} className="text-white" />
              </div>
              <div>
                <p className="font-serif text-sm text-white tracking-tight group-hover:italic transition-all">Réserver une session</p>
                <p className="font-serif text-[9px] tracking-[0.3em] uppercase text-zinc-400 mt-1">Nouveau ou ancien client</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-4 p-5 bg-zinc-50 border border-zinc-100">
              <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center shrink-0">
                <Lock size={16} strokeWidth={1.5} className="text-zinc-400" />
              </div>
              <div>
                <p className="font-serif text-sm text-zinc-600 tracking-tight">Créneau bloqué</p>
                <p className="font-serif text-[9px] tracking-[0.3em] uppercase text-zinc-400 mt-1">Non disponible à la réservation</p>
              </div>
            </div>
          )}

          {/* Block / unblock */}
          <button
            onClick={onToggleBlock}
            className={`w-full flex items-center gap-4 p-5 border transition-all duration-500 text-left group ${
              isBlocked
                ? 'bg-white border-zinc-200 hover:border-zinc-900'
                : 'bg-white border-zinc-200 hover:border-zinc-900'
            }`}
          >
            <div className="w-10 h-10 bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:border-zinc-900 transition-all duration-500 shrink-0">
              {isBlocked
                ? <CheckCircle2 size={16} strokeWidth={1.5} className="text-zinc-500" />
                : <Lock size={16} strokeWidth={1.5} className="text-zinc-400" />}
            </div>
            <div>
              <p className="font-serif text-sm text-zinc-900 tracking-tight group-hover:italic transition-all">
                {isBlocked ? 'Libérer le créneau' : 'Bloquer le créneau'}
              </p>
              <p className="font-serif text-[9px] tracking-[0.3em] uppercase text-zinc-400 mt-1">
                {isBlocked ? 'Rendre à nouveau disponible' : 'Empêcher toute réservation'}
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-7 pb-7">
          <div className="flex items-center gap-3 font-serif text-[9px] tracking-[0.3em] uppercase text-zinc-400 bg-zinc-50 border border-zinc-100 px-4 py-3">
            <Clock size={11} strokeWidth={1.5} />
            Durée standard : 60 min
          </div>
        </div>
      </motion.div>
    </div>
  );
}
