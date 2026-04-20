import React, { useState } from 'react';
import { X, Plus, Clock } from 'lucide-react';

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
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-m">
      <div className="absolute inset-0 bg-sapphire/30 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full sm:max-w-m bg-white rounded-t-card sm:rounded-card shadow-2xl flex flex-col min-h-[500px] max-h-[90vh] overflow-hidden">
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-s pb-xs shrink-0">
          <div className="w-l h-xxs bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-xl py-m border-b border-border shrink-0">
          <div>
            <h2 className="font-heading text-small font-black text-sapphire uppercase tracking-widest">Horaires types</h2>
            <p className="font-heading text-[10px] font-bold text-samaritan mt-xxs uppercase tracking-widest">Créneaux disponibles par défaut</p>
          </div>
          <button
            onClick={onClose}
            className="w-l h-l flex items-center justify-center rounded-md hover:bg-bg-soft text-samaritan hover:text-sapphire transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Day tabs */}
        <div className="flex border-b border-border px-xxs shrink-0 overflow-x-auto no-scrollbar bg-secondary/30">
          {DAYS.map(day => {
            const count = (slots[day.id] || []).length;
            return (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`relative py-m px-s text-[11px] whitespace-nowrap transition-all flex flex-col items-center gap-xxs flex-1 min-w-[60px] font-heading font-black uppercase tracking-widest ${
                  activeDay === day.id ? 'text-azraq' : 'text-samaritan/40 hover:text-azraq'
                }`}
              >
                <span>{day.label}</span>
                <span className={`text-[8px] font-black px-xs py-px rounded-md border ${
                  activeDay === day.id ? 'bg-aurora text-white border-aurora' : 'bg-white text-samaritan border-border'
                }`}>
                  {count}
                </span>
                {activeDay === day.id && <div className="absolute bottom-0 left-0 right-0 h-xxs bg-aurora rounded-t-full" />}
              </button>
            );
          })}
        </div>

        {/* Slots list */}
        <div className="flex-1 overflow-y-auto px-xl py-xl min-h-[300px] bg-white">
          {(slots[activeDay] || []).length > 0 ? (
            <div className="grid grid-cols-2 gap-xs mb-xl">
              {slots[activeDay].map(time => (
                <div
                  key={time}
                  className="flex items-center justify-between pl-m pr-xxs py-xxs bg-bg-soft/50 border border-border rounded-md group hover:border-azraq transition-all"
                >
                  <span className="font-heading text-small font-black text-sapphire uppercase tracking-widest">{time}</span>
                  <button
                    onClick={() => handleRemoveSlot(time)}
                    className="w-l h-l rounded-md flex items-center justify-center text-samaritan/30 hover:text-tomato hover:bg-tomato/10 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Clock size={24} className="text-bg-soft mx-auto mb-2" />
              <p className="text-[13px] text-samaritan font-medium">Aucun créneau ce jour</p>
            </div>
          )}

          {/* Add slot */}
          <div className="flex gap-xs sticky bottom-0 bg-white pt-m">
            <input
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="flex-1 h-l bg-bg-soft/50 border border-border rounded-md px-m font-heading text-small font-black text-sapphire focus:outline-none focus:ring-2 focus:ring-azraq/10 focus:bg-white focus:border-border transition-all uppercase tracking-widest"
            />
            <button
              onClick={handleAddSlot}
              className="h-l px-xl bg-azraq text-white rounded-md font-heading text-[10px] font-black uppercase tracking-widest hover:bg-azraq/90 shadow-lg shadow-azraq/10 transition-all shrink-0"
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-xl py-xl border-t border-border flex flex-col gap-m shrink-0 bg-bg-soft/30">
          <button
            onClick={handleCopyToWeek}
            className="font-heading text-[10px] font-black uppercase tracking-widest text-samaritan/60 hover:text-azraq transition-all mx-auto"
          >
            Appliquer à toute la semaine
          </button>
          <button
            onClick={() => onSave(slots)}
            className="w-full h-xl bg-azraq hover:bg-azraq/90 text-white rounded-md font-heading text-small font-black uppercase tracking-widest shadow-xl shadow-azraq/10 transition-all active:scale-[0.98]"
          >
            Enregistrer les horaires
          </button>
        </div>
      </div>
    </div>
  );
}
