import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Ban, Lock, CheckCircle2 } from 'lucide-react';
import { 
  format, isSameDay, isSameMonth, addDays, 
  startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek 
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../types';

interface AgendaPageProps {
  view: 'month' | 'week';
  cur: Date;
  onPeriod: (dir: number) => void;
  onToday: () => void;
  onToggleView: (v: 'month' | 'week') => void;
  onSelectAppt: (appt: Appointment) => void;
  onOpenSlot: (date: string, time: string) => void;
  appointments: Appointment[];
  configSlots: { [key: number]: string[] };
  isDayOpen: (d: string) => boolean;
  isSlotBlocked: (d: string, t: string) => boolean;
  toggleSlot: (d: string, t: string) => void;
  onToggleDay: (d: string) => void;
  blockMode: boolean;
  setBlockMode: (m: boolean) => void;
  absenceMode: boolean;
  setAbsenceMode: (m: boolean) => void;
  onOpenWeeklySettings: () => void;
}

export default function AgendaPage({
  view,
  cur,
  onPeriod,
  onToday,
  onToggleView,
  onSelectAppt,
  onOpenSlot,
  appointments,
  configSlots,
  isDayOpen,
  isSlotBlocked,
  toggleSlot,
  onToggleDay,
  blockMode,
  setBlockMode,
  absenceMode,
  setAbsenceMode,
  onOpenWeeklySettings
}: AgendaPageProps) {
  const [pendingDates, setPendingDates] = useState<Set<string>>(new Set());

  const handleSaveAbsences = () => {
    pendingDates.forEach(d => onToggleDay(d));
    setPendingDates(new Set());
    setAbsenceMode(false);
  };

  const togglePending = (dStr: string) => {
    const next = new Set(pendingDates);
    if (next.has(dStr)) next.delete(dStr);
    else next.add(dStr);
    setPendingDates(next);
  };

  // Helper functions used in the original WeekView/MonthView
  const fmt = (d: Date) => format(d, 'yyyy-MM-dd');
  const isoDay = (d: Date) => { let x = d.getDay(); return x === 0 ? 6 : x - 1; };
  const wkStart = (d: Date) => { let x = new Date(d); let day = x.getDay(), diff = x.getDate() - day + (day === 0 ? -6 : 1); return new Date(x.setDate(diff)); };

  const WeekView = () => {
    const s = wkStart(new Date(cur));
    const days = Array.from({ length: 7 }, (_, i) => addDays(s, i));
    const DAYS_S = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/20 animate-in fade-in duration-500">
        <div className="grid grid-cols-7 border-b border-slate-100 shrink-0 bg-white">
          {days.map((d, i) => {
            const isToday = isSameDay(new Date(), d);
            const dStr = fmt(d);
            const isOpen = isDayOpen(dStr);
            const isPending = pendingDates.has(dStr);
            return (
              <div key={i} 
                onClick={() => { if (absenceMode) togglePending(dStr); }}
                className={`py-6 text-center border-r border-slate-50 relative group transition-all ${absenceMode ? 'cursor-pointer hover:bg-slate-50' : ''} ${!isOpen ? 'bg-slate-50' : isPending ? 'bg-rose-50' : 'bg-white'}`}
              >
                {!isOpen && <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 12px, #94A3B8 12px, #94A3B8 24px)' }}/>}
                {isPending && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{DAYS_S[i]}</p>
                <div className="flex flex-col items-center mt-2 relative z-10">
                   <p className={`text-2xl font-black leading-none ${isToday ? 'text-indigo-600' : '!text-slate-900 opacity-80'}`}>{d.getDate()}</p>
                   {isToday && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 shadow-lg shadow-indigo-200"/>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto bg-slate-50/10">
          {days.map((d, i) => {
            const dStr = fmt(d);
            const isOpen = isDayOpen(dStr);
            const slots = [...(configSlots[isoDay(d)] || [])].sort();
            return (
              <div key={i} className={`border-r border-slate-100 p-4 flex flex-col gap-3 min-h-[600px] transition-all relative ${!isOpen ? 'bg-slate-100/50' : ''}`}>
                {!isOpen && <div className="absolute inset-0 bg-slate-100/10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(203,213,225,0.1) 12px, rgba(203,213,225,0.1) 24px)' }}/>}
                {isOpen ? slots.map(t => {
                  const ev = appointments.find(e => e.date === dStr && e.time === t);
                  const blocked = isSlotBlocked(dStr, t);
                  return (
                    <div key={t}
                      onClick={() => {
                        if (absenceMode) return;
                        if (blockMode) { if (!ev) toggleSlot(dStr, t); return; }
                        if (ev) onSelectAppt(ev);
                        else onOpenSlot(dStr, t);
                      }}
                      className={`p-4 rounded-2xl text-xs font-black transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-center min-h-[64px] shadow-sm transform hover:scale-[1.02]
                        ${ev ? 'bg-[#5F27CD] border-transparent text-white shadow-indigo-200/50'
                          : blocked ? 'bg-slate-900 border-transparent text-white'
                            : 'bg-white border border-slate-100 text-slate-900 hover:border-indigo-400 hover:text-indigo-600'}`}
                    >
                       <div className="flex items-center gap-2">
                        <span className="opacity-80 tracking-tight shrink-0 text-xs">{t}</span>
                        {ev && <span className="text-[10px] font-bold uppercase tracking-tight truncate opacity-90">— {ev.clientNameSnapshot || ev.title}</span>}
                        <div className="ml-auto flex items-center gap-1 shrink-0">
                           {ev && <CheckCircle2 size={10}/>}
                           {blocked && <Lock size={10}/>}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex-1 flex items-center justify-center opacity-5">
                    <Lock size={40} className="text-slate-900"/>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const MonthView = () => {
    const s = startOfMonth(cur);
    const e = endOfMonth(cur);
    const daysInterval = eachDayOfInterval({ 
      start: startOfWeek(s, { weekStartsOn: 1 }), 
      end: endOfWeek(e, { weekStartsOn: 1 }) 
    });
    const DAYS_S = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white animate-in fade-in duration-500">
        <div className="grid grid-cols-7 border-b border-slate-100 shrink-0 bg-white shadow-sm">
          {DAYS_S.map(d => (
            <div key={d} className="py-5 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{d}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 bg-slate-50/20">
          {daysInterval.map((day: Date, i: number) => {
             const dStr = fmt(day);
             const isOpen = isDayOpen(dStr);
             const isPending = pendingDates.has(dStr);
             const isToday = isSameDay(new Date(), day);
             const inMonth = isSameMonth(day, cur);
             const booked = appointments.filter(e => e.date === dStr).length;

             return (
               <div key={i}
                 onClick={() => { 
                   if (!inMonth) return;
                   if (absenceMode) togglePending(dStr);
                   else onToggleView('week'); 
                 }}
                 className={`p-5 border-r border-b border-slate-100 flex flex-col items-end gap-2 transition-all duration-300 relative cursor-pointer
                   ${!inMonth ? 'bg-slate-50/50 opacity-10 cursor-default' : 'hover:bg-indigo-50/30'}
                   ${inMonth && isToday ? 'bg-indigo-50/50' : ''}
                   ${inMonth && !isOpen ? 'bg-slate-100/30' : ''}
                   ${isPending ? '!bg-rose-50 border-rose-200' : ''}
                 `}
               >
                 {!isOpen && inMonth && <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}/>}
                 {isPending && <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-rose-500 shadow-sm" />}
                 <span className={`text-xs font-black tracking-tighter ${isToday ? 'bg-[#5F27CD] text-white w-8 h-8 flex items-center justify-center rounded-xl shadow-lg shadow-indigo-200' : inMonth ? 'text-slate-900' : 'text-slate-200'}`}>
                   {day.getDate()}
                 </span>
                 
                 {inMonth && isOpen && booked > 0 && (
                   <div className="mt-auto w-full flex flex-wrap gap-1 justify-end">
                      {Array.from({ length: Math.min(booked, 3) }).map((_, idx) => (
                        <div key={idx} className="w-2 h-2 rounded-full bg-[#5F27CD] shadow-sm shadow-indigo-100"/>
                      ))}
                      {booked > 3 && <span className="text-[8px] font-black text-indigo-400">+{booked - 3}</span>}
                   </div>
                 )}
                 {inMonth && !isOpen && (
                   <div className="mt-auto text-[8px] font-black text-slate-300 uppercase tracking-widest italic opacity-50">Fermé</div>
                 )}
               </div>
             );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Topbar Sub (Controls) */}
      <div className="h-24 border-b border-slate-100 px-12 flex items-center justify-between shrink-0 bg-white shadow-sm z-30">
        <div className="flex items-center gap-10">
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
            {format(cur, "MMMM yyyy", { locale: fr }).toUpperCase()}
          </h1>
          
          <div className="flex items-center gap-2">
            <div className="flex h-14 bg-slate-50 p-1.5 rounded-2xl gap-1 shadow-inner">
              {(['month', 'week'] as const).map(v => (
                <button key={v} onClick={() => onToggleView(v)} className={`h-full px-6 flex items-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                  {v === 'month' ? 'Mois' : 'Semaine'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl shadow-inner">
              <button onClick={() => onPeriod(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-90"><ChevronLeft size={18}/></button>
              <button onClick={onToday} className="h-10 px-4 text-[9px] font-black uppercase text-slate-500 hover:text-indigo-600 transition-all tracking-widest font-black">Aujourd'hui</button>
              <button onClick={() => onPeriod(1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-90"><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => { 
            if (absenceMode) handleSaveAbsences();
            else { setAbsenceMode(true); setBlockMode(false); }
          }}
            className={`h-14 px-6 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all border shadow-sm ${absenceMode ? "bg-rose-600 border-rose-600 text-white shadow-lg" : "bg-slate-50 border-slate-100 text-slate-400 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50"}`}
          >
            {absenceMode ? <CheckCircle2 size={16}/> : <Ban size={16}/>}
            {absenceMode ? `Valider (${pendingDates.size})` : "Fermer Dates"}
          </button>

          <button onClick={onOpenWeeklySettings}
            className="h-14 px-8 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all border shadow-sm bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-95"
          >
            <Plus size={16}/>
            Gérer Créneaux
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {view === 'week' ? <WeekView/> : <MonthView/>}
      </div>
    </div>
  );
}
