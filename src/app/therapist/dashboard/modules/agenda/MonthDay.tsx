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
      className={`relative flex h-full flex-col p-2.5 transition-all duration-200 group ${
        !inMonth ? 'bg-secondary/20 opacity-50' : isOpen ? 'bg-background cursor-pointer hover:bg-secondary/10' : 'cursor-pointer hover:bg-secondary/10'
      } ${isPend ? 'bg-primary/5 z-10' : ''} ${
        inMonth && !isOpen ? 'closed-day-stripes' : ''
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className={`flex items-center justify-center transition-all ${
          isToday && inMonth 
            ? 'h-8 min-w-[2rem] rounded-full bg-primary px-2 text-primary-foreground' 
            : 'h-7 min-w-[1.75rem]'
        }`}>
          <span className={`tabular-nums tracking-tight ${
            isToday && inMonth ? 'text-primary-foreground' : 
            inMonth ? 'text-muted-foreground' : 'text-muted-foreground/40'
          }`}>
            <span className={isToday && inMonth ? 'dashboard-calendar-date-active text-primary-foreground' : 'dashboard-calendar-date-sm'}>
            {day.getDate()}
            </span>
          </span>
        </div>
        
        {day.getDate() === 1 && inMonth && (
          <span className="dashboard-calendar-label text-primary">
            {format(day, 'MMM', { locale: fr })}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        {dayAppointments.length > 0 && !isPend && (
          <div className="space-y-1">
            {dayAppointments.slice(0, 3).map((appt: Appointment) => (
              <div 
                key={appt.id}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectAppt(appt);
                }}
                className={`rounded-full px-2.5 py-1 ${getAppointmentTone(appt).bg} transition-transform hover:scale-[1.01]`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="dashboard-meta shrink-0 tabular-nums text-white/85">
                    {appt.time}
                  </span>
                  <p className="dashboard-meta-strong truncate tracking-tight text-white">
                    {appt.clientNameSnapshot || appt.title}
                  </p>
                </div>
              </div>
            ))}
            {dayAppointments.length > 3 && (
              <div className="flex items-center gap-1 pl-2">
                <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <p className="dashboard-metric-label text-muted-foreground/70">
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
              <p className="dashboard-metric-label">
                {freeSlots.length} dispo
              </p>
            </div>
          </div>
        )}
      </div>

      {isPend && (
        <div className="pointer-events-none absolute inset-0 bg-primary/8 ring-1 ring-primary/15" />
      )}
    </div>
  );
}
