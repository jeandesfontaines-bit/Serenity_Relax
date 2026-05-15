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
  onSelectAppt: (appt: Appointment) => void;
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
  onSelectAppt,
}: MonthViewProps) {
  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(cur), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cur), { weekStartsOn: 1 }),
  }), [cur]);
  const rowCount = Math.ceil(days.length / 7);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-white">
      <div className="grid shrink-0 grid-cols-7 border-b border-[#edf2f7] bg-white">
        {DAYS_LABELS.map(d => (
          <div key={d} className="border-r border-[#edf2f7] py-3 text-center last:border-r-0">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{d}</span>
          </div>
        ))}
      </div>

      <div
        className="grid flex-1 grid-cols-7 overflow-hidden bg-[#edf2f7]"
        style={{ 
          gap: '1px',
          gridTemplateRows: `repeat(${rowCount}, 1fr)`
        }}
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
            onSelectAppt={onSelectAppt}
          />
        ))}
      </div>
    </div>
  );
}
