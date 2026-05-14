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
    <div className="grid shrink-0 border-b border-border/50 bg-background" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
      <div className="border-r border-border/30 bg-slate-50/50 flex items-center justify-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30 -rotate-90">
          GMT+1
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
            className={`py-10 text-center border-r border-border/30 transition-all duration-700 relative group ${
              absenceMode ? 'cursor-pointer hover:bg-destructive/5' : ''
            } ${isPending ? 'bg-destructive text-white shadow-2xl z-10' : ''}`}
          >
            <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-4 transition-colors ${
              isToday && !isPending ? 'text-primary' : 'text-muted-foreground/40'
            }`}>
              {DAYS_LABELS[i]}
            </p>
            <p className={`text-4xl font-black leading-none tracking-tighter transition-all duration-700 ${
              isToday && !isPending
                ? 'text-foreground scale-110'
                : isOpen ? (isPending ? 'text-white' : 'text-foreground') : 'text-muted-foreground/10'
            }`}>
              {d.getDate()}
            </p>
            
            {isToday && !isPending && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_15px_hsl(var(--primary)/0.6)]" />
            )}
            
            {!isOpen && !isPending && (
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--muted-foreground)/0.02)_10px,hsl(var(--muted-foreground)/0.02)_11px)] pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
}
