import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';

interface WeeklySettingsModalProps {
  initialSlots: Record<number, string[]>;
  onClose: () => void;
  onSave: (slots: Record<number, string[]>) => void;
}

const DAYS = [
  { id: 0, label: 'LUN' },
  { id: 1, label: 'MAR' },
  { id: 2, label: 'MER' },
  { id: 3, label: 'JEU' },
  { id: 4, label: 'VEN' },
  { id: 5, label: 'SAM' },
  { id: 6, label: 'DIM' },
];

export default function WeeklySettingsModal({ initialSlots, onClose, onSave }: WeeklySettingsModalProps) {
  const [slots, setSlots] = useState<Record<number, string[]>>({ ...initialSlots });
  const [activeDay, setActiveDay] = useState<number>(0);
  const [newTime, setNewTime] = useState('12:30');

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
    const currentDaySlots = slots[activeDay] || [];
    const nextSlots = { ...slots };
    [0, 1, 2, 3, 4, 5, 6].forEach(d => {
      nextSlots[d] = [...currentDaySlots];
    });
    setSlots(nextSlots);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full md:w-[380px] max-h-[85vh] rounded-t-[2rem] md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        
        {/* Header Section */}
        <div className="p-6 pb-1">
          <h2 className="text-xl font-black text-[#111827] tracking-tight">Horaires Types</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Configurez les créneaux par défaut.</p>
        </div>

        {/* Days Tabs */}
        <div className="px-6 mt-2 flex justify-between border-b border-slate-100">
          {DAYS.map(day => (
            <button
              key={day.id}
              onClick={() => setActiveDay(day.id)}
              className={`pb-3 text-[10px] font-black tracking-widest transition-all relative ${activeDay === day.id ? 'text-blue-600' : 'text-slate-300 hover:text-slate-400'}`}
            >
              {day.label}
              {activeDay === day.id && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Slots List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {(slots[activeDay] || []).length > 0 ? (
            slots[activeDay].map(time => (
              <div key={time} className="bg-slate-50/50 border border-slate-100/50 p-3 rounded-xl flex items-center justify-between group transition-all hover:bg-white hover:shadow-md">
                <span className="text-base font-black text-[#111827] tracking-tight">{time}</span>
                <button 
                  onClick={() => handleRemoveSlot(time)}
                  className="w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-rose-100"
                >
                  <X size={14} strokeWidth={4} />
                </button>
              </div>
            ))
          ) : (
             <div className="py-8 flex flex-col items-center justify-center text-center opacity-20">
                <Clock size={32} className="text-slate-900 mb-2" />
                <p className="text-[9px] font-black uppercase tracking-widest">Aucun créneau</p>
             </div>
          )}

          {/* Add Slot Block */}
          <div className="pt-4 flex gap-2">
            <input 
              type="time" 
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-base font-black text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-200"
            />
            <button 
              onClick={handleAddSlot}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="px-6 pb-6 pt-2 bg-white border-t border-slate-50">
           <div className="flex flex-col gap-4">
              <button 
                onClick={handleCopyToWeek}
                className="text-blue-600 font-black text-[9px] uppercase tracking-[0.2em] hover:text-blue-700 transition-colors text-center w-full py-1"
              >
                Appliquer à toute la semaine
              </button>
              
              <button 
                onClick={() => onSave(slots)}
                className="w-full bg-[#111827] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
              >
                Enregistrer & Fermer
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
