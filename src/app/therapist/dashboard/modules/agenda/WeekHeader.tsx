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
    <div className="grid shrink-0 border-b border-[#edf2f7] bg-white" style={{ gridTemplateColumns: '84px repeat(7, minmax(0, 1fr))' }}>
      <div className="flex items-center justify-center border-r border-[#edf2f7] bg-[#f8fbff]">
        <span className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
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
            className={`relative border-r border-[#edf2f7] px-2 py-4 text-center transition-all duration-200 ${
              absenceMode ? 'cursor-pointer hover:bg-red-50' : ''
            } ${isPending ? 'bg-red-50' : 'bg-white'}`}
          >
            <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
              isToday && !isPending ? 'text-slate-800' : isPending ? 'text-red-500' : 'text-slate-400'
            }`}>
              {DAYS_LABELS[i]}
            </p>
            <div className={`inline-flex h-11 min-w-[62px] items-center justify-center rounded-2xl border px-4 transition-all ${
              isToday && !isPending
                ? 'border-slate-900 bg-slate-900 text-white'
                : isOpen
                  ? (isPending ? 'border-red-200 bg-white text-red-600' : 'border-[#e2e9f3] bg-[#f8fbff] text-slate-900')
                  : 'border-[#edf2f7] bg-[#fbfcfe] text-slate-300'
            }`}>
              <span className="text-[1.35rem] font-semibold tabular-nums tracking-tight">
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
