import React, { useState } from 'react';
import { X, Plus, Clock, Copy, CheckCircle2 } from 'lucide-react';

interface WeeklySettingsModalProps {
  initialSlots: Record<number, string[]>;
  onClose: () => void;
  onSave: (slots: Record<number, string[]>) => void;
}

const DAYS = [
  { id: 1, label: 'LUN' },
  { id: 2, label: 'MAR' },
  { id: 3, label: 'MER' },
  { id: 4, label: 'JEU' },
  { id: 5, label: 'VEN' },
  { id: 6, label: 'SAM' },
  { id: 0, label: 'DIM' },
];

export default function WeeklySettingsModal({ initialSlots, onClose, onSave }: WeeklySettingsModalProps) {
  const [slots, setSlots] = useState<Record<number, string[]>>({ ...initialSlots });
  const [activeDay, setActiveDay] = useState<number>(1);
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-onyx/40 backdrop-blur-2xl" onClick={onClose} />

      <div className="relative w-full max-w-[480px] bg-[#F4F2EE] rounded-[40px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
        
        {/* HEADER */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-forest uppercase tracking-[0.2em] block mb-1">Configuration</span>
            <h2 className="text-[28px] font-black text-onyx tracking-tighter uppercase leading-none">Horaires Types</h2>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-border/10 text-earth hover:text-onyx transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* DAY SELECTOR (PILL TABS) */}
        <div className="px-8 pb-6 flex gap-2 overflow-x-auto no-scrollbar">
          {DAYS.map(day => {
            const count = (slots[day.id] || []).length;
            const active = activeDay === day.id;
            return (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`flex-1 min-w-[55px] h-12 rounded-full flex flex-col items-center justify-center transition-all ${
                  active ? 'bg-onyx text-neon ring-1 ring-onyx shadow-lg' : 'bg-white text-earth/50 hover:bg-bg-soft'
                }`}
              >
                <span className="text-[10px] font-black mb-0.5">{day.label}</span>
                <span className={`text-[8px] font-black opacity-40`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* SLOTS LIST */}
        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 custom-scrollbar">
           <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-earth/40 uppercase tracking-[0.2em]">Créneaux du jour</p>
              <button 
                onClick={handleCopyToWeek}
                className="flex items-center gap-1.5 text-[10px] font-black text-forest hover:underline uppercase tracking-widest"
              >
                 <Copy size={12}/> Appliquer à tous
              </button>
           </div>
           
           <div className="grid grid-cols-3 gap-2">
              {(slots[activeDay] || []).map(time => (
                <div key={time} className="h-12 bg-white rounded-2xl flex items-center justify-between pl-4 pr-1 border border-border/5 shadow-sm group">
                   <span className="text-[13px] font-black text-onyx tabular-nums">{time}</span>
                   <button 
                     onClick={() => handleRemoveSlot(time)}
                     className="w-8 h-8 rounded-full flex items-center justify-center text-earth/20 hover:text-[#F1664D] hover:bg-[#F1664D]/5 transition-all"
                   >
                      <X size={14} />
                   </button>
                </div>
              ))}
              <div className="h-12 border border-dashed border-border/40 rounded-2xl flex items-center justify-center text-earth/20 italic text-[12px] font-bold">
                 ...
              </div>
           </div>

           {(slots[activeDay] || []).length === 0 && (
              <div className="py-12 bg-white/40 border border-dashed border-border rounded-[32px] text-center">
                 <Clock size={24} className="mx-auto text-earth/20 mb-2 opacity-40" />
                 <p className="text-[11px] font-black text-earth/40 uppercase tracking-widest">Jour de fermeture</p>
              </div>
           )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-8 pt-4 space-y-4 bg-white/20 border-t border-border/10">
           <div className="flex gap-2">
              <input 
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="flex-1 h-14 bg-white border border-border/20 rounded-2xl px-6 font-black text-onyx text-[15px] outline-none focus:ring-1 focus:ring-onyx transition-all"
              />
              <button 
                onClick={handleAddSlot}
                className="w-14 h-14 bg-white border border-border/20 text-onyx rounded-2xl flex items-center justify-center hover:bg-bg-soft transition-all shadow-sm"
              >
                 <Plus size={24}/>
              </button>
           </div>
           <button 
             onClick={() => onSave(slots)}
             className="w-full h-16 bg-onyx hover:bg-forest text-white rounded-full font-black uppercase tracking-[0.2em] text-[13px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-onyx/20"
           >
              <CheckCircle2 size={18}/> Enregistrer la structure
           </button>
        </div>
      </div>
    </div>
  );
}
