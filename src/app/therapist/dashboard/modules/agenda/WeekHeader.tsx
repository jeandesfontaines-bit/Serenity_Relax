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
    <div className="grid shrink-0 border-b border-border/60 bg-background" style={{ gridTemplateColumns: '84px repeat(7, minmax(0, 1fr))' }}>
      <div className="flex items-center justify-center border-r border-border/60 bg-secondary/20">
        <span className="dashboard-calendar-label">
          Heures
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
            className={`relative border-r border-border/60 px-2 py-4 text-center transition-all duration-200 ${
              absenceMode ? 'cursor-pointer hover:bg-red-50' : ''
            } ${isPending ? 'bg-red-50' : 'bg-background'}`}
          >
            <p className={`dashboard-calendar-label mb-2 transition-colors ${
              isToday && !isPending ? 'text-foreground' : isPending ? 'text-red-500' : 'text-muted-foreground/75'
            }`}>
              {DAYS_LABELS[i]}
            </p>
            <div className={`inline-flex h-11 min-w-[62px] items-center justify-center px-4 transition-all ${
              isToday && !isPending
                ? 'bg-transparent text-primary'
                : isOpen
                  ? (isPending ? 'bg-transparent text-red-600' : 'bg-transparent text-foreground')
                  : 'bg-transparent text-muted-foreground/45'
            }`}>
              <span className={isToday && !isPending ? 'dashboard-calendar-date-active' : 'dashboard-calendar-date'}>
                {d.getDate()}
              </span>
            </div>
            
            {!isOpen && !isPending && (
              <div className="pointer-events-none absolute inset-0 closed-day-stripes opacity-40" />
            )}
          </div>
        );
      })}
    </div>
  );
}
