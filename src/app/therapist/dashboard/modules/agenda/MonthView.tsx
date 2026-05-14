import React, { useMemo } from 'react';
import { eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Appointment } from '../../types';
import { 
  DAYS_LABELS, 
} from './constants';
import MonthDay from './MonthDay';

interface MonthViewProps {
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

export default function MonthView({
  cur,
  appointments,
  configSlots,
  isDayOpen,
  isSlotBlocked,
  absenceMode,
  pendingDates,
  togglePending,
  onToggleView,
}: MonthViewProps) {
  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(cur), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cur), { weekStartsOn: 1 }),
  }), [cur]);
  const rowCount = Math.ceil(days.length / 7);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <div className="grid grid-cols-7 border-b border-border/20 shrink-0 bg-slate-50/50">
        {DAYS_LABELS.map(d => (
          <div key={d} className="border-r border-border/20 py-6 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">{d}</span>
          </div>
        ))}
      </div>

      <div
        className="grid flex-1 grid-cols-7 overflow-hidden bg-background"
        style={{ gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))` }}
      >
        {days.map((day, i) => (
          <MonthDay
            key={i}
            day={day}
            cur={cur}
            appointments={appointments}
            configSlots={configSlots}
            isDayOpen={isDayOpen}
            isSlotBlocked={isSlotBlocked}
            absenceMode={absenceMode}
            pendingDates={pendingDates}
            togglePending={togglePending}
            onToggleView={onToggleView}
          />
        ))}
      </div>
    </div>
  );
}
