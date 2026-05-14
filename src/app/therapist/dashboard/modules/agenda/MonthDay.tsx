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
      className={`relative flex min-h-0 flex-col border-r border-b border-border/20 p-6 transition-all duration-700 group ${
        !inMonth ? 'opacity-5 cursor-default bg-slate-50/50' : 'cursor-pointer hover:bg-slate-50/80'
      } ${isToday && inMonth ? 'bg-primary/[0.02]' : 'bg-background'} ${
        isPend ? 'ring-2 ring-primary/10 bg-primary shadow-2xl z-10' : ''
      }`}
    >
      {isToday && inMonth && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary/20" />
      )}

      <div className="flex items-baseline justify-between mb-4">
        <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-700 ${
          isPend ? 'text-white/40' : inMonth ? 'text-muted-foreground/30' : 'text-border'
        }`}>
          {format(day, 'MMM', { locale: fr }).toUpperCase()}
        </span>
        <span className={`text-3xl font-black tracking-tighter tabular-nums transition-all duration-700 lg:text-4xl ${
          isPend ? 'text-white' : isToday && inMonth ? 'text-primary' : inMonth ? 'text-foreground' : 'opacity-10'
        }`}>
          {day.getDate()}
        </span>
      </div>

      <div className="flex-1 space-y-4">
        {inMonth && isOpen && !isPend && (
          <div className="space-y-3 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-2 group-hover:translate-y-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">
              {freeSlots.length} LIBRES
            </p>
            <div className="flex flex-wrap gap-2">
              {freeSlots.slice(0, 1).map(t => (
                <span key={t} className="text-[11px] font-bold tabular-nums text-muted-foreground bg-slate-100 px-2 py-1 rounded-lg">
                  {t}
                </span>
              ))}
              {freeSlots.length > 1 && (
                <span className="text-[11px] font-black self-center text-muted-foreground/20 tabular-nums">+{freeSlots.length - 1}</span>
              )}
            </div>
          </div>
        )}

        {dayAppointments.length > 0 && !isPend && (
          <div className={`mt-auto space-y-2.5 ${dayAppointments.length > 1 ? 'pt-2' : ''}`}>
            {dayAppointments.slice(0, 2).map((appt: Appointment) => (
              <div key={appt.id} className="flex items-center gap-3 group/appt">
                <div className={`w-2 h-2 rounded-full shadow-sm transition-transform duration-700 group-hover/appt:scale-125 ${getAppointmentTone(appt).dot}`} />
                <p className="truncate text-[11px] font-bold tracking-tight text-foreground/50 group-hover:text-foreground transition-colors duration-700">
                  {appt.clientNameSnapshot || appt.title}
                </p>
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.2em] pl-5">
                + {dayAppointments.length - 2} AUTRES
              </p>
            )}
          </div>
        )}
      </div>

      {!inMonth && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.01] bg-[repeating-linear-gradient(45deg,hsl(var(--foreground)),hsl(var(--foreground))_1px,transparent_1px,transparent_10px)]" />
      )}
      
      {isToday && inMonth && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]" />
      )}
    </div>
  );
}
