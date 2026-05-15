import React from 'react';
import { Appointment } from '../../types';
import { getAppointmentTone } from './constants';
import { cleanServiceLabel } from '@/lib/cleanServiceLabel';

interface AppointmentBlockProps {
  appt: Appointment;
  top: number;
  height: number;
  onSelect: (a: Appointment) => void;
  className?: string;
}

export default function AppointmentBlock({
  appt, top, height, onSelect, className = '',
}: AppointmentBlockProps) {
  const tone = getAppointmentTone(appt);
  const serviceLabel = cleanServiceLabel(appt.serviceName) || cleanServiceLabel(appt.title) || 'Séance';

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(appt); }}
      className={`absolute left-2 right-2 z-[3] rounded-lg p-3 cursor-pointer border transition-all duration-200 overflow-hidden group hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${tone.surface} ${tone.border} ${className}`}
      style={{ top: top + 4, height: Math.max(height - 8, 40) }}
    >
      <div className="flex items-start justify-between gap-2 relative z-10">
        <p className={`text-xs font-semibold leading-tight truncate ${tone.title}`}>
          {appt.clientNameSnapshot || appt.title}
        </p>
        <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${tone.dot}`} />
      </div>
      
      {height >= 100 && (
        <p className={`text-[10px] font-medium tracking-[0.05em] mt-1.5 truncate ${tone.meta}`}>
          {serviceLabel}
        </p>
      )}
      
      {height >= 140 && (
        <div className="mt-auto pt-2 flex items-center border-t border-black/[0.04]">
          <span className={`text-[10px] font-medium tracking-[0.05em] tabular-nums ${tone.meta}`}>{appt.time}</span>
        </div>
      )}
      
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 h-full w-[3px] rounded-l-lg ${tone.dot} opacity-40`} />
    </div>
  );
}
