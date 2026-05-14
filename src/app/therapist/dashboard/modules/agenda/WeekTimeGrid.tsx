import React, { useMemo, useState } from 'react';
import { addDays } from 'date-fns';
import { DndContext, DragOverlay, DragEndEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Appointment } from '../../types';
import { 
  HOUR_H, 
  HOURS, 
  wkStart,
  getHeight,
  parseDuration
} from './constants';
import AppointmentBlock from './AppointmentBlock';
import WeekHeader from './WeekHeader';
import TimeLabels from './TimeLabels';
import DayColumn from './DayColumn';

interface WeekTimeGridProps {
  cur: Date;
  appointments: Appointment[];
  configSlots: { [key: number]: string[] };
  isDayOpen: (d: string) => boolean;
  isSlotBlocked: (d: string, t: string) => boolean;
  toggleSlot: (d: string, t: string) => void;
  onSelectAppt: (appt: Appointment) => void;
  onOpenSlot: (date: string, time: string) => void;
  absenceMode: boolean;
  blockMode: boolean;
  pendingDates: Set<string>;
  togglePending: (d: string) => void;
  onMoveAppt?: (id: string, date: string, time: string) => void;
}

export default function WeekTimeGrid({
  cur, appointments, configSlots, isDayOpen, isSlotBlocked,
  toggleSlot, onSelectAppt, onOpenSlot, absenceMode, blockMode,
  pendingDates, togglePending, onMoveAppt,
}: WeekTimeGridProps) {
  const days = useMemo(() => {
    const s = wkStart(new Date(cur));
    return Array.from({ length: 7 }, (_, i) => addDays(s, i));
  }, [cur]);

  const gridHeight = HOURS.length * HOUR_H;
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: any) => {
    const nextId = event?.active?.id;
    setActiveId(nextId ? String(nextId) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const active = event?.active;
    const over = event?.over;
    if (over?.id && active?.id && onMoveAppt) {
      const [newDate, newTime] = String(over.id).split('|');
      onMoveAppt(String(active.id), newDate, newTime);
    }
  };

  const activeAppt = useMemo(() => activeId ? appointments.find((a: Appointment) => a.id === activeId) : null, [activeId, appointments]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <WeekHeader 
        days={days}
        isDayOpen={isDayOpen}
        absenceMode={absenceMode}
        pendingDates={pendingDates}
        togglePending={togglePending}
      />

      <div className="flex-1 overflow-auto scrollbar-hide">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
          <div
            className="grid relative"
            style={{ gridTemplateColumns: '100px repeat(7, 1fr)', height: gridHeight }}
          >
            <TimeLabels />

            {days.map((d, dayIdx) => (
              <DayColumn
                key={dayIdx}
                day={d}
                appointments={appointments}
                configSlots={configSlots}
                isDayOpen={isDayOpen}
                isSlotBlocked={isSlotBlocked}
                toggleSlot={toggleSlot}
                onSelectAppt={onSelectAppt}
                onOpenSlot={onOpenSlot}
                absenceMode={absenceMode}
                blockMode={blockMode}
                activeId={activeId}
              />
            ))}
            
            <DragOverlay zIndex={500} dropAnimation={null}>
              {activeAppt ? (
                <AppointmentBlock
                  appt={activeAppt}
                  top={0}
                  height={getHeight(parseDuration(activeAppt.duration))}
                  onSelect={() => {}}
                  className="shadow-[0_40px_80px_rgba(0,0,0,0.15)] opacity-90 scale-[1.02]"
                />
              ) : null}
            </DragOverlay>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
