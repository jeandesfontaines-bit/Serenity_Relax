import React from 'react';
import { Appointment } from '../../types';
import { 
  isoDay, 
  fmt, 
  getTop, 
  getHeight, 
  parseDuration 
} from './constants';
import { DroppableSlot, DraggableAppointmentBlock } from './DndWrappers';
import GridLines from './GridLines';
import BlockedSlot from './BlockedSlot';

interface DayColumnProps {
  day: Date;
  appointments: Appointment[];
  configSlots: { [key: number]: string[] };
  isDayOpen: (d: string) => boolean;
  isSlotBlocked: (d: string, t: string) => boolean;
  toggleSlot: (d: string, t: string) => void;
  onSelectAppt: (appt: Appointment) => void;
  onOpenSlot: (date: string, time: string) => void;
  absenceMode: boolean;
  blockMode: boolean;
  activeId: string | null;
}

export default function DayColumn({
  day,
  appointments,
  configSlots,
  isDayOpen,
  isSlotBlocked,
  toggleSlot,
  onSelectAppt,
  onOpenSlot,
  absenceMode,
  blockMode,
  activeId,
}: DayColumnProps) {
  const dStr = fmt(day);
  const isOpen = isDayOpen(dStr);
  const daySlots = [...(configSlots[isoDay(day)] || [])].sort();
  const dayAppts = appointments.filter(
    (a: Appointment) => a && typeof a.id === 'string' && a.id.trim().length > 0 && a.date === dStr && typeof a.time === 'string',
  );

  return (
    <div className={`relative border-r border-border/60 bg-background ${!isOpen ? 'closed-day-stripes bg-secondary/20' : ''}`}>
      <GridLines />
      
      {/* Available slot markers */}
      {isOpen && daySlots.map(t => {
        const hasAppt = dayAppts.some((a: Appointment) => a.time === t);
        const blocked = isSlotBlocked(dStr, t);
        if (hasAppt || blocked) return null;

        const top = getTop(t);
        return (
          <DroppableSlot
            key={t}
            id={`${dStr}|${t}`}
            top={top}
            onClick={() => {
              if (absenceMode) return;
              if (blockMode) { toggleSlot(dStr, t); return; }
              onOpenSlot(dStr, t);
            }}
          />
        );
      })}

      {/* Blocked slot markers */}
      {isOpen && daySlots.map(t => {
        if (!isSlotBlocked(dStr, t)) return null;
        const hasAppt = dayAppts.some((a: Appointment) => a.time === t);
        if (hasAppt) return null;

        return (
          <BlockedSlot
            key={`block-${t}`}
            time={t}
            onClick={() => {
              if (!absenceMode) toggleSlot(dStr, t);
            }}
          />
        );
      })}

      {/* Appointment blocks */}
      {isOpen && dayAppts.map((appt: Appointment) => {
        if (!appt.time) return null;
        const top = getTop(appt.time);
        const height = getHeight(parseDuration(appt.duration));
        return (
          <DraggableAppointmentBlock
            key={appt.id}
            appt={appt}
            top={top}
            height={height}
            onSelect={onSelectAppt}
            isDragging={activeId === appt.id}
            disabled={absenceMode || blockMode}
          />
        );
      })}
    </div>
  );
}
