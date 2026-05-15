import React from 'react';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../../types';
import { 
  fmt,
  isoDay,
  getAppointmentTone
} from './constants';

interface MonthDayProps {
  day: Date;
  cur: Date;
  appointments: Appointment[];
  configSlots: { [key: number]: string[] };
  isDayOpen: (d: string) => boolean;
  isSlotBlocked: (d: string, t: string) => boolean;
  absenceMode: boolean;
  pendingDates: Set<string>;
  togglePending: (d: string) => void;
  onToggleView: (v: 'month' | 'week') => void;
  onSelectAppt: (appt: Appointment) => void;
}

export default function MonthDay({
  day,
  cur,
  appointments,
  configSlots,
  isDayOpen,
  isSlotBlocked,
  absenceMode,
  pendingDates,
  togglePending,
  onToggleView,
  onSelectAppt,
}: MonthDayProps) {
  const dStr = fmt(day);
  const isOpen = isDayOpen(dStr);
  const isPend = pendingDates.has(dStr);
  const isToday = isSameDay(new Date(), day);
  const inMonth = isSameMonth(day, cur);
  
  const dayAppointments = appointments
    .filter((e: Appointment) => e && typeof e.id === 'string' && e.id.trim().length > 0 && e.date === dStr)
    .sort((a: Appointment, b: Appointment) => (a.time || '').localeCompare(b.time || ''));

  const freeSlots = isOpen
    ? [...(configSlots[isoDay(day)] || [])]
        .sort()
        .filter((time) => (
          !dayAppointments.some((appt: Appointment) => appt.time === time) &&
          !isSlotBlocked(dStr, time)
        ))
    : [];

  return (
    <div
      onClick={() => {
        if (!inMonth) return;
        absenceMode ? togglePending(dStr) : onToggleView('week');
      }}
      className={`relative flex flex-col h-full p-2 transition-all duration-200 group ${
        !inMonth ? 'bg-muted/40 opacity-40' : isOpen ? 'bg-background cursor-pointer hover:bg-accent/50' : 'cursor-pointer hover:bg-accent/50'
      } ${isPend ? 'ring-2 ring-primary/20 bg-primary/5 z-10' : ''} ${
        inMonth && !isOpen ? 'closed-day-stripes' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className={`flex items-center justify-center transition-all ${
          isToday && inMonth 
            ? 'w-9 h-9 rounded-full bg-blue-600 text-white shadow-md shadow-blue-200 scale-110' 
            : 'w-7 h-7'
        }`}>
          <span className={`text-[17px] font-black tabular-nums tracking-tighter ${
            isToday && inMonth ? 'text-white' : 
            inMonth ? 'text-slate-900' : 'text-slate-300'
          }`}>
            {day.getDate()}
          </span>
        </div>
        
        {day.getDate() === 1 && inMonth && (
          <span className="text-[11px] font-black uppercase tracking-[0.1em] text-blue-600">
            {format(day, 'MMM', { locale: fr })}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
        {dayAppointments.length > 0 && !isPend && (
          <div className="space-y-1">
            {dayAppointments.slice(0, 3).map((appt: Appointment) => (
              <div 
                key={appt.id}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectAppt(appt);
                }}
                className={`px-2 py-1 rounded-md shadow-sm ${getAppointmentTone(appt).bg} transition-transform hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="text-[9px] font-black tabular-nums text-white/90 shrink-0">
                    {appt.time}
                  </span>
                  <p className="truncate text-[10px] font-bold tracking-tight text-white">
                    {appt.clientNameSnapshot || appt.title}
                  </p>
                </div>
              </div>
            ))}
            {dayAppointments.length > 3 && (
              <div className="flex items-center gap-1 pl-2">
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  + {dayAppointments.length - 3} autres
                </p>
              </div>
            )}
          </div>
        )}

        {inMonth && isOpen && !isPend && dayAppointments.length === 0 && (
          <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-1 text-emerald-500/60 pl-1">
              <div className="w-1 h-1 rounded-full bg-current" />
              <p className="text-[9px] font-bold uppercase tracking-widest">
                {freeSlots.length} dispo
              </p>
            </div>
          </div>
        )}
      </div>

      {isPend && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary pointer-events-none" />
      )}
    </div>
  );
}
