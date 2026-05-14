import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { Appointment } from '../../types';
import { getHeight, DEFAULT_DURATION } from './constants';
import AppointmentBlock from './AppointmentBlock';

export function DroppableSlot({ id, onClick, top }: { id: string; onClick: () => void; top: number; }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`absolute left-4 right-4 z-[2] rounded-3xl border-2 border-dashed transition-all duration-700 group flex items-center justify-center overflow-hidden ${
        isOver 
          ? 'border-primary/40 bg-primary/5 shadow-xl scale-[1.02]' 
          : 'border-transparent bg-transparent hover:bg-secondary/5'
      }`}
      style={{ top: top + 4, height: getHeight(DEFAULT_DURATION) - 8 }}
    >
      <div className={`w-8 h-8 rounded-full bg-background/80 border border-border/50 flex items-center justify-center transition-all duration-700 shadow-sm ${
        isOver ? 'scale-110' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <Plus size={16} strokeWidth={1.5} className="text-primary/60" />
      </div>
    </button>
  );
}

export function DraggableAppointmentBlock({ 
  appt, top, height, onSelect, isDragging, disabled 
}: { 
  appt: Appointment; 
  top: number; 
  height: number; 
  onSelect: (a: Appointment) => void; 
  isDragging: boolean; 
  disabled: boolean; 
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appt.id,
    data: { appt },
    disabled
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AppointmentBlock
        appt={appt}
        top={top}
        height={height}
        onSelect={onSelect}
        className={isDragging ? 'opacity-0' : ''}
      />
    </div>
  );
}
