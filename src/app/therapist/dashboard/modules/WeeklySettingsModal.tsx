'use client';
import React, { useState } from 'react';
import { X, Plus, Clock, Copy, Save, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeeklySettingsModalProps {
  initialSlots: Record<number, string[]>;
  onClose: () => void;
  onSave: (slots: Record<number, string[]>) => void;
}

const DAYS = [
  { id: 0, label: 'Lundi', short: 'Lu' },
  { id: 1, label: 'Mardi', short: 'Ma' },
  { id: 2, label: 'Mercredi', short: 'Me' },
  { id: 3, label: 'Jeudi', short: 'Je' },
  { id: 4, label: 'Vendredi', short: 'Ve' },
  { id: 5, label: 'Samedi', short: 'Sa' },
  { id: 6, label: 'Dimanche', short: 'Di' },
];

export default function WeeklySettingsModal({ initialSlots, onClose, onSave }: WeeklySettingsModalProps) {
  const [slots, setSlots] = useState<Record<number, string[]>>({ ...initialSlots });
  const [activeDay, setActiveDay] = useState<number>(0);
  const [newTime, setNewTime] = useState('09:00');

  const activeSlots = [...(slots[activeDay] || [])].sort();

  const handleAddSlot = () => {
    if (!newTime) return;
    const daySlots = [...activeSlots];
    if (!daySlots.includes(newTime)) {
      daySlots.push(newTime);
      daySlots.sort();
      setSlots({ ...slots, [activeDay]: daySlots });
    }
  };

  const handleRemoveSlot = (time: string) => {
    setSlots({ ...slots, [activeDay]: activeSlots.filter((t) => t !== time) });
  };

  const handleCopyToWeek = () => {
    const next = { ...slots };
    DAYS.forEach((day) => {
      next[day.id] = [...activeSlots];
    });
    setSlots(next);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
      <motion.button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="dashboard-panel-lg relative flex max-h-[88vh] w-full max-w-[980px] flex-col overflow-hidden rounded-[1.75rem] shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
      >
        <div className="flex items-start justify-between border-b border-border/60 px-6 py-5 sm:px-8">
          <div>
            <p className="dashboard-table-header-cell">Configuration</p>
            <h2 className="dashboard-title-lg mt-1">Horaires types</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="dashboard-icon-button h-11 w-11 rounded-2xl"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_1fr]">
          <aside className="bg-secondary/20 border-b border-border/60 p-4 lg:border-b-0 lg:border-r">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
              {DAYS.map((day) => {
                const count = (slots[day.id] || []).length;
                const isActive = activeDay === day.id;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setActiveDay(day.id)}
                    className={`rounded-2xl px-4 py-3 text-left transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-background text-foreground hover:bg-accent'
                    }`}
                  >
                    <div className={`dashboard-body-strong ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>{day.label}</div>
                    <div className={`dashboard-meta mt-1 ${isActive ? 'text-primary-foreground/75' : 'text-muted-foreground/70'}`}>
                      {count} créneau{count > 1 ? 'x' : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <div>
                <h3 className="dashboard-title">{DAYS[activeDay].label}</h3>
                <p className="dashboard-muted-text">Définissez les créneaux proposés ce jour-là.</p>
              </div>
              <button
                type="button"
                onClick={handleCopyToWeek}
                className="dashboard-secondary-button rounded-2xl px-4"
              >
                <Copy size={14} strokeWidth={2} />
                Dupliquer sur la semaine
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDay}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.16 }}
                >
                  {activeSlots.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {activeSlots.map((time) => (
                        <div
                          key={time}
                          className="dashboard-surface-soft flex items-center justify-between rounded-2xl px-4 py-4"
                        >
                          <div className="flex items-center gap-3 text-foreground">
                            <Clock size={16} strokeWidth={2} className="text-muted-foreground/70" />
                            <span className="dashboard-body-strong tabular-nums">{time}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(time)}
                            className="dashboard-icon-button h-9 w-9 rounded-xl hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dashboard-empty-state flex min-h-[240px] flex-col items-center justify-center rounded-[24px] px-6">
                      <Clock size={28} strokeWidth={1.6} className="text-muted-foreground/35" />
                      <p className="dashboard-body mt-4">Aucun créneau configuré pour ce jour.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="border-t border-border/60 px-6 py-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="dashboard-field dashboard-body-strong h-12 rounded-2xl bg-secondary/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="dashboard-primary-button h-12 rounded-2xl px-5"
                >
                  <Plus size={16} strokeWidth={2.4} />
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => onSave(slots)}
                  className="dashboard-secondary-button h-12 rounded-2xl px-5"
                >
                  <Save size={16} strokeWidth={2.2} />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
