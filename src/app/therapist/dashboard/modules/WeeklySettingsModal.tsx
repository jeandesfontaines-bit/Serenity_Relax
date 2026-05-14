'use client';
import React, { useState } from 'react';
import { X, Plus, Clock, Copy, Save, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeeklySettingsModalProps {
  initialSlots: Record<number, string[]>;
  onClose: () => void;
  onSave: (slots: Record<number, string[]>) => void;
}

const DAYS = [
  { id: 0, label: 'Lu' },
  { id: 1, label: 'Ma' },
  { id: 2, label: 'Me' },
  { id: 3, label: 'Je' },
  { id: 4, label: 'Ve' },
  { id: 5, label: 'Sa' },
  { id: 6, label: 'Di' },
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
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <motion.div
        className="absolute inset-0 backdrop-blur-xl" style={{ background: "hsl(var(--primary) / 0.6)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border" style={{ background: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 100 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-12 py-10 border-b" style={{ borderColor: "hsl(var(--border))" }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] mb-2 leading-none" style={{ color: "hsl(var(--muted-foreground))" }}>CONFIGURATION</p>
            <h2 className="text-4xl font-bold tracking-tighter leading-none" style={{ color: "hsl(var(--foreground))" }}>Horaires Types</h2>
          </div>
          <button
            onClick={onClose}
            className="w-14 h-14 flex items-center justify-center rounded-full text-white hover:scale-105 transition-all shadow-xl" style={{ background: "hsl(var(--primary))" }}
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Day selection */}
        <div className="flex p-2 border-b" style={{ background: "hsl(var(--secondary))", borderColor: "hsl(var(--border))" }}>
          {DAYS.map(day => {
            const count = (slots[day.id] || []).length;
            const isActive = activeDay === day.id;
            return (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`flex-1 py-4 px-2 rounded-full transition-all flex flex-col items-center justify-center gap-1 ${
                  isActive
                    ? 'text-white shadow-xl scale-105 z-10'
                    : ''
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{day.label}</span>
                <span className={`text-[10px] font-bold ${isActive ? 'text-white/40' : 'text-neutral-200'}`}>
                  {count} créneau{count > 1 ? 's' : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-12 flex-1 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.3em]" style={{ color: "hsl(var(--foreground))" }}>Disponibilités {DAYS[activeDay].label}</h3>
                { (slots[activeDay] || []).length > 0 && (
                   <button 
                    onClick={handleCopyToWeek}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors" style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    <Copy size={14} strokeWidth={2.5} /> Dupliquer semaine
                  </button>
                )}
              </div>

              {(slots[activeDay] || []).length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  {slots[activeDay].map(time => (
                    <div
                      key={time}
                      className="flex items-center justify-between px-8 py-5 rounded-[2.5rem] shadow-sm transition-all group border" style={{ background: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
                    >
                      <div className="flex items-center gap-4 text-xl font-bold tracking-tighter" style={{ color: "hsl(var(--foreground))" }}>
                        <Clock size={18} strokeWidth={2.5} className="transition-colors" style={{ color: "hsl(var(--muted-foreground))" }} />
                        {time}
                      </div>
                      <button
                        onClick={() => handleRemoveSlot(time)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-500 hover:text-white transition-all" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center rounded-[3rem] border-2 border-dashed" style={{ background: "hsl(var(--secondary))", borderColor: "hsl(var(--border))" }}>
                  <Clock size={48} strokeWidth={1} className="mx-auto mb-6" style={{ color: "hsl(var(--border))" }} />
                  <p className="text-[12px] font-bold uppercase tracking-[0.3em]" style={{ color: "hsl(var(--muted-foreground))" }}>Aucun créneau configuré</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Add slot and Actions */}
        <div className="p-12 border-t border-neutral-100 space-y-8 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="flex-1 relative group">
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full h-20 border-2 border-transparent rounded-full px-10 text-2xl font-bold tracking-tighter focus:outline-none focus:ring-2 transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}
              />
              <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-focus-within:opacity-100 transition-opacity">
                <ArrowRight size={24} strokeWidth={3} style={{ color: "hsl(var(--foreground))" }} />
              </div>
            </div>
            <button
              onClick={handleAddSlot}
              className="h-20 px-12 rounded-full text-white font-bold text-[11px] uppercase tracking-[0.4em] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:scale-95 transition-all shadow-2xl flex items-center gap-4" style={{ background: "hsl(var(--primary))" }}
            >
              <Plus size={20} strokeWidth={3} /> Ajouter
            </button>
          </div>

          <button
            onClick={() => onSave(slots)}
            className="w-full h-20 rounded-full text-white font-bold text-[13px] uppercase tracking-[0.5em] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:-translate-y-1 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-6" style={{ background: "hsl(var(--primary))" }}
          >
            <Save size={22} strokeWidth={2.5} /> Enregistrer la structure
          </button>
        </div>
      </motion.div>
    </div>
  );
}
