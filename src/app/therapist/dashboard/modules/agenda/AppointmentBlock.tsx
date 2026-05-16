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
      className={`absolute left-2 right-2 z-[3] cursor-pointer overflow-hidden rounded-2xl border p-3 transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(86,96,136,0.12)] active:scale-[0.995] ${tone.surface} ${tone.border} ${className}`}
      style={{ top: top + 4, height: Math.max(height - 8, 42) }}
    >
      <div className="flex items-start justify-between gap-2 relative z-10">
        <p className={`dashboard-body-strong truncate leading-tight ${tone.title}`}>
          {appt.clientNameSnapshot || appt.title}
        </p>
        <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${tone.dot}`} />
      </div>
      
      {height >= 88 && (
        <p className={`dashboard-meta mt-1.5 truncate ${tone.meta}`}>
          {serviceLabel}
        </p>
      )}
      
      {height >= 118 && (
        <div className="mt-auto flex items-center pt-2">
          <span className={`dashboard-meta-strong rounded-full bg-white/65 px-2 py-1 tabular-nums ${tone.meta}`}>{appt.time}</span>
        </div>
      )}
      
      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${tone.dot} opacity-65`} />
    </div>
  );
}
