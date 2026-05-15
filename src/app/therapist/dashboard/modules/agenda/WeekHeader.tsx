import React from 'react';
import { isSameDay } from 'date-fns';
import { DAYS_LABELS, fmt } from './constants';

interface WeekHeaderProps {
  days: Date[];
  isDayOpen: (d: string) => boolean;
  absenceMode: boolean;
  pendingDates: Set<string>;
  togglePending: (d: string) => void;
}

export default function WeekHeader({
  days,
  isDayOpen,
  absenceMode,
  pendingDates,
  togglePending,
}: WeekHeaderProps) {
  return (
    <div className="grid shrink-0 border-b border-border bg-background" style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}>
      <div className="border-r border-border flex items-center justify-center bg-muted/20">
        <span className="text-[11px] font-bold tracking-[0.1em] text-muted-foreground/40 uppercase">
          UTC+1
        </span>
      </div>
      {days.map((d, i) => {
        const dStr = fmt(d);
        const isToday = isSameDay(new Date(), d);
        const isOpen = isDayOpen(dStr);
        const isPending = pendingDates.has(dStr);
        return (
          <div
            key={i}
            onClick={() => absenceMode && togglePending(dStr)}
            className={`py-4 text-center border-r border-border transition-all duration-300 relative ${
              absenceMode ? 'cursor-pointer hover:bg-destructive/5' : ''
            } ${isPending ? 'bg-destructive text-white shadow-inner' : ''}`}
          >
            <p className={`text-[11px] font-black uppercase tracking-[0.2em] mb-2 transition-colors ${
              isToday && !isPending ? 'text-blue-600' : isPending ? 'text-white/60' : 'text-slate-400'
            }`}>
              {DAYS_LABELS[i]}
            </p>
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-all ${
              isToday && !isPending
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                : isOpen ? (isPending ? 'text-white' : 'text-slate-900') : 'text-slate-200'
            }`}>
              <span className="text-xl font-black tabular-nums tracking-tight">
                {d.getDate()}
              </span>
            </div>
            
            {!isOpen && !isPending && (
              <div className="absolute inset-0 closed-day-stripes pointer-events-none opacity-60" />
            )}
          </div>
        );
      })}
    </div>
  );
}
