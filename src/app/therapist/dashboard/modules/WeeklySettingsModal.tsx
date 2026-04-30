'use client';
import React, { useState } from 'react';
import { X, Plus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeeklySettingsModalProps {
  initialSlots: Record<number, string[]>;
  onClose: () => void;
  onSave: (slots: Record<number, string[]>) => void;
}

const DAYS = [
  { id: 0, label: 'Lun' },
  { id: 1, label: 'Mar' },
  { id: 2, label: 'Mer' },
  { id: 3, label: 'Jeu' },
  { id: 4, label: 'Ven' },
  { id: 5, label: 'Sam' },
  { id: 6, label: 'Dim' },
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
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <motion.div
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full sm:max-w-[34rem] bg-[#faf9f7] border border-zinc-200 flex flex-col min-h-[500px] max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1 bg-zinc-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-7 border-b border-zinc-100 shrink-0">
          <div>
            <p className="font-serif text-[9px] tracking-[0.5em] text-zinc-400 uppercase mb-1">CONFIGURATION</p>
            <h2 className="font-serif text-xl tracking-tighter text-zinc-900 uppercase">Horaires types</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <X size={18} strokeWidth={1} />
          </button>
        </div>

        {/* Day tabs */}
        <div className="flex border-b border-zinc-100 px-3 shrink-0 overflow-x-auto no-scrollbar">
          {DAYS.slice(0, 6).map(day => {
            const count = (slots[day.id] || []).length;
            return (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`relative py-4 px-4 font-serif text-[11px] tracking-[0.3em] uppercase whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeDay === day.id
                    ? 'text-zinc-900 border-b-2 border-zinc-900 -mb-px'
                    : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {day.label}
                <span className={`text-[9px] px-2 py-0.5 ${
                  activeDay === day.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Slots list */}
        <div className="flex-1 overflow-y-auto px-8 py-8 min-h-[350px]">
          {(slots[activeDay] || []).length > 0 ? (
            <div className="space-y-3 mb-8">
              {slots[activeDay].map(time => (
                <div
                  key={time}
                  className="flex items-center justify-between px-5 py-4 bg-white border border-zinc-100"
                >
                  <div className="flex items-center gap-3 font-serif text-sm text-zinc-900 tracking-tighter">
                    <Clock size={14} strokeWidth={1.5} className="text-zinc-400" />
                    {time}
                  </div>
                  <button
                    onClick={() => handleRemoveSlot(time)}
                    className="w-8 h-8 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all duration-500"
                  >
                    <X size={13} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center mb-8">
              <Clock size={24} strokeWidth={1} className="text-zinc-200 mx-auto mb-4" />
              <p className="font-serif text-[11px] tracking-[0.3em] uppercase text-zinc-400">Aucun créneau configuré</p>
            </div>
          )}

          {/* Add slot */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full h-[52px] bg-white border border-zinc-200 px-5 font-serif text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50"
              />
            </div>
            <button
              onClick={handleAddSlot}
              className="flex items-center gap-2 h-[52px] px-6 bg-zinc-900 text-white font-serif text-[10px] tracking-[0.4em] uppercase hover:bg-zinc-700 transition-all duration-500 shrink-0"
            >
              <Plus size={14} strokeWidth={1.5} />
              Ajouter
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4 border-t border-zinc-100 flex flex-col items-center gap-5 shrink-0 bg-[#faf9f7]">
          <button
            onClick={handleCopyToWeek}
            className="font-serif text-[10px] tracking-[0.3em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors mt-2"
          >
            Appliquer à toute la semaine
          </button>
          <button
            onClick={() => onSave(slots)}
            className="w-full h-[52px] bg-zinc-900 hover:bg-zinc-700 text-white font-serif text-[11px] tracking-[0.5em] uppercase transition-all duration-500"
          >
            Enregistrer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
