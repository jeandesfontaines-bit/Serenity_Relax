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
  const serviceLabel = cleanServiceLabel(appt.serviceName) || cleanServiceLabel(appt.title) || 'SÉANCE';

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(appt); }}
      className={`absolute left-3 right-3 z-[3] rounded-3xl p-6 cursor-pointer border transition-all duration-700 overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:scale-[1.01] active:scale-95 ${tone.surface} ${tone.border} ${className}`}
      style={{ top: top + 10, height: Math.max(height - 20, 60) }}
    >
      <div className="flex items-start justify-between gap-6 relative z-10">
        <p className={`text-[13px] font-bold tracking-tight leading-tight transition-all duration-500 ${tone.title}`}>
          {appt.clientNameSnapshot || appt.title}
        </p>
        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-150 ${tone.dot}`} />
      </div>
      
      {height >= 120 && (
        <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-3 truncate transition-colors duration-500 ${tone.meta}`}>
          {serviceLabel}
        </p>
      )}
      
      {height >= 160 && (
        <div className="mt-auto pt-4 flex items-center border-t border-black/[0.03]">
          <span className={`text-[9px] font-bold uppercase tracking-[0.3em] tabular-nums ${tone.meta}`}>{appt.time}</span>
        </div>
      )}
      
      {/* Decorative accent */}
      <div className={`absolute left-0 top-0 h-full w-[4px] ${tone.dot} opacity-20 transition-all duration-700 group-hover:w-[6px]`} />
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${tone.dot} opacity-[0.03] blur-2xl transition-all duration-700 group-hover:scale-150`} />
    </div>
  );
}
