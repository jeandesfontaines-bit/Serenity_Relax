'use client';
import React, { useState } from 'react';
import { X, Plus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import * as dashboardTheme from './dashboardTheme';

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
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <motion.div
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      <motion.div
        className={`${dashboardTheme.dashboardPanel} relative w-full sm:max-w-[34rem] flex flex-col max-h-[90vh] overflow-hidden`}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1 bg-zinc-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-100/50 shrink-0">
          <div>
            <p className={`${dashboardTheme.dashboardEyebrow} mb-1`}>CONFIGURATION</p>
            <h2 className={`${dashboardTheme.dashboardTitle} text-xl`}>Horaires types</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <X size={18} strokeWidth={1} />
          </button>
        </div>

        {/* Day tabs — all 7 days including Sunday */}
        <div className="flex border-b border-zinc-100 shrink-0">
          {DAYS.map(day => {
            const count = (slots[day.id] || []).length;
            return (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`flex-1 py-3 px-1 ${dashboardTheme.dashboardEyebrow} whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
                  activeDay === day.id
                    ? 'text-zinc-900 border-b-2 border-zinc-900 -mb-px'
                    : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {day.label}
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${
                  activeDay === day.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Slots list — scrolls only if many slots */}
        <div className="overflow-y-auto px-8 pt-5 pb-3 flex-1">
          {(slots[activeDay] || []).length > 0 ? (
            <div className="space-y-3">
              {slots[activeDay].map(time => (
                <div
                  key={time}
                  className="flex items-center justify-between px-5 py-4 bg-white/50 border border-zinc-200 rounded-xl"
                >
                  <div className="flex items-center gap-3 font-serif text-sm text-zinc-900 tracking-tighter">
                    <Clock size={14} strokeWidth={1.5} className="text-zinc-400" />
                    {time}
                  </div>
                  <button
                    onClick={() => handleRemoveSlot(time)}
                    className="w-8 h-8 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all duration-500"
                  >
                    <X size={13} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <Clock size={24} strokeWidth={1} className="text-zinc-200 mx-auto mb-3" />
              <p className={`${dashboardTheme.dashboardEyebrow} text-zinc-400`}>Aucun créneau configuré</p>
            </div>
          )}
        </div>

        {/* Add slot — always visible, outside scroll zone */}
        <div className="flex gap-3 px-8 py-4 shrink-0">
          <div className="flex-1 relative">
            <input
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="w-full h-12 bg-white/50 border border-zinc-200 rounded-xl px-5 font-serif text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50"
            />
          </div>
          <button
            onClick={handleAddSlot}
            className={`${dashboardTheme.dashboardPrimaryButton} flex items-center gap-2 h-12 px-6 shrink-0`}
          >
            <Plus size={14} strokeWidth={1.5} />
            Ajouter
          </button>
        </div>

        {/* Footer — always visible */}
        <div className="px-8 pb-6 pt-2 border-t border-zinc-100/50 flex flex-col items-center gap-4 shrink-0">
          <button
            onClick={handleCopyToWeek}
            className={`${dashboardTheme.dashboardEyebrow} text-zinc-400 hover:text-zinc-900 transition-colors`}
          >
            Appliquer à toute la semaine
          </button>
          <button
            onClick={() => onSave(slots)}
            className={`${dashboardTheme.dashboardPrimaryButton} w-full h-12`}
          >
            Enregistrer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
