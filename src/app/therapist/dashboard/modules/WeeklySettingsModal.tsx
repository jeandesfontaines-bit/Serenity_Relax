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
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-[32rem] bg-white rounded-t-[24px] sm:rounded-[24px] shadow-2xl flex flex-col min-h-[500px] max-h-[90vh] overflow-hidden">
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-[17px] font-semibold text-slate-900">Horaires types</h2>
            <p className="text-[14px] text-slate-500 mt-0.5">Créneaux disponibles par défaut</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Day tabs - Included all 7 days */}
        <div className="flex border-b border-slate-100 px-2 shrink-0 overflow-x-auto no-scrollbar bg-slate-50/30">
          {DAYS.map(day => {
            const count = (slots[day.id] || []).length;
            return (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`relative py-3 px-3 text-[14px] whitespace-nowrap transition-colors flex flex-col items-center gap-1 min-w-[54px] flex-1 ${
                  activeDay === day.id
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>{day.label}</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                  activeDay === day.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {count}
                </span>
                {activeDay === day.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
              </button>
            );
          })}
        </div>

        {/* Slots list - Compacted */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[300px]">
          {(slots[activeDay] || []).length > 0 ? (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {slots[activeDay].map(time => (
                <div
                  key={time}
                  className="flex items-center justify-between pl-4 pr-1 py-1.5 bg-slate-50 border border-slate-100 rounded-full group hover:border-indigo-200 transition-all"
                >
                  <span className="text-[14px] font-bold text-slate-700">{time}</span>
                  <button
                    onClick={() => handleRemoveSlot(time)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Clock size={24} className="text-slate-200 mx-auto mb-2" />
              <p className="text-[13px] text-slate-400 font-medium">Aucun créneau ce jour</p>
            </div>
          )}

          {/* Add slot */}
          <div className="flex gap-2 sticky bottom-0 bg-white pt-2">
            <input
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="flex-1 h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            <button
              onClick={handleAddSlot}
              className="px-5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all shrink-0"
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Footer - Compacted */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col gap-3 shrink-0 bg-white">
          <button
            onClick={handleCopyToWeek}
            className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors mx-auto"
          >
            Copier ce jour sur toute la semaine
          </button>
          <button
            onClick={() => onSave(slots)}
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98]"
          >
            Sauvegarder les horaires
          </button>
        </div>
      </div>
    </div>
  );
}
