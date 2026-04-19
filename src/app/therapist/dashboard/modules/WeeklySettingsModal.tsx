'use client';

import React, { useState } from 'react';
import { X, Plus, Clock, Copy, CheckCircle2, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeeklySettingsModalProps {
  initialSlots: Record<number, string[]>;
  onClose: () => void;
  onSave: (slots: Record<number, string[]>) => void;
}

const DAYS = [
  { id: 0, label: 'Lundi' },
  { id: 1, label: 'Mardi' },
  { id: 2, label: 'Mercredi' },
  { id: 3, label: 'Jeudi' },
  { id: 4, label: 'Vendredi' },
  { id: 5, label: 'Samedi' },
  { id: 6, label: 'Dimanche' },
];

export default function WeeklySettingsModal({ initialSlots, onClose, onSave }: WeeklySettingsModalProps) {
  const [slots, setSlots] = useState<Record<number, string[]>>({ ...initialSlots });
  const [activeDay, setActiveDay] = useState<number>(0);
  const [newTime, setNewTime] = useState('09:00');

  const handleAddSlot = () => {
    const daySlots = [...(slots[activeDay] || [])];
    if (!daySlots.includes(newTime)) {
      daySlots.push(newTime);
      daySlots.sort();
      setSlots({ ...slots, [activeDay]: daySlots });
    }
  };

  const handleRemoveSlot = (time: string) => {
    const daySlots = (slots[activeDay] || []).filter(t => t !== time);
    setSlots({ ...slots, [activeDay]: daySlots });
  };

  const handleCopyToWeek = () => {
    const current = slots[activeDay] || [];
    const next = { ...slots };
    [0, 1, 2, 3, 4, 5, 6].forEach(d => { next[d] = [...current]; });
    setSlots(next);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#222F3E]/40 backdrop-blur-xl" 
        onClick={onClose} 
      />

      {/* Main Panel */}
      <motion.div 
        initial={{ y: '100%', opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: '100%', opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full sm:max-w-xl glass rounded-t-[3rem] sm:rounded-xl shadow-2xl flex flex-col max-h-[94vh] border border-white/80"
      >
        {/* HEADER IMPACT LUXE */}
        <div className="relative bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399] p-5 lg:p-8 text-white overflow-hidden shrink-0">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-3 hover:bg-white/20 rounded-full transition-colors z-10"
            title="Fermer"
          >
            <X size={32} />
          </button>

          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-lg">
                    <Clock size={24} />
                </div>
                <div>
                   <p className="text-[0.65rem] font-black uppercase tracking-[0.4em] opacity-70">Configuration Récurrente</p>
                   <h2 className="text-4xl lg:text-3xl font-sans font-light leading-tight tracking-tight">Horaires Types</h2>
                </div>
             </div>
          </div>
          
          <div className="absolute top-0 right-0 p-5 opacity-10 pointer-events-none scale-150 -rotate-12 translate-x-20">
              <Clock size={240} />
          </div>
        </div>

        {/* Day Tabs Navigation */}
        <div className="grid grid-cols-7 border-b border-white/40 bg-white/40 sm:px-2 shrink-0">
          {DAYS.map(day => {
            const count = (slots[day.id] || []).length;
            const isActive = activeDay === day.id;
            return (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`relative py-4 px-1 sm:px-2 transition-all flex flex-col items-center justify-center gap-1 group ${
                  isActive ? 'text-[#059669]' : 'text-gray-400'
                }`}
              >
                <span className={`text-[0.6rem] font-black uppercase tracking-wider transition-all ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                  {day.label.slice(0, 3)}
                </span>
                <AnimatePresence>
                  {count > 0 && (
                     <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`text-[10px] font-black w-6 h-6 rounded-lg flex items-center justify-center shadow-sm ${
                          isActive ? 'bg-[#059669] text-white' : 'bg-white text-gray-400'
                        }`}
                     >
                       {count}
                     </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div 
                    layoutId="day-accent"
                    className="absolute bottom-0 left-6 right-6 h-1 bg-[#059669] rounded-t-full shadow-[0_0_10px_rgba(95,39,205,0.4)]" 
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Slots Content Area */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-14 py-10 scrollbar-hide min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {(slots[activeDay] || []).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {slots[activeDay].map(time => (
                  <motion.div
                    key={time}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-4 bg-white/60 border border-white hover:bg-white hover:shadow-xl hover:shadow-emerald-50/50 rounded-2xl group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-[#10B981]" />
                      <span className="text-base font-sans font-medium text-[#222F3E]">{time}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveSlot(time)}
                      className="w-8 h-8 rounded-xl bg-gray-50 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-xl mx-auto flex items-center justify-center text-gray-200">
                    <Clock size={30} />
                </div>
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest italic">Aucun créneau ce jour</p>
              </div>
            )}
          </AnimatePresence>

          {/* New Slot Input */}
          <div className="flex gap-4 items-center bg-white/40 p-3 rounded-[1.5rem] border border-white shadow-xl shadow-emerald-100/10">
            <div className="flex-1 px-4">
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full h-12 bg-transparent text-xl font-sans font-medium text-[#222F3E] focus:outline-none focus:ring-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60"
              />
            </div>
            <button
              onClick={handleAddSlot}
              className="h-14 px-8 bg-[#222F3E] text-white rounded-xl text-[0.65rem] font-black uppercase tracking-widest hover:bg-[#059669] shadow-lg transition-all flex items-center gap-3 active:scale-95"
            >
              <Plus size={18} />
              Ajouter
            </button>
          </div>
        </div>

        {/* Global Actions Footer */}
        <div className="px-6 lg:px-14 pb-14 pt-6 glass border-t border-white/60 flex flex-col items-center gap-6 shrink-0">
          <button
            onClick={handleCopyToWeek}
            className="flex items-center gap-3 text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#10B981] hover:text-[#059669] transition-all group"
          >
            <Copy size={14} className="group-hover:rotate-12 transition-transform" />
            Synchroniser toute la semaine
          </button>
          
          <button
            onClick={() => onSave(slots)}
            className="w-full btn-luxe py-6 flex items-center gap-4 shadow-2xl shadow-emerald-100"
          >
            <CheckCircle2 size={20} />
            <span>Valider la Configuration Globale</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
