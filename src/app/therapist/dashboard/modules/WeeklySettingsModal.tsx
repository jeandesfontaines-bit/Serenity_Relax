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

        {/* Day tabs */}
        <div className="flex border-b border-slate-100 px-3 shrink-0 overflow-x-auto no-scrollbar">
          {DAYS.slice(0, 6).map(day => {
            const count = (slots[day.id] || []).length;
            return (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`relative py-4 px-4 text-[15px] whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeDay === day.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px font-medium'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {day.label}
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  activeDay === day.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Slots list */}
        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-[350px]">
          {(slots[activeDay] || []).length > 0 ? (
            <div className="space-y-3 mb-6">
              {slots[activeDay].map(time => (
                <div
                  key={time}
                  className="flex items-center justify-between px-5 py-3 bg-white border border-slate-200 rounded-full shadow-sm"
                >
                  <div className="flex items-center gap-3 text-[16px] text-slate-800">
                    <Clock size={18} className="text-slate-400" />
                    {time}
                  </div>
                  <button
                    onClick={() => handleRemoveSlot(time)}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center mb-4">
              <Clock size={28} className="text-slate-200 mx-auto mb-3" />
              <p className="text-[15px] text-slate-400">Aucun créneau configuré</p>
            </div>
          )}

          {/* Add slot */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full h-[52px] bg-white border border-slate-200 shadow-sm rounded-full px-5 text-[16px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60"
              />
            </div>
            <button
              onClick={handleAddSlot}
              className="flex items-center gap-2 h-[52px] px-6 bg-[#5B4DF6] text-white rounded-full text-[15px] font-medium hover:bg-indigo-700 shadow-sm transition-colors shrink-0"
            >
              <Plus size={18} />
              Ajouter
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex flex-col items-center gap-5 shrink-0 bg-white">
          <button
            onClick={handleCopyToWeek}
            className="text-[15px] font-medium text-slate-500 hover:text-indigo-600 transition-colors mt-2"
          >
            Appliquer à toute la semaine
          </button>
          <button
            onClick={() => onSave(slots)}
            className="w-full h-[52px] bg-[#0F172A] hover:bg-slate-800 text-white rounded-full text-[16px] font-medium shadow-md transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
