'use client';

import React from 'react';
import { X, UserPlus, Lock, Clock, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#222F3E]/40 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Main Panel */}
      <motion.div 
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        className="relative w-full sm:max-w-md glass rounded-t-[3rem] sm:rounded-[2.5rem] shadow-2xl border border-white/80 overflow-hidden"
      >
        {/* Header Section */}
        <div className="pt-10 pb-6 px-10 border-b border-white/60">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-xl bg-[#222F3E] text-white flex items-center justify-center">
                 <Clock size={20} />
             </div>
             <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/50 text-gray-400 hover:text-[#5F27CD] transition-all"
              >
                <X size={16} />
              </button>
          </div>
          
          <h2 className="text-xl font-serif font-medium text-[#222F3E]">Gestion du Créneau</h2>
          <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#5F27CD] mt-1 capitalize opacity-70">
            {format(d, 'EEEE d MMMM', { locale: fr })} • {time}
          </p>
        </div>

        {/* Actions Context */}
        <div className="p-8 space-y-4">
          {/* Booking Option */}
          <AnimatePresence mode="wait">
            {!isBlocked ? (
              <motion.button
                key="book-action"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBook}
                className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-[#5F27CD] to-[#0ABDE3] rounded-[2rem] text-white shadow-xl shadow-indigo-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-all">
                        <UserPlus size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                        <p className="text-base font-serif font-medium">Réserver une Séance</p>
                        <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-60">Nouveau ou Ancien Patient</p>
                    </div>
                </div>
                <Sparkles size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ) : (
              <motion.div 
                key="blocked-status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 p-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] w-full"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Lock size={20} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-base font-serif font-medium text-gray-400">Créneau Inactif</p>
                  <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-300">Non disponible à la réservation</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Block / Unblock Toggle */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggleBlock}
            className={`w-full flex items-center gap-4 p-6 rounded-[2rem] border transition-all text-left ${
              isBlocked
                ? 'bg-white border-[#1DD1A1] text-[#1DD1A1] shadow-lg shadow-emerald-50'
                : 'bg-white/40 border-white text-gray-500 hover:border-[#FF6B6B]/30 hover:text-[#FF6B6B]'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
              isBlocked ? 'bg-[#1DD1A1]/10' : 'bg-gray-100/50'
            }`}>
              {isBlocked
                ? <CheckCircle2 size={20} className="text-[#1DD1A1]" />
                : <Lock size={20} className="text-gray-300" />}
            </div>
            <div>
              <p className="text-base font-serif font-medium">
                {isBlocked ? 'Libérer le sanctuaire' : 'Bloquer le créneau'}
              </p>
              <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-60">
                {isBlocked ? 'Rendre à nouveau disponible' : 'Empêcher toute réservation'}
              </p>
            </div>
          </motion.button>
        </div>

        {/* Clinical Constraints Bar */}
        <div className="px-10 pb-10">
          <div className="flex items-center gap-3 text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-300 px-6 py-3 bg-white/20 rounded-2xl border border-white/40">
            <Clock size={12} strokeWidth={3} />
            DURÉE CLINIQUE STANDARD : 60 MIN
          </div>
        </div>
      </motion.div>
    </div>
  );
}
