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
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
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
          <div className="w-12 h-1 bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#e2e8f0] shrink-0">
          <div>
            <p className={`${dashboardTheme.dashboardEyebrow} mb-1`}>CONFIGURATION</p>
            <h2 className={`${dashboardTheme.dashboardTitle} text-xl`}>Horaires types</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-[#f8fafc] text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X size={18} strokeWidth={1} />
          </button>
        </div>

        {/* Day tabs — all 7 days including Sunday */}
        <div className="flex border-b border-[#e2e8f0] shrink-0">
          {DAYS.map(day => {
            const count = (slots[day.id] || []).length;
            return (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`flex-1 py-3 px-1 ${dashboardTheme.dashboardEyebrow} whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
                  activeDay === day.id
                    ? 'text-[#4f46e5] border-b-2 border-[#6366f1] -mb-px'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {day.label}
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${
                  activeDay === day.id ? 'bg-[#6366f1] text-white' : 'bg-[#eef2ff] text-[#4f46e5]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="overflow-y-auto px-8 pt-5 pb-3 flex-1">
          {(slots[activeDay] || []).length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {slots[activeDay].map(time => (
                <div
                  key={time}
                  className="flex items-center justify-between px-4 py-3 bg-white/70 border border-[#e2e8f0] rounded-xl"
                >
                  <div className="flex items-center gap-2  text-[13px] text-slate-900 tracking-tighter">
                    <Clock size={12} strokeWidth={1.5} className="text-slate-400" />
                    {time}
                  </div>
                  <button
                    onClick={() => handleRemoveSlot(time)}
                    className="w-7 h-7 border border-[#e2e8f0] rounded-full flex items-center justify-center text-slate-400 hover:border-[#6366f1] hover:text-[#4f46e5] transition-all duration-300"
                  >
                    <X size={11} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <Clock size={24} strokeWidth={1} className="text-slate-200 mx-auto mb-3" />
              <p className={`${dashboardTheme.dashboardEyebrow} text-slate-400`}>Aucun créneau configuré</p>
            </div>
          )}
        </div>

        {/* Add slot — always visible, outside scroll zone */}
        <div className="flex gap-2 px-8 py-3 shrink-0">
          <div className="flex-1 relative">
            <input
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="w-full h-10 bg-white/70 border border-[#e2e8f0] rounded-xl px-4  text-[13px] text-slate-900 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/15 transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50"
            />
          </div>
          <button
            onClick={handleAddSlot}
            className={`${dashboardTheme.dashboardPrimaryButton} flex items-center gap-2 h-10 px-5 shrink-0 text-[11px]`}
          >
            <Plus size={13} strokeWidth={1.5} />
            Ajouter
          </button>
        </div>

        {/* Footer — always visible */}
        <div className="px-8 pb-6 pt-2 border-t border-[#e2e8f0] flex flex-col items-center gap-4 shrink-0">
          <button
            onClick={handleCopyToWeek}
            className={`${dashboardTheme.dashboardEyebrow} text-slate-400 hover:text-[#4f46e5] transition-colors`}
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
